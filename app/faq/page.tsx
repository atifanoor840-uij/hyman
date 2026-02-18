'use client';

import { useState, ReactNode } from 'react';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const faqs: { q: string; a: ReactNode }[] = [
	{
		q: 'What is FXGENZ?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ is a proprietary trading firm that provides skilled traders with access to funded trading accounts. We supply the capital, risk framework, and trading infrastructure — you trade and keep the majority of the profits.</p>
				<p>Traders purchase a trading account, follow our risk and trading rules, and trade in real market conditions. Once profit requirements are met, traders can withdraw profits regularly based on the agreed profit split.</p>
			</div>
		),
	},
	{
		q: 'Do I risk my own money?',
		a: (
			<div className="space-y-2">
				<p className="font-semibold text-[#0b0b0f]">No. You never risk your own trading capital.</p>
				<p>Your only cost is the account fee. All trading losses are covered by FXGENZ within the predefined drawdown limits.</p>
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
		q: 'Who is FXGENZ for?',
		a: <p>FXGENZ is designed for traders who understand basic risk management. While beginners are welcome, consistent and disciplined trading is required to remain funded.</p>,
	},
	{
		q: 'What account sizes does FXGENZ offer?',
		a: <p>FXGENZ offers instant funded accounts starting from smaller balances and scaling up to $100,000+, with the opportunity to grow further based on performance.</p>,
	},
	{
		q: 'What profit split does FXGENZ offer?',
		a: <p>Funded traders keep up to 80–100% of profits, depending on the account type and performance tier.</p>,
	},
	{
		q: 'Does FXGENZ restrict IP addresses?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ does not apply any IP address restrictions to trader accounts. You are free to:</p>
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
		q: 'What is the legal relationship between FXGENZ and the customer?',
		a: (
			<div className="space-y-3">
				<p>The legal relationship between FXGENZ and the customer is a service agreement, not an investment contract.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Points of the Agreement:</p>
				<ul className="list-disc pl-6 space-y-2 text-sm">
					<li><strong>No Investment Relationship:</strong> FXGENZ does not accept deposits, manage funds, or provide investment services. Customers are not investors and FXGENZ does not offer financial advice.</li>
					<li><strong>Simulated Trading Environment:</strong> Customers trade on simulated (demo) accounts designed to replicate real market conditions. All trading activity is evaluated based on predefined rules and performance metrics.</li>
					<li><strong>Performance-Based Rewards:</strong> Any payouts received by the customer are performance rewards, not profits from real capital or client funds.</li>
					<li><strong>Independent Contractor Relationship:</strong> Customers act as independent contractors, not employees, partners, or agents of FXGENZ.</li>
					<li><strong>No Ownership or Equity Rights:</strong> The agreement does not grant customers any ownership, equity, or voting rights in FXGENZ.</li>
					<li><strong>Risk Limitation:</strong> The customer&apos;s financial risk is limited only to the account fee paid for access to the trading platform.</li>
					<li><strong>Rule-Based Evaluation:</strong> Continued participation and payouts are conditional upon compliance with FXGENZ trading rules, risk limits, and terms.</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What does FXGENZ consider cheating?',
		a: (
			<div className="space-y-4">
				<p>FXGENZ defines cheating as any deliberate attempt to manipulate the trading environment, bypass rules, or exploit technical weaknesses to gain an unfair advantage.</p>
				<p className="font-semibold text-[#0b0b0f]">Examples of Cheating Include (But Are Not Limited To):</p>
				<ul className="list-disc pl-6 space-y-2 text-sm">
					<li><strong>Platform & Pricing Abuse:</strong> Exploiting latency, price delays, or quote manipulation; arbitrage based on technical execution errors; trading during platform outages or frozen prices.</li>
					<li><strong>Strategy Abuse:</strong> Grid trading or martingale systems; trade layering or order stacking to bypass lot limits; ultra-fast scalping designed to exploit execution gaps; reverse trading across multiple accounts.</li>
					<li><strong>Automation & Tools:</strong> Use of Expert Advisors (EAs), bots, or copy-trading software; trade mirroring between accounts or third parties.</li>
					<li><strong>Rule Circumvention:</strong> Intentionally bypassing drawdown, holding time, or consistency rules; repeated micro-violations used to game system limits.</li>
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
				<p>FXGENZ supports manual, discretionary trading and allows traders flexibility, provided all activity follows our risk and integrity rules.</p>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Allowed Trading Styles</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Manual discretionary trading</li>
						<li>Day trading</li>
						<li>News trading (within holding-time and risk rules)</li>
						<li>Multiple trades per day within lot and drawdown limits</li>
						<li>Trading any supported instrument</li>
					</ul>
				</div>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Prohibited Trading Styles</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Scalping below the minimum holding time</li>
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
				<p className="font-semibold text-[#0b0b0f]">Yes — news trading is allowed at FXGENZ.</p>
				<p>You may open and close trades during high-impact news events as long as all trading rules are respected.</p>
				<p className="font-semibold text-[#0b0b0f]">Important Conditions:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Trades must follow drawdown and risk limits</li>
					<li>Minimum holding time rules still apply on funded accounts</li>
					<li>No latency, price-feed, or execution abuse</li>
					<li>Trading must be manual (no EAs or bots)</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">What&apos;s Not Allowed:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Exploiting spreads, freezes, or delayed pricing</li>
					<li>Ultra-fast trades designed to capture execution gaps</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What is a minimum profitable day?',
		a: (
			<div className="space-y-3">
				<p>A minimum profitable day is a trading day where your account records net positive profit, regardless of the amount.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Points:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Any day that closes with overall profit counts</li>
					<li>There is no minimum dollar or percentage target per day</li>
					<li>Only closed trades are considered</li>
					<li>Loss days do not count as profitable days</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Example:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>$10 positive counts as a day</li>
					<li>$0.50 positive counts as a day</li>
					<li>-$10 does not count as a day</li>
				</ul>
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
					<li><strong>Reach Withdrawal Conditions:</strong> Trade consistently, respect drawdown and risk rules, and reach the minimum profit requirement.</li>
					<li><strong>Request Payout:</strong> Submit a withdrawal request through your dashboard and get paid according to your profit split.</li>
				</ol>
			</div>
		),
	},
	{
		q: 'What are the profit targets?',
		a: (
			<div className="space-y-4">
				<p>Profit targets depend on the account phase you are trading.</p>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Challenge / Evaluation Phase</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Phase 1 Profit Target: 8%</li>
						<li>Phase 2 Profit Target: 5%</li>
					</ul>
					<p className="mt-2 text-sm">You must reach the required profit without violating drawdown or trading rules.</p>
				</div>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">Funded (Live) Account</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>No fixed profit target</li>
						<li>Trade freely within risk rules</li>
						<li>Withdraw profits once the minimum withdrawal requirement (5%) is reached</li>
					</ul>
				</div>
				<p className="font-semibold text-[#0b0b0f]">Example:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>$10,000 account — Phase 1 target: $800; Phase 2 target: $500; Funded withdrawal eligibility: $500</li>
				</ul>
			</div>
		),
	},
	{
		q: 'How does drawdown work?',
		a: (
			<div className="space-y-4">
				<p>FXGENZ applies two standard drawdown limits used across most professional prop firms.</p>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">1. Daily Drawdown</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>The maximum loss allowed in a single trading day</li>
						<li>Calculated based on the starting balance/equity of the day</li>
						<li>Includes closed and floating (open) losses</li>
						<li>Resets at the daily server reset time</li>
						<li>Example: $10,000 account with 5% daily drawdown → max loss $500 per day</li>
					</ul>
				</div>
				<div>
					<p className="font-semibold text-[#0b0b0f] mb-2">2. Maximum Drawdown</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>The maximum total loss allowed on the account</li>
						<li>Calculated from the initial account balance</li>
						<li>Includes closed and floating losses</li>
						<li>Does not reset</li>
						<li>Example: $10,000 account with 8% max drawdown → max total loss $800</li>
					</ul>
				</div>
				<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
					<p className="font-semibold text-[#0b0b0f] mb-2">Standard Limits</p>
					<ul className="list-disc pl-6 space-y-1 text-sm">
						<li>Daily Drawdown: 5% per trading day (resets daily)</li>
						<li>Maximum Drawdown: 8% total</li>
						<li>Breaching either limit results in account termination. Drawdowns are tracked in real time. Applies to all phases, including funded accounts.</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		q: 'How do I get started?',
		a: (
			<div className="space-y-3">
				<p>Getting started with FXGENZ is quick and simple.</p>
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
				<p>FXGENZ offers fast and flexible withdrawal methods to suit traders worldwide.</p>
				<p className="font-semibold text-[#0b0b0f]">Available Withdrawal Options:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Bank Transfer</li>
					<li>Cryptocurrency (USDT / major networks)</li>
					<li>E-wallets (where available)</li>
				</ul>
				<p className="text-sm">Available methods may vary depending on your country and compliance requirements.</p>
				<p className="font-semibold text-[#0b0b0f]">Processing Time:</p>
				<p className="text-sm">Withdrawal requests are typically processed within 24–72 hours after approval.</p>
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
				<p>FXGENZ offers a high, trader-friendly profit split so you keep most of what you earn.</p>
				<p className="font-semibold text-[#0b0b0f]">Profit Split Details:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Up to 80% of profits go to the trader</li>
					<li>The remaining percentage is retained by FXGENZ</li>
					<li>Profit split depends on the account type and performance tier</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">How It Works:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>You trade the funded account</li>
					<li>Once withdrawal conditions are met, profits are calculated</li>
					<li>Your share is paid out based on your profit split</li>
				</ul>
				<p className="text-sm">Example: $10,000 funded account, $1,000 profit, 80% split → You receive $800.</p>
			</div>
		),
	},
	{
		q: 'Can I have multiple accounts?',
		a: (
			<div className="space-y-3">
				<p>You may hold multiple FXGENZ accounts at the same time, as long as all accounts are used independently and fairly.</p>
				<p className="font-semibold text-[#0b0b0f]">Key Rules:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>There is no strict limit on the number of accounts you can purchase</li>
					<li>Each account must be traded separately</li>
					<li>No copying, mirroring, or hedging between your own accounts</li>
					<li>No reverse trading across multiple accounts</li>
					<li>All accounts must follow individual drawdown and risk rules</li>
				</ul>
				<p className="text-sm">FXGENZ monitors for coordinated or abusive behavior, not for how many accounts you own. Legitimate traders managing accounts independently are fully allowed.</p>
			</div>
		),
	},
	{
		q: 'Is there a withdrawal cap?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No. FXGENZ does not impose any withdrawal cap.</p>
				<p className="font-semibold text-[#0b0b0f]">What This Means:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>There is no maximum limit on how much you can withdraw</li>
					<li>Withdrawals are based solely on your profits and profit split</li>
					<li>The more you earn, the more you can withdraw</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>All withdrawals must meet minimum withdrawal requirements</li>
					<li>Accounts must remain compliant with risk and trading rules</li>
					<li>Large withdrawals may require standard compliance checks</li>
				</ul>
			</div>
		),
	},
	{
		q: 'Does FXGENZ offer account scaling?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">Yes. FXGENZ allows account scaling for consistent and disciplined traders.</p>
				<p className="font-semibold text-[#0b0b0f]">How Scaling Works:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Traders who follow all rules and show consistent performance become eligible for scaling</li>
					<li>Scaling may include: increased account balance, higher profit split, access to larger account sizes</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Scaling Conditions:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>No drawdown violations</li>
					<li>Consistent risk management (CSR respected)</li>
					<li>Successful withdrawals</li>
					<li>Clean trading history with no rule abuse</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What leverage does FXGENZ offer?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ provides flexible leverage options to suit different trading styles while managing risk.</p>
				<p className="font-semibold text-[#0b0b0f]">Standard Leverage:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Up to 1:100 on most accounts</li>
					<li>Leverage may vary depending on the instrument and account size</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Higher leverage increases both profit potential and risk</li>
					<li>All trades must follow drawdown and lot size rules</li>
					<li>Leverage limits are enforced per instrument and per account</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What instruments can I trade?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ offers a variety of instruments for funded traders, giving you flexibility and diversity in your trading strategies.</p>
				<p className="font-semibold text-[#0b0b0f]">Available Instruments:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Forex Pairs – Major, minor, and exotic currencies</li>
					<li>Indices – Global stock market indices</li>
					<li>Commodities</li>
					<li>Cryptocurrencies – BTC, ETH, USDT, and select altcoins (where available)</li>
				</ul>
				<p className="text-sm">Instrument availability may vary by account type or region. All trading must follow FXGENZ rules: drawdowns, lot size, and trade holding time.</p>
			</div>
		),
	},
	{
		q: 'What are the trading costs?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ provides transparent trading costs to ensure traders know exactly what they pay.</p>
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
				<p className="text-sm">Costs are competitive with top brokers. FXGENZ does not add extra hidden fees. Traders are responsible for monitoring swap/rollover charges if holding positions overnight.</p>
			</div>
		),
	},
	{
		q: 'How often can I withdraw?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ ensures traders can access their profits regularly and reliably.</p>
				<p className="font-semibold text-[#0b0b0f]">Standard Withdrawal Frequency:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Withdrawals are processed once per week (7 days)</li>
					<li>Requests are reviewed and approved within 24–72 hours</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Important Notes:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Minimum withdrawal requirement: 5% profit of account balance</li>
					<li>Withdrawals must comply with all risk rules and account limits</li>
					<li>First-time withdrawals may require KYC/identity verification</li>
					<li>No maximum payout cap; withdraw as much as you earn</li>
				</ul>
			</div>
		),
	},
	{
		q: 'What time-based rules apply?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ gives traders flexibility, but some time-based rules apply to ensure fair and consistent trading.</p>
				<p className="font-semibold text-[#0b0b0f]">Minimum Trade Holding Time:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Funded accounts only</li>
					<li>Each trade must be held for at least 3 minutes</li>
					<li>Prevents ultra-fast scalping or abuse of execution gaps</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Trading Hours:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Trading is allowed 24/5 on most instruments (Forex, indices, commodities)</li>
					<li>Cryptocurrencies may allow 24/7 trading depending on account type</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Challenge / Evaluation Phase:</p>
				<p className="text-sm">No daily time restrictions. Trades must be completed within the phase validity period (e.g., 30 days).</p>
				<p className="text-sm">No forced limits on login times or session length. Drawdown and consistency rules apply at all times. Violating minimum holding time can result in warnings or account review.</p>
			</div>
		),
	},
	{
		q: 'Can I merge funded accounts?',
		a: (
			<div className="space-y-3">
				<p className="font-semibold text-[#0b0b0f]">No, FXGENZ does not allow merging funded accounts.</p>
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
		q: 'What is the minimum withdrawal requirement?',
		a: (
			<div className="space-y-3">
				<p>FXGENZ requires traders to meet a minimum profit threshold before requesting a withdrawal.</p>
				<p className="font-semibold text-[#0b0b0f]">Minimum Withdrawal Requirement: 5% of your account balance (applies to all funded accounts).</p>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[280px] border border-[#e5e5e5] text-sm">
						<thead>
							<tr className="bg-[#f9f9f9]">
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Account Size</th>
								<th className="border-b border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#0b0b0f]">Minimum Withdrawal</th>
							</tr>
						</thead>
						<tbody>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$5k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$250</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$10k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$500</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$25k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$1,250</td></tr>
							<tr><td className="border-b border-[#e5e5e5] px-4 py-2">$50k</td><td className="border-b border-[#e5e5e5] px-4 py-2">$2,500</td></tr>
							<tr><td className="px-4 py-2">$100k</td><td className="px-4 py-2">$5,000</td></tr>
						</tbody>
					</table>
				</div>
				<p className="text-sm">Once the 5% profit is reached, you can request a payout. Withdrawals are processed according to the weekly payout schedule. Account must remain in compliance with all rules (drawdown, lot size, CSR, etc.).</p>
			</div>
		),
	},
	{
		q: 'What is KYC and when is it required?',
		a: (
			<div className="space-y-3">
				<p>KYC (Know Your Customer) is a standard verification process used to confirm the identity of traders. At FXGENZ, KYC ensures secure, safe, and compliant payouts.</p>
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
		q: 'What is the Consistency Score (CSR)?',
		a: (
			<div className="space-y-3">
				<p>The Consistency Score (CSR) is a metric used by FXGENZ to measure how steady and disciplined your trading is over time.</p>
				<p className="font-semibold text-[#0b0b0f]">How It Works:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Tracks daily profits relative to account balance</li>
					<li>Monitors risk management, trade size, and adherence to rules</li>
					<li>Ensures traders don&apos;t earn too much profit in a single day (max 25% of total profits per day)</li>
				</ul>
				<p className="font-semibold text-[#0b0b0f]">Why It Matters:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>Promotes long-term, sustainable trading</li>
					<li>Helps qualify for scaling or higher account tiers</li>
					<li>Protects both the trader and FXGENZ from sudden account failures</li>
				</ul>
				<p className="text-sm">Example: $10,000 account, daily profits of $500, $300, $200 over 3 days → Total profit = $1,000. No single day exceeds 25% of total → CSR is good. If one day made $400 out of $500 total profit → CSR warning.</p>
			</div>
		),
	},
	{
		q: 'What is Instant Funding?',
		a: (
			<div className="space-y-3">
				<p>Instant Funding is a fast-track program by FXGENZ that allows traders to start trading a funded account immediately — without going through a full evaluation or challenge phase.</p>
				<p className="font-semibold text-[#0b0b0f]">How It Works:</p>
				<ol className="list-decimal pl-6 space-y-1 text-sm">
					<li><strong>Choose an Instant Account</strong> – Select from available account sizes ($5k, $10k, $25k, $50k, $100k).</li>
					<li><strong>Pay the Account Fee</strong> – One-time payment gives you instant access.</li>
					<li><strong>Start Trading Immediately</strong> – Begin trading under funded account rules (drawdown, lot size, CSR, and trade holding time).</li>
					<li><strong>Profit & Withdraw</strong> – Trade, reach the minimum withdrawal requirement (5%), and withdraw profits according to your profit split.</li>
				</ol>
				<p className="font-semibold text-[#0b0b0f]">Benefits of Instant Funding:</p>
				<ul className="list-disc pl-6 space-y-1 text-sm">
					<li>No waiting for challenge or evaluation</li>
					<li>Keep up to 80% of profits</li>
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
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Up to $100,000+ in trading capital — no personal risk</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Keep up to 90% of your profits — your skill, your payout</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Zero risk to your own funds — only the account fee</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Real market conditions — no demo gimmicks</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Fast, repeatable withdrawals — get paid for performance</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
								<span>Clear rules, no traps — trade freely within risk limits</span>
							</li>
							<li className="flex gap-3">
								<span className="text-[#0ea5e9] mt-0.5">•</span>
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
										<span className="flex-shrink-0 text-2xl font-light text-[#0ea5e9] transition-transform">
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
							className="mt-6 inline-block rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
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
