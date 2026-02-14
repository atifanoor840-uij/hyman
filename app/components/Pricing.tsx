'use client';

import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import {
	SiBitcoin,
	SiTether,
	SiStripe,
	SiVisa,
	SiMastercard,
	SiGooglepay,
	SiApplepay,
} from "react-icons/si";
import SaleTimer from "./SaleTimer";

const FEATURES = [
	{ label: "All limited links", included: true },
	{ label: "Own analytics platform", included: true },
	{ label: "Chat support", included: true },
	{ label: "Optimize hashtags", included: false },
	{ label: "Unlimited users", included: false },
];

const PLANS = [
	{ id: "intro", name: "Intro", priceMonthly: 19, priceYearly: 15 },
	{ id: "base", name: "Base", priceMonthly: 39, priceYearly: 31 },
	{ id: "popular", name: "Popular", priceMonthly: 99, priceYearly: 79 },
	{ id: "enterprise", name: "Enterprise", priceMonthly: 119, priceYearly: 95 },
];

export default function Pricing() {
	const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
	const [selectedPlan, setSelectedPlan] = useState<string>("intro");
	const [acceptPrize, setAcceptPrize] = useState(true);

	return (
		<section id="pricing" className="bg-white py-16 md:py-24">
			<div className="mx-auto max-w-6xl px-6 md:px-10">
				{/* Header */}
				<header className="text-center mb-10">
					<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
						Trader Development Plans — Transparent Pricing
					</h2>
					<p className="mt-2 text-base text-slate-500">
						Skills assessment programs on simulated accounts. Refundable fees per terms. No surprise charges.
					</p>
				</header>

				{/* Main card - two columns: left = toggle + features, right = vertical plan cards side by side */}
				<div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-6 md:p-8">
					<div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-10 items-start">
						{/* Left column: toggle + feature list */}
						<div className="space-y-6">
							{/* Monthly / Yearly toggle */}
							<div className="inline-flex rounded-full bg-zinc-200 p-1">
								<button
									onClick={() => setBilling('monthly')}
									className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
										billing === 'monthly'
											? 'bg-black text-white'
											: 'text-zinc-500 hover:text-zinc-700'
									}`}
								>
									Monthly
								</button>
								<button
									onClick={() => setBilling('yearly')}
									className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
										billing === 'yearly'
											? 'bg-black text-white'
											: 'text-zinc-500 hover:text-zinc-700'
									}`}
								>
									Yearly
								</button>
							</div>

							{/* Feature list */}
							<ul className="space-y-4">
								{FEATURES.map(({ label, included }) => (
									<li key={label} className="flex items-center justify-between gap-4 min-w-[200px]">
										<span className="text-sm font-medium text-slate-800">{label}</span>
										{included ? (
											<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
												<Check className="h-3.5 w-3.5" strokeWidth={3} />
											</span>
										) : (
											<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-zinc-500">
												<Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
											</span>
										)}
									</li>
								))}
							</ul>
						</div>

						{/* Right column: vertical plan cards side by side (each card is a vertical column) */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full min-h-[280px]">
							{PLANS.map((plan) => {
								const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly;
								const isSelected = selectedPlan === plan.id;
								return (
									<button
										key={plan.id}
										type="button"
										onClick={() => setSelectedPlan(plan.id)}
										className={`flex flex-col rounded-xl px-4 py-5 text-left transition-all min-h-[240px] ${
											isSelected
												? 'bg-black text-white shadow-lg'
												: 'bg-white border border-zinc-200 text-slate-800 hover:border-zinc-300 hover:shadow-sm'
										}`}
									>
										<div className="flex flex-col flex-1">
											{isSelected ? (
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white mb-3">
													<Check className="h-3.5 w-3.5" strokeWidth={3} />
												</span>
											) : (
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 mb-3" />
											)}
											<p className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-slate-900'}`}>
												{plan.name}
											</p>
											<p className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-rose-500'}`}>
												Save 20%
											</p>
											<div className="mt-auto pt-6">
												<span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
													${price}
												</span>
												<span className={`text-sm block ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
													/Month
												</span>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Bottom: Accept your prize toggle + Choose Plan button */}
					<div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-3">
							<button
								type="button"
								role="switch"
								aria-checked={acceptPrize}
								onClick={() => setAcceptPrize(!acceptPrize)}
								className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
									acceptPrize ? 'bg-emerald-500' : 'bg-zinc-300'
								}`}
							>
								<span
									className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
										acceptPrize ? 'left-5' : 'left-0.5'
									}`}
								/>
							</button>
							<div>
								<p className="text-sm font-medium text-slate-800">Accept your prize.</p>
								<p className="text-xs text-rose-500">Save 20%</p>
							</div>
						</div>
						<Link
							href="/dashboard/buys"
							className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
						>
							Choose Plan
						</Link>
					</div>
				</div>

				{/* Available payment methods */}
				<div className="mt-12">
					<p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
						Available payment methods
					</p>
					<div className="flex flex-wrap items-center justify-center gap-6">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="USDT">
							<SiTether className="h-7 w-7 text-[#26a17b]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Bitcoin">
							<SiBitcoin className="h-7 w-7 text-[#f7931a]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Stripe">
							<SiStripe className="h-7 w-7 text-[#635bff]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Visa">
							<SiVisa className="h-7 w-7 text-[#1a1f71]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Mastercard">
							<SiMastercard className="h-7 w-7 text-[#eb001b]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Google Pay">
							<SiGooglepay className="h-7 w-7 text-[#1a73e8]" />
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Apple Pay">
							<SiApplepay className="h-7 w-7 text-slate-800" />
						</div>
					</div>
				</div>

				{/* Sale banner / timer - below available payment methods */}
				<SaleTimer />
			</div>
		</section>
	);
}
