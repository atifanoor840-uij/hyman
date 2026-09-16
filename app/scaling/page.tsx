'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_3 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

// Profit split ladder, per lib/rules-config.ts PROFIT_SPLIT. The split rises with
// each clean withdrawal and is fixed at 90/10 from the third onward.
const scalingTiers = [
	{
		level: '1st Withdrawal',
		accountSize: 'All account sizes',
		profitShare: '80%',
		stars: 3,
		requirements: [
			'14 days since your account was funded',
			'3 Profitable Days + 2 Trading Days completed',
			'Account in profit with zero rule violations',
		],
		benefits: ['80/20 split', 'Bi-weekly payout cycle', 'Account fee returned (except Instant)'],
	},
	{
		level: '2nd Withdrawal',
		accountSize: 'All account sizes',
		profitShare: '85%',
		stars: 4,
		requirements: [
			'First withdrawal completed with no rule violations',
			'A further 14-day payout cycle completed',
			'Account in profit with zero rule violations',
		],
		benefits: ['85/15 split', 'Bi-weekly payout cycle', 'Priority support'],
	},
	{
		level: '3rd Withdrawal and onward',
		accountSize: 'All account sizes',
		profitShare: '90%',
		stars: 5,
		requirements: [
			'Every earlier withdrawal completed with no rule violations',
			'A further 14-day payout cycle completed',
			'Account in profit with zero rule violations',
		],
		benefits: ['90/10 split, fixed for every future payout', 'Bi-weekly payout cycle', 'VIP support'],
	},
];

const StarRating = ({ stars }: { stars: number }) => {
	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<svg
					key={star}
					className={`h-5 w-5 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
			))}
		</div>
	);
};

const milestones = [
	{
		milestone: '1st Withdrawal',
		description: 'Wait 14 days from funding, complete 3 Profitable Days plus 2 Trading Days, and finish in profit with a clean rule record.',
		reward: '80% Profit Share',
	},
	{
		milestone: '2nd Withdrawal',
		description: 'Complete your first payout with no rule violations, then the next 14-day cycle.',
		reward: '85% Profit Share',
	},
	{
		milestone: '3rd Withdrawal and onward',
		description: 'Keep every payout clean and the split stays fixed at its maximum for every future withdrawal.',
		reward: '90% Profit Share',
	},
];

export default function ScalingPage() {
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
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]"></div>
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12 mt-16 lg:mt-20">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Scaling Program
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Earn up to 90% profit share as you scale. The more you succeed, the more you earn.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_3} alt="GenzProp scaling" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
				{/* Hero Section */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f5f3ff] to-white p-12 text-center">
						<div className="mb-6 flex justify-center">
							<StarRating stars={5} />
						</div>
						<h2 className={`${display.className} text-4xl font-semibold text-[#0b0b0f] mb-4`}>
							Earn Up to 90% Profit Share
						</h2>
						<p className="text-[#37353E]/80 mb-8 max-w-3xl mx-auto text-lg">
							Your profit split rises with every clean payout. Start at 80% on your first withdrawal and reach 90% 
							as you demonstrate excellence. The better you perform, the more you earn.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-6">
							<div className="text-center">
								<div className={`${display.className} text-3xl font-bold text-[#5235ff]`}>90%</div>
								<div className="text-sm text-[#37353E]/70">Maximum Profit Share</div>
							</div>
							<div className="h-12 w-px bg-[#e5e5e5]"></div>
							<div className="text-center">
								<div className={`${display.className} text-3xl font-bold text-[#5235ff]`}>3</div>
								<div className="text-sm text-[#37353E]/70">Withdrawals to Max Split</div>
							</div>
							<div className="h-12 w-px bg-[#e5e5e5]"></div>
							<div className="text-center">
								<div className={`${display.className} text-3xl font-bold text-[#5235ff]`}>14</div>
								<div className="text-sm text-[#37353E]/70">Day Payout Cycle</div>
							</div>
						</div>
					</div>
				</section>

				{/* Scaling Tiers */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
							Scaling Tiers
						</h2>
						<div className="space-y-6">
							{scalingTiers.map((tier, index) => (
								<div
									key={tier.level}
									className={`overflow-hidden rounded-2xl border-2 ${
										tier.stars === 5
											? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-lg'
											: 'border-[#e5e5e5] bg-white shadow-sm'
									}`}
								>
									<div className="grid gap-8 lg:grid-cols-12">
										{/* Left: Level Info */}
										<div className="lg:col-span-4 bg-gradient-to-br from-[#f5f3ff] to-white p-8">
											<div className="mb-4">
												<StarRating stars={tier.stars} />
											</div>
											<h3 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-2`}>
												{tier.level}
											</h3>
											<p className="text-sm text-[#37353E]/70 mb-4">{tier.accountSize}</p>
											<div className="rounded-full bg-[#5235ff] px-6 py-3 text-center">
												<div className={`${display.className} text-3xl font-bold text-white`}>
													{tier.profitShare}
												</div>
												<div className="text-xs text-white/90">Profit Share</div>
											</div>
										</div>

										{/* Right: Details */}
										<div className="lg:col-span-8 p-8">
											<div className="grid gap-8 md:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[#0b0b0f] mb-4 flex items-center gap-2">
														<svg className="h-5 w-5 text-[#5235ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														Requirements
													</h4>
													<ul className="space-y-2">
														{tier.requirements.map((req) => (
															<li key={req} className="flex items-start gap-2 text-sm text-[#37353E]/80">
																<span className="text-[#5235ff] mt-0.5">•</span>
																{req}
															</li>
														))}
													</ul>
												</div>
												<div>
													<h4 className="font-semibold text-[#0b0b0f] mb-4 flex items-center gap-2">
														<svg className="h-5 w-5 text-[#5235ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
														</svg>
														Benefits
													</h4>
													<ul className="space-y-2">
														{tier.benefits.map((benefit) => (
															<li key={benefit} className="flex items-start gap-2 text-sm text-[#37353E]/80">
																<span className="text-[#5235ff] mt-0.5">✓</span>
																{benefit}
															</li>
														))}
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Milestones */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
						Scaling Milestones
					</h2>
					<div className="relative">
						{/* Progress Line */}
						<div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#5235ff] via-[#5235ff] to-yellow-400 hidden md:block"></div>
						
						<div className="space-y-8">
							{milestones.map((milestone, index) => (
								<div key={milestone.milestone} className="relative flex gap-6">
									{/* Icon */}
									<div className="flex-shrink-0">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5235ff] to-[#452cff] text-white shadow-lg">
											{index === milestones.length - 1 ? (
												<StarRating stars={5} />
											) : (
												<span className="text-xl font-bold">{index + 1}</span>
											)}
										</div>
									</div>
									
									{/* Content */}
									<div className="flex-1 rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
										<div className="mb-2 flex items-center justify-between">
											<h3 className="text-xl font-semibold text-[#0b0b0f]">{milestone.milestone}</h3>
											<span className="rounded-full bg-[#f5f3ff] px-4 py-1 text-sm font-bold text-[#5235ff]">
												{milestone.reward}
											</span>
										</div>
										<p className="text-[#37353E]/80">{milestone.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How Scaling Works */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
							How Scaling Works
						</h2>
						<div className="grid gap-8 md:grid-cols-3">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
								<div className="mb-4 text-4xl">📊</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Track Performance</h3>
								<p className="text-sm text-[#37353E]/80">
									Your performance is automatically tracked with every payout. Consistency and profitability are key.
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
								<div className="mb-4 text-4xl">⬆️</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Scale Up</h3>
								<p className="text-sm text-[#37353E]/80">
									As you reach milestones, you automatically advance to higher levels with better profit shares.
								</p>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
								<div className="mb-4 text-4xl">💰</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Earn More</h3>
								<p className="text-sm text-[#37353E]/80">
									Higher levels mean higher profit shares. Earn up to 90% of your trading profits.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f5f3ff] to-white p-12 text-center">
						<div className="mb-6 flex justify-center">
							<StarRating stars={5} />
						</div>
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-4`}>
							Start Your Scaling Journey
						</h2>
						<p className="text-[#37353E]/80 mb-8 max-w-2xl mx-auto">
							Join thousands of traders who are scaling their accounts and earning up to 90% profit share.
						</p>
						<a
							href="/signup"
							className="inline-block rounded-full bg-[#5235ff] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
						>
							Get Started
						</a>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}





