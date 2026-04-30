'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_1 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const socialLinks = [
	{
		name: 'Twitter',
		handle: '@GenzProp',
		url: 'https://twitter.com/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
			</svg>
		),
		description: 'Follow us for market updates, trading tips, and community highlights.',
		followers: '50K+',
	},
	{
		name: 'LinkedIn',
		handle: 'GenzProp',
		url: 'https://linkedin.com/company/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
			</svg>
		),
		description: 'Connect with us for professional networking and industry insights.',
		followers: '25K+',
	},
	{
		name: 'Instagram',
		handle: '@GenzProp',
		url: 'https://instagram.com/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
			</svg>
		),
		description: 'See behind-the-scenes content, trading setups, and community stories.',
		followers: '75K+',
	},
	{
		name: 'YouTube',
		handle: 'GenzProp',
		url: 'https://youtube.com/@GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
			</svg>
		),
		description: 'Watch tutorials, market analysis, and educational trading content.',
		followers: '100K+',
	},
	{
		name: 'Telegram',
		handle: '@GenzProp',
		url: 'https://t.me/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
			</svg>
		),
		description: 'Join our community for real-time market signals and discussions.',
		followers: '30K+',
	},
	{
		name: 'Discord',
		handle: 'GenzProp Community',
		url: 'https://discord.gg/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.018 1.99 7.765 1.99 9.539c0 5.163 3.26 9.675 7.619 10.948a.07.07 0 0 0 .051 0c.592-.19 1.14-.44 1.644-.75a.076.076 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .081-.01c3.928-1.793 6.833-4.38 6.833-7.348 0-1.774-.46-3.52-1.648-5.142a.066.066 0 0 0-.031-.03zM8.02 15.33a1.125 1.125 0 0 1-1.06-1.2 1.125 1.125 0 1 1 2.25 0c0 .663-.525 1.2-1.19 1.2zm7.974 0a1.125 1.125 0 0 1-1.19-1.2 1.125 1.125 0 1 1 2.25 0c0 .663-.525 1.2-1.19 1.2z" />
			</svg>
		),
		description: 'Join our Discord server for trading discussions and community support.',
		followers: '15K+',
	},
	{
		name: 'Facebook',
		handle: 'GenzProp',
		url: 'https://facebook.com/GenzProp',
		icon: (
			<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
			</svg>
		),
		description: 'Connect with our community and stay updated with latest news.',
		followers: '40K+',
	},
];

export default function SocialPage() {
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
								Connect With Us
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Follow us on social media for trading insights, market updates, and community engagement.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="GenzProp social" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{socialLinks.map((social) => (
							<a
								key={social.name}
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#5235ff] hover:shadow-lg"
							>
								<div className="mb-4 flex items-center gap-4">
									<div className="flex-shrink-0 rounded-full bg-[#f5f3ff] p-3 text-[#5235ff] group-hover:bg-[#5235ff] group-hover:text-white transition-colors">
										{social.icon}
									</div>
									<div>
										<h3 className="font-semibold text-[#0b0b0f] group-hover:text-[#5235ff] transition-colors">
											{social.name}
										</h3>
										<p className="text-sm text-[#37353E]/70">{social.handle}</p>
									</div>
								</div>
								<p className="text-sm text-[#37353E]/80 mb-3">{social.description}</p>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold text-[#5235ff]">{social.followers} followers</span>
									<svg className="h-4 w-4 text-[#37353E]/40 group-hover:text-[#5235ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</a>
						))}
					</div>

					<div className="mt-16 rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f5f3ff] to-white p-8 text-center">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-4`}>
							Stay Connected
						</h2>
						<p className="text-[#37353E]/80 mb-6 max-w-2xl mx-auto">
							Join our growing community of traders. Get real-time updates, trading tips, and connect with fellow traders from around the world.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-4">
							{socialLinks.slice(0, 4).map((social) => (
								<a
									key={social.name}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-full border border-[#5235ff]/20 bg-white px-4 py-2 text-sm font-semibold text-[#5235ff] transition hover:bg-[#5235ff] hover:text-white"
								>
									<div className="h-4 w-4">{social.icon}</div>
									Follow on {social.name}
								</a>
							))}
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}





