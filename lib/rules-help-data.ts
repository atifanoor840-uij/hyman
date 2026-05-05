/**
 * Help center collections under /rules/help — category list + article bodies.
 * Body strings use **double asterisks** for bold segments; paragraphs separated by blank lines.
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

const ph = (topic: string) =>
	`This guide covers **${topic}** at GenzProp. For official program rules and numbers, see the **Trading Rules** section on our rules page.\n\nIf anything is unclear, contact support — we're happy to help.`;

export const HELP_CATEGORIES: HelpCategory[] = [
	{
		slug: 'challenge-rules',
		title: 'Challenge rules',
		articles: [
			{
				slug: 'sigma-instant-rules',
				title: 'Instant — rules overview',
				body: `**Instant** accounts use simulated capital under real market conditions. There is no separate evaluation phase.\n\nKey points include **balance-based drawdowns**, **leverage 1:100**, restrictions on scalping, grid, martingale, hedging, and EAs, plus **consistency** and **payout** rules.\n\nSee the full **Rules by Account Type** section on the main rules page for the complete list.`,
			},
			{
				slug: 'beta-challenge-rules',
				title: 'Step 2 — challenge rules overview',
				body: `**Step 2** programs follow our standard challenge structure with **daily and maximum drawdown** limits calculated from your account balance.\n\n**EA use**, **overnight** and **weekend holding**, and **news trading** are allowed under Step 2 rules where stated. An **inactivity rule** may apply if no trades are opened for an extended period.\n\nRefer to the rules page for exact percentages and conditions.`,
			},
			{
				slug: 'alpha-challenge-rules',
				title: 'Step 1 — challenge rules overview',
				body: `**Step 1** typically includes a **single evaluation phase** before funded access, with **minimum trading days**, **drawdown limits**, and **profit split** tiers.\n\n**Weekend holding**, certain strategies, and **minimum trade holding time** on live accounts may apply. Always confirm current terms on the **Rules** page.`,
			},
		],
	},
	{
		slug: 'getting-started',
		title: 'Get Started',
		articles: [
			{
				slug: 'what-is-GenzProp',
				title: 'What is GenzProp?',
				body: `GenzProp is a **proprietary trading firm** that provides traders with access to **funded trading accounts**, allowing them to trade financial markets **without risking their own capital** while keeping a **major share of the profits** they generate.`,
			},
			{
				slug: 'how-to-purchase-challenge',
				title: 'How can I purchase the Challenge?',
				body: `🛠 **Step-by-Step**\n\n**Create Your Account**\n\nVisit the **GenzProp website** and create your account.\n\n**Choose Your Challenge**\n\nSelect the **evaluation program** that suits your trading style.\n\n**Select Account Size**\n\nChoose your preferred account size, typically ranging from **$5,000 to $200,000**.\n\n**Complete Payment**\n\nComplete the payment using the available methods such as **credit/debit card**, **cryptocurrency**, or other supported payment options.\n\n**Receive Your Account Details**\n\nYour **trading account credentials** will be delivered to your email within minutes, including **platform login details** and access to the **GenzProp dashboard**.`,
			},
			{
				slug: 'which-trading-platforms-supported',
				title: 'Which Trading Platforms are Supported?',
				body: `GenzProp offers traders access to both **MetaTrader 4 (MT4)** and **MetaTrader 5 (MT5)**, two of the most widely used trading platforms in the industry.\n\n**Desktop**\n\nTrade from the **desktop terminal** for Windows and macOS where supported.\n\n**Web**\n\nUse the **web-based** platform in your browser when you cannot install software.\n\n**Mobile**\n\nDownload the **MT4/MT5 mobile apps** for iOS and Android to manage positions on the go.\n\nYou will receive **server and login** details for your program after purchase or account assignment.`,
			},
		],
	},
	{
		slug: 'general',
		title: 'General',
		articles: [
			{ slug: 'who-can-join', title: 'Who can join GenzProp?', body: ph('eligibility and who our programs are for') },
			{ slug: 'fees-and-refunds', title: 'Fees and refundable fees', body: ph('how fees work and when refunds may apply') },
			{ slug: 'kyc-and-compliance', title: 'KYC and compliance', body: ph('verification and compliance expectations') },
			{ slug: 'support-hours', title: 'Support and response times', body: ph('how to reach support') },
			{ slug: 'legal-disclaimer', title: 'Educational & simulated trading disclaimer', body: ph('how our services are described legally') },
		],
	},
	{
		slug: 'dashboard',
		title: 'Dashboard',
		articles: [
			{
				slug: 'how-long-credentials',
				title: 'How Long Will It Take to Receive My Credentials?',
				body: `The time required to receive your **trading credentials** depends on the **successful confirmation of your payment**.\n\nOnce your payment is confirmed, whether made through **card** or **cryptocurrency**, your trading account credentials will be generated **automatically**.\n\nYou will be able to access your credentials directly from your **GenzProp dashboard**, and they will also be sent to your **registered email address** for your convenience.\n\nIn most cases, this process is completed **shortly after** the payment is successfully confirmed.`,
			},
			{
				slug: 'switch-between-accounts',
				title: 'How Can I Switch Between Accounts on the Dashboard?',
				body: `If you have **multiple accounts** with GenzProp, you can easily switch between them directly from your dashboard.\n\n**Follow these steps:**\n\n**Click** on the **account selection dropdown** located in the **top-right corner** of your dashboard near your profile name.\n\n**Open** the dropdown menu to view the list of available **account types** or **programs** linked to your profile.\n\n**Select** the **account number** you want to access from the list.\n\nOnce selected, the dashboard will **update automatically** to display the information and statistics for that specific account.\n\nThis feature allows traders to quickly navigate between multiple accounts and manage them conveniently from one place. 🚀`,
			},
			{
				slug: 'dashboard-features',
				title: `What Features do we offer in our trader's dashboard?`,
				body: `**1. Account Information**\n\nDisplays basic account details such as account ID, type, platform, size, start date, and current status.\n\n**2. Balance & Equity**\n\nShows the current account balance, equity, floating P/L, and closed profit or loss.\n\n**3. Profit Target Tracking**\n\nTracks the trader's progress toward reaching the required profit target to pass the phase.\n\n**4. Drawdown Monitoring**\n\nMonitors daily and overall loss limits and shows the remaining drawdown available.\n\n**5. Trading Statistics**\n\nProvides key performance metrics such as total trades, win rate, average win/loss, and profit factor.\n\n**6. Trading History**\n\nDisplays a complete record of all executed trades with detailed information.\n\n**7. Rule Monitoring**\n\nShows whether the trader is complying with all trading rules and risk limits.\n\n**8. Platform Credentials**\n\nProvides trading platform login details including ID, password, server, and download links.\n\n**9. Profit Split & Payouts**\n\nShows available profits, profit split percentage, withdrawable amount, and payout history.\n\n**10. Certificates**\n\nProvides downloadable certificates for passing phases and becoming a funded trader.\n\n**11. Notifications**\n\nDisplays important alerts such as rule warnings, drawdown alerts, phase results, and payout updates.\n\n**12. Account Actions**\n\nAllows traders to reset accounts, restart challenges, buy add-ons, or upgrade accounts.\n\n**13. Support**\n\nGives access to customer support through live chat, tickets, FAQ, and community channels.\n\n**In Short:**\n\nThe prop firm dashboard provides traders with **account status**, **performance analytics**, **rule tracking**, **trade history**, **payouts**, and **account management** in one place.`,
			},
		],
	},
	{
		slug: 'prohibited-strategies',
		title: 'Prohibited strategies',
		articles: [
			{
				slug: 'prohibited-trading-practices',
				title: 'Prohibited Trading Practices – GenzProp',
				body: `At GenzProp, we aim to maintain a fair, professional, and sustainable trading environment for all traders. Any trading activity that attempts to exploit system delays, technical weaknesses, or avoids real market risk is strictly forbidden.\n\nThese rules ensure that traders are evaluated based on real trading skill, proper risk management, and genuine market participation.\n\nIf any prohibited activity is detected, the account may face actions such as:\n\n• Profit cancellation\n• Account suspension\n• Account termination\n• Removal from the GenzProp program\n\nThese actions may be applied without prior notice, especially on Instant and Funded Accounts.\n\n**Reverse Arbitrage**\n\nWhat It Means:\n\nReverse arbitrage happens when a trader tries to take advantage of price delays between different platforms or brokers instead of trading the actual market.\n\nThis usually occurs when a trader sees a price move on one platform and quickly trades on another platform where the price has not updated yet.\n\nWhy It Is Not Allowed:\n\nThis practice is not considered real trading because it relies on technical delays instead of market analysis.\n\nIt also creates an unfair advantage over other traders.\n\nExample:\n\nA trader sees EUR/USD move up on another broker first and immediately opens a buy trade on GenzProp before the price updates there.\n\n**Hedging Between Multiple Accounts**\n\nWhat It Means:\n\nHedging between accounts means opening opposite trades on different accounts for the same instrument.\n\nHedging inside a single account may be acceptable depending on trading conditions, but hedging across multiple GenzProp accounts is strictly prohibited.\n\nWhy It Is Not Allowed:\n\nThis removes real market risk because one account will gain when the other loses.\n\nThe goal of GenzProp is to evaluate real trading performance.\n\nExample:\n\nOpening a Buy trade on EUR/USD on one account and a Sell trade on EUR/USD on another account at the same time.\n\n**Tick Scalping**\n\nWhat It Means:\n\nTick scalping refers to opening and closing trades extremely quickly (within seconds) to capture very small price movements.\n\nThis is often done using automated systems.\n\nGenzProp Rule:\n\nTick scalping is not allowed on Instant and Funded Accounts.\n\nHard Violation:\n\nIf 3 trades are closed in less than 10 seconds within one hour, it may be considered a rule violation.\n\nWhy It Is Not Allowed:\n\n• Exploits execution speed rather than trading skill\n• Creates unnecessary load on trading systems\n• Does not represent meaningful market analysis\n\nExample:\n\nOpening and closing several trades within a few seconds to gain only 1–2 pips repeatedly.\n\n**Trade Layering**\n\nWhat It Means:\n\nTrade layering happens when a trader opens multiple trades too quickly within a short time period.\n\nInstead of waiting for a proper setup, the trader keeps adding positions rapidly.\n\nGenzProp Rule:\n\nOnly one trade can be opened within a 5-minute period.\n\nOpening another trade before 5 minutes from the previous trade opening may be considered a violation.\n\nWhy It Is Not Allowed:\n\n• Creates excessive exposure very quickly\n• Can imitate grid or aggressive strategies\n• Prevents proper risk control\n\nExample:\n\nOpening a trade at 10:00 and opening another trade at 10:03.\n\n**Minimum Trade Holding Time**\n\nGenzProp Rule:\n\nAll trades on Instant and Funded Accounts must remain open for at least 3 minutes before they are closed.\n\nTrades closed earlier than this time may be considered a violation.\n\nWhy This Rule Exists:\n\nThis rule helps prevent:\n\n• Tick scalping\n• Latency trading\n• Ultra-high-frequency trading strategies\n\nExample:\n\nOpening a trade at 10:00 and closing it at 10:01:30 would violate the rule.\n\nClosing it at 10:03 or later is acceptable.\n\n**Abusive Automated Trading**\n\nWhat It Means:\n\nUsing trading robots (EAs) or algorithms in a way that abuses system delays or technical gaps.\n\nAutomation itself is not always prohibited, but using bots to exploit infrastructure is not allowed.\n\nWhy It Is Not Allowed:\n\n• Exploits platform mechanics\n• Generates artificial profits\n• Does not reflect real trading decisions\n\nExample:\n\nA bot opening dozens of trades per minute to benefit from execution delays.\n\n**Latency Trading**\n\nWhat It Means:\n\nLatency trading occurs when a trader attempts to benefit from milliseconds of delay between price feeds.\n\nInstead of reacting to real market movement, the trader reacts to delayed price updates.\n\nWhy It Is Not Allowed:\n\n• Creates unfair advantages\n• Disrupts platform performance\n• Does not represent genuine market trading\n\nExample:\n\nSeeing a price movement on a fast data feed and entering a trade on GenzProp before the price updates.\n\n**Martingale and Grid Strategies**\n\nWhat They Mean:\n\nMartingale Strategy:\n\nIncreasing the trade size after each losing trade in an attempt to recover previous losses with one winning trade.\n\nGrid Strategy:\n\nOpening many buy and sell orders at fixed price levels without proper risk management.\n\nWhy These Strategies Are Not Allowed:\n\n• Can create extremely large losses\n• Lead to uncontrolled exposure\n• Do not follow responsible risk management\n\nExample:\n\nA trader doubles the position size after each loss hoping that one winning trade will recover all previous losses.\n\n**Excessive or Hyperactive Trading**\n\nWhat It Means:\n\nOpening, modifying, or cancelling a large number of trades within a very short period without a clear strategy.\n\nWhy It Is Not Allowed:\n\n• Can overload trading servers\n• Often indicates automated exploitation\n• Not considered professional trading behavior\n\nExample:\n\nOpening hundreds of trades in a single day without clear trading logic.\n\n**Account Sharing**\n\nWhat It Means:\n\nAllowing another person to trade your account or using external services to pass a challenge.\n\nWhy It Is Not Allowed:\n\nGenzProp accounts must be traded only by the registered trader.\n\nAccount sharing can violate identity verification and security policies.\n\nExample:\n\nHiring someone else to trade your GenzProp account.\n\n**Exploiting Platform Errors**\n\nWhat It Means:\n\nTaking advantage of technical problems such as:\n\n• Frozen prices\n• Incorrect spreads\n• Execution delays\n• Data errors\n\nWhy It Is Not Allowed:\n\nThese situations do not reflect real trading conditions.\n\nExample:\n\nOpening trades during a known platform glitch to profit from incorrect prices.\n\n**Gambling Behavior**\n\nWhat It Means:\n\nTrading randomly without proper analysis or risk management.\n\nThis includes emotional trading or extremely high-risk positions.\n\nWhy It Is Not Allowed:\n\nGenzProp promotes professional and disciplined trading, not luck-based speculation.\n\nExample:\n\nOpening a very large trade after a loss in an attempt to recover quickly without analysis.\n\n**Account Rolling**\n\nWhat It Means:\n\nBuying many evaluation accounts and applying extremely risky strategies until one account passes by chance.\n\nWhy It Is Not Allowed:\n\nThis approach relies on probability instead of consistent trading performance.\n\nExample:\n\nPurchasing multiple accounts repeatedly and using very high risk until one account passes the challenge.`,
			},
			{
				slug: 'ea-scalping-martingale',
				title: 'Summary of prohibited strategy categories',
				body: `Key prohibited areas at GenzProp include:\n\n• Reverse arbitrage and latency exploitation\n• Hedging between multiple accounts\n• Tick scalping and ultra-fast execution abuse\n• Trade layering and aggressive position stacking\n• Abusive automation and infrastructure exploitation\n• Martingale and grid-style risk escalation\n• Account sharing and challenge-pass outsourcing\n• Exploiting known platform errors\n• Gambling-style, non-systematic risk behavior\n• Account rolling across many high-risk evaluations\n\nAll traders are expected to follow disciplined, risk-managed, and genuine market trading behavior.`,
			},
		],
	},
	{
		slug: 'evaluation',
		title: 'Evaluation',
		articles: [
			{ slug: 'evaluation-overview', title: 'How evaluation works', body: ph('evaluation phases and objectives') },
			{ slug: 'pass-and-fail', title: 'Pass, fail, and resets', body: ph('what happens when you pass or breach rules') },
			{ slug: 'profit-targets', title: 'Profit targets and drawdown', body: ph('how targets and drawdown are measured') },
		],
	},
	{
		slug: 'trading-rules-guidelines',
		title: 'Trading Rules and guidelines',
		articles: [
			{
				slug: 'daily-drawdown-daily-loss-limit',
				title: 'Daily Drawdown (Daily Loss Limit)',
				body: `**Definition**\n\nThe Daily Drawdown, also known as the Daily Loss Limit, represents the maximum amount a trader is allowed to lose within a single trading day.\n\nAt GenzProp, the Daily Drawdown is calculated as an Equity-Based Static Drawdown, which means:\n\n• The limit is calculated based on the Initial Account Balance and measured from the start of each trading day.\n• The rule considers both closed trades and floating (unrealized) losses.\n• The daily limit resets at the beginning of each new trading day.\n• If at any moment during the day the account equity falls below the allowed daily limit, the account will breach the rule and fail the evaluation.\n\n**How the Daily Drawdown is Calculated**\n\nDaily Drawdown Limit = Start of Day Equity × Daily Drawdown %\n\nThe maximum loss allowed for the day is fixed once the trading day begins.\n\n**Example 1**\n\nStart of Day Equity: $100,000\nDaily Drawdown Limit: 4%\nMaximum Daily Loss: $100,000 × 4% = $4,000\nMinimum equity allowed during the day: $100,000 − $4,000 = $96,000\n\nIf the account equity reaches $96,000 or below at any time during the day, the account fails the challenge.\n\n**Example 2**\n\nStart of Day Equity: $103,000\nDaily Drawdown Limit: 4%\nMaximum Daily Loss: $103,000 × 4% = $4,120\nMinimum equity allowed during the day: $103,000 − $4,120 = $98,880\n\nIf the account equity drops to $98,880 or below during that trading day, the account violates the Daily Drawdown rule.\n\n**Important Notes**\n\n• The Daily Drawdown is equity-based, meaning open trades are included in the calculation.\n• The rule is monitored in real-time.\n• The Daily Drawdown resets automatically at the start of each new trading day.`,
			},
			{
				slug: 'maximum-drawdown-overall-loss-limit',
				title: 'Maximum Drawdown (Overall Loss Limit)',
				body: `**Definition**\n\nThe Maximum Drawdown, also known as the Overall Loss Limit, is the maximum total loss allowed on the account during the entire evaluation period.\n\nAt GenzProp, the Maximum Drawdown is set at 10% of the Initial Account Balance. This limit is static, meaning it is always calculated from the initial balance and does not increase if the account makes profits.\n\nThe rule is monitored using both Balance and Equity, which means closed trades and floating (unrealized) losses are included.\n\nIf at any time the account Balance or Equity falls below the allowed drawdown level, the account will breach the rule and fail the evaluation.\n\n**How the Maximum Drawdown is Calculated**\n\nMaximum Drawdown Limit = Initial Account Balance × 10%\nMinimum allowed equity = Initial Account Balance − Maximum Drawdown\n\n**Example**\n\nInitial Account Balance: $100,000\nMaximum Drawdown: 10%\nMaximum loss allowed: $100,000 × 10% = $10,000\nMinimum allowed Balance or Equity: $100,000 − $10,000 = $90,000\n\n**Scenario**\n\n• The account starts with $100,000.\n• After profitable trading, the balance increases to $108,500.\n• Later, the account experiences losses and the balance drops to $95,400.\n• The account remains valid because the total loss from the initial balance is $4,600, which is still within the $10,000 maximum drawdown limit.`,
			},
			{
				slug: 'stop-loss-policy',
				title: 'Stop-Loss Policy',
				body: `At GenzProp, the use of a Stop-Loss is not mandatory, but it is strongly recommended as part of responsible risk management.\n\nTrading without a stop-loss means the risk on the position is not predefined, and traders must carefully manage their exposure.\n\nIf the unrealized loss on a single instrument exceeds 50% of the Daily Drawdown limit, it may be considered excessive or one-sided risk exposure and may result in a rule violation.\n\nUsing stop-loss orders helps protect the account and maintain compliance with GenzProp risk management rules.`,
			},
			{
				slug: 'minimum-holding-time-rule',
				title: 'Minimum Holding Time Rule',
				body: `At GenzProp, the minimum holding time for trades is 3 minutes on Instant and Funded Accounts. Any trade that is opened and closed in less than 3 minutes may be considered a rule violation.\n\nThis rule is implemented to prevent ultra-short-term trading strategies, such as tick scalping or latency exploitation, on funded capital.\n\nHowever, the Minimum Holding Time rule does not apply during the Evaluation Phase. Traders in Phase 1 and Phase 2 are allowed to close trades at any time without a minimum holding requirement.\n\n**Key Points**\n\n• Minimum holding time: 3 minutes\n• Applies to Instant and Funded Accounts only\n• Not applied during Phase 1 and Phase 2 (Evaluation)\n• Trades closed before 3 minutes on Instant or Funded Accounts may be considered non-compliant trading activity.`,
			},
			{
				slug: 'profit-consistency-rule-30',
				title: 'Profit Consistency Rule (30%)',
				body: `To promote consistent and disciplined trading, GenzProp applies a 30% Profit Consistency Rule on Instant and Funded Accounts.\n\nUnder this rule, traders cannot generate more than 30% of the payout cycle profit from a single trade or a single trading day. This ensures that profits are achieved through stable and consistent trading, rather than one large position.\n\n**Important:** This rule does not apply during the Evaluation Phase (Phase 1 and Phase 2). Traders in the challenge phases are not restricted by the Profit Consistency Rule.\n\n**Profit Cap**\n\nEach payout cycle has a maximum profit cap of 6% of the account balance.\n\n**Example ($100,000 Account)**\n\nAccount Balance: $100,000\nMaximum Profit per Cycle (6%): $6,000\nApplying the 30% Consistency Rule: 30% of $6,000 = $1,800\n\nTherefore:\n\n• Maximum profit per trade = $1,800\n• Maximum profit per day = $1,800\n\nIf the profit from a single trade or a single day exceeds $1,800, it will be considered a rule violation.\n\n**Formula**\n\nMaximum allowed profit per trade or per day:\nAccount Balance × 6% × 30%\n\nThis equals 1.8% of the account balance.\n\n**Quick Examples**\n\n• $10,000 account: Profit cap $600, 30% rule limit $180\n• $50,000 account: Profit cap $3,000, 30% rule limit $900\n• $100,000 account: Profit cap $6,000, 30% rule limit $1,800\n\nTraders must ensure their profits remain within this limit to maintain payout eligibility on Instant and Funded Accounts.`,
			},
			{
				slug: 'minimum-profitable-days-requirement',
				title: 'Minimum Profitable Days Requirement',
				body: `To successfully complete the Challenge Phase, traders must record at least 3 Winning Days.\n\nA Winning Day is a trading day in which the account achieves a minimum profit of 0.5% of the initial challenge balance within that same day. The profit is calculated based on equity, meaning both closed trades and floating profit are considered.\n\n**Key Points**\n\n• Each Winning Day must occur on a different calendar day.\n• Trading performance is reset daily at 00:00 UTC, as reflected on your dashboard.\n• Profits from multiple days cannot be combined to qualify as a Winning Day.\n\n**Example**\n\nInitial Challenge Balance: $100,000\nRequired profit for one Winning Day: 0.5% of $100,000 = $500\n\nScenario 1: Day 1 profit = $520 (counts as 1 Winning Day)\nScenario 2: Day 2 profit = $300 (does not qualify)\nScenario 3: Day 3 profit = $650 (counts as another Winning Day)\n\nIn this case, the trader has 2 Winning Days and must achieve one more qualifying day to meet the requirement of 3 Winning Days.`,
			},
			{
				slug: 'minimum-trading-days-requirement',
				title: 'Minimum Trading Days Requirement',
				body: `To complete the Challenge Phase, traders must trade for at least 4 separate trading days.\n\nA trading day is counted when the trader opens and closes at least one trade during that day. This rule ensures that traders demonstrate consistent trading activity rather than achieving results in a very short period of time.\n\n**Key Points**\n\n• The minimum requirement is 4 trading days.\n• Trading days must occur on separate calendar days.\n• Reaching the profit target before completing 4 trading days will not immediately pass the challenge.\n\n**Example**\n\nInitial Account Balance: $100,000\nProfit Target: $10,000\n\nScenario:\n\n• Day 1 profit: $6,000\n• Day 2 profit: $4,000\n\nAlthough the trader has reached the $10,000 profit target, they have only traded for 2 days.\n\nThe trader must continue trading until at least 4 trading days are completed to successfully pass the challenge.`,
			},
			{
				slug: 'news-trading-policy',
				title: 'News Trading Policy',
				body: `At GenzProp, news trading is allowed during both the Challenge Phase (Phase 1 and Phase 2) and the Funded Phase.\n\nTraders are permitted to open, close, or hold positions during high-impact economic news releases and major market events.\n\nHowever, traders should be aware that news events can cause increased volatility, wider spreads, and slippage. All trades placed during news events must still comply with GenzProp risk management rules, including Daily Drawdown and Maximum Loss limits.\n\nTraders are fully responsible for managing their risk when trading during high-impact news periods.`,
			},
			{
				slug: 'trade-layering-rule',
				title: 'Trade Layering Rule',
				body: `**What is Trade Layering?**\n\nTrade layering means opening multiple trades too quickly one after another instead of waiting some time between trades. This can create too much risk on the account in a very short time.\n\n**GenzProp Rule (Funded / Instant Accounts)**\n\n• A trader can open only one trade within a 5-minute period.\n• If another trade is opened before 5 minutes have passed from the previous trade opening, it will be considered trade layering.\n• If this rule is violated, the account may be terminated during the final review.\n\nThis rule applies even if the first trade is already closed.\n\n**Simple Example**\n\nAllowed:\n\n• Open a trade at 10:00\n• Open the next trade at 10:06\n\nSince more than 5 minutes passed, this is allowed.\n\nNot Allowed:\n\n• Open a trade at 10:00\n• Open another trade at 10:03\n\nSince the second trade was opened within 5 minutes, this is considered trade layering and may result in account failure.\n\n**Why This Rule Exists**\n\nThis rule helps prevent:\n\n• Excessive risk in a short time\n• Grid or aggressive scaling strategies\n• Uncontrolled position stacking\n\nIt ensures traders maintain disciplined and structured trade entries.`,
			},
			{
				slug: 'general-rules-account-violation',
				title: 'General Rules: What Happens If My GenzProp Account Violates a Trading Rule?',
				body: `If a rule violation or any prohibited trading activity is detected on your GenzProp account, the account may be suspended and will no longer be eligible to continue in the program.\n\nThis means the account may lose the ability to:\n\n• Progress to the next evaluation stage\n• Qualify for a funded account\n• Receive any profit payouts or rewards\n\nGenzProp continuously monitors trading activity to ensure that all traders follow the firm's risk management guidelines and trading rules. Any confirmed breach of these rules may result in account termination in order to maintain a fair and disciplined trading environment.`,
			},
		],
	},
	{
		slug: 'trading',
		title: 'Trading',
		articles: [
			{ slug: 'instruments', title: 'What can I trade?', body: ph('available instruments') },
			{ slug: 'execution', title: 'Execution and spreads', body: ph('execution') },
		],
	},
	{
		slug: 'funding-payouts',
		title: 'Funding and payouts',
		articles: [
			{
				slug: 'when-can-i-request-payout',
				title: 'When Can I Request a Payout?',
				body: `You become eligible to request a payout from GenzProp once the following conditions are met:\n\n• Your account is fully funded\n• At least 15 calendar days have passed since your first trade\n• You have completed the minimum required number of profitable trading days\n• Each counted trading day must achieve at least 0.5% profit\n• Your account must be in overall profit\n• No open trades are present when submitting the payout request\n• All trading activity must comply with GenzProp rules\n\n**Note:**\n\nPayout eligibility is calculated from the date of your **first trade**, not the account creation date.`,
			},
			{
				slug: 'payout-cycle',
				title: 'Payout Cycle',
				body: `GenzProp operates on a **bi-weekly payout system**.\n\n**Default Payout Schedule**\n\n• First Payout: Eligible after completing the required profitable trading days and meeting the minimum profit conditions.\n• Next Payouts: Available every 14 days (2 weeks) after the previous payout request.\n\n**Note:**\n\nCalendar days include weekends, and inactive trading days do not reset the payout cycle.`,
			},
			{
				slug: 'minimum-withdrawal-amount',
				title: 'Minimum Withdrawal Amount',
				body: `The minimum payout amount for GenzProp funded accounts is:\n\n• Funded Trading Profits: Minimum $200\n\nWithdrawal requests below the minimum amount will not be processed.`,
			},
			{
				slug: 'trading-conditions-before-withdrawal',
				title: 'Trading Conditions Before Withdrawal',
				body: `To ensure fair payout processing at GenzProp, the following conditions must be met:\n\n• All profits must be realized profits (closed trades only)\n• Floating profits are not counted toward withdrawal eligibility\n• The account must remain within all risk management limits\n• Accounts with rule violations may have payout requests rejected.`,
			},
			{
				slug: 'trading-activity-after-request',
				title: 'Trading Activity After Request',
				body: `Once a payout request is submitted at GenzProp:\n\n• All open trades must be closed\n• Traders must not open new positions until the payout review process is completed\n\nThis ensures accurate profit calculation and proper payout processing.`,
			},
			{
				slug: 'payment-methods',
				title: 'Payment Methods',
				body: `GenzProp currently supports the following payout method:\n\n**Cryptocurrency**\n\n• No processing fees charged by GenzProp\n• Payments are sent directly to your provided wallet address\n• Fast and secure transactions\n\n**Important:**\n\nPlease ensure your wallet address is correct, as incorrect details may result in payment delays or loss of funds.`,
			},
			{
				slug: 'payout-processing-time',
				title: 'Payout Processing Time',
				body: `Most GenzProp payouts are processed within **1 week** after the payout request is submitted.\n\nProcessing time may vary depending on:\n\n• Internal compliance checks\n• Trading activity reviews\n• High-volume payout periods\n\nOnce the payout is completed, the account will automatically be reactivated for continued trading.`,
			},
		],
	},
	{
		slug: 'account-pricing',
		title: 'Account size and pricing',
		articles: [
			{ slug: 'choose-size', title: 'Choosing an account size', body: ph('how to pick a size') },
			{ slug: 'compare-programs', title: 'Comparing programs', body: ph('program differences') },
			{ slug: 'scaling', title: 'Scaling and growth', body: ph('scaling rules') },
		],
	},
	{
		slug: 'platforms',
		title: 'Platforms',
		articles: [
			{ slug: 'mt5-setup', title: 'MetaTrader 5 setup', body: ph('MT5 setup') },
			{ slug: 'mt4-setup', title: 'MetaTrader 4 setup', body: ph('MT4 setup') },
		],
	},
	{
		slug: 'affiliate-marketing',
		title: 'Affiliate Marketing',
		articles: [
			{
				slug: 'affiliate-overview',
				title: 'Affiliate program overview',
				body: `GenzProp may offer **partner or affiliate** opportunities. Terms, commissions, and tracking are defined in the **partner agreement** when you enroll.\n\nVisit the **Partner** page for current signup and rules, or contact our team for **custom partnerships**.`,
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
