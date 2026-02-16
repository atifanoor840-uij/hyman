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
	{ label: "Hedging and News Trading is Allowed", included: true },
	{ label: "Layering not allowed", included: false },
	{ label: "Minimum trading days 5", included: true },
	{ label: "Daily drawdown 5%", included: true },
	{ label: "Maximum drawdown 8%", included: true },
	{ label: "Leverage 1:100", included: true },
];

const TIERS = [
	{
		id: "Alpha",
		label: "Alpha (Single Step)",
		accounts: [
			{ size: 4000, price: 45, discountedPrice: 31 },
			{ size: 10000, price: 85, discountedPrice: 60 },
			{ size: 20000, price: 160, discountedPrice: 112 },
			{ size: 50000, price: 375, discountedPrice: 260 },
			{ size: 100000, price: 750, discountedPrice: 520 },
		],
	},
	{
		id: "Beta",
		label: "Beta (2 Step)",
		accounts: [
			{ size: 4000, price: 39, discountedPrice: 27 },
			{ size: 10000, price: 75, discountedPrice: 52 },
			{ size: 20000, price: 140, discountedPrice: 98 },
			{ size: 50000, price: 325, discountedPrice: 225 },
			{ size: 100000, price: 650, discountedPrice: 450 },
		],
	},
	{
		id: "Sigma",
		label: "Sigma (Instant)",
		accounts: [
			{ size: 5000, price: 55, discountedPrice: 38 },
			{ size: 10000, price: 85, discountedPrice: 60 },
			{ size: 25000, price: 210, discountedPrice: 147 },
			{ size: 50000, price: 375, discountedPrice: 260 },
			{ size: 100000, price: 750, discountedPrice: 520 },
		],
	},
] as const;

export default function Pricing() {
	const [selectedTierId, setSelectedTierId] = useState<string>("Alpha");
	const [selectedAccount, setSelectedAccount] = useState<number>(4000);
	const [acceptPrize, setAcceptPrize] = useState(true);

	const currentTier = TIERS.find((t) => t.id === selectedTierId) ?? TIERS[0];
	const accounts = currentTier.accounts;

	const formatSizeK = (size: number) => (size >= 1000 ? `${size / 1000}K` : String(size));

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
					<div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,200px)_1fr] gap-6 lg:gap-6 items-start">
						{/* Left column: Alpha/Beta top, Sigma below + feature list */}
						<div className="space-y-4 lg:max-w-[200px]">
							{/* Alpha & Beta on top row */}
							<div className="flex gap-1.5">
								{TIERS.filter((t) => t.id !== "Sigma").map((tier) => (
									<button
										key={tier.id}
										onClick={() => handleTierChange(tier.id)}
										className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
											selectedTierId === tier.id
												? "bg-[#0b0b0f] text-white shadow-md"
												: "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
										}`}
									>
										{tier.id}
									</button>
								))}
							</div>
							{/* Sigma below */}
							<button
								onClick={() => handleTierChange("Sigma")}
								className={`w-full rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
									selectedTierId === "Sigma"
										? "bg-[#0b0b0f] text-white shadow-md"
										: "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
								}`}
							>
								Sigma (Instant)
							</button>

							{/* Feature list - compact */}
							<ul className="space-y-2.5">
								{FEATURES.map(({ label, included }) => (
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
								const displayPrice = acceptPrize ? account.discountedPrice : account.price;
								const isSelected = selectedAccount === account.size;
								const sizeLabel = formatSizeK(account.size);
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
										{/* Save % */}
										{acceptPrize && (
											<p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-rose-500"}`}>
												Save {Math.round((1 - account.discountedPrice / account.price) * 100)}%
											</p>
										)}
										{/* Price */}
										<div className="mt-auto pt-5">
											{acceptPrize && (
												<span className={`text-sm line-through block ${isSelected ? "text-white/60" : "text-slate-400"}`}>
													${account.price}
												</span>
											)}
											<span className={`text-2xl md:text-3xl font-bold block ${isSelected ? "text-white" : "text-slate-900"}`}>
												${displayPrice}
											</span>
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
								<p className="text-xs text-rose-500">Discounted pricing</p>
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
