'use client';

import Link from 'next/link';
import { Inter, Poppins } from 'next/font/google';
import { ArrowUpRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import SaleTimer from '../components/SaleTimer';
import SaleBanner from '../components/SaleBanner';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const carouselImages = [
	{ id: 1, label: 'Your trading workspace', description: 'Central view of open accounts and performance.' },
	{ id: 2, label: 'Risk overview', description: 'Drawdown, exposure and daily targets in one place.' },
	{ id: 3, label: 'Payout timeline', description: 'Upcoming and completed payouts by account.' },
];

const accounts = [
	{
		id: 'FX-001',
		platform: 'MetaTrader 4',
		challengeType: 'Challenge 100K',
		profitTarget: '10%',
		status: 'Active',
		server: 'FxGenz-Demo01',
		login: '12345678',
		password: '********',
	},
	{
		id: 'FX-002',
		platform: 'MetaTrader 5',
		challengeType: 'Challenge 50K',
		profitTarget: '8%',
		status: 'Evaluating',
		server: 'FxGenz-Demo02',
		login: '23456789',
		password: '********',
	},
];

const shopItems = [
	{
		name: 'Advanced Trading Course',
		price: '$299',
		originalPrice: '$499',
		discount: '40% OFF',
		accent: 'from-sky-500 to-cyan-500',
		description: 'Master advanced trading strategies',
		category: 'Education',
	},
	{
		name: 'Premium EA Package',
		price: '$199',
		originalPrice: '$349',
		discount: '43% OFF',
		accent: 'from-emerald-500 to-green-500',
		description: '5 Professional Expert Advisors',
		category: 'Tools',
	},
	{
		name: 'VIP Trading Signals',
		price: '$99/month',
		originalPrice: '$199/month',
		discount: '50% OFF',
		accent: 'from-purple-500 to-pink-500',
		description: 'Daily premium trading signals',
		category: 'Signals',
	},
	{
		name: 'Custom Indicator Pack',
		price: '$149',
		originalPrice: '$249',
		discount: '40% OFF',
		accent: 'from-amber-500 to-orange-500',
		description: '20+ Professional indicators',
		category: 'Tools',
	},
];

const downloads = [
	{ 
		name: 'MT4 Platform Setup Guide', 
		type: 'PDF', 
		size: '2.4 MB', 
		accent: 'from-sky-500 to-cyan-500',
		date: 'Dec 15, 2024',
	},
	{ 
		name: 'Trading Strategy Templates', 
		type: 'ZIP', 
		size: '5.8 MB', 
		accent: 'from-violet-500 to-fuchsia-500',
		date: 'Dec 10, 2024',
	},
	{ 
		name: 'Risk Management Calculator', 
		type: 'XLSX', 
		size: '1.2 MB', 
		accent: 'from-emerald-500 to-green-500',
		date: 'Dec 5, 2024',
	},
	{ 
		name: 'Market Analysis Report Q4', 
		type: 'PDF', 
		size: '3.1 MB', 
		accent: 'from-orange-500 to-amber-500',
		date: 'Nov 28, 2024',
	},
	{ 
		name: 'Platform Comparison Chart', 
		type: 'PDF', 
		size: '1.9 MB', 
		accent: 'from-blue-500 to-indigo-500',
		date: 'Nov 20, 2024',
	},
];

const quickActions = [
	{
		title: 'Open Trading Platform',
		description: 'Start trading on your preferred platform',
		href: '/platforms',
		accent: 'from-black to-neutral-700',
		badge: 'Launch',
	},
	{
		title: 'Request Payout',
		description: 'Withdraw your trading profits securely',
		href: '/pricing',
		accent: 'from-black to-neutral-700',
		badge: 'Finance',
	},
	{
		title: 'Get Support',
		description: '24/7 customer support available',
		href: '/support',
		accent: 'from-black to-neutral-700',
		badge: 'Care',
	},
];

export default function DashboardPage() {
	const [activeSlide, setActiveSlide] = useState(0);
	const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

	return (
		<main className={bodyFont.className}>
			{/* Sale Banner */}
			<SaleBanner />
			
			<div className="p-6 md:p-8 lg:p-12">
				{/* Sale Timer */}
				<div className="mb-8 flex justify-center">
					<SaleTimer />
				</div>

				{/* Header */}
				<div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="mb-3 inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white">
							<ShieldCheck className="h-3.5 w-3.5" />
							SECURE TRADER WORKSPACE
						</p>
						<h1 className={`${display.className} mb-3 text-3xl font-semibold text-[#0b0b0f] md:text-[2.25rem]`}>
							Overview
						</h1>
						<p className="max-w-xl text-sm font-medium text-[#111827]">
							Real-time view of your funded accounts, performance, and payouts in one place.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<button className="inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/40 transition hover:bg-[#020617]">
							Start new challenge
							<ArrowUpRight className="h-4 w-4" />
						</button>
						<button className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-white px-5 py-2.5 text-sm font-semibold text-[#0b0b0f] transition hover:border-[#0ea5e9] hover:text-[#0ea5e9]">
							Request payout
						</button>
					</div>
				</div>

				<div className="space-y-8">
					{/* Hero carousel */}
					<section
						className="relative overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-sm"
						style={{
							backgroundImage:
								"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
						}}
					>
						<div className="absolute inset-0 bg-black/40" />
						<div className="relative flex flex-col justify-between p-6 md:p-8 lg:p-10 min-h-[220px]">
							<div className="flex items-center justify-between">
								<h2 className={`${display.className} text-base font-semibold text-white`}>
									Workspace overview
								</h2>
							</div>
							<div className="mt-6 flex flex-wrap gap-3">
								<button className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black shadow-sm hover:bg-neutral-200">
									View accounts
								</button>
								<button className="rounded-full border border-white/70 bg-transparent px-5 py-2 text-xs font-semibold text-white hover:bg-white/10">
									Open trading tools
								</button>
							</div>
						</div>
					</section>

					{/* Account details */}
					<section className="rounded-3xl border border-[#e5e5e5] bg-white p-8 shadow-sm">
						<div className="mb-5 flex items-center justify-between">
							<h2 className={`${display.className} text-xl font-bold text-[#0b0b0f]`}>
								Accounts
							</h2>
							<Link
								href="/dashboard/trades"
								className="text-xs font-bold text-[#111827] underline-offset-2 hover:underline"
							>
								View trading activity
							</Link>
						</div>
						<div className="space-y-5 text-xs text-[#4b5563]">
							{accounts.map((account) => {
								const isExpanded = expandedAccount === account.id;
								return (
									<div
										key={account.id}
										className="rounded-2xl border border-[#e5e5e5] bg-[#f9fafb] p-6 transition-colors"
									>
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div className="space-y-1">
												<p className="text-[14px] font-bold text-[#111827]">
													Account ID: {account.id}
												</p>
												<div className="flex flex-wrap gap-x-4 gap-y-1">
													<span className="font-bold">Platform: {account.platform}</span>
													<span className="font-bold">Challenge: {account.challengeType}</span>
													<span className="font-bold">Profit target: {account.profitTarget}</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="rounded-full border border-[#e5e5e5] px-3 py-1 text-[11px] font-bold text-[#111827]">
													{account.status}
												</span>
												<button
													onClick={() =>
														setExpandedAccount(isExpanded ? null : account.id)
													}
													className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[11px] font-bold text-[#111827] hover:bg-[#e5e5e5]"
												>
													{isExpanded ? 'Hide credentials' : 'Show credentials'}
													{isExpanded ? (
														<ChevronUp className="h-3 w-3" />
													) : (
														<ChevronDown className="h-3 w-3" />
													)}
												</button>
											</div>
										</div>
										{isExpanded && (
											<div className="mt-3 grid gap-3 border-t border-dashed border-[#e5e5e5] pt-3 text-[11px] md:grid-cols-3">
												<div>
													<p className="font-bold text-[#111827]">Server</p>
													<p className="font-semibold">{account.server}</p>
												</div>
												<div>
													<p className="font-bold text-[#111827]">Login</p>
													<p className="font-semibold">{account.login}</p>
												</div>
												<div>
													<p className="font-bold text-[#111827]">Password</p>
													<p className="font-semibold">{account.password}</p>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</section>

					{/* Quick Actions */}
					<div className="grid gap-6 md:grid-cols-3">
						{quickActions.map((action, index) => (
							<Link
								key={action.title}
								href={action.href}
								className="group relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#0ea5e9] hover:shadow-xl hover:shadow-[#0ea5e9]/10"
							>
								<div className="mb-4 flex items-center justify-between">
									<div
										className={`inline-flex rounded-full bg-gradient-to-br ${action.accent} px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white`}
									>
										{action.badge}
									</div>
									<span className="text-xs font-semibold text-[#37353E]/50">STEP {index + 1}</span>
								</div>
								<h3 className="mb-2 font-semibold text-[#0b0b0f]">{action.title}</h3>
								<p className="text-sm text-[#37353E]/70">{action.description}</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}


