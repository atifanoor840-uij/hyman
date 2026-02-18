'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const helpCategories = [
	{
		title: 'Getting Started',
		icon: '🚀',
		articles: [
			'How to create an account',
			'Understanding the evaluation process',
			'Choosing the right account size',
			'Platform setup guide',
		],
	},
	{
		title: 'Trading Rules',
		icon: '📋',
		articles: [
			'Daily loss limits explained',
			'Profit target requirements',
			'Maximum drawdown rules',
			'Prohibited trading strategies',
		],
	},
	{
		title: 'Account Management',
		icon: '💼',
		articles: [
			'How to fund your account',
			'Withdrawal process',
			'Account verification',
			'Upgrading your account',
		],
	},
	{
		title: 'Platform Help',
		icon: '💻',
		articles: [
			'MT4 installation guide',
			'MT5 setup instructions',
			'cTrader platform guide',
			'Troubleshooting common issues',
		],
	},
	{
		title: 'Payouts & Withdrawals',
		icon: '💰',
		articles: [
			'How to request a payout',
			'Withdrawal methods available',
			'Processing times',
			'Payout limits and fees',
		],
	},
	{
		title: 'Technical Support',
		icon: '🔧',
		articles: [
			'Connection issues',
			'Platform errors',
			'Chart problems',
			'Order execution issues',
		],
	},
];

const faqs = [
	{
		q: 'How do I contact support?',
		a: 'You can reach our support team 24/7 through live chat on our platform, email at support@fxgenz.com, or through our contact form. Average response time is under 2 hours.',
	},
	{
		q: 'What are your support hours?',
		a: 'Our support team operates 24/7, 365 days a year. We provide round-the-clock assistance for all your trading and account-related questions.',
	},
	{
		q: 'How long does account verification take?',
		a: 'Account verification typically takes 1-2 business days. We review all documents carefully to ensure security and compliance.',
	},
	{
		q: 'Can I change my account size after starting?',
		a: 'Yes, you can upgrade your account size at any time. Contact support to discuss your options and requirements.',
	},
];

export default function SupportPage() {
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
								Support & Help Center
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Find answers to your questions or get in touch with our support team. We're here to help 24/7.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_2} alt="Fx Genz support" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
					{/* Quick Actions */}
					<div className="mb-16 grid gap-4 md:grid-cols-3">
						<a
							href="/contact"
							className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#0ea5e9] hover:shadow-lg"
						>
							<div className="mb-4 text-4xl">💬</div>
							<h3 className="font-semibold text-[#0b0b0f] mb-2 group-hover:text-[#0ea5e9] transition-colors">
								Live Chat
							</h3>
							<p className="text-sm text-[#37353E]/80">Get instant help from our support team</p>
						</a>
						<a
							href="/contact"
							className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#0ea5e9] hover:shadow-lg"
						>
							<div className="mb-4 text-4xl">📧</div>
							<h3 className="font-semibold text-[#0b0b0f] mb-2 group-hover:text-[#0ea5e9] transition-colors">
								Email Support
							</h3>
							<p className="text-sm text-[#37353E]/80">Send us a detailed message</p>
						</a>
						<a
							href="/faq"
							className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#0ea5e9] hover:shadow-lg"
						>
							<div className="mb-4 text-4xl">❓</div>
							<h3 className="font-semibold text-[#0b0b0f] mb-2 group-hover:text-[#0ea5e9] transition-colors">
								FAQ
							</h3>
							<p className="text-sm text-[#37353E]/80">Browse frequently asked questions</p>
						</a>
					</div>

					{/* Help Categories */}
					<div className="mb-16">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-8`}>
							Browse by Category
						</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{helpCategories.map((category) => (
								<div
									key={category.title}
									className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm"
								>
									<div className="mb-4 text-4xl">{category.icon}</div>
									<h3 className="font-semibold text-[#0b0b0f] mb-4">{category.title}</h3>
									<ul className="space-y-2">
										{category.articles.map((article) => (
											<li key={article}>
												<a
													href="#"
													className="text-sm text-[#0ea5e9] hover:underline flex items-center gap-2"
												>
													<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
													{article}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>

					{/* Quick FAQs */}
					<div className="mb-16">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-8`}>
							Quick Answers
						</h2>
						<div className="space-y-4">
							{faqs.map((faq) => (
								<div key={faq.q} className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
									<h3 className="font-semibold text-[#0b0b0f] mb-2">{faq.q}</h3>
									<p className="text-sm text-[#37353E]/80 leading-relaxed">{faq.a}</p>
								</div>
							))}
						</div>
					</div>

					{/* Contact CTA */}
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8 text-center">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-4`}>
							Still Need Help?
						</h2>
						<p className="text-[#37353E]/80 mb-6 max-w-2xl mx-auto">
							Our support team is available 24/7 to assist you with any questions or issues.
						</p>
						<a
							href="/contact"
							className="inline-block rounded-full bg-[#0ea5e9] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
						>
							Contact Support
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}





