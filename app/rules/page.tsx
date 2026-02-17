'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import { HEADER_IMAGE_3 } from '@/lib/header-image';
import { useMemo, useState } from 'react';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

type SizeOption = {
	label: string;
	price: string;
	step1: PhaseRules;
	step2: PhaseRules;
	funded: PhaseRules;
};

type PhaseRules = {
	tradingPeriod: string;
	minTradingDays: string;
	maxDailyLoss: string;
	maxOverallLoss: string;
	profitTarget: string;
	brightTokens: string;
	refundableFee: string;
};

function baseStep({ profitTarget, maxDailyLoss, maxOverallLoss, refundableFee }: { profitTarget: string; maxDailyLoss: string; maxOverallLoss: string; refundableFee: string; }): PhaseRules {
	return {
		tradingPeriod: "Unlimited",
		minTradingDays: "5 Days",
		maxDailyLoss,
		maxOverallLoss,
		profitTarget,
		brightTokens: "Yes",
		refundableFee,
	};
}

function fundedStep({ maxDailyLoss, maxOverallLoss }: { maxDailyLoss: string; maxOverallLoss: string; }): PhaseRules {
	return {
		tradingPeriod: "Indefinite",
		minTradingDays: "-",
		maxDailyLoss,
		maxOverallLoss,
		profitTarget: "-",
		brightTokens: "Yes",
		refundableFee: "Free",
	};
}

const SIZES: SizeOption[] = [
	{ label: "$5,000", price: "€59", step1: baseStep({ profitTarget: "$400", maxDailyLoss: "$250", maxOverallLoss: "$500", refundableFee: "€59" }), step2: baseStep({ profitTarget: "$250", maxDailyLoss: "$250", maxOverallLoss: "$500", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$250", maxOverallLoss: "$500" }) },
	{ label: "$10,000", price: "€95", step1: baseStep({ profitTarget: "$800", maxDailyLoss: "$500", maxOverallLoss: "$1,000", refundableFee: "€95" }), step2: baseStep({ profitTarget: "$500", maxDailyLoss: "$500", maxOverallLoss: "$1,000", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$500", maxOverallLoss: "$1,000" }) },
	{ label: "$25,000", price: "€195", step1: baseStep({ profitTarget: "$2,000", maxDailyLoss: "$1,250", maxOverallLoss: "$2,500", refundableFee: "€195" }), step2: baseStep({ profitTarget: "$1,250", maxDailyLoss: "$1,250", maxOverallLoss: "$2,500", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$1,250", maxOverallLoss: "$2,500" }) },
	{ label: "$50,000", price: "€295", step1: baseStep({ profitTarget: "$4,000", maxDailyLoss: "$2,500", maxOverallLoss: "$5,000", refundableFee: "€295" }), step2: baseStep({ profitTarget: "$2,500", maxDailyLoss: "$2,500", maxOverallLoss: "$5,000", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$2,500", maxOverallLoss: "$5,000" }) },
	{ label: "$100,000", price: "€495", step1: baseStep({ profitTarget: "$8,000", maxDailyLoss: "$5,000", maxOverallLoss: "$10,000", refundableFee: "€495" }), step2: baseStep({ profitTarget: "$5,000", maxDailyLoss: "$5,000", maxOverallLoss: "$10,000", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$5,000", maxOverallLoss: "$10,000" }) },
	{ label: "$200,000", price: "€949", step1: baseStep({ profitTarget: "$16,000", maxDailyLoss: "$10,000", maxOverallLoss: "$20,000", refundableFee: "€949" }), step2: baseStep({ profitTarget: "$10,000", maxDailyLoss: "$10,000", maxOverallLoss: "$20,000", refundableFee: "Free" }), funded: fundedStep({ maxDailyLoss: "$10,000", maxOverallLoss: "$20,000" }) },
];

const ACCOUNT_TYPES = ["Alpha", "Beta", "Gamma", "Sigma"] as const;

type RuleTab = 'sigma' | 'beta' | 'alpha';

export default function RulesPage() {
	const [selectedIdx, setSelectedIdx] = useState<number>(4);
	const [ruleTab, setRuleTab] = useState<RuleTab>('sigma');
	const size = useMemo(() => SIZES[selectedIdx], [selectedIdx]);

	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Header Section with background */}
			<section className="relative overflow-hidden bg-[#050406]">
				{/* Decorative gradient overlays */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				{/* Subtle vignette */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12 mt-16 lg:mt-20">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Trading Rules & Pricing
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Comprehensive trading rules and transparent pricing for all account sizes. Select an account to view detailed rules for each phase.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_3} alt="Fx Genz trading rules" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
						</div>
					</div>
				</div>
				{/* Subtle divider curve */}
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			{/* Main content with white background */}
			<main className="bg-white">
				<div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					{/* Rules by Account Type */}
					<section className="mb-16">
						<h2 className={`${display.className} text-3xl font-semibold tracking-tight text-[#0b0b0f] mb-6`}>
							Rules by Account Type
						</h2>
						<div className="mb-6 flex flex-wrap gap-2">
							{(['sigma', 'beta', 'alpha'] as const).map((tab) => (
								<button
									key={tab}
									onClick={() => setRuleTab(tab)}
									className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
										ruleTab === tab
											? 'bg-[#0ea5e9] text-white'
											: 'bg-[#f0f9ff] text-[#0b0b0f] hover:bg-[#e0f2fe]'
									}`}
								>
									{tab === 'sigma' ? 'Sigma (Instant)' : tab === 'beta' ? 'Beta' : 'Alpha'}
								</button>
							))}
						</div>

						{/* Sigma (Instant) Rules */}
						{ruleTab === 'sigma' && (
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 md:p-8 shadow-sm space-y-6">
								<h3 className={`${display.className} text-xl font-semibold text-[#0b0b0f] border-b border-[#e5e5e5] pb-3`}>Sigma (Instant) — Rules</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li><span className="font-semibold text-[#0b0b0f]">Daily Drawdown:</span> 5% of the initial account balance (static, balance-based)</li>
									<li><span className="font-semibold text-[#0b0b0f]">Maximum Drawdown:</span> 8% of the initial account balance (static, balance-based)</li>
									<li>No trailing equity tricks; no hidden floating loss violations</li>
									<li><span className="font-semibold text-[#0b0b0f]">Leverage:</span> 1:100</li>
									<li>Breach of any drawdown rule results in account termination</li>
									<li>Instant Accounts are simulated trading accounts operated under real market conditions. No evaluation or challenge phase is required.</li>
									<li>Scalping not allowed. Grid, martingale, hedging not allowed. Expert Advisor (EA) not allowed.</li>
									<li>News Trading allowed. No time restrictions.</li>
									<li>Consistency rule applied: 25%</li>
									<li>No IP rule</li>
									<li>Overnight holding is not allowed — you must close trades before the new day starts.</li>
									<li>Weekend holding is not allowed; if found mistakenly or unknowingly it will breach your account. Trading is not allowed on weekends on Instant accounts.</li>
									<li>Copy trading is prohibited on Instant Funded accounts; doing so can result in account termination.</li>
									<li>No resets or retries — if breached, the only way to try again is to purchase another Instant Funded program.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Profit split:</span> up to 80%</li>
									<li><span className="font-semibold text-[#0b0b0f]">Payout:</span> after 21 days</li>
									<li>Traders must reach at least 5% profit of their account balance before requesting a payout.</li>
								</ul>
								<div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-4">
									<p className="font-semibold text-[#0b0b0f] mb-2">Example</p>
									<p className="text-sm">Account Size: $10,000 → Minimum profit required for payout: 5% × $10,000 = $500. Once your account reaches $500 in profits, you are eligible to request your payout.</p>
								</div>
								<div className="rounded-lg border border-[#0ea5e9]/30 bg-[#f0f9ff] p-4">
									<p className="font-semibold text-[#0b0b0f] mb-2">Trade Holding Rule</p>
									<ul className="text-sm space-y-1">
										<li><span className="font-semibold">Max Open Trades:</span> Up to 2 trades simultaneously on the same instrument and direction.</li>
										<li><span className="font-semibold">Minimum Holding Time:</span> Each trade must be held for at least 3 minutes on live accounts.</li>
										<li><span className="font-semibold">Stage:</span> Applies only to funded accounts, not during the challenge/evaluation phase.</li>
									</ul>
								</div>
							</div>
						)}

						{/* Beta Rules */}
						{ruleTab === 'beta' && (
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 md:p-8 shadow-sm space-y-6">
								<h3 className={`${display.className} text-xl font-semibold text-[#0b0b0f] border-b border-[#e5e5e5] pb-3`}>Beta — Rules</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li><span className="font-semibold text-[#0b0b0f]">Daily Drawdown:</span> Typically 5% of account balance per day.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Maximum Drawdown:</span> Typically 8% of account balance overall.</li>
									<li>Balance-based: drawdowns are calculated from the initial account balance, including floating losses.</li>
									<li>Violation: exceeding daily or max drawdown may result in account termination or reset.</li>
									<li>Consistency rule not applied.</li>
									<li>EA allowed only on challenge phase.</li>
									<li>Overnight holding allowed (keeping a trade open after the market closes for the day, into the next trading session).</li>
									<li>Weekend holding is allowed.</li>
									<li>News trading is allowed. Hedging is allowed.</li>
									<li>Stop loss is not mandatory.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Inactivity Rule:</span> If you do not open any trade within 30 days, your account will be marked as failed.</li>
									<li>On weekends, crypto trading is allowed.</li>
									<li>No IP rule applied. Cryptocurrency markets (e.g. BTC) never fully close, so trading can happen 24/7, including weekends.</li>
									<li>Traders must reach at least 5% profit of their account balance before requesting a payout.</li>
								</ul>
								<div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-4">
									<p className="font-semibold text-[#0b0b0f] mb-2">Example</p>
									<p className="text-sm">Account Size: $10,000 → Minimum profit required for payout: 5% × $10,000 = $500. Once your account reaches $500 in profits, you are eligible to request your payout.</p>
								</div>
							</div>
						)}

						{/* Alpha Rules */}
						{ruleTab === 'alpha' && (
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 md:p-8 shadow-sm space-y-6">
								<h3 className={`${display.className} text-xl font-semibold text-[#0b0b0f] border-b border-[#e5e5e5] pb-3`}>Alpha — Rules</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li><span className="font-semibold text-[#0b0b0f]">Minimum trading days:</span> 5</li>
									<li>Alpha consists of a single phase; once you pass the challenge you receive a live funded account.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Daily drawdown:</span> 5%. <span className="font-semibold text-[#0b0b0f]">Maximum drawdown:</span> 8%.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Profit split:</span> 80–100%. After first withdrawal, profit split increases by 5% on the next payout.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Leverage:</span> 1:100</li>
									<li><span className="font-semibold text-[#0b0b0f]">Payout:</span> 21 days on funded account</li>
									<li>Weekend holding is not allowed.</li>
									<li>EA, scalping, grid, martingale strategy not allowed. Hedging and news trading allowed. Layering not allowed.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Minimum Trade Holding Time (live account):</span> 3 minutes on funded stage; does not apply during the challenge phase.</li>
									<li>Purchase fee is refundable on first payout on every account.</li>
									<li><span className="font-semibold text-[#0b0b0f]">Consistency Rule:</span> Your whole trading day must not exceed 25%.</li>
									<li>Stop loss and take profit are not mandatory.</li>
									<li>Overnight holding not allowed (keeping a trade open after the market closes for the day, into the next trading session).</li>
									<li><span className="font-semibold text-[#0b0b0f]">Inactivity Rule:</span> If you do not open any trade within 30 days, your account will be marked as failed.</li>
									<li>Traders must reach at least 5% profit of their account balance before requesting a payout.</li>
								</ul>
								<div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-4">
									<p className="font-semibold text-[#0b0b0f] mb-2">Example</p>
									<p className="text-sm">Account Size: $10,000 → Minimum profit required for payout: 5% × $10,000 = $500. Once your account reaches $500 in profits, you are eligible to request your payout.</p>
								</div>
							</div>
						)}
					</section>

					{/* General Trading Rules Section */}
					<section className="mb-16">
						<h2 className={`${display.className} text-3xl font-semibold tracking-tight text-[#0b0b0f] mb-8`}>
							General Trading Rules
						</h2>
						<div className="grid gap-6 md:grid-cols-2">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Allowed Strategies</h3>
								<ul className="space-y-2 text-[#37353E]">
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">✓</span>
										<span>Scalping and day trading</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">✓</span>
										<span>News trading (with restrictions)</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">✓</span>
										<span>Weekend holding allowed</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">✓</span>
										<span>EA and algorithmic trading</span>
									</li>
								</ul>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Prohibited Strategies</h3>
								<ul className="space-y-2 text-[#37353E]">
									<li className="flex items-start gap-2">
										<span className="text-red-600 mt-1">✗</span>
										<span>Arbitrage trading</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-red-600 mt-1">✗</span>
										<span>Hedging between accounts</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-red-600 mt-1">✗</span>
										<span>Copy trading from external sources</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-red-600 mt-1">✗</span>
										<span>Exploiting platform delays</span>
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Detailed Program Rules */}
					<section className="mb-16">
						<h2 className={`${display.className} text-3xl font-semibold tracking-tight text-[#0b0b0f] mb-8`}>
							Detailed Program Conditions
						</h2>

						<div className="grid gap-6 md:grid-cols-2">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Core Risk Parameters</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li>
										<span className="font-semibold">Minimum Trading Days:</span> 4
									</li>
									<li>
										<span className="font-semibold">Minimum Trades:</span> 4
									</li>
									<li>
										<span className="font-semibold">Trading Period:</span> Unlimited
									</li>
									<li>
										<span className="font-semibold">Daily Drawdown:</span> 4%
									</li>
									<li>
										<span className="font-semibold">Maximum Drawdown:</span> 10%
									</li>
									<li>
										<span className="font-semibold">Leverage:</span> 1:100 (all account types)
									</li>
									<li>
										<span className="font-semibold">Profit Split:</span> 80–100. After the first withdrawal,
										profit split increases by 5% on the next payout.
									</li>
								</ul>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Payouts & Activity</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li>
										<span className="font-semibold">Payout Window:</span> 15 business days (excluding weekends)
										on live funded accounts.
									</li>
									<li>
										<span className="font-semibold">Minimum Withdrawal Limit:</span> 10% of profits, and at
										least $200.
									</li>
									<li>
										<span className="font-semibold">Purchase Fee Refund:</span> refundable on first payout on
										big accounts starting from $10k and above.
									</li>
									<li>
										<span className="font-semibold">Inactivity Rule:</span> if no trades are opened within 30
										days, the account will be marked as failed.
									</li>
									<li>
										<span className="font-semibold">Minimum Trade Holding Time (live):</span> 2 minutes 30
										seconds. This applies only to the funded stage, not the challenge phase.
									</li>
								</ul>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Strategy Restrictions</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li>
										<span className="font-semibold">Weekend Holding:</span> not allowed.
									</li>
									<li>
										<span className="font-semibold">Overnight Holding:</span> not allowed (keeping a trade
										open after the market closes for the day into the next trading session).
									</li>
									<li>
										<span className="font-semibold">EA, Scalping, Martingale:</span> not allowed.
									</li>
									<li>
										<span className="font-semibold">Hedging and News Trading:</span> allowed.
									</li>
									<li>
										<span className="font-semibold">Layering:</span> considered a hard breach on live accounts.
									</li>
									<li>
										<span className="font-semibold">Consistency Rule:</span> your total trading volume in a
										single day should not exceed 30% of your overall trading activity.
									</li>
									<li>
										<span className="font-semibold">Stop Loss / Take Profit:</span> not mandatory.
									</li>
									<li>
										<span className="font-semibold">Crypto Markets:</span> cryptocurrency markets (e.g. BTC)
										trade 24/7, so weekend trading is possible there even though FX markets close.
									</li>
								</ul>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-4">Account Lifecycle</h3>
								<ul className="space-y-2 text-[#37353E] text-sm">
									<li>
										<span className="font-semibold">Invalid Accounts:</span> in case your account becomes
										invalid we will issue a new broker fresh account. It is not possible to shift balances
										from one broker to another.
									</li>
									<li>
										<span className="font-semibold">Funded Stage Replacement:</span> if your account becomes
										invalid at the funded stage, you will be provided with another funded-stage account.
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Pricing Section */}
					<section>
						<header className="mb-8 text-center">
							<h2 className={`${display.className} text-3xl font-semibold tracking-[-0.02em] text-[#0b0b0f] md:text-4xl`}>
								Funding Plans & Rules
							</h2>
							<p className="mx-auto mt-2 max-w-2xl text-sm text-[#2e2e35]/75">
								Select an account size to compare rules for each phase. Fees are refundable after successful evaluation.
							</p>
						</header>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-12">
							{/* Left controls */}
							<aside className="md:col-span-4">
								<div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
									<div className="mb-4">
										<button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0b0b0f]/15 bg-[#edf5ff] px-5 py-2 text-sm font-semibold text-[#0b0b0f]">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
												<path d="M4 17h6v3H4v-3zm10-6h6v9h-6v-9zM4 10h6v4H4v-4zM14 4h6v4h-6V4z" fill="currentColor" />
											</svg>
											2-Step
										</button>
									</div>

									{/* Account types (match main pricing section: Alpha, Beta, Gamma, Sigma) */}
									<div className="mb-4 grid grid-cols-2 gap-3">
										{ACCOUNT_TYPES.map((type) => (
											<div
												key={type}
												className="flex items-center justify-center rounded-xl border border-[#0b0b0f]/15 bg-[#0b0b0f] px-3 py-2 text-xs font-semibold text-white shadow-sm"
											>
												{type}
											</div>
										))}
									</div>

									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
										{SIZES.map((s, i) => {
											const active = i === selectedIdx;
											const isPopular = s.label === '$100,000';
											return (
												<button
													key={s.label}
													onClick={() => setSelectedIdx(i)}
													className={`group relative rounded-full px-3 py-2 text-sm font-semibold transition ${
														active
															? 'bg-[#0ea5e9] text-white shadow-[0_8px_20px_rgba(14,165,233,0.35)]'
															: 'bg-white text-[#0b0b0f] border border-[#0b0b0f]/15 hover:bg-[#f6f7fb]'
													}`}
												>
													{s.label}
													{isPopular && (
														<span className="absolute -top-2 right-2 rounded-full bg-[#0ea5e9] px-2 py-0.5 text-[10px] font-bold text-white">
															Popular
														</span>
													)}
												</button>
											);
										})}
									</div>

									<div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#0b0b0f]">
										<span className="inline-flex items-center gap-2 rounded-full bg-[#f7fbff] px-3 py-1 text-[#0b0b0f]">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
												<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
												<path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
											No Consistency Rules
										</span>
										<span className="inline-flex items-center gap-2 rounded-full bg-[#f7fbff] px-3 py-1 text-[#0b0b0f]">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
												<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
												<path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
											MetaTrader 5 Available
										</span>
									</div>
								</div>
							</aside>

							{/* Right details */}
							<div className="md:col-span-8">
								<div className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
									<div className="grid grid-cols-4 text-sm">
										<div className="border-b border-[#eef1f5] px-4 py-3 text-center font-semibold text-[#0b0b0f]"></div>
										<div className="border-b border-[#eef1f5] px-4 py-3 text-center font-semibold text-[#0b0b0f]">Step 1</div>
										<div className="border-b border-[#eef1f5] px-4 py-3 text-center font-semibold text-[#0b0b0f]">Step 2</div>
										<div className="border-b border-[#eef1f5] px-4 py-3 text-center font-semibold text-[#0b0b0f]">Funded Stage</div>

										{[
											['Trading Period', size.step1.tradingPeriod, size.step2.tradingPeriod, size.funded.tradingPeriod],
											['Min. Trading Days', size.step1.minTradingDays, size.step2.minTradingDays, size.funded.minTradingDays],
											['Max. Daily Loss', size.step1.maxDailyLoss, size.step2.maxDailyLoss, size.funded.maxDailyLoss],
											['Max Overall Loss', size.step1.maxOverallLoss, size.step2.maxOverallLoss, size.funded.maxOverallLoss],
											['Profit Target', size.step1.profitTarget, size.step2.profitTarget, size.funded.profitTarget],
											['BrightFunded Tokens', size.step1.brightTokens, size.step2.brightTokens, size.funded.brightTokens],
											['Refundable Fee', size.step1.refundableFee, size.step2.refundableFee, size.funded.refundableFee],
										].map((row, idx) => (
											<div key={idx} className={idx % 2 === 0 ? 'contents bg-white' : 'contents bg-[#fafbfd]'}>
												<div className="col-span-1 border-b border-[#eef1f5] px-4 py-3 text-sm text-[#2e2e35]/80">
													<span className="inline-flex items-center gap-2">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline align-[-2px]">
															<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
															<path d="M12 8h.01M11 11h2v5h-2z" stroke="currentColor" strokeWidth="1.6" />
														</svg>
														{row[0]}
													</span>
												</div>
												<div className="border-b border-[#eef1f5] px-4 py-3 text-center text-[#0b0b0f]">{row[1]}</div>
												<div className="border-b border-[#eef1f5] px-4 py-3 text-center text-[#0b0b0f]">{row[2]}</div>
												<div className="border-b border-[#eef1f5] px-4 py-3 text-center text-[#0b0b0f]">{row[3]}</div>
											</div>
										))}
									</div>

									<div className="flex flex-col items-start justify-between gap-4 border-t border-[#eef1f5] bg-[#f6fbff] px-4 py-4 sm:flex-row sm:items-center">
										<div className="text-[#0b0b0f]">
											<span className="font-semibold">{size.label}</span> • 2-Step Challenge
										</div>
										<div className="flex items-center gap-4">
											<div className={`${display.className} text-lg font-semibold text-[#0b0b0f]`}>
												Price: <span className="text-[#0b0b0f]">{size.price}</span>
											</div>
											<a
												href="#pricing"
												className="inline-flex items-center justify-center rounded-full bg-[#0ea5e9] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0891d1]"
											>
												Get Funded →
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}





