'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_1 } from '@/lib/header-image';
import { COMPANY, COMPANY_LINE, LEGAL_LAST_UPDATED } from '@/lib/company';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function RefundPage() {
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
								Refund Policy
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Last updated: {LEGAL_LAST_UPDATED}
							</p>
							<p className="text-sm text-white/50">{COMPANY_LINE}</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="GenzProp refund policy" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
				<div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">

					<div className="prose prose-slate max-w-none space-y-8 text-[#37353E]">
						<p className="leading-relaxed">
							This Refund Policy applies to all evaluation program fees purchased through {COMPANY.site}, operated by <strong>{COMPANY.legalName}</strong> (Company Registration No. {COMPANY.registrationNumber}). It should be read together with our{' '}
							<a href="/terms" className="text-[#5235ff] underline underline-offset-2">Terms and Conditions</a>.
						</p>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">1. General Rule: Fees Are Non-Refundable</h2>
							<p className="leading-relaxed">
								Evaluation program fees are charged in exchange for immediate access to a simulated trading evaluation environment, trading rules, dashboard tools, and support services. As such, <strong>fees are non-refundable once your evaluation program has been activated</strong>, except as expressly set out in Section 2 below.
							</p>
							<p className="leading-relaxed mt-3">
								Purchasing an evaluation program does not guarantee that you will pass the evaluation or receive a funded account.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">2. Refund on First Payout</h2>
							<p className="leading-relaxed mb-3">
								As a benefit to traders who successfully complete our program, {COMPANY.brand} will <strong>refund your original evaluation fee in full once you receive your first payout</strong> from a funded account obtained through that evaluation.
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>The refund applies to the fee paid for the specific evaluation program that led to the funded account.</li>
								<li>The refund is issued after your first successful payout has been processed and settled.</li>
								<li>The refund is paid using the same method as your payout, unless otherwise agreed, and is separate from your payout amount.</li>
								<li>This refund benefit applies once per successfully funded account and is not transferable between accounts or traders.</li>
								<li>Promotional discounts: if you purchased at a discounted price, the refund reflects the amount actually paid, not the undiscounted list price.</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">3. Circumstances Where No Refund Applies</h2>
							<p className="leading-relaxed mb-3">
								No refund (including the first-payout refund described in Section 2) will be issued where:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>The evaluation account was disqualified or terminated for a breach of trading rules or our Terms.</li>
								<li>The account was found to involve fraudulent activity, false information, prohibited trading strategies, or abuse of promotional offers.</li>
								<li>The trader voluntarily withdraws from the program before completing it.</li>
								<li>The trader fails to pass the evaluation phases.</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">4. Technical or Billing Errors</h2>
							<p className="leading-relaxed">
								If you were charged in error (e.g., duplicate charge, incorrect amount, or a charge without corresponding account activation), contact us within <strong>14 days</strong> of the transaction at {COMPANY.supportEmail} with your order details. Verified billing errors will be corrected or refunded in full.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">5. Chargebacks</h2>
							<p className="leading-relaxed">
								We ask that you contact our support team before filing a chargeback or payment dispute with your bank or card issuer, so we can resolve the issue directly. Filing a chargeback without first contacting support may result in suspension of your account pending investigation. Fraudulent or unwarranted chargebacks may be contested with evidence of service delivery and program activation.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">6. How to Request a Refund</h2>
							<p className="leading-relaxed mb-3">
								To request a refund under Section 2 or Section 4, contact us at <strong>{COMPANY.supportEmail}</strong> with:
							</p>
							<ol className="list-decimal pl-6 space-y-2">
								<li>Your registered account email or username.</li>
								<li>Order/transaction ID.</li>
								<li>Reason for the refund request (first-payout refund or billing error).</li>
							</ol>
							<p className="leading-relaxed mt-3">
								Refund requests are typically reviewed within <strong>5&ndash;7 business days</strong>. Approved refunds are processed to the original payment method or payout method within a further <strong>5&ndash;10 business days</strong>, depending on your payment provider&apos;s processing times.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">7. Changes to This Policy</h2>
							<p className="leading-relaxed">
								We may update this Refund Policy from time to time. Changes apply to evaluation programs purchased after the updated policy is posted; programs already activated are governed by the policy in effect at the time of purchase, unless a change is required by law.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">8. Contact Us</h2>
							<div className="mt-4 p-4 bg-[#f9f9f9] rounded-lg">
								<p className="font-semibold text-[#0b0b0f]">{COMPANY.legalName} (operating {COMPANY.brand})</p>
								<p className="text-sm text-[#37353E]/80">Company Registration No. {COMPANY.registrationNumber}</p>
								<p className="text-sm text-[#37353E]/80">Email: {COMPANY.supportEmail}</p>
							</div>
						</section>
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8">
						<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">Need help with a refund?</h3>
						<p className="text-sm text-[#37353E]/80 mb-4">
							Our support team can walk you through the process and check your order.
						</p>
						<a
							href="/contact"
							className="inline-block rounded-full bg-[#5235ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
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
