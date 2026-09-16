'use client';

import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import {
	SiBitcoin,
	SiEthereum,
	SiTether,
	SiGooglepay,
	SiApplepay,
} from "react-icons/si";
import SaleTimer from "./SaleTimer";
import { GLOBAL_RULES } from "@/lib/rules-config";

/** Per-tier feature list. Numbers come from lib/rules-config.ts. */
const FEATURES_BY_TIER: Record<string, Array<{ label: string; included: boolean }>> = {
	Step1: [
		{ label: "Profit target 10% (Phase 1)", included: true },
		{ label: "3 profitable days to pass", included: true },
		{ label: `Daily drawdown ${GLOBAL_RULES.dailyDrawdownPct}%`, included: true },
		{ label: "Maximum drawdown 10%", included: true },
		{ label: `Leverage ${GLOBAL_RULES.leverage}`, included: true },
		{ label: "Minimum holding time 3 min", included: true },
		{ label: "No profit consistency rule", included: true },
		{ label: "Overnight holding included", included: true },
		{ label: "News free in challenge", included: true },
		{ label: "Weekend holding — paid add-on", included: false },
		{ label: "Trade layering not allowed", included: false },
	],
	Step2: [
		{ label: "Profit target 10% then 5%", included: true },
		{ label: "3 profitable days per phase", included: true },
		{ label: `Daily drawdown ${GLOBAL_RULES.dailyDrawdownPct}%`, included: true },
		{ label: "Maximum drawdown 10%", included: true },
		{ label: `Leverage ${GLOBAL_RULES.leverage}`, included: true },
		{ label: "Minimum holding time 3 min", included: true },
		{ label: "No profit consistency rule", included: true },
		{ label: "Overnight holding included", included: true },
		{ label: "News free in challenge", included: true },
		{ label: "Weekend holding — paid add-on", included: false },
		{ label: "Trade layering not allowed", included: false },
	],
	Instant: [
		{ label: "No profit target — funded day one", included: true },
		{ label: "5 days (3 profitable + 2 trading)", included: true },
		{ label: `Daily drawdown ${GLOBAL_RULES.dailyDrawdownPct}%`, included: true },
		{ label: "Maximum drawdown 6%", included: true },
		{ label: `Leverage ${GLOBAL_RULES.leverage}`, included: true },
		{ label: "Minimum holding time 3 min", included: true },
		{ label: "No profit consistency rule", included: true },
		{ label: "Overnight holding included", included: true },
		{ label: "News: 10-min restricted window", included: false },
		{ label: "Weekend holding — paid add-on", included: false },
		{ label: "Max 2 concurrent layers", included: false },
	],
};

const TIERS = [
	{
		id: "Step1",
		label: "Step 1",
		accounts: [
			{ size: 3000, price: 14 },
			{ size: 5000, price: 23 },
			{ size: 10000, price: 32 },
			{ size: 50000, price: 49 },
			{ size: 100000, price: 103 },
			{ size: 200000, price: 145 },
			{ size: 500000, price: 240 },
		],
	},
	{
		id: "Step2",
		label: "Step 2",
		accounts: [
			{ size: 3000, price: 9 },
			{ size: 5000, price: 14 },
			{ size: 10000, price: 23 },
			{ size: 50000, price: 42 },
			{ size: 100000, price: 82 },
			{ size: 200000, price: 123 },
			{ size: 500000, price: 200 },
		],
	},
	{
		id: "Instant",
		label: "Instant",
		accounts: [
			{ size: 3000, price: 29 },
			{ size: 5000, price: 38 },
			{ size: 10000, price: 50 },
			{ size: 50000, price: 91 },
			{ size: 100000, price: 180 },
			{ size: 200000, price: 323 },
			{ size: 500000, price: 900 },
		],
	},
] as const;

export default function Pricing() {
	const [selectedTierId, setSelectedTierId] = useState<string>("Step1");
	const [selectedAccount, setSelectedAccount] = useState<number>(3000);

	const currentTier = TIERS.find((t) => t.id === selectedTierId) ?? TIERS[0];
	const accounts = currentTier.accounts;
	const features = FEATURES_BY_TIER[currentTier.id] ?? FEATURES_BY_TIER.Step1;

	const formatSizeK = (size: number) => (size >= 1000 ? `${size / 1000}K` : String(size));
	const realPrice = (discounted: number) => Number((discounted * 1.65).toFixed(2));

	const handleTierChange = (tierId: string) => {
		setSelectedTierId(tierId);
		const tier = TIERS.find((t) => t.id === tierId);
		if (tier) setSelectedAccount(tier.accounts[0].size);
	};

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

				{/* Main card - two columns: compact left (toggle + features), larger cards right */}
				<div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-6 md:p-8">
					{/* Pricing key */}
					<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
								Pricing
							</span>
							<span className="text-xs text-zinc-500">All prices in USD.</span>
						</div>
						<span className="text-xs font-medium text-zinc-500">
							Select account type, then account size.
						</span>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,200px)_1fr] gap-6 lg:gap-6 items-start">
						{/* Left column: Step 1 / Step 2 / Instant + feature list */}
						<div className="space-y-4 lg:max-w-[200px]">
							<div className="grid grid-cols-3 gap-1.5">
								{TIERS.map((tier) => (
									<button
										key={tier.id}
										onClick={() => handleTierChange(tier.id)}
										className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
											selectedTierId === tier.id
												? "bg-[#0b0b0f] text-white shadow-md"
												: "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
										}`}
									>
										{tier.label}
									</button>
								))}
							</div>

							{/* Feature list - compact */}
							<ul className="space-y-2.5">
								{features.map(({ label, included }) => (
									<li key={label} className="flex items-center justify-between gap-2">
										<span className="text-xs font-medium text-slate-800 leading-tight">{label}</span>
										{included ? (
											<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
												<Check className="h-2.5 w-2.5" strokeWidth={3} />
											</span>
										) : (
											<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-zinc-500">
												<Minus className="h-2.5 w-2.5" strokeWidth={2.5} />
											</span>
										)}
									</li>
								))}
							</ul>
						</div>

						{/* Right column: Professional pricing cards */}
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-5 w-full min-h-[240px]">
							{accounts.map((account) => {
								const isSelected = selectedAccount === account.size;
								const sizeLabel = formatSizeK(account.size);
								const real = realPrice(account.price);
								return (
									<button
										key={account.size}
										type="button"
										onClick={() => setSelectedAccount(account.size)}
										className={`flex flex-col rounded-xl p-5 md:p-6 text-left transition-all duration-200 min-h-[220px] md:min-h-[240px] ${
											isSelected
												? "bg-black text-white shadow-lg"
												: "bg-white border border-zinc-200 text-slate-800 hover:border-zinc-300 hover:shadow-md"
										}`}
									>
										{/* Selection indicator - top left */}
										<div className="mb-4">
											{isSelected ? (
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
													<Check className="h-3.5 w-3.5" strokeWidth={2.5} />
												</span>
											) : (
												<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300" />
											)}
										</div>
										{/* Title */}
										<p className={`font-semibold text-base md:text-lg ${isSelected ? "text-white" : "text-slate-900"}`}>
											${sizeLabel} Account
										</p>
										{/* Price */}
										<div className="mt-auto pt-5">
											<div className={`text-xs ${isSelected ? "text-white/70" : "text-slate-500"}`}>
												<span className="line-through">${real}</span>
												<span className="ml-1">Real (+65%)</span>
											</div>
											<span className={`text-2xl md:text-3xl font-bold block ${isSelected ? "text-white" : "text-slate-900"}`}>
												${account.price}
											</span>
											<div className={`text-xs ${isSelected ? "text-white/70" : "text-slate-500"}`}>Discounted</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Bottom: Choose Plan button */}
					<div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
						<Link
							href="/signup"
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
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm" title="Ethereum">
							<SiEthereum className="h-7 w-7 text-[#627eea]" />
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
