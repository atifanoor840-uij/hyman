'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const values = [
	{
		title: 'Transparency',
		description: 'Clear rules, honest communication, and no hidden fees. We believe in complete transparency in everything we do.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
			</svg>
		),
	},
	{
		title: 'Innovation',
		description: 'Cutting-edge technology and advanced trading tools to give you the edge in the markets.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
	},
	{
		title: 'Excellence',
		description: 'We strive for excellence in execution, support, and service delivery to help you succeed.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
			</svg>
		),
	},
	{
		title: 'Community',
		description: 'Building a strong community of traders who support and learn from each other.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
		),
	},
];

const stats = [
	{ label: 'Active Traders', value: '50,000+' },
	{ label: 'Countries Served', value: '150+' },
	{ label: 'Total Payouts', value: '$500M+' },
	{ label: 'Success Rate', value: '85%' },
];

const team = [
	{
		name: 'Alexandra Chen',
		role: 'CEO & Founder',
		description: '15+ years in fintech and trading. Former institutional trader.',
	},
	{
		name: 'Marcus Rodriguez',
		role: 'CTO',
		description: 'Expert in trading platform architecture and low-latency systems.',
	},
	{
		name: 'Sarah Johnson',
		role: 'Head of Trading',
		description: '20+ years experience in forex and derivatives markets.',
	},
	{
		name: 'David Kim',
		role: 'Head of Support',
		description: 'Dedicated to providing exceptional customer experience.',
	},
];

export default function AboutPage() {
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
					<div className="mx-auto max-w-4xl space-y-6 text-left mt-16 lg:mt-20">
						<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
							About FxGenz
						</h1>
						<p className="text-lg text-white/70 md:text-xl max-w-2xl">
							Empowering traders worldwide with institutional-grade funding and cutting-edge technology.
						</p>
					</div>
				</div>
				{/* Subtle divider curve */}
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			{/* Main content with white background */}
			<main className="bg-white">
				{/* Our Story */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="mx-auto max-w-3xl">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-6`}>
							Our Story
						</h2>
						<div className="space-y-4 text-[#37353E]/80 leading-relaxed">
							<p>
								FxGenz was founded in 2020 with a simple mission: to democratize access to institutional trading capital. 
								We recognized that talented traders often lacked the capital needed to scale their strategies, while traditional 
								funding programs were restrictive and opaque.
							</p>
							<p>
								Today, we've grown into a global platform serving over 50,000 traders across 150+ countries. We've processed 
								over $500 million in payouts and built a reputation for transparency, fairness, and innovation in the prop trading space.
							</p>
							<p>
								Our commitment to traders goes beyond funding. We provide comprehensive support, educational resources, and 
								cutting-edge technology to help you succeed. Whether you're a beginner or a seasoned professional, FxGenz 
								is here to support your trading journey.
							</p>
						</div>
					</div>
				</section>

				{/* Stats */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
							{stats.map((stat) => (
								<div key={stat.label} className="text-center">
									<div className={`${display.className} text-4xl font-bold text-[#0ea5e9] mb-2`}>
										{stat.value}
									</div>
									<div className="text-sm font-medium text-[#37353E]/80">{stat.label}</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Our Values */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
						Our Values
					</h2>
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{values.map((value) => (
							<div key={value.title} className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<div className="mb-4 text-[#0ea5e9]">{value.icon}</div>
								<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">{value.title}</h3>
								<p className="text-sm text-[#37353E]/80 leading-relaxed">{value.description}</p>
							</div>
						))}
					</div>
				</section>

				{/* Leadership Team */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
							Leadership Team
						</h2>
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
							{team.map((member) => (
								<div key={member.name} className="rounded-2xl border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
									<div className="mb-4 h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0891d1] flex items-center justify-center">
										<span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
									</div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">{member.name}</h3>
									<p className="text-sm text-[#0ea5e9] mb-3">{member.role}</p>
									<p className="text-xs text-[#37353E]/70">{member.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-12 text-center">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-4`}>
							Join the FxGenz Community
						</h2>
						<p className="text-[#37353E]/80 mb-8 max-w-2xl mx-auto">
							Start your trading journey with us today. Get funded, trade with confidence, and grow your capital.
						</p>
						<a
							href="/signup"
							className="inline-block rounded-full bg-[#0ea5e9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
						>
							Get Started
						</a>
					</div>
				</section>
			</main>
		</div>
	);
}





