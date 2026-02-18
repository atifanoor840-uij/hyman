'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_3 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

type Platform = {
	name: string;
	logo: React.ReactNode;
	specifications: {
		execution: string;
		spreads: string;
		instruments: string;
		leverage: string;
		minimumDeposit: string;
		platformType: string;
	};
	countries: string[];
	description: string;
	bestFor: string[];
};

const platforms: Platform[] = [
	{
		name: 'MetaTrader 5',
		logo: (
			<svg className="h-12 w-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="200" height="200" rx="20" fill="#1E88E5"/>
				<path d="M50 60L100 40L150 60V140L100 160L50 140V60Z" fill="white" opacity="0.9"/>
				<path d="M70 80L100 70L130 80V120L100 130L70 120V80Z" fill="#1E88E5"/>
				<text x="100" y="110" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">MT5</text>
			</svg>
		),
		specifications: {
			execution: 'Market & Instant Execution',
			spreads: 'From 0.0 pips',
			instruments: 'Forex, Stocks, Indices, Commodities, Crypto',
			leverage: 'Up to 1:100',
			minimumDeposit: '$100',
			platformType: 'Desktop, Mobile, Web',
		},
		countries: ['United States', 'United Kingdom', 'Germany', 'Australia', 'Canada', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark'],
		description: 'The most advanced multi-asset trading platform with 21 timeframes, 38 technical indicators, and built-in economic calendar.',
		bestFor: ['Professional Traders', 'Algorithmic Trading', 'Multi-Asset Trading', 'Advanced Analysis'],
	},
	{
		name: 'MetaTrader 4',
		logo: (
			<svg className="h-12 w-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="200" height="200" rx="20" fill="#00A651"/>
				<path d="M50 60L100 40L150 60V140L100 160L50 140V60Z" fill="white" opacity="0.9"/>
				<path d="M70 80L100 70L130 80V120L100 130L70 120V80Z" fill="#00A651"/>
				<text x="100" y="110" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">MT4</text>
			</svg>
		),
		specifications: {
			execution: 'Market & Instant Execution',
			spreads: 'From 0.5 pips',
			instruments: 'Forex, CFDs, Metals',
			leverage: 'Up to 1:500',
			minimumDeposit: '$50',
			platformType: 'Desktop, Mobile, Web',
		},
		countries: ['United Kingdom', 'Cyprus', 'Malta', 'Bulgaria', 'Romania', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Portugal', 'Turkey', 'UAE'],
		description: 'The world\'s most popular forex trading platform with Expert Advisors (EAs), custom indicators, and automated trading capabilities.',
		bestFor: ['Forex Traders', 'EA Trading', 'Beginners', 'Scalping'],
	},
];

export default function PlatformsPage() {
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
					<div className="mt-16 lg:mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Trading Platforms
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Trade on MetaTrader 5 (MT5) or MetaTrader 4 (MT4) — professional platforms for our evaluation programs.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img
								src={HEADER_IMAGE_3}
								alt="Trading platform interface"
								className="w-full h-auto rounded-xl object-contain shadow-2xl"
							/>
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
					<div className="space-y-12">
						{platforms.map((platform) => (
							<div
								key={platform.name}
								className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm transition-all hover:shadow-lg"
							>
								<div className="grid gap-8 lg:grid-cols-12">
									{/* Platform Logo and Header */}
									<div className="lg:col-span-3 bg-gradient-to-br from-[#f0f9ff] to-white p-8 flex flex-col items-center justify-center">
										<div className="mb-4">{platform.logo}</div>
										<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] text-center`}>
											{platform.name}
										</h2>
									</div>

									{/* Platform Details */}
									<div className="lg:col-span-9 p-8">
										<p className="text-[#37353E]/80 mb-6 leading-relaxed">{platform.description}</p>

										{/* Specifications */}
										<div className="mb-6">
											<h3 className="font-semibold text-[#0b0b0f] mb-4">Specifications</h3>
											<div className="grid gap-4 sm:grid-cols-2">
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Execution Type</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.execution}</p>
													</div>
												</div>
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Spreads</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.spreads}</p>
													</div>
												</div>
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Instruments</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.instruments}</p>
													</div>
												</div>
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Leverage</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.leverage}</p>
													</div>
												</div>
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Minimum Deposit</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.minimumDeposit}</p>
													</div>
												</div>
												<div className="flex items-start gap-3">
													<svg className="h-5 w-5 text-[#0ea5e9] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
													</svg>
													<div>
														<p className="text-sm font-medium text-[#0b0b0f]">Platform Type</p>
														<p className="text-sm text-[#37353E]/70">{platform.specifications.platformType}</p>
													</div>
												</div>
											</div>
										</div>

										{/* Best For */}
										<div className="mb-6">
											<h3 className="font-semibold text-[#0b0b0f] mb-3">Best For</h3>
											<div className="flex flex-wrap gap-2">
												{platform.bestFor.map((item) => (
													<span
														key={item}
														className="inline-flex items-center rounded-full bg-[#f0f9ff] px-3 py-1 text-xs font-semibold text-[#0ea5e9]"
													>
														{item}
													</span>
												))}
											</div>
										</div>

										{/* Recommended Countries */}
										<div>
											<h3 className="font-semibold text-[#0b0b0f] mb-3">Recommended Countries</h3>
											<div className="flex flex-wrap gap-2">
												{platform.countries.map((country) => (
													<span
														key={country}
														className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-medium text-[#37353E]"
													>
														<svg className="h-3 w-3 text-[#0ea5e9]" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
														</svg>
														{country}
													</span>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Comparison Section */}
					<div className="mt-16 rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-6 text-center`}>
							Platform Comparison
						</h2>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[#e5e5e5]">
										<th className="px-4 py-3 text-left font-semibold text-[#0b0b0f]">Platform</th>
										<th className="px-4 py-3 text-center font-semibold text-[#0b0b0f]">Best For</th>
										<th className="px-4 py-3 text-center font-semibold text-[#0b0b0f]">Execution</th>
										<th className="px-4 py-3 text-center font-semibold text-[#0b0b0f]">Min. Deposit</th>
									</tr>
								</thead>
								<tbody>
									{platforms.map((platform, idx) => (
										<tr key={platform.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]'}>
											<td className="px-4 py-3 font-semibold text-[#0b0b0f]">{platform.name}</td>
											<td className="px-4 py-3 text-center text-[#37353E]/80">{platform.bestFor[0]}</td>
											<td className="px-4 py-3 text-center text-[#37353E]/80">{platform.specifications.execution}</td>
											<td className="px-4 py-3 text-center text-[#37353E]/80">{platform.specifications.minimumDeposit}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}





