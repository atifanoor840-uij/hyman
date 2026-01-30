'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Syne } from "next/font/google";

type NavbarVariant = "sticky" | "hero";

const brandFont = Syne({ subsets: ["latin"], weight: ["700", "800"] });

export default function Navbar({ variant = "sticky" }: { variant?: NavbarVariant }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const base =
		variant === "hero"
			? `absolute top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl shadow-lg border-b border-white/5' : 'bg-transparent'}`
			: "sticky top-0 z-50 w-full border-b border-white/5 bg-black/90 backdrop-blur-xl shadow-lg";

	return (
		<header className={base}>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10 lg:py-5">
				{/* Logo */}
				<div className="flex items-center gap-4">
					<Link href="/" className="group flex items-center gap-3 transition-all duration-300 hover:opacity-90">
						<div className="relative flex items-center">
							{/* Image logo - made larger */}
							<img
								src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
								alt="Brand"
								className="w-14 h-14 md:w-16 md:h-16 object-contain mr-2 drop-shadow-lg"
								style={{ minWidth: '3.5rem', minHeight: '3.5rem' }}
							/>
							{/* Text logo - made smaller */}
							<span className={`${brandFont.className} relative flex items-center text-white`}>
								<span className="text-lg font-extrabold tracking-tight md:text-xl">
									<span className="bg-gradient-to-r from-white via-white to-white/95 bg-clip-text text-transparent">Fx</span>
								</span>
								<span className="ml-2 text-base font-bold tracking-tight text-white md:text-lg">Genz</span>
							</span>
							<div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
						</div>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-1 lg:flex lg:mx-auto">
					<Link 
						href="/" 
						className="relative px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group"
					>
						<span className="relative z-10">Home</span>
						<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
					</Link>
					<Link 
						href="/blog" 
						className="relative px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group"
					>
						<span className="relative z-10">News</span>
						<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
					</Link>
					
					{/* Trading Dropdown */}
					<div 
						className="relative"
						onMouseEnter={() => setDropdownOpen('trading')}
						onMouseLeave={() => setDropdownOpen(null)}
					>
						<button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group">
							<span>Trading</span>
							<svg className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen === 'trading' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
							<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
						</button>
						{dropdownOpen === 'trading' && (
							<div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
								<Link href="/platforms" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									<span>Platforms</span>
								</Link>
								<Link href="/rules" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>Trading Rules</span>
								</Link>
								<Link href="/scaling" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
									<span>Scaling Program</span>
								</Link>
								<Link href="/pricing" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>Pricing</span>
								</Link>
							</div>
						)}
					</div>
                    
					{/* Resources Dropdown */}
					<div 
						className="relative"
						onMouseEnter={() => setDropdownOpen('resources')}
						onMouseLeave={() => setDropdownOpen(null)}
					>
						<button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group">
							<span>Resources</span>
							<svg className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen === 'resources' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
							<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
						</button>
						{dropdownOpen === 'resources' && (
							<div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
								<Link href="/resources" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
									<span>Education</span>
								</Link>
								<Link href="/blog" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
									</svg>
									<span>Blog & News</span>
								</Link>
								<Link href="/faq" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>FAQ</span>
								</Link>
								<Link href="/support" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
									<span>Support</span>
								</Link>
							</div>
						)}
					</div>

					{/* Company Dropdown */}
					<div 
						className="relative"
						onMouseEnter={() => setDropdownOpen('company')}
						onMouseLeave={() => setDropdownOpen(null)}
					>
						<button className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group">
							<span>Company</span>
							<svg className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen === 'company' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
							<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
						</button>
						{dropdownOpen === 'company' && (
							<div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
								<Link href="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>About Us</span>
								</Link>
								<Link href="/partner" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<span>Become a Partner</span>
								</Link>
								<Link href="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									<span>Contact Us</span>
								</Link>
								<Link href="/social" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all duration-150 group">
									<svg className="h-4 w-4 text-[#00ff88] group-hover:text-[#00ff88] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									<span>Social Media</span>
								</Link>
							</div>
						)}
					</div>

					<Link 
						href="/terms" 
						className="relative px-5 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:text-white rounded-lg group"
					>
						<span className="relative z-10">Legal</span>
						<span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
					</Link>
				</nav>

				{/* Desktop CTA Buttons */}
				<div className="hidden items-center gap-3 lg:flex">
					<Link 
						href="/login" 
						className="relative px-5 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:text-white rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5"
					>
						Sign in
					</Link>
					<Link 
						href="/signup" 
						className="relative px-6 py-2.5 text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all duration-200 rounded-full shadow-lg hover:shadow-xl"
					>
						Get funded
					</Link>
				</div>

				{/* Mobile Menu Button */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
					aria-label="Toggle menu"
				>
					{!mobileMenuOpen ? (
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					) : (
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					)}
				</button>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
					<nav className="mx-auto max-w-7xl px-6 py-4 space-y-1">
						<Link 
							href="/" 
							className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link 
							href="/blog" 
							className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							News
						</Link>
						
						<div className="space-y-1">
							<div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Trading</div>
							<Link 
								href="/platforms" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Platforms
							</Link>
							<Link 
								href="/rules" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Trading Rules
							</Link>
							<Link 
								href="/scaling" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Scaling Program
							</Link>
							<Link 
								href="/pricing" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Pricing
							</Link>
						</div>

						<div className="space-y-1">
							<div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Resources</div>
							<Link 
								href="/resources" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Education
							</Link>
							<Link 
								href="/blog" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Blog & News
							</Link>
							<Link 
								href="/faq" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								FAQ
							</Link>
							<Link 
								href="/support" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Support
							</Link>
						</div>

						<div className="space-y-1">
							<div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Company</div>
							<Link 
								href="/about" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								About Us
							</Link>
							<Link 
								href="/partner" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Become a Partner
							</Link>
							<Link 
								href="/contact" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Contact Us
							</Link>
							<Link 
								href="/social" 
								className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ml-4"
								onClick={() => setMobileMenuOpen(false)}
							>
								Social Media
							</Link>
						</div>

						<Link 
							href="/terms" 
							className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Legal
						</Link>

						<div className="pt-4 space-y-2 border-t border-white/10 mt-4">
							<Link 
								href="/login" 
								className="block w-full px-4 py-2.5 text-sm font-semibold text-center text-white/90 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
								onClick={() => setMobileMenuOpen(false)}
							>
								Sign in
							</Link>
							<Link 
								href="/signup" 
								className="block w-full px-4 py-2.5 text-sm font-semibold text-center text-[#0b0b0f] bg-white hover:bg-white/90 rounded-full transition-colors"
								onClick={() => setMobileMenuOpen(false)}
							>
								Get funded
							</Link>
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}

