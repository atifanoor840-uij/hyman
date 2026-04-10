'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function AboutPage() {
	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Navbar fixed at top */}
			<Navbar variant="hero" />

			{/* Header Section with background — pt offsets fixed navbar */}
			<section className="relative overflow-hidden bg-[#050406] pt-[7.5rem] md:pt-32">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />

				<div className="relative mx-auto max-w-7xl px-6 py-10 md:px-10 lg:py-14">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
						<div className="max-w-4xl space-y-4 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								About GenzProp — Prop Firm Trading Evaluations
							</h1>
							<p className="text-lg text-white/80 md:text-xl max-w-2xl leading-relaxed">
								Trader development programs and skills assessments. Clear rules, transparent conditions.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img
								src={HEADER_IMAGE_2}
								alt="GenzProp — trading evaluations"
								className="w-full h-auto rounded-xl object-contain shadow-2xl"
							/>
						</div>
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
						Trader development programs. Skills assessments on simulated accounts. Verifiable results — educational purposes only.
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
									At GenzProp, we created the evaluation program we wished existed when we were traders ourselves.
								</p>
								<p>
									Too many prop firms complicate trading with unclear rules and payout uncertainty. GenzProp was built differently—clear risk limits, transparent conditions, and a trader-first structure for our skill-based programs.
								</p>
								<p>
									Our focus is long-term sustainability. We don&apos;t reward gambling. We reward discipline, consistency, and professional risk management in our trading evaluations.
								</p>
								<p>
									If you respect capital and trade with intent, GenzProp is designed to grow with you.
								</p>
								<p className="italic text-[#0b0b0f] pt-2">
									— Founder, GenzProp
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Why GenzProp? */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="mx-auto max-w-3xl">
						<div className="flex items-center gap-3 mb-8">
							<span className="text-2xl" aria-hidden>⚡</span>
							<h2 className={`${display.className} text-2xl md:text-3xl font-semibold text-[#0b0b0f]`}>
								Why GenzProp?
							</h2>
						</div>
						<div className="space-y-4 text-[#37353E]/90 leading-relaxed">
							<p>
								GenzProp is designed to remove unnecessary barriers in trading evaluations.
							</p>
							<p>
								Our skill-based programs offer flexible evaluation paths, allowing qualified traders to progress through simulated account challenges with clear objectives.
							</p>
							<p>
								Unlike firms with vague or shifting risk rules, GenzProp operates with fully transparent evaluation parameters.
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
								GenzProp focuses on trading discipline and skill development, not artificial obstacles.
								<br />
								Complete our skills assessment to demonstrate readiness. Program terms and eligibility are disclosed in full — no profit guarantees.
							</p>
							<p className={`${display.className} text-xl md:text-2xl font-semibold text-[#0b0b0f] pt-4`}>
								Start your trader development program today.
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
			<Footer />
		</div>
	);
}
