'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function TermsPage() {
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
							Terms of Service
						</h1>
						<p className="text-lg text-white/70 md:text-xl max-w-2xl">
							Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
				<div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">

					<div className="prose prose-slate max-w-none space-y-8 text-[#37353E]">
						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">1. Agreement to Terms</h2>
							<p className="leading-relaxed">
								By accessing or using FxGenz services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">2. Use License</h2>
							<p className="leading-relaxed mb-3">
								Permission is granted to temporarily access the materials on FxGenz's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Modify or copy the materials</li>
								<li>Use the materials for any commercial purpose or for any public display</li>
								<li>Attempt to reverse engineer any software contained on the website</li>
								<li>Remove any copyright or other proprietary notations from the materials</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">3. Account Registration</h2>
							<p className="leading-relaxed mb-3">
								To access certain features of our service, you must register for an account. You agree to:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Provide accurate, current, and complete information during registration</li>
								<li>Maintain and promptly update your account information</li>
								<li>Maintain the security of your password and identification</li>
								<li>Accept all responsibility for activities that occur under your account</li>
								<li>Notify us immediately of any unauthorized use of your account</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">4. Trading Rules and Restrictions</h2>
							<p className="leading-relaxed mb-3">
								When trading through FxGenz, you must comply with all trading rules and restrictions, including but not limited to:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Maximum daily loss limits</li>
								<li>Profit target requirements</li>
								<li>Prohibited trading strategies (e.g., arbitrage, hedging restrictions)</li>
								<li>Minimum trading days requirements</li>
								<li>Maximum drawdown limits</li>
							</ul>
							<p className="leading-relaxed mt-3">
								Violation of trading rules may result in immediate account termination and forfeiture of any profits or fees paid.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">5. Payouts and Withdrawals</h2>
							<p className="leading-relaxed">
								Payouts are subject to verification and compliance with all trading rules. We reserve the right to withhold or delay payouts if we suspect fraudulent activity or rule violations. All payouts are processed according to our payout schedule and may be subject to fees as outlined in our pricing structure.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">6. Risk Disclosure</h2>
							<p className="leading-relaxed">
								Trading financial instruments involves substantial risk of loss. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources. Past performance is not indicative of future results. You may lose more than your initial investment.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">7. Intellectual Property</h2>
							<p className="leading-relaxed">
								All content, features, and functionality of the FxGenz platform, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of FxGenz and are protected by international copyright, trademark, and other intellectual property laws.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">8. Limitation of Liability</h2>
							<p className="leading-relaxed">
								In no event shall FxGenz or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FxGenz's website, even if FxGenz or an authorized representative has been notified orally or in writing of the possibility of such damage.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">9. Termination</h2>
							<p className="leading-relaxed">
								We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">10. Changes to Terms</h2>
							<p className="leading-relaxed">
								FxGenz reserves the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">11. Contact Information</h2>
							<p className="leading-relaxed">
								If you have any questions about these Terms of Service, please contact us through our support channels or email us at legal@fxgenz.com.
							</p>
						</section>
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8">
						<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">Questions about our terms?</h3>
						<p className="text-sm text-[#37353E]/80 mb-4">
							Our legal team is available to answer any questions you may have.
						</p>
						<a
							href="/contact"
							className="inline-block rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
						>
							Contact Legal Team
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}

