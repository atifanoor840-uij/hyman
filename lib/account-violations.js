/**
 * Shared account rules and violation checking.
 * Used by Stats page and Withdraw page to show the same violations (e.g. weekend holding, layering, daily drawdown).
 * Data shape: response from /api/statistics/{accountId}.
 */

/**
 * Rule set per account type. Mirrors lib/rules-config.ts — keep the two in sync.
 *
 * STEP 1 / STEP 2: 4% daily, 10% overall, 3 profitable days in the challenge and
 * 5 qualifying days on the funded stage.
 * INSTANT: 4% daily, 6% overall, 5 qualifying days, max 2 concurrent layers.
 */
export function getFullAccountRules(accountType) {
  const shared = {
    'Daily Drawdown': '4%',
    'Leverage': '1:100',
    'Weekend Holding': 'Not Allowed',
    'Overnight Holding': 'Allowed',
    'Minimum Trade Holding Time': '3 minutes',
    'Minimum Trade Holding Time Live': '3 minutes',
    'Layering Window Seconds': 300,
    'Inactivity Days': 30
  };

  const allRules = {
    'STEP 1': {
      ...shared,
      'Minimum Trading Days': '3',
      'Minimum Trades': '3',
      'Maximum Drawdown': '10%',
      'Profit Target': '10%'
    },
    'STEP 2': {
      ...shared,
      'Minimum Trading Days': '3',
      'Minimum Trades': '3',
      'Maximum Drawdown': '10%',
      'Profit Target': '10% (Phase 1), 5% (Phase 2)'
    },
    INSTANT: {
      ...shared,
      'Minimum Trading Days': '5',
      'Minimum Trades': '5',
      'Maximum Drawdown': '6%',
      'Profit Target': 'None',
      'Max Concurrent Layers': 2
    }
  };

  if (!accountType) return allRules['STEP 1'];
  const t = String(accountType).toUpperCase().trim();
  if (allRules[t]) return allRules[t];
  if (t.includes('SIGMA') || t.includes('INSTANT')) return allRules.INSTANT;
  if (t.includes('BETA') || t.includes('STEP 2') || t.includes('STEP2') || t.includes('PHASE 2')) return allRules['STEP 2'];
  if (t.includes('ALPHA') || t.includes('STEP 1') || t.includes('STEP1') || t.includes('PHASE 1')) return allRules['STEP 1'];
  return allRules['STEP 1'];
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
  const minDaysRule = rules['Minimum Trading Days'];
  const minDaysRequired = parseInt(minDaysRule?.match(/\d+/)?.[0] || '3', 10);
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

  // GenzProp has no profit consistency rule - nothing to check here.

  // Minimum Trade Holding Time
  const isLiveAccount = !!(order.live_credentials || String(order.status || '').toUpperCase() === 'LIVE ACCOUNT' || String(order.status || '').toUpperCase() === 'LIVE' || order.is_live);
  // The 3-minute minimum applies to every trade in every phase, not just funded accounts.
  const holdingTimeRule = isLiveAccount && rules['Minimum Trade Holding Time Live'] ? rules['Minimum Trade Holding Time Live'] : rules['Minimum Trade Holding Time'];
  if (holdingTimeRule) {
    const minHoldingTimeMatch = holdingTimeRule.match(/(\d+)\s*minutes?(?:\s*(\d+)\s*seconds?)?/);
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
          required: minSeconds > 0 ? `${minMinutes}m ${minSeconds}s` : `${minMinutes}m`,
          current: `${shortTrades.length} trade(s) below minimum`,
          severity: 'error',
          description: `You have ${shortTrades.length} trade(s) with holding time less than the required ${minMinutes} minute(s)${minSeconds > 0 ? ` ${minSeconds} seconds` : ''}`
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

  // Layering: only 1 trade may open within a 5-minute window of the previous trade's open.
  // Instant accounts additionally cap concurrent open layers.
  if (tradeHistory?.length > 0) {
    const windowSeconds = rules['Layering Window Seconds'] || 300;
    const sortedTrades = [...tradeHistory].sort(
      (a, b) => new Date(a.open_time || a.openTime || 0).getTime() - new Date(b.open_time || b.openTime || 0).getTime()
    );
    let layeringCount = 0;
    for (let i = 1; i < sortedTrades.length; i++) {
      const prevOpen = new Date(sortedTrades[i - 1].open_time || sortedTrades[i - 1].openTime || 0).getTime();
      const thisOpen = new Date(sortedTrades[i].open_time || sortedTrades[i].openTime || 0).getTime();
      if (!prevOpen || !thisOpen) continue;
      if ((thisOpen - prevOpen) / 1000 < windowSeconds) layeringCount++;
    }
    if (layeringCount > 0) {
      violations.push({
        rule: 'Trade Layering',
        required: `1 trade per ${Math.round(windowSeconds / 60)}-minute window`,
        current: `${layeringCount} trade(s) opened too soon`,
        severity: 'error',
        description: `Detected ${layeringCount} trade(s) opened less than ${Math.round(windowSeconds / 60)} minutes after the previous trade was opened. Only one trade may be opened per window, even if the earlier trade was already closed.`
      });
    }

    const maxLayers = rules['Max Concurrent Layers'];
    if (maxLayers && openTrades.length > maxLayers) {
      violations.push({
        rule: 'Concurrent Layers',
        required: `Max ${maxLayers} concurrent layers`,
        current: `${openTrades.length} open position(s)`,
        severity: 'error',
        description: `Instant accounts allow a maximum of ${maxLayers} concurrent layers. Opening a ${maxLayers + 1}th results in account failure.`
      });
    }
  }

  return violations;
}
