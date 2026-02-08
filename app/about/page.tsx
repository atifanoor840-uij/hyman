'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Link from 'next/link';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function AboutPage() {
	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Header Section with background */}
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
							About Us
						</h1>
						<p className="text-lg text-white/80 md:text-xl max-w-3xl leading-relaxed">
							FXGENZ is built for traders who want real capital without nonsense. We fund disciplined traders with clear rules, fast payouts, and scalable accounts—no gimmicks, no fake challenges, no hidden traps.
						</p>
						<p className="text-lg text-white/70 md:text-xl max-w-3xl leading-relaxed">
							If you can trade responsibly, manage risk, and stay consistent, FXGENZ gives you the capital and lets you work.
						</p>
					</div>
				</div>
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			<main className="bg-white">
				{/* Tagline */}
				<section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
					<p className={`${display.className} text-2xl md:text-3xl font-semibold text-[#0b0b0f] text-center max-w-4xl mx-auto leading-snug`}>
						Trade real funds. Keep most of the profits. Scale without limits.
					</p>
				</section>

				{/* Founder's Message */}
				<section className="bg-[#f9f9f9] py-16 md:py-24">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<div className="mx-auto max-w-3xl">
							<div className="flex items-center gap-3 mb-6">
								<span className="text-2xl" aria-hidden>👤</span>
								<h2 className={`${display.className} text-2xl md:text-3xl font-semibold text-[#0b0b0f]`}>
									Founder&apos;s Message
								</h2>
							</div>
							<div className="space-y-4 text-[#37353E]/90 leading-relaxed">
								<p>
									At FXGENZ, we created the firm we wished existed when we were traders ourselves.
								</p>
								<p>
									Too many prop firms complicate trading with unclear rules, sudden restrictions, and payout uncertainty. FXGENZ was built differently—clear risk limits, transparent conditions, and a trader-first structure.
								</p>
								<p>
									Our focus is long-term sustainability. We don&apos;t reward gambling. We reward discipline, consistency, and professional risk management.
								</p>
								<p>
									If you respect capital and trade with intent, FXGENZ is designed to grow with you.
								</p>
								<p className="italic text-[#0b0b0f] pt-2">
									— Founder, FXGENZ
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Why FXGENZ? */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="mx-auto max-w-3xl">
						<div className="flex items-center gap-3 mb-8">
							<span className="text-2xl" aria-hidden>⚡</span>
							<h2 className={`${display.className} text-2xl md:text-3xl font-semibold text-[#0b0b0f]`}>
								Why FXGENZ?
							</h2>
						</div>
						<div className="space-y-4 text-[#37353E]/90 leading-relaxed">
							<p>
								FXGENZ is designed to remove the unnecessary barriers that exist at traditional prop firms.
							</p>
							<p>
								While most firms rely on complex multi-phase challenges, FXGENZ offers instant funding, allowing qualified traders to access capital immediately without artificial obstacles.
							</p>
							<p>
								Unlike firms with vague or shifting risk rules, FXGENZ operates with fully transparent risk parameters.
							</p>
							<p>
								All drawdown limits, lot size rules, and trading conditions are clearly defined from day one. There are no hidden restrictions, no surprise violations, and no retroactive rule changes.
							</p>
						</div>
					</div>
				</section>

				{/* Built for Professionals + CTA */}
				<section className="bg-[#f9f9f9] py-16 md:py-24">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<div className="mx-auto max-w-3xl text-center space-y-6">
							<h2 className={`${display.className} text-2xl md:text-3xl font-semibold text-[#0b0b0f]`}>
								Built for Professionals
							</h2>
							<p className="text-[#37353E]/90 leading-relaxed">
								FXGENZ focuses on real trading behavior, not artificial obstacles.
								<br />
								If you trade clean, manage risk, and stay consistent, we fund you—and we pay you.
							</p>
							<p className={`${display.className} text-xl md:text-2xl font-semibold text-[#0b0b0f] pt-4`}>
								Stop proving yourself. Start trading with capital that respects your skill.
							</p>
							<div className="pt-6">
								<Link
									href="/signup"
									className="inline-block rounded-full bg-[#0ea5e9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
								>
									Get Started
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
