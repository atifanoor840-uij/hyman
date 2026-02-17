'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const resources = [
	{
		title: 'Trading Basics Course',
		description: 'Learn the fundamentals of trading, from market basics to order types and risk management.',
		type: 'Course',
		duration: '4 hours',
		level: 'Beginner',
		icon: '📚',
	},
	{
		title: 'Advanced Chart Analysis',
		description: 'Master technical analysis with advanced chart patterns, indicators, and trading strategies.',
		type: 'Course',
		duration: '6 hours',
		level: 'Advanced',
		icon: '📊',
	},
	{
		title: 'Risk Management Guide',
		description: 'Comprehensive guide to managing risk, position sizing, and protecting your capital.',
		type: 'Guide',
		duration: '2 hours',
		level: 'Intermediate',
		icon: '🛡️',
	},
	{
		title: 'MT4 Platform Tutorial',
		description: 'Step-by-step tutorial on using MetaTrader 4, from installation to advanced features.',
		type: 'Tutorial',
		duration: '3 hours',
		level: 'Beginner',
		icon: '💻',
	},
	{
		title: 'Psychology of Trading',
		description: 'Understand the psychological aspects of trading and learn to control emotions.',
		type: 'Course',
		duration: '5 hours',
		level: 'Intermediate',
		icon: '🧠',
	},
	{
		title: 'Algorithmic Trading Basics',
		description: 'Introduction to algorithmic trading, Expert Advisors, and automated strategies.',
		type: 'Course',
		duration: '8 hours',
		level: 'Advanced',
		icon: '🤖',
	},
	{
		title: 'Market Analysis Weekly',
		description: 'Weekly market analysis reports covering major currency pairs and market trends.',
		type: 'Report',
		duration: 'Weekly',
		level: 'All Levels',
		icon: '📈',
	},
	{
		title: 'Trading Strategies Library',
		description: 'Collection of proven trading strategies with detailed explanations and examples.',
		type: 'Library',
		duration: 'Ongoing',
		level: 'All Levels',
		icon: '📖',
	},
];

const webinars = [
	{
		title: 'Trading Evaluation Workshop',
		date: 'December 20, 2024',
		time: '2:00 PM GMT',
		host: 'Sarah Johnson',
		topic: 'Market analysis and evaluation strategies',
	},
	{
		title: 'Risk Management Workshop',
		date: 'December 22, 2024',
		time: '3:00 PM GMT',
		host: 'Marcus Rodriguez',
		topic: 'Protecting your capital in volatile markets',
	},
	{
		title: 'Platform Deep Dive: MT5',
		date: 'December 25, 2024',
		time: '1:00 PM GMT',
		host: 'David Kim',
		topic: 'Advanced features and trading tools',
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
								Trading Resources & Education
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Enhance your trading skills with our comprehensive educational resources, courses, and webinars.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_2} alt="Fx Genz resources" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
					{/* Resources Grid */}
					<section className="mb-16">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-8`}>
							Educational Resources
						</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{resources.map((resource) => (
								<div
									key={resource.title}
									className="group overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#0ea5e9] hover:shadow-lg"
								>
									<div className="mb-4 text-4xl">{resource.icon}</div>
									<div className="mb-2 flex items-center gap-2">
										<span className="rounded-full bg-[#f0f9ff] px-2 py-1 text-xs font-semibold text-[#0ea5e9]">
											{resource.type}
										</span>
										<span className="rounded-full bg-[#f9f9f9] px-2 py-1 text-xs font-medium text-[#37353E]/70">
											{resource.level}
										</span>
									</div>
									<h3 className="font-semibold text-[#0b0b0f] mb-2 group-hover:text-[#0ea5e9] transition-colors">
										{resource.title}
									</h3>
									<p className="mb-4 text-sm text-[#37353E]/80 leading-relaxed">{resource.description}</p>
									<div className="flex items-center justify-between">
										<span className="text-xs text-[#37353E]/60">⏱️ {resource.duration}</span>
										<a
											href="#"
											className="text-xs font-semibold text-[#0ea5e9] hover:underline"
										>
											View →
										</a>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Upcoming Webinars */}
					<section className="mb-16">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-8`}>
							Upcoming Webinars
						</h2>
						<div className="grid gap-6 md:grid-cols-3">
							{webinars.map((webinar) => (
								<div
									key={webinar.title}
									className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm"
								>
									<div className="mb-4 flex items-center gap-3">
										<div className="flex-shrink-0 rounded-full bg-[#f0f9ff] p-3">
											<svg className="h-6 w-6 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<p className="text-xs font-medium text-[#37353E]/60">{webinar.date}</p>
											<p className="text-xs text-[#37353E]/60">{webinar.time}</p>
										</div>
									</div>
									<h3 className="font-semibold text-[#0b0b0f] mb-2">{webinar.title}</h3>
									<p className="mb-4 text-sm text-[#37353E]/80">{webinar.topic}</p>
									<div className="flex items-center justify-between">
										<span className="text-xs text-[#37353E]/60">Host: {webinar.host}</span>
										<button className="rounded-full bg-[#0ea5e9] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0891d1]">
											Register
										</button>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Learning Paths */}
					<section className="mb-16">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-8`}>
							Learning Paths
						</h2>
						<div className="grid gap-6 md:grid-cols-3">
							<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8">
								<div className="mb-4 text-4xl">🌱</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Beginner Path</h3>
								<p className="mb-4 text-sm text-[#37353E]/80">
									Start your trading journey with fundamentals, basic strategies, and platform basics.
								</p>
								<ul className="mb-6 space-y-2 text-sm text-[#37353E]/70">
									<li>✓ Trading Basics Course</li>
									<li>✓ MT4 Platform Tutorial</li>
									<li>✓ Risk Management Guide</li>
								</ul>
								<a
									href="#"
									className="inline-block rounded-full bg-[#0ea5e9] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
								>
									Start Learning
								</a>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8">
								<div className="mb-4 text-4xl">📈</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Intermediate Path</h3>
								<p className="mb-4 text-sm text-[#37353E]/80">
									Advance your skills with technical analysis, strategy development, and psychology.
								</p>
								<ul className="mb-6 space-y-2 text-sm text-[#37353E]/70">
									<li>✓ Advanced Chart Analysis</li>
									<li>✓ Psychology of Trading</li>
									<li>✓ Trading Strategies Library</li>
								</ul>
								<a
									href="#"
									className="inline-block rounded-full bg-[#0ea5e9] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
								>
									Start Learning
								</a>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8">
								<div className="mb-4 text-4xl">🚀</div>
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Advanced Path</h3>
								<p className="mb-4 text-sm text-[#37353E]/80">
									Master advanced techniques, algorithmic trading, and professional strategies.
								</p>
								<ul className="mb-6 space-y-2 text-sm text-[#37353E]/70">
									<li>✓ Algorithmic Trading Basics</li>
									<li>✓ Advanced Chart Analysis</li>
									<li>✓ Market Analysis Weekly</li>
								</ul>
								<a
									href="#"
									className="inline-block rounded-full bg-[#0ea5e9] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
								>
									Start Learning
								</a>
							</div>
						</div>
					</section>

					{/* CTA */}
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8 text-center">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-4`}>
							Ready to Start Learning?
						</h2>
						<p className="text-[#37353E]/80 mb-6 max-w-2xl mx-auto">
							Access all our educational resources and start improving your trading skills today.
						</p>
						<a
							href="/signup"
							className="inline-block rounded-full bg-[#0ea5e9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
						>
							Get Started
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}





