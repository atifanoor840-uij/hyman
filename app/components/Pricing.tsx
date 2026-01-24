'use client';

import { Poppins } from "next/font/google";
import { useState } from "react";
import { ArrowRight, Layers, Sparkles, Info, CheckCircle2 } from "lucide-react";
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

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700", "800"],
});

const accountTypes = [
	{ label: "Alpha", icon: Layers, color: "from-green-50 to-white", iconColor: "text-green-600" },
	{ label: "Beta", icon: Sparkles, color: "from-purple-50 to-white", iconColor: "text-purple-600" },
	{ label: "Gamma", icon: Info, color: "from-yellow-50 to-white", iconColor: "text-yellow-600" },
	{ label: "Sigma", icon: CheckCircle2, color: "from-blue-50 to-white", iconColor: "text-blue-600" },
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
		{ label: "$2.5k", price: "$25", discountedPrice: "$20", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$20k", price: "$135", discountedPrice: "$120", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$40k", price: "$245", discountedPrice: "$220", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$80k", price: "$425", discountedPrice: "$380", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$150k", price: "$650", discountedPrice: "$590", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$175k", price: "$725", discountedPrice: "$660", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
	],
	Beta: [
		{ label: "$5,000", price: "$45", discountedPrice: "$39", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$25,000", price: "$155", discountedPrice: "$140", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$50,000", price: "$275", discountedPrice: "$245", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$100,000", price: "$495", discountedPrice: "$450", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$200,000", price: "$925", discountedPrice: "$850", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
		{ label: "$225,000", price: "$995", discountedPrice: "$910", dailyDrawdown: "5%", minTradingDays: "5 Days", weekendHolding: "Allowed" },
	],
	Gamma: [
		{ label: "$3,000", price: "$35", discountedPrice: "$30", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
		{ label: "$10,000", price: "$75", discountedPrice: "$65", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
		{ label: "$30,000", price: "$185", discountedPrice: "$165", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
		{ label: "$60,000", price: "$325", discountedPrice: "$290", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
		{ label: "$80,000", price: "$395", discountedPrice: "$355", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
		{ label: "$100,000", price: "$475", discountedPrice: "$430", dailyDrawdown: "4%", minTradingDays: "1 Day", weekendHolding: "Allowed" },
	],
	Sigma: [
		{ label: "$125,000", price: "$1,250", discountedPrice: "$1,125", dailyDrawdown: "4%", minTradingDays: "4 Days", weekendHolding: "Allowed" },
		{ label: "$250,000", price: "$2,300", discountedPrice: "$2,080", dailyDrawdown: "4%", minTradingDays: "4 Days", weekendHolding: "Allowed" },
		{ label: "$500,000", price: "$4,200", discountedPrice: "$3,780", dailyDrawdown: "4%", minTradingDays: "4 Days", weekendHolding: "Allowed" },
	],
};

export default function Pricing() {
	const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeLabel>("Alpha");

	const accountSizes = ACCOUNT_SIZES[selectedAccountType];
	const selectedType = accountTypes.find((type) => type.label === selectedAccountType);

	return (
		<section id="pricing" className="bg-white">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
				<header className="mb-12 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border-2 border-black/10 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black/70 mb-6">
						Pricing Plans
					</div>
					<h2 className={`${display.className} text-4xl font-bold tracking-tight text-black md:text-5xl lg:text-6xl mb-4`}>
						Choose Your Account Plan
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-black/70 md:text-xl">
						The best performing funding infrastructure in the industry with flexible account sizes for every trader.
					</p>
				</header>

				{/* Account Type Selection Buttons */}
				<div className="mb-12 flex flex-wrap items-center justify-center gap-4">
					{accountTypes.map(({ label, icon: Icon, iconColor }) => {
						const isActive = label === selectedAccountType;
						return (
							<button
								key={label}
								onClick={() => setSelectedAccountType(label)}
								className={`inline-flex items-center gap-3 rounded-xl border-2 px-6 py-3.5 text-base font-bold transition-all ${
									isActive
										? "border-black bg-black text-white shadow-lg scale-105"
										: "border-black/20 bg-white text-black hover:bg-black/5 hover:border-black/40 hover:shadow-md"
								}`}
							>
								<Icon className={`h-5 w-5 ${isActive ? 'text-white' : iconColor}`} />
								{label}
							</button>
						);
					})}
				</div>

				{/* Account Size Cards */}
				<div className="space-y-4">
					{accountSizes.map((size, index) => {
						const gradientColors = [
							"from-green-50 to-white",
							"from-purple-50 to-white",
							"from-yellow-50 to-white",
							"from-blue-50 to-white",
							"from-pink-50 to-white",
							"from-indigo-50 to-white",
						];
						const iconColors = [
							"text-green-600",
							"text-purple-600",
							"text-yellow-600",
							"text-blue-600",
							"text-pink-600",
							"text-indigo-600",
						];
						
						const gradient = gradientColors[index % gradientColors.length];
						const iconColor = iconColors[index % iconColors.length];
						const Icon = selectedType?.icon || Layers;

						return (
							<div
								key={size.label}
								className={`group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-r ${gradient} p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]`}
							>
								<div className="flex items-center justify-between">
									{/* Left side - Icon, Label, Description */}
									<div className="flex items-start gap-4 flex-1">
										<div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-black/10 shadow-sm`}>
											<Icon className={`h-6 w-6 ${iconColor}`} />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-3">
												<h3 className={`${display.className} text-xl font-bold text-black`}>
													{size.label}
												</h3>
												{/* MT5 and MT4 Logos */}
												<div className="flex items-center gap-2">
													<div className="flex items-center justify-center h-5 px-2 py-0.5 rounded bg-black/5 border border-black/10">
														<span className="text-[10px] font-bold text-black/70">MT5</span>
													</div>
													<div className="flex items-center justify-center h-5 px-2 py-0.5 rounded bg-black/5 border border-black/10">
														<span className="text-[10px] font-bold text-black/70">MT4</span>
													</div>
												</div>
											</div>
											{/* Rules */}
											<div className="flex flex-wrap items-center gap-4 text-xs">
												<div className="flex items-center gap-1.5">
													<span className="font-semibold text-black/60">Daily Drawdown:</span>
													<span className="font-bold text-black">{size.dailyDrawdown}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="font-semibold text-black/60">Min Trading Days:</span>
													<span className="font-bold text-black">{size.minTradingDays}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="font-semibold text-black/60">Weekend Holding:</span>
													<span className="font-bold text-black">{size.weekendHolding}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="font-semibold text-black/60">Consistency Rule:</span>
													<span className="font-bold text-green-600">No</span>
												</div>
											</div>
										</div>
									</div>

									{/* Right side - Price and Button */}
									<div className="flex items-center gap-6 ml-6">
										<div className="text-right">
											<div className="flex items-baseline gap-2">
												<span className="text-lg line-through text-black/40 font-semibold">
													{size.price}
												</span>
												<span className={`${display.className} text-3xl font-bold text-black`}>
													{size.discountedPrice}
												</span>
											</div>
											<p className="text-xs font-semibold text-black/60 mt-1">Pay as you go</p>
										</div>
										<button className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:bg-black/90 hover:scale-110 group-hover:shadow-xl">
											<ArrowRight className="h-5 w-5" />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Payment Icons Infinite Scroll */}
			<div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50 border-t border-black/10 py-12">
				<div className="mb-6 text-center">
					<p className="text-sm font-semibold uppercase tracking-wider text-black/60">Accepted Payment Methods</p>
				</div>
				<div className="animate-scroll flex items-center gap-16 whitespace-nowrap">
					{/* Duplicate content for seamless loop */}
					{[...Array(2)].map((_, i) => (
						<div key={i} className="flex items-center gap-16">
							{/* USDT */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiTether className="h-12 w-12 text-[#26a17b]" />
							</div>
							{/* BTC */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiBitcoin className="h-12 w-12 text-[#f7931a]" />
							</div>
							{/* Solana */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<svg width="48" height="48" viewBox="0 0 397.7 311.7" className="w-12 h-12">
									<path fill="#14F195" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
									<path fill="#9945FF" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
									<path fill="#14F195" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
								</svg>
							</div>
							{/* Tron */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<svg width="48" height="48" viewBox="0 0 24 24" className="w-12 h-12">
									<path fill="#FF0019" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6S6.698 2.4 12 2.4 21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/>
									<path fill="#FF0019" d="M12 4.8c-3.978 0-7.2 3.222-7.2 7.2s3.222 7.2 7.2 7.2 7.2-3.222 7.2-7.2-3.222-7.2-7.2-7.2zm0 12.48c-2.914 0-5.28-2.366-5.28-5.28S9.086 6.72 12 6.72s5.28 2.366 5.28 5.28-2.366 5.28-5.28 5.28z"/>
								</svg>
							</div>
							{/* Stripe */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiStripe className="h-12 w-12 text-[#635bff]" />
							</div>
							{/* Mastercard */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiMastercard className="h-12 w-12 text-[#eb001b]" />
							</div>
							{/* Google Pay */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiGooglepay className="h-12 w-12 text-[#1a73e8]" />
							</div>
							{/* Apple Pay */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiApplepay className="h-12 w-12 text-black" />
							</div>
							{/* Visa */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiVisa className="h-12 w-12 text-[#1a1f71]" />
							</div>
							{/* Amazon Pay */}
							<div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all hover:scale-110">
								<SiAmazon className="h-12 w-12 text-[#ff9900]" />
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
