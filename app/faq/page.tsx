'use client';

import { useState, ReactNode } from 'react';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const faqs: { q: string; a: ReactNode }[] = [
	{
		q: 'What is GenzProp?',
		a: (
			<div className="space-y-3">
				<p>GenzProp is a proprietary trading firm that provides skilled traders with access to funded trading accounts. We supply the capital, risk framework, and trading infrastructure — you trade and keep the majority of the profits.</p>
				<p>Traders purchase a trading account, follow our risk and trading rules, and trade in real market conditions. Once profit requirements are met, traders can withdraw profits regularly based on the agreed profit split.</p>
			</div>
		),
	},
	{
		q: 'Do I risk my own money?',
		a: (
			<div className="space-y-2">
				<p className="font-semibold text-[#0b0b0f]">No. You never risk your own trading capital.</p>
				<p>Your only cost is the account fee. All trading losses are covered by GenzProp within the predefined drawdown limits.</p>
			</div>
		),
	},
	{
		q: 'What can I trade?',
		a: (
			<div className="space-y-2">
				<p>You can trade:</p>
				<ul className="list-disc pl-6 space-y-1">
					<li>Forex pairs</li>
					<li>Indices</li>
					<li>Commodities</li>
					<li>Cryptocurrencies (where available)</li>
				</ul>
				<p>All instruments are offered under professional trading conditions.</p>
			</div>
		),
	},
	{
		q: 'Who is GenzProp for?',
		a: <p>GenzProp is designed for traders who understand basic risk management. While beginners are welcome, consistent and disciplined trading is required to remain funded.</p>,
	},
	{
		q: 'What account types does GenzProp offer?',
		a: (
			<div className="space-y-3">
				<p>GenzProp offers three account types:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li><strong>Step 1</strong> — a single-phase challenge with one 10% profit target.</li>
					<li><strong>Step 2</strong> — a two-phase evaluation: 10% in Phase 1, then 5% in Phase 2.</li>
					<li><strong>Instant</strong> — a funded-style account with no challenge phase; you are evaluated live while trading.</li>
				</ul>
				<p className="text-sm">Completing a Step 1 or Step 2 challenge moves your account to the <strong>Funded Stage</strong>. Instant accounts are funded from day one and progress through their own requirements to unlock full withdrawal eligibility.</p>
			</div>
		),
	},
	{
		q: 'What happens if I break a rule?',
		a: (
			<div className="space-y-3">
				<p>If an account violates a trading rule it is <strong>permanently closed</strong>, and progress is reset.</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Accounts cannot be restarted or resumed from a failed phase — continuing requires purchasing a new evaluation.</li>
					<li>Some breaches do not trigger an automated flag immediately and are confirmed during manual review by our risk team.</li>
					<li>The one exception is the news-window <strong>soft breach</strong>: an SL or TP firing inside the 10-minute window does not close the account, but that profit is not withdrawable.</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Inactivity counts too:</p>
				<p className="text-sm">You must execute at least one trade every 30 consecutive days. An account with no activity for 30 days from your first executed trade is closed as a breach.</p>
			</div>
		),
	},
	{
		q: 'Do I have to use a stop-loss?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No. Stop-loss orders are optional — there is no penalty for trading without one.</p>
				<p className="text-sm">You are still fully responsible for managing your open risk and staying within the Maximum Daily Drawdown and Maximum Loss rules, whether or not you use a stop-loss. Remember that both limits include floating losses on open positions.</p>
			</div>
		),
	},
	{
		q: 'Do I get my account fee back?',
		a: (
			<div className="space-y-3">
				<p>Your full account fee is returned with your <strong>first successful withdrawal</strong>, as long as there are no rule violations.</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>If that withdrawal is rejected for a violation, the fee return is voided.</li>
					<li>Fees are <strong>not</strong> returned on Instant accounts.</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What account sizes does GenzProp offer?',
		a: <p>GenzProp offers instant funded accounts starting from smaller balances and scaling up to $100,000+, with the opportunity to grow further based on performance.</p>,
	},
	{
		q: 'What profit split does GenzProp offer?',
		a: <p>The split rises with each clean withdrawal: <strong>80/20</strong> on your first withdrawal, <strong>85/15</strong> on the second, then <strong>90/10</strong> from the third onward and for every payout after that.</p>,
	},
	{
		q: 'Does GenzProp restrict IP addresses?',
		a: (
			<div className="space-y-3">
				<p>GenzProp does not apply any IP address restrictions to trader accounts. You are free to:</p>
				<ul className="list-disc pl-6 space-y-1">
					<li>Trade from any location</li>
					<li>Use different networks or devices</li>
					<li>Change IPs due to travel, ISP changes, or mobile connections</li>
				</ul>
				<p>There is no fixed IP requirement and no IP-based violations.</p>
				<div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-4 mt-3">
					<p className="font-semibold text-[#0b0b0f] mb-1">Important Clarification</p>
					<p className="text-sm">IP addresses are not used to restrict trading activity or disqualify accounts. Our compliance checks focus only on trading behavior and rule compliance, not where you log in from.</p>
				</div>
			</div>
		),
	},
	{
		q: 'What is the legal relationship between GenzProp and the customer?',
		a: (
			<div className="space-y-3">
				<p>The legal relationship between GenzProp and the customer is a service agreement, not an investment contract.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Points of the Agreement:</p>
				<ul className="list-disc pl-6 space-y-2 text-sm">
					<li><strong>No Investment Relationship:</strong> GenzProp does not accept deposits, manage funds, or provide investment services. Customers are not investors and GenzProp does not offer financial advice.</li>
					<li><strong>Simulated Trading Environment:</strong> Customers trade on simulated (demo) accounts designed to replicate real market conditions. All trading activity is evaluated based on predefined rules and performance metrics.</li>
					<li><strong>Performance-Based Rewards:</strong> Any payouts received by the customer are performance rewards, not profits from real capital or client funds.</li>
					<li><strong>Independent Contractor Relationship:</strong> Customers act as independent contractors, not employees, partners, or agents of GenzProp.</li>
					<li><strong>No Ownership or Equity Rights:</strong> The agreement does not grant customers any ownership, equity, or voting rights in GenzProp.</li>
					<li><strong>Risk Limitation:</strong> The customer&apos;s financial risk is limited only to the account fee paid for access to the trading platform.</li>
					<li><strong>Rule-Based Evaluation:</strong> Continued participation and payouts are conditional upon compliance with GenzProp trading rules, risk limits, and terms.</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What does GenzProp consider cheating?',
		a: (
			<div className="space-y-4">
				<p>GenzProp defines cheating as any deliberate attempt to manipulate the trading environment, bypass rules, or exploit technical weaknesses to gain an unfair advantage.</p>
				<p className="font-semibold text-[#0b0b0f]">Examples of Cheating Include (But Are Not Limited To):</p>
				<ul className="list-disc pl-6 space-y-2 text-sm">
					<li><strong>Platform & Pricing Abuse:</strong> Exploiting latency, price delays, or quote manipulation; arbitrage based on technical execution errors; trading during platform outages or frozen prices.</li>
					<li><strong>Strategy Abuse:</strong> Grid trading or martingale systems; trade layering or order stacking to bypass lot limits; ultra-fast scalping designed to exploit execution gaps; reverse trading across multiple accounts.</li>
					<li><strong>Automation & Tools:</strong> Use of Expert Advisors (EAs), bots, or copy-trading software; trade mirroring between accounts or third parties.</li>
					<li><strong>Rule Circumvention:</strong> Intentionally bypassing drawdown, minimum holding time, trade layering, or news-window rules; repeated micro-violations used to game system limits.</li>
				</ul>
				<div className="rounded-lg border border-[#e5e5e5] bg-[#f0fdf4] p-4">
					<p className="font-semibold text-[#0b0b0f] mb-2">What Is NOT Considered Cheating</p>
					<p className="text-sm">Manual discretionary trading; normal scalping within allowed holding times; news trading (when rules are respected); trading from different devices or IP addresses; legitimate risk-managed strategies.</p>
				</div>
			</div>
		),
	},
	{
		q: 'What trading styles are allowed vs prohibited?',
		a: (
			<div className="space-y-4">
				<p>GenzProp supports manual, discretionary trading and allows traders flexibility, provided all activity follows our risk and integrity rules.</p>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Allowed Trading Styles</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Manual discretionary trading</li>
						<li>Day trading</li>
						<li>News trading — unrestricted during the challenge; on funded/Instant accounts, outside the 10-minute restricted window</li>
						<li>Multiple trades per day within lot and drawdown limits</li>
						<li>Trading any supported instrument</li>
					</ul>
				</div>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Prohibited Trading Styles</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Scalping below the 3-minute minimum holding time</li>
						<li>Grid trading systems</li>
						<li>Martingale strategies</li>
						<li>Trade layering or order stacking to bypass limits</li>
						<li>Automated trading (EAs, bots, copy trading)</li>
						<li>Latency, arbitrage, or execution abuse</li>
						<li>Reverse or mirrored trading across accounts</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		q: 'Is news trading allowed?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">It depends on the stage you are in.</p>
				<p><strong>Step 1 and Step 2 challenge phases:</strong> news trading is completely unrestricted. You may open, close, or modify trades directly during any news event.</p>
				<p><strong>Funded stage and Instant accounts:</strong> a 10-minute restricted window applies — you may not open or close a position on the affected instrument within <strong>5 minutes before or 5 minutes after</strong> a listed high-impact release. This covers every execution type: manual orders, pending orders, Stop-Loss and Take-Profit.</p>
				<p>Holding a position through the release is fine, provided it was opened more than 5 minutes before the event.</p>
				<p className="font-semibold text-[#0b0b0f]">Soft breach handling:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>If an existing position&apos;s SL or TP fires inside the window, it is a <strong>soft breach</strong> — the account is not terminated.</li>
					<li>Any profit from that specific execution is not withdrawable and is deducted.</li>
					<li>Any loss from it stays on the account and is not reimbursed or reversed.</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Affected announcements:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Interest rate decisions, rate statements, central bank press conferences</li>
					<li>CPI, Core PCE, and GDP reports</li>
					<li>Non-Farm Payrolls, Unemployment Rate, Employment Change</li>
					<li>Manufacturing and Services PMI</li>
					<li>Speeches and press conferences — for their full live duration plus the 5-minute buffer either side</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What is a minimum profitable day?',
		a: (
			<div className="space-y-3">
				<p>A <strong>Profitable Day</strong> is a single calendar day (00:00–23:59 UTC) in which your profit reaches at least <strong>0.5% of your initial account balance</strong>, measured on an equity basis.</p>
				<p>A <strong>Trading Day</strong> is simpler: a trade was opened and closed on that calendar day, profitable or not. Every Profitable Day is automatically also a Trading Day.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Points:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>A day below +0.5% does not count, no matter how many trades you placed</li>
					<li>Profitable Days must fall on separate calendar days — profit from different days cannot be combined</li>
					<li>The daily reset is at 00:00 UTC, shown on your dashboard countdown</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">How many you need:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Step 1 and Step 2 challenge phases: 3 Profitable Days</li>
					<li>Instant and every funded stage: 5 days in total — 3 Profitable Days plus 2 plain Trading Days, in any order</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Example ($100,000 account):</p>
				<p className="text-sm">0.5% of $100,000 = $500. A day closing +$520 counts. A day closing +$300 does not.</p>
			</div>
		),
	},
	{
		q: 'What happens after I pass my phase?',
		a: (
			<div className="space-y-3">
				<p>Once you pass your phase, here&apos;s what happens next — simple and fast:</p>
				<ol className="list-decimal pl-6 space-y-2 text-sm">
					<li><strong>Account Review:</strong> Your trading activity is reviewed to confirm all rules were followed.</li>
					<li><strong>Funded Account Issued:</strong> After approval, you&apos;ll receive your funded (live) account details via email.</li>
					<li><strong>Start Trading:</strong> Begin trading your funded account immediately under funded-stage rules.</li>
					<li><strong>Reach Withdrawal Conditions:</strong> wait 14 days from funding, complete 3 Profitable Days plus 2 Trading Days, finish in profit, and keep a clean rule record. There is no minimum profit threshold.</li>
					<li><strong>Request Payout:</strong> Submit a withdrawal request through your dashboard and get paid according to your profit split.</li>
				</ol>
			</div>
		),
	},
	{
		q: 'What are the profit targets?',
		a: (
			<div className="space-y-4">
				<p>Profit targets depend on the account type you bought.</p>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[320px] border border-[#e5e5e5] text-sm">
						<thead>
							<tr className="bg-[#f9f9f9]">
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Account type</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Phase 1</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Phase 2</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Funded</th>
							</tr>
						</thead>
						<tbody>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Step 1</td><td className="border-b border-[#e5e5e5] px-4 py-2">10%</td><td className="border-b border-[#e5e5e5] px-4 py-2">—</td><td className="border-b border-[#e5e5e5] px-4 py-2">None</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Step 2</td><td className="border-b border-[#e5e5e5] px-4 py-2">10%</td><td className="border-b border-[#e5e5e5] px-4 py-2">5%</td><td className="border-b border-[#e5e5e5] px-4 py-2">None</td></tr>
							<tr><td className="px-4 py-2">Instant</td><td className="px-4 py-2">—</td><td className="px-4 py-2">—</td><td className="px-4 py-2">None — funded from day one</td></tr>
						</tbody>
					</table>
				</div>
				<p className="text-sm">Targets are verified strictly on <strong>closed account balance</strong>: every open position and pending order must be closed before the target is confirmed.</p>
				<p className="font-semibold text-[#0b0b0f]">Example ($100,000 account):</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Step 1 — Phase 1 target $10,000; balance must reach $110,000 with no active exposure</li>
					<li>Step 2 — Phase 1 target $10,000, Phase 2 target $5,000</li>
				</ul>
			</div>
		),
	},
	{
		q: 'How does drawdown work?',
		a: (
			<div className="space-y-4">
				<p>GenzProp applies two loss limits. Both are <strong>static</strong> — always measured from your initial account balance, never trailing upward with profits — and both are monitored on balance <em>and</em> equity, so floating losses count.</p>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">1. Maximum Daily Drawdown — 4%</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>4% of your initial account balance, for every account type and stage</li>
						<li>Current daily loss = results of closed positions for the day + unrealized result of open positions</li>
						<li>Resets at 00:00 UTC, shown on your dashboard countdown</li>
						<li>Breaching it fails the account for that day, even if it later recovers</li>
						<li>Example: $10,000 account → max daily loss $400</li>
					</ul>
				</div>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">2. Maximum Loss (overall)</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li><strong>Step 1 / Step 2:</strong> 10% of the initial balance, in both the challenge phases and the funded stage</li>
						<li><strong>Instant / Funded account:</strong> 6% of the initial balance</li>
						<li>Does not reset and applies for the account&apos;s whole lifetime</li>
						<li>Example: $100,000 Step 2 account fails below $90,000; a $100,000 Instant account fails below $94,000</li>
					</ul>
				</div>
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
					<p className="font-semibold text-[#0b0b0f] mb-2">Summary</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Daily drawdown: 4% — every type, every stage</li>
						<li>Maximum loss: 10% (Step 1 / Step 2) or 6% (Instant)</li>
						<li>Breaching the maximum loss fails and permanently terminates the account, regardless of any later recovery</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		q: 'How do I get started?',
		a: (
			<div className="space-y-3">
				<p>Getting started with GenzProp is quick and simple.</p>
				<ol className="list-decimal pl-6 space-y-2 text-sm">
					<li><strong>Choose Your Account:</strong> Select the account size and plan that fits your trading style.</li>
					<li><strong>Complete Registration:</strong> Sign up and securely complete your purchase.</li>
					<li><strong>Receive Account Details:</strong> Your trading credentials will be sent to your email instantly.</li>
					<li><strong>Start Trading:</strong> Log in to MT4/MT5 and begin trading under the selected account rules.</li>
					<li><strong>Pass & Get Funded:</strong> Meet the profit targets (if applicable) and follow the rules to move to the funded stage.</li>
					<li><strong>Withdraw Your Profits:</strong> Once withdrawal conditions are met, request a payout and get paid.</li>
				</ol>
			</div>
		),
	},
	{
		q: 'What withdrawal methods are available?',
		a: (
			<div className="space-y-3">
				<p>GenzProp offers fast and flexible withdrawal methods to suit traders worldwide.</p>
				<p className="font-semibold text-[#0b0b0f]">Available Withdrawal Options:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Bank Transfer</li>
					<li>Cryptocurrency (USDT / major networks)</li>
					<li>E-wallets (where available)</li>
				</ul>
				<p className="text-sm">Available methods may vary depending on your country and compliance requirements.</p>
				<p className="font-semibold text-[#0b0b0f]">Processing Time:</p>
				<p className="text-sm">Most payouts are processed within about <strong>48 working hours</strong>; some may take <strong>5–7 working days</strong>. Only realized profit is withdrawable — floating profit does not count.</p>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>The same method used for deposit may be required for withdrawals (where applicable).</li>
					<li>KYC verification may be required before your first payout.</li>
					<li>All withdrawals are processed securely and confidentially.</li>
				</ul>
			</div>
		),
	},
	{
		q: 'How does the profit split work?',
		a: (
			<div className="space-y-3">
				<p>Your split improves with each clean withdrawal.</p>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[280px] border border-[#e5e5e5] text-sm">
						<thead>
							<tr className="bg-[#f9f9f9]">
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Withdrawal</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">You keep</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">GenzProp</th>
							</tr>
						</thead>
						<tbody>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">1st</td><td className="border-b border-[#e5e5e5] px-4 py-2">80%</td><td className="border-b border-[#e5e5e5] px-4 py-2">20%</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">2nd</td><td className="border-b border-[#e5e5e5] px-4 py-2">85%</td><td className="border-b border-[#e5e5e5] px-4 py-2">15%</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">3rd</td><td className="border-b border-[#e5e5e5] px-4 py-2">90%</td><td className="border-b border-[#e5e5e5] px-4 py-2">10%</td></tr>
							<tr><td className="px-4 py-2">4th and onward</td><td className="px-4 py-2">90%</td><td className="px-4 py-2">10%</td></tr>
						</tbody>
					</table>
				</div>
				<p className="text-sm">The split only increases if every earlier withdrawal was completed with no rule violations. From the 3rd withdrawal onward it stays fixed at 90/10. GenzProp can adjust or reset your split if rules are not followed.</p>
				<p className="text-sm">Example: $100,000 funded account, $5,000 realized profit on your first payout at 80% → you receive $4,000.</p>
			</div>
		),
	},
	{
		q: 'Can I have multiple accounts?',
		a: (
			<div className="space-y-3">
				<p>You may hold multiple GenzProp accounts at the same time, as long as all accounts are used independently and fairly.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Rules:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>There is no strict limit on the number of accounts you can purchase</li>
					<li>Each account must be traded separately</li>
					<li>No copying, mirroring, or hedging between your own accounts</li>
					<li>No reverse trading across multiple accounts</li>
					<li>All accounts must follow individual drawdown and risk rules</li>
				</ul>
				<p className="text-sm">GenzProp monitors for coordinated or abusive behavior, not for how many accounts you own. Legitimate traders managing accounts independently are fully allowed.</p>
			</div>
		),
	},
	{
		q: 'Is there a withdrawal cap?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">Yes. Each payout period is capped at 6% of your initial account balance.</p>
				<p>The cap applies to all funded accounts — Step 1, Step 2 and Instant — regardless of how much profit you made in that period.</p>
				<p className="font-semibold text-[#0b0b0f]">What This Means:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>$100,000 account → up to $6,000 of profit per payout period</li>
					<li>Profit above the cap is <strong>not lost</strong> — it stays on the account and can be withdrawn in a future payout period</li>
					<li>There is no <em>minimum</em> profit threshold on any account type, including Instant</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Accounts must remain compliant with all risk and trading rules</li>
					<li>Only realized profit counts — floating profit does not</li>
					<li>Large withdrawals may require standard compliance checks</li>
				</ul>
			</div>
		),
	},
	{
		q: 'Does GenzProp offer account scaling?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">Yes. GenzProp allows account scaling for consistent and disciplined traders.</p>
				<p className="font-semibold text-[#0b0b0f]">How Scaling Works:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Traders who follow all rules and show consistent performance become eligible for scaling</li>
					<li>Scaling may include: increased account balance, higher profit split, access to larger account sizes</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Scaling Conditions:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>No drawdown violations</li>
					<li>Consistent risk management within the daily and maximum loss limits</li>
					<li>Successful withdrawals</li>
					<li>Clean trading history with no rule abuse</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What leverage does GenzProp offer?',
		a: (
			<div className="space-y-3">
				<p>Leverage is capped at <strong>1:100 across every asset class</strong>, for all account types and stages.</p>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[260px] border border-[#e5e5e5] text-sm">
						<thead>
							<tr className="bg-[#f9f9f9]">
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Asset class</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Max leverage</th>
							</tr>
						</thead>
						<tbody>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Forex</td><td className="border-b border-[#e5e5e5] px-4 py-2">1:100</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Indices</td><td className="border-b border-[#e5e5e5] px-4 py-2">1:100</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Metals</td><td className="border-b border-[#e5e5e5] px-4 py-2">1:100</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Energies</td><td className="border-b border-[#e5e5e5] px-4 py-2">1:100</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">Stocks</td><td className="border-b border-[#e5e5e5] px-4 py-2">1:100</td></tr>
							<tr><td className="px-4 py-2">Crypto</td><td className="px-4 py-2">1:100</td></tr>
						</tbody>
					</table>
				</div>
				<p className="text-sm">Leverage limits are set per instrument, not by account size. Higher leverage never exempts you from the Maximum Daily Drawdown, Maximum Loss, or margin requirements.</p>
			</div>
		),
	},
	{
		q: 'What instruments can I trade?',
		a: (
			<div className="space-y-3">
				<p>GenzProp offers a variety of instruments for funded traders, giving you flexibility and diversity in your trading strategies.</p>
				<p className="font-semibold text-[#0b0b0f]">Available Instruments:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Forex Pairs – Major, minor, and exotic currencies</li>
					<li>Indices – Global stock market indices</li>
					<li>Commodities</li>
					<li>Cryptocurrencies – BTC, ETH, USDT, and select altcoins (where available)</li>
				</ul>
				<p className="text-sm">Instrument availability may vary by account type or region. All trading must follow GenzProp rules: drawdowns, lot size, and trade holding time.</p>
			</div>
		),
	},
	{
		q: 'What are the trading costs?',
		a: (
			<div className="space-y-3">
				<p>GenzProp provides transparent trading costs to ensure traders know exactly what they pay.</p>
				<p className="font-semibold text-[#0b0b0f]">Spreads:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Raw/Variable spreads on all instruments</li>
					<li>Spreads depend on market conditions and liquidity</li>
					<li>No hidden markups — what you see is what you trade</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Commission:</p>
				<p className="text-sm">Certain account types or instruments may charge a small commission per trade. Commission details are displayed in your account info or trading platform.</p>
				<p className="font-semibold text-[#0b0b0f]">Swap / Rollover:</p>
				<p className="text-sm">Overnight positions may incur a swap fee (interest adjustment). Swap rates depend on the instrument and direction. Visible in MT4/MT5 under Trade → Swap.</p>
				<p className="text-sm">Costs are competitive with top brokers. GenzProp does not add extra hidden fees. Traders are responsible for monitoring swap/rollover charges if holding positions overnight.</p>
			</div>
		),
	},
	{
		q: 'How often can I withdraw?',
		a: (
			<div className="space-y-3">
				<p>Withdrawals run on a <strong>bi-weekly</strong> schedule — every 14 calendar days.</p>
				<p className="font-semibold text-[#0b0b0f]">Eligibility for your first request:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>At least 14 days have passed since the account was funded</li>
					<li>The required Profitable Days are complete (plus the 2 Trading Days on Instant and funded stages)</li>
					<li>The account is in profit, with zero rule violations</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>There is no minimum profit threshold on any account type</li>
					<li>Each payout period is capped at 6% of your initial account balance; anything above stays for a future payout</li>
					<li>Once you submit a request, close all open trades and do not open new ones until it is processed — trading after a request can cancel the withdrawal</li>
					<li>Most payouts are processed within about 48 working hours; some take 5–7 working days</li>
					<li>First-time withdrawals may require KYC/identity verification</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What time-based rules apply?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">Minimum trade holding time — 3 minutes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Applies to <strong>every trade on every account</strong>, in the challenge phases and on funded/Instant accounts alike</li>
					<li>Closing a position in under 3 minutes is a breach, regardless of whether it was profitable</li>
					<li>Exactly 3 minutes is valid; 2:59 is not</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Trade layering — 5-minute window:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>On the funded stage, only 1 trade may be opened within a 5-minute window from the previous trade&apos;s opening time — even if the first trade is already closed</li>
					<li>Instant accounts additionally allow a maximum of 2 concurrent layers; a 3rd fails the account</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Daily reset — 00:00 UTC:</p>
				<p className="text-sm">All daily loss and Profitable Day calculations reset at 00:00 UTC. The dashboard countdown timer is the sole and final reference — not your broker&apos;s server time or your local time.</p>
				<p className="font-semibold text-[#0b0b0f]">Overnight and weekend holding:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Overnight holding is allowed by default on every plan; swap/rollover charges apply as normal</li>
					<li>Weekend holding (Friday 23:00 UTC – Sunday 23:00 UTC) is prohibited by default on all account types and stages, including crypto — it requires the paid Weekend Holding add-on at checkout</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Inactivity:</p>
				<p className="text-sm">You must execute at least one trade every 30 consecutive days. An account with no activity for 30 days from your first executed trade is closed as a breach.</p>
			</div>
		),
	},
	{
		q: 'Can I merge funded accounts?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No, GenzProp does not allow merging funded accounts.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Points:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Each funded account is independent with its own balance, rules, and profit/loss tracking</li>
					<li>Merging balances from multiple accounts is not permitted</li>
					<li>All accounts must follow their own drawdown, lot size, and trading rules</li>
					<li>Profits must be withdrawn separately from each account</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Why?</p>
				<p className="text-sm">Ensures fair trading and risk management; prevents rule circumvention (e.g., hiding losses or combining gains); keeps scaling and performance metrics accurate for each account.</p>
			</div>
		),
	},
	{
		q: 'Is there a minimum withdrawal amount?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No. There is no minimum profit threshold on any account type, including Instant.</p>
				<p>What matters is eligibility, not size: 14 days since the account was funded, the required Profitable Days (plus 2 Trading Days on Instant and funded stages), an account in profit, and a clean rule record.</p>
				<p className="font-semibold text-[#0b0b0f]">There is a maximum, though:</p>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[280px] border border-[#e5e5e5] text-sm">
						<thead>
							<tr className="bg-[#f9f9f9]">
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Account Size</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Max per payout period (6%)</th>
							</tr>
						</thead>
						<tbody>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$5k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$300</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$10k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$600</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$25k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$1,500</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$50k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$3,000</td></tr>
							<tr><td className="px-4 py-2">$100k</td><td className="px-4 py-2">$6,000</td></tr>
						</tbody>
					</table>
				</div>
				<p className="text-sm">Profit above the 6% cap stays on your account and can be withdrawn in a future payout period, as long as all rules are respected.</p>
			</div>
		),
	},
	{
		q: 'What is KYC and when is it required?',
		a: (
			<div className="space-y-3">
				<p>KYC (Know Your Customer) is a standard verification process used to confirm the identity of traders. At GenzProp, KYC ensures secure, safe, and compliant payouts.</p>
				<p className="font-semibold text-[#0b0b0f]">When KYC Is Required:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Before your first withdrawal</li>
					<li>When updating account details or payout methods</li>
					<li>In cases where regulatory compliance or anti-fraud checks are needed</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">What You Need to Submit:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Government-issued ID (passport, driver&apos;s license, or national ID)</li>
					<li>Proof of address (utility bill, bank statement, or official document)</li>
					<li>Optional: Selfie with ID for additional verification</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<p className="text-sm">KYC is mandatory for security and to prevent fraud. Processing is usually fast (24–72 hours). Your documents are stored securely and confidentially.</p>
			</div>
		),
	},
	{
		q: 'Is there a profit consistency rule?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No. There is no profit consistency rule at GenzProp.</p>
				<p>Some prop firms require that no single trading day accounts for more than a set percentage of your total profit, to discourage passing on the back of one lucky trade. GenzProp does not enforce this.</p>
				<p className="font-semibold text-[#0b0b0f]">What this means:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>You can pass a challenge or reach payout with profit earned on a single strong trading day</li>
					<li>There is no requirement to spread your profit evenly across days</li>
					<li>You will not be flagged or penalized for one day generating most of your gains</li>
					<li>No cap on how much of your total profit can come from a single day</li>
				</ul>
				<p className="text-sm">Every other rule still applies as normal — the daily loss limit, maximum loss, trade layering, minimum holding time, and the minimum number of Profitable Days.</p>
			</div>
		),
	},
	{
		q: 'What is Instant Funding?',
		a: (
			<div className="space-y-3">
				<p>Instant Funding is a fast-track program by GenzProp that allows traders to start trading a funded account immediately — without going through a full evaluation or challenge phase.</p>
				<p className="font-semibold text-[#0b0b0f]">How It Works:</p>
				<ol className="list-decimal pl-6 space-y-1 text-sm">
					<li><strong>Choose an Instant Account</strong> – Select from available account sizes ($5k, $10k, $25k, $50k, $100k).</li>
					<li><strong>Pay the Account Fee</strong> – One-time payment gives you instant access.</li>
					<li><strong>Start Trading Immediately</strong> – Begin trading under funded account rules: 4% daily drawdown, 6% maximum loss, 3-minute minimum holding time, and a maximum of 2 concurrent layers.</li>
					<li><strong>Profit & Withdraw</strong> – Complete 3 Profitable Days plus 2 Trading Days, wait 14 days from funding, then withdraw up to 6% of your initial balance per payout period.</li>
				</ol>
				<p className="font-semibold text-[#0b0b0f]">Instant-specific rules:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>No profit target — you are funded from day one</li>
					<li>Maximum loss is 6% of the initial balance (tighter than the 10% on Step 1 / Step 2)</li>
					<li>A 10-minute restricted window around high-impact news applies from the start</li>
					<li>Account fees are <strong>not</strong> returned on Instant accounts</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Benefits of Instant Funding:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>No waiting for a challenge or evaluation</li>
					<li>Profit split starts at 80/20 and rises to 90/10 by your third clean withdrawal</li>
					<li>Perfect for experienced traders who want instant access</li>
				</ul>
			</div>
		),
	},
];

export default function FAQPage() {
	const [open, setOpen] = useState<number | null>(null);

	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			<section className="relative overflow-hidden bg-[#050406]">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />

				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="mx-auto max-w-4xl space-y-6 text-left mt-16 lg:mt-20">
						<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
							FAQs
						</h1>
						<p className="text-lg text-white/80 md:text-xl max-w-2xl leading-relaxed">
							Because trading small accounts limits your potential.
						</p>
						<p className="text-lg text-white/70 md:text-xl max-w-2xl leading-relaxed">
							As a funded trader, you get instant access to large capital without risking your own money. We fund the account. You trade. You keep the profits.
						</p>
					</div>
				</div>
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			<main className="bg-white">
				<div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
					{/* Here's what you get */}
					<section className="mb-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-6 md:p-8">
						<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>Here&apos;s what you get:</h2>
						<ul className="space-y-3 text-[#37353E]/90">
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Up to $100,000+ in trading capital — no personal risk</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Keep up to 90% of your profits — your skill, your payout</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Zero risk to your own funds — only the account fee</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Real market conditions — no demo gimmicks</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Fast, repeatable withdrawals — get paid for performance</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Clear rules, no traps — trade freely within risk limits</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#5235ff] mt-0.5">•</span>
								<span>Scale fast — consistent traders unlock bigger accounts</span>
							</li>
						</ul>
					</section>

					<div className="divide-y divide-[#e5e5e5] rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
						{faqs.map((item, i) => {
							const isOpen = open === i;
							return (
								<div key={i} className="transition-all">
									<button
										type="button"
										onClick={() => setOpen(isOpen ? null : i)}
										className="flex w-full items-center justify-between gap-6 p-6 text-left hover:bg-[#f9f9f9] transition-colors"
									>
										<span className="text-base font-semibold text-[#0b0b0f] md:text-lg">{item.q}</span>
										<span className="flex-shrink-0 text-2xl font-light text-[#5235ff] transition-transform">
											{isOpen ? '–' : '+'}
										</span>
									</button>
									{isOpen && (
										<div className="px-6 pb-6 text-sm leading-relaxed text-[#37353E]/90 md:text-base">
											{item.a}
										</div>
									)}
								</div>
							);
						})}
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8 text-center">
						<h3 className="text-xl font-semibold text-[#0b0b0f]">Still have questions?</h3>
						<p className="mt-2 text-sm text-[#37353E]/80">
							Our support team is here to help. Contact us anytime.
						</p>
						<a
							href="/contact"
							className="mt-6 inline-block rounded-full bg-[#5235ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
						>
							Contact Support
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
