'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter, Syne } from 'next/font/google';
import {
	Home,
	Store,
	Sparkles,
	Trophy,
	TrendingUp,
	Shield,
	CreditCard,
	BarChart3,
	Map,
	Tag,
	Calendar,
	ChartLine,
	FolderDown,
	Menu,
	X,
	Bell,
	UserRound,
	ChevronDown,
	ChevronUp,
} from 'lucide-react';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });

const sidebarItems = [
	{ href: '/dashboard', label: 'Overview', icon: Home },
	{ href: '/dashboard/shop', label: 'Shop', icon: Store },
	{ href: '/dashboard/rewards', label: 'Reward Studio', icon: Sparkles },
	{ href: '/dashboard/achievements', label: 'Achievements', icon: Trophy },
	{ href: '/dashboard/trades', label: 'Trades', icon: TrendingUp },
	{ href: '/dashboard/kyc', label: 'KYC', icon: Shield },
	{ href: '/dashboard/withdraw', label: 'Withdraw', icon: CreditCard },
	{
		label: 'Trading',
		icon: BarChart3,
		children: [
			{ href: '/dashboard/heatmap', label: 'Heat Map' },
			{ href: '/dashboard/symbols', label: 'Symbol' },
			{ href: '/dashboard/calendar', label: 'Economical Calendar' },
			{ href: '/dashboard/live-graph', label: 'Live Graph' },
		],
	},
	{ href: '/dashboard/downloads', label: 'Downloads', icon: FolderDown },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const pathname = usePathname();

	const tradingChildren = [
		{ href: '/dashboard/heatmap', label: 'Heat Map' },
		{ href: '/dashboard/symbols', label: 'Symbol' },
		{ href: '/dashboard/calendar', label: 'Economical Calendar' },
		{ href: '/dashboard/live-graph', label: 'Live Graph' },
	];

	const [tradingOpen, setTradingOpen] = useState(() =>
		tradingChildren.some((child) => pathname.startsWith(child.href)),
	);

	return (
		<div className={`min-h-screen bg-[#f5f5f5] ${bodyFont.className} flex`}>
			{/* Sidebar */}
			<aside
				className={`${
					sidebarOpen ? 'w-72' : 'w-24'
				} fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-black/10 bg-[#050505] transition-all duration-300`}
			>
				{/* Logo */}
				<div className="flex items-center justify-between border-b border-white/10 p-6">
					{sidebarOpen && (
						<Link href="/" className={`${brandFont.className} flex items-center gap-2 text-white`}>
							<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-black shadow-lg shadow-black/30">
								FX
							</span>
							<span className="text-lg font-semibold tracking-tight">FxGenz</span>
						</Link>
					)}
					{!sidebarOpen && (
						<Link
							href="/"
							className={`${brandFont.className} flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-black shadow-lg shadow-black/30`}
						>
							FX
						</Link>
					)}
					<button
						onClick={() => setSidebarOpen((prev) => !prev)}
						className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
					>
						{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sidebar-scroll">
					{sidebarItems.map((item) => {
						const Icon = item.icon;

						// Trading group with sub buttons
						if ((item as any).children) {
							const children = (item as any).children as { href: string; label: string }[];
							const isAnyChildActive = children.some((child) => pathname.startsWith(child.href));

							return (
								<div key={item.label} className="space-y-1">
									<button
										type="button"
										onClick={() => setTradingOpen((prev) => !prev)}
										className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-[14px] transition-all duration-200 ${
											isAnyChildActive ? 'bg-white text-black shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
										}`}
									>
										<span
											className={`flex h-11 w-11 items-center justify-center rounded-full border text-[0.75rem] font-semibold tracking-wide ${
												isAnyChildActive ? 'bg-white text-black' : 'bg-white/5 text-white/80'
											} ${!sidebarOpen ? 'mx-auto' : ''}`}
										>
											<Icon className="h-6 w-6" />
										</span>
										{sidebarOpen && (
											<>
												<span className="flex-1 text-left font-semibold text-[15px]">{item.label}</span>
												<span className="text-sm">
													{tradingOpen ? (
														<ChevronUp className="h-4 w-4" />
													) : (
														<ChevronDown className="h-4 w-4" />
													)}
												</span>
											</>
										)}
									</button>

									{/* Sub buttons */}
									{sidebarOpen && tradingOpen && (
										<div className="space-y-2 pl-5">
											{children.map((child) => {
												const isChildActive = pathname.startsWith(child.href);
												// Use different icons for sub-items
												const subIcons: Record<string, any> = {
													'/dashboard/heatmap': Map,
													'/dashboard/symbols': Tag,
													'/dashboard/calendar': Calendar,
													'/dashboard/live-graph': ChartLine,
												};
												const SubIcon = subIcons[child.href] || BarChart3;
												return (
													<Link
														key={child.href}
														href={child.href}
														className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-[13px] transition-all duration-200 ${
															isChildActive
																? 'bg-white text-black shadow-sm'
																: 'text-white/70 hover:bg-white/10 hover:text-white'
														}`}
													>
														<span
															className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.7rem] font-semibold tracking-wide ${
																isChildActive
																	? 'bg-white text-black'
																	: 'bg-white/5 text-white/70'
															}`}
														>
															<SubIcon className="h-4 w-4" />
														</span>
														<span className="font-medium text-[14px]">{child.label}</span>
													</Link>
												);
											})}
										</div>
									)}
								</div>
							);
						}

						// Regular single sidebar button
						if (!item.href) return null;
						
						const isActive =
							item.href === '/dashboard'
								? pathname === item.href
								: pathname.startsWith(item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-[14px] transition-all duration-200 ${
									isActive
										? 'bg-white text-black shadow-sm'
										: 'text-white/70 hover:bg-white/10 hover:text-white'
								}`}
							>
								<span
									className={`flex h-11 w-11 items-center justify-center rounded-full border text-[0.75rem] font-semibold tracking-wide ${
										isActive ? 'bg-white text-black' : 'bg-white/5 text-white/70'
									} ${!sidebarOpen ? 'mx-auto' : ''}`}
								>
									<Icon className="h-6 w-6" />
								</span>
								{sidebarOpen && <span className="font-medium text-[15px]">{item.label}</span>}
							</Link>
						);
					})}
				</nav>

				{/* User Profile */}
				<div className="border-t border-white/10 p-4">
					<div
						className={`flex items-center gap-3 rounded-xl bg-white/5 p-3 ${
							!sidebarOpen && 'justify-center'
						}`}
					>
						<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-black">
							<span className="text-sm font-bold text-white">JD</span>
						</div>
						{sidebarOpen && (
							<div className="min-w-0 flex-1">
								<div className="truncate text-sm font-semibold text-white">John Doe</div>
								<div className="truncate text-xs text-white/60">Level 3 Trader</div>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-24'}`}>
				<header className="sticky top-0 z-40 border-b border-black/20 bg-[#050505]/95 backdrop-blur-sm">
					<div className="flex items-center justify-between px-6 py-3 md:px-10">
						<div className="flex flex-col">
							<span className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
								Dashboard
							</span>
							<span className="text-sm font-semibold text-neutral-50">
								Professional trading workspace
							</span>
						</div>
						<div className="flex items-center gap-3">
							<button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-[#111111] text-neutral-100 hover:bg-black">
								<Bell className="h-4 w-4" />
								<span className="absolute -right-0.5 -top-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-white text-[8px] font-semibold text-black">
									1
								</span>
							</button>
							<button className="hidden items-center gap-2 rounded-full border border-neutral-700 bg-[#111111] px-3 py-1.5 text-xs font-semibold text-neutral-50 hover:bg-black md:flex">
								<UserRound className="h-4 w-4" />
								<span>Profile</span>
							</button>
							<button className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm hover:bg-neutral-200">
								Buy account
							</button>
						</div>
					</div>
				</header>
				<div>{children}</div>
			</div>
		</div>
	);
}


