/**
 * Help center collections under /rules/help — category list + article bodies.
 *
 * This is the authoritative GenzProp Help Center content. Rule numbers here must
 * match `lib/rules-config.ts`, which is the single source of truth used by the
 * dashboard, buy page and pricing tables.
 *
 * Body markup understood by `components/rules/help-article-body.tsx`:
 *   `## Heading`   section heading      `- item`     bullet list
 *   `1. item`      numbered list        `| a | b |`  table (first row = header)
 *   `> note`       callout              `**bold**`   inline bold
 * Blocks are separated by blank lines.
 */

export type HelpArticle = {
	slug: string;
	title: string;
	body: string;
};

export type HelpCategory = {
	slug: string;
	title: string;
	articles: HelpArticle[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
	// -----------------------------------------------------------------------
	{
		slug: 'general',
		title: 'General',
		articles: [
			{
				slug: 'are-you-a-broker',
				title: 'Are you a broker?',
				body: `**No, GenzProp is not a broker.** We are a proprietary trading firm.

We do not accept client deposits for live market trading. Traders simply purchase an evaluation challenge to test their trading strategies within our simulated institutional environment.`,
			},
			{
				slug: 'am-i-trading-with-real-funds',
				title: 'Am I trading with real funds?',
				body: `**No.** GenzProp provides simulated accounts where all trading is conducted with virtual funds. These accounts allow us to identify and evaluate consistent, high-performing trading strategies.

Once you successfully pass the evaluation stages, you retain access to our simulated environment as a funded trader, earning performance fees based on your simulated trading results.`,
			},
			{
				slug: 'trading-platforms-available',
				title: 'What trading platforms are available?',
				body: `We offer access to both **MetaTrader 4 (MT4)** and **MetaTrader 5 (MT5)**.

You receive your server and login details for your program after purchase or account assignment.`,
			},
			{
				slug: 'how-long-to-receive-credentials',
				title: 'How long does it take to receive account credentials?',
				body: `Your delivery timeframe depends on your selected payment method:

- **Card payments:** your account details are generated and sent immediately after your payment is confirmed.
- **Cryptocurrency:** credentials are sent as soon as the transaction is confirmed on the blockchain.

> **Note:** Always verify you are using the correct network and transferring the full amount, including network gas fees. Underpaid transactions may delay delivery and require manual refund handling, subject to network fee deductions.`,
			},
			{
				slug: 'prior-trading-experience',
				title: 'Do I need prior trading experience to apply?',
				body: `No formal experience is required to purchase an assessment with GenzProp.

However, because our evaluations are designed around strict risk parameters, achieving consistency without foundational trading knowledge is challenging.`,
			},
			{
				slug: 'country-restrictions',
				title: 'Are there any country restrictions?',
				body: `**No.** We welcome traders globally with no regional restrictions.`,
			},
			{
				slug: 'liability-and-account-responsibility',
				title: 'Liability and Account Responsibility',
				body: `GenzProp provides the simulated infrastructure and tools, but you remain in complete control of your execution and security.

- **Account security:** you are strictly responsible for protecting your login credentials. Sharing access with third parties or account management services is prohibited. GenzProp is not liable for compromised credentials resulting from personal email or device security breaches.
- **Simulated environment, real discipline:** although balances are virtual, execution requires professional discipline. You are responsible for every executed trade, risk setting, and drawdown level.
- **Operational liability:** GenzProp is not responsible for losses or breaches caused by trader error, local internet outages, or client-side issues.`,
			},
			{
				slug: 'what-happens-if-i-fail',
				title: 'What happens if I fail an evaluation or funded account?',
				body: `If an account violates any trading rule, it is **permanently closed**, and progress is reset.

- Accounts cannot be restarted or resumed from a failed phase; continuing with GenzProp requires purchasing a new evaluation.
- Some rule breaches may not trigger automated flags immediately and will be confirmed during manual reviews by our risk team.`,
			},
			{
				slug: 'inactivity-rule',
				title: 'Is there an inactivity rule?',
				body: `**Yes.** You must execute at least one trade every **30 consecutive days** to keep your account active.

If an account shows no trading activity for 30 days starting from your first executed trade, it will be marked as inactive and closed due to a breach.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'account-types',
		title: 'Account Types',
		articles: [
			{
				slug: 'what-account-types-does-genzprop-offer',
				title: 'What account types does GenzProp offer?',
				body: `GenzProp offers three account types:

- **Step 1** — a single-phase challenge with one profit target.
- **Step 2** — a two-phase evaluation with a separate Phase 1 and Phase 2 profit target.
- **Instant** — a funded-style account with no challenge phase; you are evaluated live while trading.

Once you successfully complete a Step 1 or Step 2 challenge, your account moves to the **Funded Stage**.

Instant accounts are already funded from day one and progress through their own requirements to unlock full withdrawal eligibility.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'challenge-requirements',
		title: 'Challenge Requirements',
		articles: [
			{
				slug: 'step-1-requirements',
				title: 'Step 1 — requirements',
				body: `## Profit Target

| Stage | Target |
| Phase 1 | 10% |
| Phase 2 | None |
| Funded | None |

The profit target is verified strictly on **closed account balance**. All open positions and pending orders must be completely closed for target verification.

**Example ($100,000 account):** initial balance is $100,000. Required profit is $10,000. Balance must hit $110,000 with no active exposures to pass Phase 1.

## Minimum Profitable Days

- **Requirement:** 3 Profitable Days during the challenge.
- **Definition:** a day qualifies as a Profitable Day when the end-of-day balance is at least **0.5%** of the initial balance higher than the highest recorded previous closing balance.
- **Condition:** trading sessions without a +0.5% balance increase do not count toward this requirement, regardless of trade volume.
- **Funded Stage:** 5 qualifying days in total — 3 Profitable Days plus 2 Trading Days.

## Maximum Daily Loss

- **Limit:** 4% of the initial account balance ($4,000 on a $100k account).
- **Calculation:** measured from the previous day's closing balance; both closed trades and floating losses count.
- **Reset:** the threshold resets every day at **00:00 UTC**, shown on your dashboard countdown.

## Maximum Loss (Account Equity Requirement)

- **Limit:** 10% from the initial balance.
- **Structure:** static and fixed from the starting balance; it does not trail upward with profits.
- **Example ($100,000 account):** equity or balance cannot fall below $90,000 at any point.

## Leverage, Holding and News

- **Leverage:** 1:100 across every asset class.
- **Minimum holding time:** 3 minutes on every trade.
- **Overnight holding:** allowed by default. Swap/rollover charges apply as normal.
- **Weekend holding:** not allowed by default — available as a paid add-on at checkout.
- **News trading:** unrestricted during the challenge. On the Funded Stage a 10-minute restricted window applies.
- **Inactivity:** 30 consecutive calendar days without a trade closes the account.
- **Payout frequency:** bi-weekly (every 14 calendar days) once funded.`,
			},
			{
				slug: 'step-2-requirements',
				title: 'Step 2 — requirements',
				body: `## Profit Target

| Stage | Target ($100k account) |
| Phase 1 | 10% ($10,000) |
| Phase 2 | 5% ($5,000) |
| Funded | None |

Verification is balance-based with zero active or pending positions.

## Minimum Profitable Days & Trading Days

- **Evaluation (Phase 1 & Phase 2):** 3 Profitable Days per phase.
- **Funded Stage:** 3 Profitable Days and a minimum of 2 Trading Days (5 days total).
- **Definition:** the daily closing balance must exceed the previous high-water mark by at least **+0.5%** of the starting capital.

## Maximum Daily Loss (Daily Drawdown)

- **Evaluation and Funded:** 4% of the initial balance ($4,000 on a $100k account).
- **Calculation:** resets daily at **00:00 UTC** based on the previous closing balance.

## Maximum Drawdown (Account Equity Requirement)

- **Limit:** 10% — static from the initial balance, in both Evaluation and Funded.
- **Example ($100,000 account):** the equity/balance floor is $90,000 in every stage.

## Leverage, Holding and News

- **Leverage:** 1:100 across every asset class.
- **Minimum holding time:** 3 minutes on every trade.
- **Overnight holding:** allowed by default. Swap/rollover charges apply as normal.
- **Weekend holding:** not allowed by default — available as a paid add-on at checkout.
- **News trading:** unrestricted during Phase 1 and Phase 2. On the Funded Stage a 10-minute restricted window applies.`,
			},
			{
				slug: 'instant-funding-requirements',
				title: 'Instant Funding — requirements',
				body: `## Profit Target

**None (0%).** Instant gives you direct access to funded capital from day one, without evaluation phases.

## Minimum Profitable Days & Trading Days

- **Requirement:** 3 Profitable Days and a minimum of 2 Trading Days — 5 qualifying days in total.
- **Definition:** a Profitable Day requires a closing daily balance at least **+0.5%** higher than the prior high balance.

## Maximum Daily Loss (Daily Drawdown)

- **Limit:** 4% of the initial balance ($4,000 on a $100k account).
- **Calculation:** evaluated continuously against the previous day's close; resets at **00:00 UTC**.

## Maximum Drawdown (Account Equity Requirement)

- **Limit:** 6% from the initial balance (static).
- **Example ($100,000 account):** equity/balance must never touch or breach $94,000.

## Leverage, Holding and News

- **Leverage:** 1:100 across all instruments.
- **Minimum holding time:** 3 minutes on every trade.
- **Trade layering:** one trade per 5-minute window, and a maximum of **2 concurrent layers**. Opening a 3rd layer fails the account.
- **Overnight holding:** allowed by default. Swap/rollover charges apply as normal.
- **Weekend holding:** not allowed by default — available as a paid add-on at checkout.
- **News trading:** a 10-minute restricted window applies (5 minutes before and after high-impact releases).
- **Account fee:** evaluation fees are not returned on Instant accounts.`,
			},
			{
				slug: 'comparison-summary-table',
				title: 'Comparison Summary Table',
				body: `## GenzProp Account Rules Comparison

| Parameter | Step 1 | Step 2 | Instant |
| Profit Target | Phase 1: 10%, Funded: none | Phase 1: 10%, Phase 2: 5%, Funded: none | None (direct funded) |
| Daily Drawdown (Evaluation) | 4% | 4% | N/A |
| Daily Drawdown (Funded / Instant) | 4% | 4% | 4% |
| Max Drawdown (Evaluation) | 10% | 10% | N/A |
| Max Drawdown (Funded / Instant) | 10% | 10% | 6% |
| Min Profitable Days (Evaluation) | 3 days | 3 days per phase | N/A |
| Funded Account Requirements | 3 Profitable Days & 2 Trading Days | 3 Profitable Days & 2 Trading Days | 3 Profitable Days & 2 Trading Days |
| Minimum Holding Time | 3 minutes | 3 minutes | 3 minutes |
| Leverage | 1:100 | 1:100 | 1:100 |
| Profit Consistency Rule | None | None | None |
| News Trading | Free (Evaluation), restricted window on Funded | Free (Evaluation), restricted window on Funded | Restricted window (soft breach) |
| Overnight Holding | Allowed by default | Allowed by default | Allowed by default |
| Weekend Holding | Paid add-on at checkout | Paid add-on at checkout | Paid add-on at checkout |

## Notes

- **News trading:** free and unrestricted during the Step 1 / Step 2 challenge phase. On Funded and Instant accounts a **10-minute restricted window** applies (5 minutes before and after high-impact news releases) — if a Stop Loss or Take Profit fires within that window it is treated as a **soft breach**.
- **Overnight holding:** allowed on all plans by default — no add-on required. Swap/rollover charges apply as normal.
- **Weekend holding:** not allowed by default — available only as an optional paid add-on at checkout.
- **Profit consistency:** GenzProp does not apply a profit consistency rule on any account type.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'trading-rules-guidelines',
		title: 'Trading Rules',
		articles: [
			{
				slug: 'profitable-day-and-trading-day',
				title: 'What is a "Profitable Day" and a "Trading Day"?',
				body: `## Profitable Day

A **Profitable Day** is a single trading day (00:00–23:59 UTC) in which your account's profit reaches at least **0.5% of your initial account balance/equity**, calculated on an equity basis.

## Trading Day

A **Trading Day** simply requires that a trade was opened and closed on that calendar day, regardless of whether it was profitable.

Every Profitable Day is automatically also a Trading Day.

## Notes

- Profitable Days must fall on separate calendar days — you cannot combine profit from different days to make one Profitable Day.
- The daily reset happens at **00:00 UTC**, shown live on your dashboard countdown timer.`,
			},
			{
				slug: 'minimum-trading-days-requirement',
				title: 'Minimum Trading Days Requirement',
				body: `| Account Type | Minimum Days Required |
| Step 1 | 3 Profitable Days |
| Step 2 | 3 Profitable Days |
| Instant | 5 days total (3 Profitable Days + 2 Trading Days) |
| All Funded Stages | 5 days total (3 Profitable Days + 2 Trading Days) |

## For Instant and all Funded Stage accounts

- You need **5 qualifying days in total** — 3 of them must be Profitable Days, and 2 more can be plain Trading Days (a trade simply opened and closed, profitable or not).
- These do not need to happen in any fixed order — you do not have to finish all 3 Profitable Days first before the remaining days count. Since a Profitable Day is also a Trading Day, your Profitable Days count toward the total automatically.
- This 5-day minimum does not apply to Step 1 / Step 2 challenge accounts, which only need 3 Profitable Days.

See the **Withdrawal Eligibility** article for how this affects your payout.`,
			},
			{
				slug: 'daily-reset',
				title: 'When does the daily reset happen?',
				body: `- All daily loss and Profitable Day calculations reset at **00:00 UTC**, based on dashboard time.
- The dashboard countdown timer is the sole and final reference — not your broker's server time or your local time.
- Losses or profits before 00:00 UTC count toward the current trading day; anything after counts toward the next.`,
			},
			{
				slug: 'leverage',
				title: 'What leverage does GenzProp offer?',
				body: `Leverage is capped at **1:100** across every asset class, for all account types and stages:

| Asset Class | Max Leverage |
| Forex | 1:100 |
| Indices | 1:100 |
| Metals | 1:100 |
| Energies | 1:100 |
| Stocks | 1:100 |
| Crypto | 1:100 |

Leverage limits are set per instrument, not by account size. Higher leverage never exempts you from the Maximum Daily Drawdown, Maximum Loss, or margin requirements.`,
			},
			{
				slug: 'stop-loss-policy',
				title: 'Do I have to use a stop-loss?',
				body: `**No.** Stop-loss orders are optional — there is no penalty for trading without one.

That said, you are still fully responsible for managing your open risk and staying within the **Maximum Daily Drawdown** and **Maximum Loss** rules regardless of whether you use a stop-loss.`,
			},
			{
				slug: 'news-trading-policy',
				title: 'News Trading Policy',
				body: `## 1. Challenge Phase (Step 1 & Step 2)

- You may trade freely during all news events with no restricted windows or execution limits.
- Trades may be opened, closed, or modified directly during news events.

## 2. Funded Stage & Instant Accounts — the 10-minute window

- **The restricted window:** you may not open a new position or close an existing position on the affected instrument within **5 minutes before and 5 minutes after** a listed high-impact news announcement (a 10-minute total restricted window).
- **Execution types covered:** this restriction applies to all forms of execution — manual market execution, pending orders, Stop-Loss (SL), and Take-Profit (TP).
- **Holding through news:** holding an open trade through the news release is permitted, provided the position was opened more than 5 minutes prior to the start of the restricted event.

## 3. Soft breach handling

- If a pre-existing position's Stop-Loss or Take-Profit executes inside the 10-minute restricted window, it is classified as a **soft breach**.
- **Account status:** your account will not be terminated.
- **Profit treatment:** any realised profits generated from that specific execution are ineligible for withdrawal and will be deducted.
- **Loss treatment:** any losses incurred during the restricted window remain the trader's sole responsibility and will not be reimbursed or reversed.

## Affected economic announcements

This restriction applies strictly to the specific currency or instrument linked to the event (as classified by standard calendars like Forex Factory or Myfxbook):

- **Monetary policy:** interest rate decisions, rate statements, and central bank press conferences.
- **Inflation & growth:** Consumer Price Index (CPI), Core PCE, and Gross Domestic Product (GDP) reports.
- **Labor market:** Non-Farm Payrolls (NFP), Unemployment Rate, and Employment Change data.
- **Activity indices:** Manufacturing and Services Purchasing Managers' Index (PMI).
- **Speeches & press conferences:** restricted for their entire live duration, plus the standard 5-minute buffer before the start and after the conclusion.

> **Relation to other rules:** this policy works in tandem with the Weekend Holding rule. Holding positions across the weekend closure requires the Weekend Holding add-on.

## Frequently asked questions

**Can I trade news during my challenge phase?** Yes. News trading is completely unrestricted on Step 1 and Step 2 evaluation accounts.

**Can I trade news once I am on a Funded Stage or Instant account?** You cannot open or close trades on the affected currency or asset within 5 minutes before or 5 minutes after a listed high-impact news release. You may hold a running trade through the event as long as it was entered more than 5 minutes prior to the release.

**What happens if my Stop-Loss or Take-Profit triggers inside the restricted window?** It is treated as a soft breach. The account remains active and will not be closed, but any profits earned from that execution cannot be withdrawn. Any incurred losses remain on the account balance.`,
			},
			{
				slug: 'trade-layering',
				title: 'Trade Layering',
				body: `## Standard rule (Funded Stage)

Only **1 trade** may be opened within a **5-minute window** from the previous trade's opening time.

Opening a second trade within that 5-minute window is a violation resulting in account termination, even if the first trade was already closed.

The window is locked to the account's registration date and applies to all trades, regardless of when each is placed.

## Instant accounts — additional cap

Instant accounts have an additional restriction: a maximum of **2 concurrent layers** is allowed.

Opening a 3rd layer at any time results in account failure, even if each entry was separated by 5 minutes or more.

## Key points

- **Funded Stage:** max 1 trade per 5-minute window from the previous trade's opening time — violation = account termination.
- **Instant accounts:** max 2 concurrent layers — opening a 3rd = account failure.
- The 5-minute window is fixed to the account's registration date, not reset per trade.
- Applies to all trades regardless of when they are placed.`,
			},
			{
				slug: 'daily-drawdown',
				title: 'Daily Drawdown',
				body: `The **Maximum Daily Drawdown** represents the maximum loss permitted within a single trading day while trading under GenzProp account rules.

The limit is calculated based on the **Initial Account Balance**, measured from the start of each trading day.

The daily loss calculation includes:

- All closed trades
- All unrealized losses from open positions

If the account balance or equity drops below the permitted threshold at any point during the trading day, the Maximum Daily Drawdown is triggered — **even if the account later recovers**.

## How is the Maximum Daily Drawdown calculated?

At any moment during the trading day, the combined loss of open and closed trades must not exceed:

| Account Type | Max Daily Drawdown |
| Step 1 / Step 2 (Challenge Phase) | 4% of Initial Account Balance |
| Step 1 / Step 2 (Funded Stage) | 4% of Initial Account Balance |
| Instant / Funded Account | 4% of Initial Account Balance |

**Formula:** Current Daily Loss = results of closed positions for the day + unrealized result of open positions.

This value must never exceed **4% of the Initial Account Balance**, for every GenzProp account type and stage.

## Examples

**Example 1 — Step 1 Challenge (4% limit).** Initial balance $10,000. Max daily drawdown = 4% × $10,000 = $400. Closed trades loss $150, unrealized loss $200. Current daily loss = $350 → within limit, no breach.

**Example 2 — Step 2 Challenge, breach case.** Initial balance $25,000. Max daily drawdown = $1,000. Closed trades loss $600, unrealized loss $450. Current daily loss = $1,050 → limit exceeded, breach triggered even if the trade recovers later.

**Example 3 — Instant / Funded account.** Initial balance $50,000. Max daily drawdown = $2,000. Closed trades loss $900, unrealized loss $1,200. Current daily loss = $2,100 → breach.

**Example 4 — Instant / Funded account, safe case.** Initial balance $100,000. Max daily drawdown = $4,000. Closed trades +$500 profit, unrealized loss $1,200. Net current daily loss = $700 → well within the $4,000 limit.`,
			},
			{
				slug: 'maximum-drawdown',
				title: 'Maximum Drawdown',
				body: `The **Maximum Loss** is the total loss limit you are allowed to reach on your account at any time while trading under GenzProp rules.

It represents the maximum drawdown permitted on the account over its entire lifetime, not just within a single trading day.

The Maximum Loss is calculated based on the **Initial Account Balance** and applies continuously from the moment the account is activated.

If your balance or equity drops below the allowed threshold at any point, the rule is considered breached — even if the account later recovers.

## How is the Maximum Loss calculated?

At any time, the total loss on the account must not exceed:

| Account Type | Maximum Loss |
| Step 1 / Step 2 (Challenge Phase & Funded) | 10% of Initial Account Balance |
| Instant / Funded Account | 6% of Initial Account Balance |

**Formula:** Current Total Loss = Initial Account Balance − current balance or equity.

## Examples

**Example 1 — Step 1 / Step 2 (10% limit).** Initial balance $100,000, maximum loss $10,000. If balance or equity drops below $90,000, the rule is breached.

**Example 2 — Instant / Funded account (6% limit).** Initial balance $100,000, maximum loss $6,000. If balance or equity drops below $94,000, the rule is breached.

**Example 3 — account after profits (Step 1 / Step 2).** Initial balance $100,000, highest balance reached $108,500. Maximum loss remains $10,000 — if balance or equity drops below $90,000 the rule is breached. Maximum Loss is always based on the initial balance, not on profits or peak equity.

**Example 4 — gradual drawdown (Instant / Funded).** Initial balance $100,000, current balance $96,200, total loss so far $3,800. The account remains valid until balance or equity reaches $94,000, at which point the account fails immediately and is terminated.

## Key points

- Applies to Step 1 / Step 2 (10%) and Instant / Funded (6%) accounts.
- The rule is static and does not increase with profits.
- Both balance and equity are monitored.
- Open trades and floating losses are included.
- Breaching the limit results in immediate account failure and permanent termination.

Unlike the Maximum Daily Drawdown rule, this limit does not reset and remains in effect for the full duration of the account.`,
			},
			{
				slug: 'minimum-trade-holding-time',
				title: 'Minimum Trade Holding Time',
				body: `GenzProp requires every trade to be held open for a minimum of **3 minutes** before it is closed.

If a position is closed before 3 minutes have passed since it was opened, this is treated as a rule breach.

## Why this rule exists

This rule is in place to prevent high-frequency scalping, latency arbitrage, and other ultra-short-duration trading strategies that do not reflect genuine market risk-taking.

## Rule summary

**Trade Duration = trade close time − trade open time**

- If trade duration is **less than 3 minutes** → breach
- If trade duration is **3 minutes or more** → valid trade, no breach

## Examples

**Example 1 — valid trade.** Opened 10:00:00, closed 10:03:15. Duration 3 minutes 15 seconds → valid.

**Example 2 — breach case.** Opened 14:20:00, closed 14:21:40. Duration 1 minute 40 seconds → breach.

**Example 3 — edge case.** Opened 09:00:00, closed 09:03:00. Duration exactly 3 minutes → valid.

## Key points

- Applies to **all trades** on the account, in every phase and stage.
- Minimum holding time: 3 minutes.
- Closing a trade earlier than 3 minutes is flagged as a breach.
- Applies regardless of profit or loss on the trade.`,
			},
			{
				slug: 'profit-consistency-rule',
				title: 'Profit Consistency Rule',
				body: `**There is no profit consistency rule at GenzProp.**

Some prop firms require that no single trading day accounts for more than a set percentage (e.g. 30–40%) of your total profit — this is called a profit consistency rule, and it is designed to discourage a trader from passing a challenge on the back of one lucky big trade.

GenzProp does not enforce this rule. This means:

- You can pass a challenge or reach payout with profits earned from a single strong trading day.
- There is no requirement to "spread out" your profit evenly across multiple days.
- You will not be flagged or penalised for having one day that generated most of your overall gains.

## Key points

- No minimum number of profitable trading days required for consistency purposes.
- No cap on how much of your total profit can come from a single day.
- All other applicable rules (Daily Loss Limit, Maximum Drawdown, Trade Layering, Minimum Holding Time, etc.) still apply as normal.`,
			},
			{
				slug: 'weekend-holding',
				title: 'Weekend Holding',
				body: `By default, holding any position open during the weekend closure (**Friday 23:00 UTC – Sunday 23:00 UTC**) is prohibited for **all account types and stages**: Step 1, Step 2, and Instant, across both Challenge and Funded.

This applies to all tradable instruments, including 24/7 assets like crypto, which must still follow the same weekend schedule.

## Weekend Holding add-on

Weekend holding is only permitted if the trader purchases the **Weekend Holding add-on** at checkout, for an additional fee.

## Key points

- Applies to all account types and stages: Step 1, Step 2, Instant, Challenge and Funded.
- Prohibited by default — requires the paid Weekend Holding add-on to unlock.
- Applies to all instruments, including 24/7 assets like crypto.
- All other risk rules continue to apply in full even with the add-on — the trader accepts full responsibility for weekend gap risk, slippage, and equity/margin swings at market open.
- Failure to comply without the add-on may result in trade removal, profit adjustment, withdrawal rejection, or account termination in repeat or severe cases.

> **Overnight holding is different.** Holding positions overnight on a normal trading day is **allowed by default on every plan**, with no add-on required. Swap/rollover charges apply as normal.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'funding-payouts',
		title: 'Withdrawals',
		articles: [
			{
				slug: 'withdrawal-eligibility',
				title: 'When am I eligible to request a withdrawal?',
				body: `A withdrawal request requires **all** of the following to be true:

- At least **14 days** have passed since your account was received (funded).
- Your account has met the required number of **Profitable Days**.
- For Instant and Funded Stage accounts only: you have additionally completed the **2 required Trading Days** as part of the overall minimum days requirement.
- Your account is in profit.
- Your account has zero rule violations.
- All your trading complies with GenzProp terms, rules, and guidelines.

**No minimum profit threshold applies to any account type, including Instant.**`,
			},
			{
				slug: 'profit-split',
				title: 'How is profit split between me and GenzProp?',
				body: `| Withdrawal Number | Trader Split | Firm Split |
| 1st withdrawal | 80% | 20% |
| 2nd withdrawal | 85% | 15% |
| 3rd withdrawal | 90% | 10% |
| 4th and all subsequent | 90% | 10% |

The split only increases if every earlier withdrawal was completed with no rule violations. From the 3rd withdrawal onward, the split stays fixed at 90/10 for every future payout.

GenzProp can adjust or reset your split if rules are not followed.`,
			},
			{
				slug: 'withdrawal-limit',
				title: 'Is there a limit on how much I can withdraw at once?',
				body: `**Yes.** The maximum withdrawable profit per payout period is capped at **6% of your Initial Account Balance**, regardless of how much profit you earned in that period. This applies to all funded accounts (Step 1, Step 2, and Instant).

Profit above the 6% cap is not lost — it stays on your account and can be withdrawn in a future payout period, as long as all rules are respected.`,
			},
			{
				slug: 'withdrawal-processing-time',
				title: 'How long do withdrawals take?',
				body: `- Withdrawals run on a **bi-weekly** schedule (every 14 calendar days).
- Most payouts are processed within about **48 working hours**; some may take **5–7 working days**.
- After you submit a withdrawal request, **all open trades must be closed immediately**, and no new trades can be opened until the withdrawal is processed. Trading after a request can lead to your withdrawal being cancelled or other account action.
- Only **realised** profit is withdrawable — unrealized/floating profit does not count.`,
			},
			{
				slug: 'account-fee-refund',
				title: 'Do I get my account fee back?',
				body: `Your full account fee is returned with your **first successful withdrawal**, as long as there are no rule violations.

If that withdrawal is rejected for a violation, the fee return is voided.

**Fees are not returned on Instant accounts.**`,
			},
			{
				slug: 'after-a-withdrawal',
				title: 'What happens to my account after a withdrawal?',
				body: `After each successful withdrawal, your account's balance and equity are reset under the GenzProp reset policy, and a new trading cycle begins.

All trading rules continue to apply as normal.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'prohibited-strategies',
		title: 'Prohibited Trading Practices',
		articles: [
			{
				slug: 'prohibited-trading-practices',
				title: 'Prohibited Trading Practices',
				body: `At GenzProp, we aim to discover and fund disciplined traders who demonstrate genuine market edge, solid risk management, and long-term consistency. To maintain a fair and realistic simulated environment, strategies designed to exploit platform mechanics, data lag, or system vulnerabilities are strictly forbidden.

Engaging in any of the following prohibited behaviours across any account phase (Evaluation or Funded) may lead to **immediate account termination and forfeiture of rewards without prior notice**.

## 1. Reverse Arbitrage

**What it means:** exploiting artificial price discrepancies caused by platform connectivity lag, bridge delays, or server desynchronization, rather than trading true market inefficiencies.

**Example:** a trader notices that Broker A's price feed lags behind Broker B by 500 milliseconds during high volatility. They place orders on GenzProp solely to capture the stale price before the feed catches up, carrying zero real market risk.

## 2. Hedging Between Accounts

**What it means:** opening opposing buy and sell positions on the same financial asset across two or more accounts owned by the same trader or coordinated among a group of traders.

**Example:** you buy 10 lots of EUR/USD on Account A and simultaneously sell 10 lots of EUR/USD on Account B before a major news event. One account is guaranteed to blow up while the other passes the evaluation, bypassing genuine risk control.

## 3. Tick Scalping

**What it means:** entering and exiting positions within seconds to scalp fractions of a pip off platform latency or quote flickers.

**Rule threshold:** closing **3 or more trades held for less than 10 seconds within a 1-hour window** constitutes an immediate hard breach.

**Example:** opening a trade on XAU/USD and closing it 4 seconds later for a 2-pip gain, then repeating this pattern multiple times within minutes.

## 4. Abusive Autotrading

**What it means:** using Expert Advisors (EAs), bots, or algorithms engineered specifically to exploit server latency, queue delays, or platform glitches rather than executing legitimate technical or fundamental strategies.

**Example:** deploying a high-frequency trading bot designed to flood the trading server with microsecond limit orders to front-run execution queues.

## 5. Latency Trading

**What it means:** taking advantage of millisecond differences between a high-speed institutional data feed and the simulated retail broker feed.

**Example:** looking at an ultra-fast raw institutional feed and instantly firing orders on the retail platform knowing the retail chart will reflect that price change half a second later.

## 6. Martingale & Grid Strategies

**What it means:**

- **Martingale:** doubling or multiplying lot sizes after losing trades to break even on a single retracement.
- **Grid trading:** placing continuous buy and sell orders at rigid intervals without directional analysis, stop losses, or risk control.

**Example:** you buy 1 lot of GBP/USD and it drops 20 pips. You then buy 2 lots; it drops another 20 pips, so you buy 4 lots, escalating position sizes exponentially until your account equity is exposed to catastrophic drawdown.

## 7. Hyperactive Trading

**What it means:** flooding the trading server with rapid orders, cancellations, or modifications inside extremely short windows without a credible analytical strategy.

**Example:** an algorithm submitting 200 order modifications or cancel-replace requests per minute, creating artificial server load and spamming market depth logs.

## 8. Account Sharing & Pass Services

**What it means:** handing account credentials over to third parties, hiring "account passing" firms, or delegating trade management.

**Example:** hiring a service to log into your GenzProp account via VPS and trade on your behalf to complete Phase 1.

## 9. Exploiting Technical Errors & Glitches

**What it means:** knowingly trading on mispriced instruments, frozen charts, faulty spreads, or broker-side software glitches.

**Example:** a weekend rollover glitch causes BTC/USD to display a spread error or frozen quote 2% away from fair value. A trader repeatedly places orders into the frozen quote to lock in guaranteed profit when normal pricing resumes.

## 10. Gambling & Unsystematic Trading

**What it means:** reckless, emotional execution devoid of risk parameters — such as "all-in" revenge trading, over-leveraging the entire margin on a single binary bet, or trading without pre-calculated stop parameters.

**Example:** after taking an initial 2% loss, a trader immediately opens the maximum allowed lot size on a single gold position hoping to recover the loss on one candle.

## 11. Account Rolling (Churning Accounts)

**What it means:** purchasing multiple assessment accounts at once and executing ultra-high-risk, reckless setups across them until one accidentally passes by luck.

**Example:** purchasing five $100k accounts on the same day, opening maximum leverage positions on different volatile pairs across all five, and expecting four to fail while one hits the profit target by chance.

## 12. Unauthorized Copy Trading

**What it means:** replicating trades directly from external signals, public copy networks, or third-party providers without independent analysis or authorization.

**Example:** connecting your GenzProp account to a public trading pool or social copy-trading app where hundreds of retail users execute the identical trade tickets and timestamps simultaneously.

## 13. Price Arbitrage

**What it means:** capturing discrepancies between delayed price feeds across different platforms where the trade does not reflect real-market risk or genuine liquidity interaction.

**Example:** exploiting an artificial spread delay where Platform X updates 3 seconds slower than the broader market, locking in a synthetic, risk-free profit before the feed synchronizes.`,
			},
		],
	},

	// -----------------------------------------------------------------------
	{
		slug: 'account-reference',
		title: 'Account Structure & Limits',
		articles: [
			{
				slug: 'account-structure',
				title: 'Account Structure',
				body: `GenzProp offers **3 account types**:

- Step 1
- Step 2
- Instant

A **Funded Stage** is reached after successfully completing Step 1 or Step 2. Instant accounts are funded from day one.`,
			},
			{
				slug: 'profitable-days-requirement',
				title: 'Profitable Days Requirement',
				body: `Applies to all account types: Step 1, Step 2, Instant, and all Funded Stages.

| Account Type | Minimum Profitable Days |
| Step 1 | 3 |
| Step 2 | 3 |
| Instant | 5 (3 Profitable + 2 Trading) |
| All Funded Stages | 5 (3 Profitable + 2 Trading) |

## Definition

- A Profitable Day is a single trading day in which profit reaches at least **0.5%** of the account's initial starting balance/equity.
- Calculated on an equity basis.
- Daily reset occurs at **00:00 UTC**.
- Profitable Days must fall on separate calendar days.
- Profits from different days cannot be combined to form one Profitable Day.`,
			},
			{
				slug: 'what-is-the-maximum-daily-drawdown',
				title: 'What is the Maximum Daily Drawdown?',
				body: `- The Maximum Daily Drawdown is **4% of your Initial Account Balance**, applying to every account type and stage (Challenge and Funded).
- This is a **static** limit — it does not grow with profits or your peak equity.
- Both balance and equity are monitored, including floating losses on open trades.
- Breaching this limit results in immediate account failure for that trading day.`,
			},
			{
				slug: 'what-is-the-maximum-loss-limit',
				title: 'What is the Maximum Loss (Overall) limit?',
				body: `The Maximum Loss is the total loss allowed on the account over its entire lifetime:

| Account Type | Maximum Loss |
| Step 1 / Step 2 (Challenge & Funded) | 10% of Initial Account Balance |
| Instant / Funded Account | 6% of Initial Account Balance |

- The limit is **static** and is always measured from the Initial Account Balance — it never trails upward with profits.
- Both balance and equity are monitored, including floating losses on open positions.
- Breaching it fails and permanently terminates the account, regardless of any later recovery.
- All daily loss and Profitable Day calculations reset at **00:00 UTC**, based on dashboard time. The dashboard countdown timer is the sole and final reference — not your broker's server time or your local time.`,
			},
		],
	},
];

const categoryMap = new Map(HELP_CATEGORIES.map((c) => [c.slug, c]));

export function getHelpCategory(slug: string): HelpCategory | undefined {
	return categoryMap.get(slug);
}

export function getHelpArticle(
	categorySlug: string,
	articleSlug: string,
): { category: HelpCategory; article: HelpArticle } | undefined {
	const category = getHelpCategory(categorySlug);
	if (!category) return undefined;
	const article = category.articles.find((a) => a.slug === articleSlug);
	if (!article) return undefined;
	return { category, article };
}

export function getAllHelpCategorySlugs(): string[] {
	return HELP_CATEGORIES.map((c) => c.slug);
}
