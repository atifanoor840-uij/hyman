/**
 * Shared account rules and violation checking.
 * Used by Stats page and Withdraw page to show the same violations (e.g. weekend holding, consistency, daily drawdown).
 * Data shape: response from /api/statistics/{accountId}.
 */

function formatCurrency(val) {
  if (val == null || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
}

export function getFullAccountRules(accountType) {
  const allRules = {
    'DRAGON APEX': {
      'Minimum Trading Days': '4',
      'Minimum Trades': '4',
      'Daily Drawdown': '4%',
      'Maximum Drawdown': '10%',
      'Consistency Rule': 'Your whole trading day not exceeded than 30%',
      'Weekend Holding': 'Not Allowed',
      'Overnight Holding': 'Not Allowed',
      'Minimum Trade Holding Time': '2 minutes 30 seconds (Funded Stage Only)',
      'Minimum Trade Holding Time Live': '2 minutes 30 seconds'
    },
    'DRAGON PRIME': {
      'Minimum Trading Days': '4',
      'Minimum Trades': '4',
      'Daily Drawdown': '4%',
      'Maximum Drawdown': '10%',
      'Consistency Rule': 'Not Applied',
      'Weekend Holding': 'Allowed',
      'Overnight Holding': 'Allowed',
      'Minimum Trade Holding Time': '2 minutes 30 seconds',
      'Minimum Trade Holding Time Live': '2 minutes 30 seconds'
    },
    SWING: {
      'Minimum Trading Days': 'Your trades closed within the week (not exceed 4 days)',
      'Minimum Trades': '4 trades total (2 on first stage, 2 on second stage)',
      'Daily Drawdown': '5%',
      'Maximum Drawdown': '8%',
      'Consistency Rule': 'Not Applied',
      'Weekend Holding': 'Allowed',
      'Overnight Holding': 'Allowed',
      'Minimum Trade Holding Time': 'No Minimum on Live Account'
    },
    'HFT DRAGON': {
      'Minimum Trading Days': '1',
      'Minimum Trades': '1',
      'Daily Drawdown': '4%',
      'Maximum Drawdown': '8%',
      'Consistency Rule': 'Applied',
      'Weekend Holding': 'Not Allowed',
      'Overnight Holding': 'Not Allowed',
      'Minimum Trade Holding Time': '2 minutes 30 seconds',
      'Minimum Trade Holding Time Live': '2 minutes 30 seconds'
    },
    'DRAGON INSTANT PRO': {
      'Minimum Trading Days': '1',
      'Minimum Trades': '1',
      'Daily Drawdown': '4%',
      'Maximum Drawdown': '8%',
      'Consistency Rule': 'Applied',
      'Weekend Holding': 'Not Allowed',
      'Overnight Holding': 'Not Allowed',
      'Minimum Trade Holding Time': '2 minutes 30 seconds (Live Account)'
    }
  };

  if (!accountType) return allRules['DRAGON APEX'];
  const normalizedType = String(accountType).toUpperCase().trim();
  if (allRules[normalizedType]) return allRules[normalizedType];
  if (normalizedType.includes('INSTANT ACCOUNT') || normalizedType.includes('INSTANT ACCOUNTS') || normalizedType === 'INSTANT ACCOUNT' || normalizedType === 'INSTANT ACCOUNTS') return allRules['DRAGON INSTANT PRO'];
  if (normalizedType.includes('DRAGON 1') || normalizedType === 'DRAGON1' || normalizedType === 'D1' || normalizedType.includes('DRAGON-1') || normalizedType.includes('DRAGON_1')) return allRules['DRAGON APEX'];
  if (normalizedType.includes('DRAGON 2') || normalizedType === 'DRAGON2' || normalizedType === 'D2' || normalizedType.includes('DRAGON-2') || normalizedType.includes('DRAGON_2')) return allRules['DRAGON PRIME'];
  if (normalizedType.includes('SWING')) return allRules.SWING;
  if (normalizedType.includes('HFT') || normalizedType.includes('HFT DRAGON')) return allRules['HFT DRAGON'];
  if (normalizedType.includes('INSTANT PRO') || normalizedType.includes('DRAGON INSTANT') || (normalizedType.includes('INSTANT') && !normalizedType.includes('PRIME'))) return allRules['DRAGON INSTANT PRO'];
  if (normalizedType.includes('APEX') || normalizedType.includes('DRAGON APEX')) return allRules['DRAGON APEX'];
  if (normalizedType.includes('PRIME') || normalizedType.includes('DRAGON PRIME')) return allRules['DRAGON PRIME'];
  return allRules['DRAGON APEX'];
}

/**
 * Compute violations for an order given the full statistics API response.
 * @param {object} order - Order object (challenge_type, live_credentials, stage2_credentials, credentials, etc.)
 * @param {object} data - Full response from GET /api/statistics/{accountId}
 * @returns {Array<{ rule: string, required: string, current: string, severity: 'error'|'warning', description: string, dailyViolations?: Array }>}
 */
export function getViolations(order, data) {
  if (!order || !data) return [];

  const stats = data?.statistics?.account_stats || {};
  const equityCurve = data?.statistics?.equity_curve?.daily_performance || [];
  const tradeHistory = data?.statistics?.advanced_statistics?.charts?.recent_trades_duration || [];
  const accountInfo = data?.account_info || {};
  const openTrades = data?.open_trades?.data || [];
  const advStats = data?.statistics?.advanced_statistics || {};

  const getTradingDays = () => {
    const set = new Set();
    (tradeHistory || []).forEach((t) => {
      if (t.open_time) set.add(new Date(t.open_time).toISOString().split('T')[0]);
    });
    return Array.from(set).sort().reverse();
  };
  const tradingDaysList = getTradingDays();
  const today = new Date().toISOString().split('T')[0];
  const selectedDay = tradingDaysList.length > 0 ? tradingDaysList[0] : today;

  const calculateDayDrawdown = (targetDate) => {
    if (!targetDate) return 0;
    let dayDrawdown = 0;
    if (equityCurve?.length > 0) {
      const dayEquity = equityCurve.filter((item) => new Date(item.date).toISOString().split('T')[0] === targetDate);
      if (dayEquity.length > 0) {
        const drawdownValues = dayEquity.map((item) => Math.abs(item.drawdown || 0));
        if (drawdownValues.length > 0) dayDrawdown = Math.max(...drawdownValues);
        if (dayDrawdown === 0) {
          const startEquity = dayEquity[0]?.cumulative_equity || stats.balance || 0;
          const minEquity = Math.min(...dayEquity.map((item) => item.cumulative_equity || startEquity));
          if (startEquity > 0) dayDrawdown = Math.abs(((startEquity - minEquity) / startEquity) * 100);
        }
      }
    }
    if (dayDrawdown === 0 && tradeHistory?.length > 0) {
      const dayTrades = tradeHistory.filter((t) => {
        if (!t.open_time) return false;
        return new Date(t.open_time).toISOString().split('T')[0] === targetDate;
      });
      if (dayTrades.length > 0) {
        let cumulativeLoss = 0;
        let maxLoss = 0;
        dayTrades.forEach((t) => {
          cumulativeLoss += t.net_profit || 0;
          if (cumulativeLoss < maxLoss) maxLoss = cumulativeLoss;
        });
        const startingBalance = stats.balance || accountInfo.balance || 0;
        if (startingBalance > 0) dayDrawdown = Math.abs((maxLoss / startingBalance) * 100);
      }
    }
    return dayDrawdown;
  };

  const drawdownAchieved = Math.abs(stats.drawdown_percent || 0);
  let maxDrawdownDate = null;
  let maxDrawdownValue = 0;
  if (equityCurve?.length > 0) {
    equityCurve.forEach((item) => {
      const d = Math.abs(item.drawdown || 0);
      if (d > maxDrawdownValue) {
        maxDrawdownValue = d;
        maxDrawdownDate = item.date;
      }
    });
  }

  const achievements = {
    tradingDaysAchieved: tradingDaysList.length,
    tradesAchieved: advStats.total_trades || 0,
    drawdownAchieved,
    maxDrawdownDate,
    dailyDrawdownAchieved: calculateDayDrawdown(selectedDay),
    selectedDay
  };

  const accountType = order.challenge_type || order.account_type || order.challengeType || order.accountType || '';
  const rules = getFullAccountRules(accountType);
  const violations = [];

  // Minimum Trading Days
  let minDaysRequired = 4;
  const minDaysRule = rules['Minimum Trading Days'];
  if (minDaysRule && minDaysRule.includes('not exceed 4 days')) minDaysRequired = 4;
  else minDaysRequired = parseInt(minDaysRule?.match(/\d+/)?.[0] || '4', 10);
  const credentials = order.live_credentials || order.stage2_credentials || order.credentials;
  const profitTarget = credentials?.profit_target || order.profit_target || 0;
  const currentProfit = stats.profit || 0;
  const profitTargetAchieved = profitTarget > 0 && currentProfit >= profitTarget;
  if (achievements.tradingDaysAchieved < minDaysRequired && profitTargetAchieved) {
    const profitPercent = profitTarget > 0 ? ((currentProfit / profitTarget) * 100).toFixed(1) : 0;
    violations.push({
      rule: 'Minimum Trading Days',
      required: minDaysRule || `${minDaysRequired} days`,
      current: `${achievements.tradingDaysAchieved} days`,
      severity: 'error',
      description: `Profit target achieved (${profitPercent}%) but minimum trading days not met. You need ${minDaysRule || minDaysRequired + ' days'} but currently have ${achievements.tradingDaysAchieved} days.`
    });
  }

  // Maximum Drawdown
  const maxDrawdownAllowed = parseFloat(String(rules['Maximum Drawdown'] || '10').replace('%', '')) || 10;
  const drawdownWarningThreshold = maxDrawdownAllowed * 0.8;
  if (achievements.drawdownAchieved > maxDrawdownAllowed) {
    const drawdownDate = achievements.maxDrawdownDate
      ? new Date(achievements.maxDrawdownDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Date not available';
    violations.push({
      rule: 'Maximum Drawdown',
      required: `${maxDrawdownAllowed}%`,
      current: `${achievements.drawdownAchieved.toFixed(2)}%`,
      severity: 'error',
      description: `Maximum drawdown limit is ${maxDrawdownAllowed}% but current drawdown is ${achievements.drawdownAchieved.toFixed(2)}% (Hit on: ${drawdownDate})`
    });
  } else if (achievements.drawdownAchieved >= drawdownWarningThreshold) {
    violations.push({
      rule: 'Maximum Drawdown Warning',
      required: `${maxDrawdownAllowed}%`,
      current: `${achievements.drawdownAchieved.toFixed(2)}%`,
      severity: 'warning',
      description: `Approaching maximum drawdown limit! Current drawdown (${achievements.drawdownAchieved.toFixed(2)}%) is at ${((achievements.drawdownAchieved / maxDrawdownAllowed) * 100).toFixed(0)}% of the ${maxDrawdownAllowed}% limit.`
    });
  }

  // Daily Drawdown
  const dailyDrawdownAllowed = parseFloat(String(rules['Daily Drawdown'] || '4').replace('%', '')) || 4;
  const dailyDrawdownWarningThreshold = dailyDrawdownAllowed * 0.8;
  const dailyViolations = [];
  const dailyWarnings = [];
  tradingDaysList.forEach((day) => {
    const dayDrawdown = calculateDayDrawdown(day);
    const isToday = day === today;
    if (isToday && dayDrawdown >= dailyDrawdownWarningThreshold && dayDrawdown <= dailyDrawdownAllowed) {
      dailyWarnings.push({ day: 'Today', drawdown: dayDrawdown.toFixed(2), date: day, percentOfLimit: ((dayDrawdown / dailyDrawdownAllowed) * 100).toFixed(0) });
    }
    if (dayDrawdown > dailyDrawdownAllowed) {
      const date = new Date(day);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
      const dayLabel = day === today ? `Today (${formattedDate})` : formattedDate;
      dailyViolations.push({ day: dayLabel, drawdown: dayDrawdown.toFixed(2), date: day });
    }
  });
  if (dailyViolations.length > 0) {
    violations.push({
      rule: 'Daily Drawdown Violations',
      required: `${dailyDrawdownAllowed}% per day`,
      current: `${dailyViolations.length} day(s) exceeded limit`,
      severity: 'error',
      description: `The following ${dailyViolations.length} day(s) exceeded the daily drawdown limit of ${dailyDrawdownAllowed}%: ${dailyViolations.map((v) => `${v.day} (${v.drawdown}%)`).join(', ')}`,
      dailyViolations
    });
  }
  if (dailyWarnings.length > 0 && !dailyViolations.some((v) => v.date === today)) {
    violations.push({
      rule: 'Daily Drawdown Warning',
      required: `${dailyDrawdownAllowed}% per day`,
      current: `${dailyWarnings[0].drawdown}%`,
      severity: 'warning',
      description: `Today's daily drawdown (${dailyWarnings[0].drawdown}%) is at ${dailyWarnings[0].percentOfLimit}% of the ${dailyDrawdownAllowed}% daily limit. Be cautious with your trades!`
    });
  }

  // Consistency Rule
  if (rules['Consistency Rule'] && rules['Consistency Rule'] !== 'Not Applied' && (stats.profit || 0) > 0 && equityCurve.length > 0) {
    const dailyProfits = {};
    equityCurve.forEach((item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!dailyProfits[date]) dailyProfits[date] = 0;
      dailyProfits[date] += item.daily_profit || 0;
    });
    const totalProfit = stats.profit || 0;
    const maxDailyProfit = Math.max(...Object.values(dailyProfits), 0);
    const consistencyThreshold = totalProfit * 0.3;
    if (maxDailyProfit > consistencyThreshold) {
      violations.push({
        rule: 'Consistency Rule',
        required: 'No single day > 30% of total profit',
        current: `${((maxDailyProfit / totalProfit) * 100).toFixed(2)}% of total profit`,
        severity: 'error',
        description: `Your highest trading day (${formatCurrency(maxDailyProfit)}) exceeds 30% of total profit (${formatCurrency(totalProfit)})`
      });
    }
  }

  // Minimum Trade Holding Time (live accounts)
  const isLiveAccount = !!(order.live_credentials || String(order.status || '').toUpperCase() === 'LIVE ACCOUNT' || String(order.status || '').toUpperCase() === 'LIVE' || order.is_live);
  const holdingTimeRule = isLiveAccount && rules['Minimum Trade Holding Time Live'] ? rules['Minimum Trade Holding Time Live'] : rules['Minimum Trade Holding Time'];
  if (
    holdingTimeRule &&
    holdingTimeRule !== 'No Minimum on Live Account' &&
    isLiveAccount
  ) {
    const minHoldingTimeMatch = holdingTimeRule.match(/(\d+)\s*minutes?\s*(\d+)?\s*seconds?/);
    if (minHoldingTimeMatch) {
      const minMinutes = parseInt(minHoldingTimeMatch[1] || 0, 10);
      const minSeconds = parseInt(minHoldingTimeMatch[2] || 0, 10);
      const minHoldingTimeSeconds = minMinutes * 60 + minSeconds;
      const shortTrades = (tradeHistory || []).filter((t) => {
        const duration = t.duration || 0;
        return duration > 0 && duration < minHoldingTimeSeconds;
      });
      if (shortTrades.length > 0) {
        violations.push({
          rule: 'Minimum Trade Holding Time',
          required: `${minMinutes}m ${minSeconds}s`,
          current: `${shortTrades.length} trade(s) below minimum`,
          severity: 'error',
          description: `You have ${shortTrades.length} trade(s) with holding time less than the required ${minMinutes} minutes ${minSeconds} seconds`
        });
      }
    }
  }

  // Weekend Holding
  if (rules['Weekend Holding'] === 'Not Allowed') {
    const weekendTrades = [];
    if (tradeHistory?.length > 0) {
      tradeHistory.forEach((trade) => {
        const openTime = new Date(trade.open_time || trade.openTime || 0);
        const closeTime = new Date(trade.close_time || trade.closeTime || 0);
        const openDay = openTime.getDay();
        const closeDay = closeTime.getDay();
        const daysDiff = Math.floor((closeTime - openTime) / (1000 * 60 * 60 * 24));
        if (
          (openDay === 5 && closeDay >= 1 && closeDay <= 5 && daysDiff >= 2) ||
          openDay === 0 || openDay === 6 ||
          closeDay === 0 || closeDay === 6
        ) {
          weekendTrades.push(trade);
        }
      });
    }
    const hasOpenTradesOnWeekend = openTrades?.length > 0 && (new Date().getDay() === 0 || new Date().getDay() === 6);
    if (weekendTrades.length > 0) {
      violations.push({
        rule: 'Weekend Holding',
        required: 'Not Allowed',
        current: `${weekendTrades.length} trade(s) held over weekend`,
        severity: 'error',
        description: `${weekendTrades.length} trade(s) were held over the weekend. Weekend holding is not allowed for this account type.`
      });
    } else if (hasOpenTradesOnWeekend) {
      violations.push({
        rule: 'Weekend Holding',
        required: 'Not Allowed',
        current: `${openTrades.length} open position(s) on weekend`,
        severity: 'error',
        description: `Warning: ${openTrades.length} open position(s) detected on weekend! Close positions before the weekend.`
      });
    }
  }

  // Layering
  if (tradeHistory?.length > 0) {
    const sortedTrades = [...tradeHistory].sort((a, b) => new Date(a.open_time || a.openTime || 0).getTime() - new Date(b.open_time || b.openTime || 0).getTime());
    let layeringCount = 0;
    const checkedGroups = new Set();
    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];
      const symbol = trade.symbol || '';
      const direction = trade.type || trade.direction || '';
      const openTime = new Date(trade.open_time || trade.openTime || 0).getTime();
      const tradesInWindow = sortedTrades.filter((t, idx) => {
        if (idx <= i) return false;
        const tSymbol = t.symbol || '';
        const tDirection = t.type || t.direction || '';
        const tOpenTime = new Date(t.open_time || t.openTime || 0).getTime();
        const timeDiff = (tOpenTime - openTime) / 1000;
        return tSymbol === symbol && tDirection === direction && timeDiff >= 0 && timeDiff <= 10;
      });
      if (tradesInWindow.length >= 2) {
        const groupKey = `${symbol}-${direction}-${Math.floor(openTime / 10000)}`;
        if (!checkedGroups.has(groupKey)) {
          checkedGroups.add(groupKey);
          layeringCount++;
        }
      }
    }
    if (layeringCount > 0) {
      violations.push({
        rule: 'Layering',
        required: 'Max 2 orders per pair/direction within 10s',
        current: `${layeringCount} layering instance(s) detected`,
        severity: 'error',
        description: `Detected ${layeringCount} instance(s) where more than 2 orders were placed on the same pair in the same direction within 10 seconds`
      });
    }
  }

  return violations;
}
