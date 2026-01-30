'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Info, CheckCircle2, Check } from "lucide-react";
import { 
	SiBitcoin, 
	SiTether, 
	SiStripe, 
	SiVisa, 
	SiMastercard, 
	SiGooglepay,
	SiApplepay,
	SiAmazon
} from "react-icons/si";
import SaleTimer from "./SaleTimer";

const accountTypes = [
	{ label: "Alpha", icon: Layers, description: "Single step" },
	{ label: "Beta", icon: Sparkles, description: "2 Step" },
	{ label: "Sigma", icon: CheckCircle2, description: "Instant" },
] as const;

type AccountTypeLabel = (typeof accountTypes)[number]["label"];

type AccountSizeConfig = {
	label: string;
	price: string;
	discountedPrice: string;
	dailyDrawdown: string;
	minTradingDays: string;
	weekendHolding: string;
};

const ACCOUNT_SIZES: Record<AccountTypeLabel, AccountSizeConfig[]> = {
	Alpha: [
		{ label: "$4,000", price: "$45", discountedPrice: "$31", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$10,000", price: "$85", discountedPrice: "$60", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$20,000", price: "$160", discountedPrice: "$112", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$50,000", price: "$375", discountedPrice: "$260", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$100,000", price: "$750", discountedPrice: "$520", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
	],
	Beta: [
		{ label: "$4,000", price: "$45", discountedPrice: "$31", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$10,000", price: "$85", discountedPrice: "$60", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$20,000", price: "$160", discountedPrice: "$112", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$50,000", price: "$375", discountedPrice: "$260", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$100,000", price: "$750", discountedPrice: "$520", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
	],
	Sigma: [
		{ label: "$5,000", price: "$55", discountedPrice: "$38", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$10,000", price: "$85", discountedPrice: "$60", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$25,000", price: "$210", discountedPrice: "$147", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$50,000", price: "$375", discountedPrice: "$260", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
		{ label: "$100,000", price: "$750", discountedPrice: "$520", dailyDrawdown: "5%", minTradingDays: "0 Days", weekendHolding: "Allowed" },
	],
};

export default function Pricing() {
	const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeLabel>("Alpha");

	const accountSizes = ACCOUNT_SIZES[selectedAccountType];
	const selectedType = accountTypes.find((type) => type.label === selectedAccountType);

	return (
		<section id="pricing" className="bg-slate-50/80">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
				<header className="mb-14 text-center">
					<p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
						Pricing Plans
					</p>
					<h2 className="font-sans text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl mb-4">
						Choose Your Account Plan
					</h2>
					<p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
						Flexible account sizes and transparent rules. One fee, clear targets, no hidden costs.
					</p>
				</header>

				{/* Account type tabs — pill style */}
				<div className="mb-10 flex flex-wrap items-center justify-center gap-2">
					{accountTypes.map(({ label, icon: Icon, description }) => {
						const isActive = label === selectedAccountType;
						return (
							<button
								key={label}
								onClick={() => setSelectedAccountType(label)}
								className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
									isActive
										? "bg-slate-900 text-white shadow-md"
										: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
								}`}
							>
								<Icon className="h-4 w-4 shrink-0" />
								<span>{label}</span>
								<span className={`hidden sm:inline text-[11px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
									{description}
								</span>
							</button>
						);
					})}
				</div>

				{/* Pricing cards — professional list */}
				<div className="space-y-3">
					{accountSizes.map((size) => {
						const Icon = selectedType?.icon || Layers;
						return (
							<article
								key={size.label}
								className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
							>
								{/* Left: account size + specs */}
								<div className="flex min-w-0 flex-1 items-start gap-5">
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
										<Icon className="h-5 w-5" />
									</div>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											<h3 className="font-sans text-lg font-bold tracking-tight text-slate-900">
												{size.label}
											</h3>
											<span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
												MT4 / MT5
											</span>
										</div>
										<ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
											<li className="flex items-center gap-1.5">
												<Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
												<span>Daily drawdown {size.dailyDrawdown}</span>
											</li>
											<li className="flex items-center gap-1.5">
												<Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
												<span>Min. {size.minTradingDays}</span>
											</li>
											<li className="flex items-center gap-1.5">
												<Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
												<span>Weekend holding {size.weekendHolding}</span>
											</li>
											<li className="flex items-center gap-1.5">
												<Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
												<span>No consistency rule</span>
											</li>
										</ul>
									</div>
								</div>

								{/* Right: price + CTA */}
								<div className="flex shrink-0 flex-col items-start sm:items-end gap-3 sm:pl-6 border-t border-slate-100 pt-5 sm:border-t-0 sm:pt-0 sm:border-l sm:border-slate-200">
									<div className="flex items-baseline gap-2">
										<span className="text-sm text-slate-400 line-through">{size.price}</span>
										<span className="font-sans text-2xl font-bold tracking-tight text-slate-900">
											{size.discountedPrice}
										</span>
									</div>
									<p className="text-xs text-slate-500">One-time fee · Pay as you go</p>
									<Link
										href="/dashboard/buys"
										className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
									>
										Get started
										<ArrowRight className="h-4 w-4" />
									</Link>
								</div>
							</article>
						);
					})}
				</div>
			</div>

			{/* Payment methods strip */}
			<div className="relative overflow-hidden border-t border-slate-200 bg-white py-10">
				<p className="text-center text-xs font-medium uppercase tracking-widest text-slate-400 mb-6">
					Accepted payment methods
				</p>
				<div className="animate-scroll flex items-center gap-12 whitespace-nowrap">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="flex items-center gap-12">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiTether className="h-7 w-7 text-[#26a17b]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiBitcoin className="h-7 w-7 text-[#f7931a]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<svg width="28" height="28" viewBox="0 0 397.7 311.7" className="shrink-0">
									<path fill="#14F195" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
									<path fill="#9945FF" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
									<path fill="#14F195" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
								</svg>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiStripe className="h-7 w-7 text-[#635bff]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiMastercard className="h-7 w-7 text-[#eb001b]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiGooglepay className="h-7 w-7 text-[#1a73e8]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiApplepay className="h-7 w-7 text-slate-800" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiVisa className="h-7 w-7 text-[#1a1f71]" />
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
								<SiAmazon className="h-7 w-7 text-[#ff9900]" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Sale Timer at the end */}
			<SaleTimer />
		</section>
	);
}
