'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const steps = [
	{
		step: '1',
		title: 'Buy Challenge',
		description: 'Choose your account size and pay the evaluation fee. Get instant access to your trading account within seconds.',
		cta: 'View Pricing',
		href: '/pricing',
	},
	{
		step: '2',
		title: 'Show Your Skill',
		description: 'Trade on simulated accounts and meet profit targets while following our rules. Prove your trading discipline and risk management.',
		cta: 'View Rules',
		href: '/rules',
	},
	{
		step: '3',
		title: 'Apply for Payout',
		description: 'Pass your evaluation and receive funded account credentials. Request payouts when you hit profit targets — most processed within 24–48 hours.',
		cta: 'Get Started',
		href: '/signup',
	},
];

export default function ResourcesPage() {
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
								How It Works
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Buy a challenge, show your skill, and apply for payout. Simple, transparent, and built for traders.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_2} alt="GenzProp resources" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
					{/* How It Works - 3 Steps */}
					<section className="mb-16">
						<div className="grid gap-8 md:grid-cols-3">
							{steps.map((item, index) => (
								<div
									key={item.step}
									className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition-all hover:border-[#0ea5e9]/30 hover:shadow-lg"
								>
									<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-lg font-bold text-[#0284c7]">
										{item.step}
									</div>
									<h3 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-3`}>
										{item.title}
									</h3>
									<p className="mb-6 text-[#64748b] leading-relaxed">
										{item.description}
									</p>
									<a
										href={item.href}
										className="inline-flex items-center gap-2 rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0284c7]"
									>
										{item.cta}
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</a>
								</div>
							))}
						</div>
					</section>

					{/* CTA */}
					<div className="rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#f0f9ff] to-white p-10 text-center">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-4`}>
							Ready to Get Funded?
						</h2>
						<p className="text-[#64748b] mb-6 max-w-2xl mx-auto">
							Buy a challenge, prove your skill, and start earning payouts. Simple, transparent, and built for serious traders.
						</p>
						<a
							href="/signup"
							className="inline-block rounded-full bg-[#0ea5e9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0284c7]"
						>
							Start Your Challenge
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}





