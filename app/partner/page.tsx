'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const benefits = [
	{
		title: 'Revenue Sharing',
		description: 'Earn competitive commissions on every trader you refer. The more traders you bring, the more you earn.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	{
		title: 'Marketing Support',
		description: 'Access to professional marketing materials, banners, and promotional content to help you succeed.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
			</svg>
		),
	},
	{
		title: 'Dedicated Support',
		description: 'Get dedicated partner support to help you maximize your earnings and grow your business.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		),
	},
	{
		title: 'Real-Time Analytics',
		description: 'Track your referrals, commissions, and performance with our comprehensive partner dashboard.',
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		),
	},
];

const partnerTypes = [
	{
		title: 'Affiliate Partner',
		description: 'Perfect for content creators, bloggers, and marketers who want to earn commissions by referring traders.',
		commission: 'Up to 20%',
		requirements: ['Active website or social media', 'Minimum 1,000 followers', 'Relevant audience'],
		features: ['Marketing materials', 'Tracking links', 'Monthly payouts', 'Performance dashboard'],
	},
	{
		title: 'IB Partner',
		description: 'Ideal for experienced traders and trading communities who can provide value-added services to their clients.',
		commission: 'Up to 30%',
		requirements: ['Trading experience', 'Client base', 'Educational resources', 'Support capabilities'],
		features: ['Higher commissions', 'White-label options', 'Dedicated manager', 'Custom solutions'],
	},
	{
		title: 'Institutional Partner',
		description: 'For businesses, trading schools, and institutions looking to offer funding programs to their clients.',
		commission: 'Custom',
		requirements: ['Business registration', 'Established presence', 'Volume commitments'],
		features: ['Custom commission structure', 'API integration', 'Priority support', 'Co-marketing opportunities'],
	},
];

const steps = [
	{
		step: '1',
		title: 'Apply',
		description: 'Fill out our partner application form with your details and business information.',
	},
	{
		step: '2',
		title: 'Review',
		description: 'Our team reviews your application and gets back to you within 48 hours.',
	},
	{
		step: '3',
		title: 'Onboarding',
		description: 'Get access to your partner dashboard, marketing materials, and tracking tools.',
	},
	{
		step: '4',
		title: 'Start Earning',
		description: 'Begin referring traders and earning commissions. Payouts are processed monthly.',
	},
];

export default function PartnerPage() {
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
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]"></div>
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12 mt-16 lg:mt-20">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Become a Partner
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Join our partner program and earn competitive commissions by referring traders to GenzProp.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_2} alt="GenzProp partner" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
				{/* Hero CTA */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<div className="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f5f3ff] to-white p-12 text-center">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-4`}>
							Earn Competitive Commissions
						</h2>
						<p className="text-[#37353E]/80 mb-8 max-w-2xl mx-auto">
							Partner with GenzProp and earn up to 30% commission on every trader you refer. Join thousands of successful partners worldwide.
						</p>
						<a
							href="#apply"
							className="inline-block rounded-full bg-[#5235ff] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
						>
							Apply Now
						</a>
					</div>
				</section>

				{/* Benefits */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
							Partner Benefits
						</h2>
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
							{benefits.map((benefit) => (
								<div key={benefit.title} className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
									<div className="mb-4 text-[#5235ff]">{benefit.icon}</div>
									<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">{benefit.title}</h3>
									<p className="text-sm text-[#37353E]/80 leading-relaxed">{benefit.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Partner Types */}
				<section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
						Choose Your Partner Type
					</h2>
					<div className="grid gap-8 lg:grid-cols-3">
						{partnerTypes.map((type) => (
							<div
								key={type.title}
								className="rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm"
							>
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-2xl font-semibold text-[#0b0b0f]">{type.title}</h3>
									<span className="rounded-full bg-[#f5f3ff] px-4 py-1 text-sm font-bold text-[#5235ff]">
										{type.commission}
									</span>
								</div>
								<p className="mb-6 text-[#37353E]/80 leading-relaxed">{type.description}</p>
								
								<div className="mb-6">
									<h4 className="font-semibold text-[#0b0b0f] mb-3">Requirements:</h4>
									<ul className="space-y-2">
										{type.requirements.map((req) => (
											<li key={req} className="flex items-start gap-2 text-sm text-[#37353E]/80">
												<svg className="h-5 w-5 text-[#5235ff] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{req}
											</li>
										))}
									</ul>
								</div>

								<div>
									<h4 className="font-semibold text-[#0b0b0f] mb-3">Features:</h4>
									<ul className="space-y-2">
										{type.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-sm text-[#37353E]/80">
												<svg className="h-5 w-5 text-[#5235ff] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
												{feature}
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* How It Works */}
				<section className="bg-[#f9f9f9] py-16">
					<div className="mx-auto max-w-7xl px-6 md:px-10">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-12 text-center`}>
							How It Works
						</h2>
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
							{steps.map((step) => (
								<div key={step.step} className="relative">
									<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
										<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5235ff] text-xl font-bold text-white">
											{step.step}
										</div>
										<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">{step.title}</h3>
										<p className="text-sm text-[#37353E]/80 leading-relaxed">{step.description}</p>
									</div>
									{step.step !== '4' && (
										<div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-[#5235ff]">
											<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Application Form */}
				<section id="apply" className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
					<div className="rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm md:p-12">
						<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-6 text-center`}>
							Partner Application
						</h2>
						<p className="text-center text-[#37353E]/80 mb-8">
							Fill out the form below and our team will get back to you within 48 hours.
						</p>
						<form className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<label htmlFor="firstName" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										First Name
									</label>
									<input
										type="text"
										id="firstName"
										required
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20"
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										Last Name
									</label>
									<input
										type="text"
										id="lastName"
										required
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20"
									/>
								</div>
							</div>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-[#0b0b0f] mb-2">
									Email Address
								</label>
								<input
									type="email"
									id="email"
									required
									className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20"
								/>
							</div>
							<div>
								<label htmlFor="partnerType" className="block text-sm font-medium text-[#0b0b0f] mb-2">
									Partner Type
								</label>
								<select
									id="partnerType"
									required
									className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20"
								>
									<option value="">Select partner type</option>
									<option value="affiliate">Affiliate Partner</option>
									<option value="ib">IB Partner</option>
									<option value="institutional">Institutional Partner</option>
								</select>
							</div>
							<div>
								<label htmlFor="website" className="block text-sm font-medium text-[#0b0b0f] mb-2">
									Website/Social Media
								</label>
								<input
									type="url"
									id="website"
									placeholder="https://yourwebsite.com"
									className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20"
								/>
							</div>
							<div>
								<label htmlFor="message" className="block text-sm font-medium text-[#0b0b0f] mb-2">
									Tell Us About Yourself
								</label>
								<textarea
									id="message"
									rows={5}
									required
									className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#5235ff] focus:outline-none focus:ring-2 focus:ring-[#5235ff]/20 resize-none"
									placeholder="Describe your experience, audience, and why you'd like to partner with us..."
								/>
							</div>
							<button
								type="submit"
								className="w-full rounded-full bg-[#5235ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
							>
								Submit Application
							</button>
						</form>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}





