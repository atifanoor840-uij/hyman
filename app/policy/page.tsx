'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_1 } from '@/lib/header-image';
import { COMPANY, COMPANY_LINE, LEGAL_LAST_UPDATED } from '@/lib/company';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function PolicyPage() {
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
								Privacy Policy
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Last updated: {LEGAL_LAST_UPDATED}
							</p>
							<p className="text-sm text-white/50">{COMPANY_LINE}</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="GenzProp privacy" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
							{COMPANY.brand} (&ldquo;{COMPANY.brand},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is operated by <strong>{COMPANY.legalName}</strong>, a company registered in {COMPANY.country} under Company Registration No. {COMPANY.registrationNumber}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit {COMPANY.site} (the &ldquo;Site&rdquo;) or use our trader development and skills-assessment programs (the &ldquo;Services&rdquo;).
						</p>
						<p className="leading-relaxed">
							By using the Site or Services, you agree to the collection and use of information in accordance with this policy.
						</p>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">1. Information We Collect</h2>

							<h3 className="text-lg font-semibold text-[#0b0b0f] mt-4 mb-2">1.1 Information You Provide Directly</h3>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Account information:</strong> full name, email address, phone number, country of residence, date of birth.</li>
								<li><strong>Identity verification (KYC):</strong> government-issued ID, proof of address, and other documents where required for compliance or payout processing.</li>
								<li><strong>Payment information:</strong> billing name, billing address, and payment method details. Card and bank details are processed directly by our payment providers and payment gateway partners &mdash; {COMPANY.brand} does not store full card numbers on its own servers.</li>
								<li><strong>Payout information:</strong> bank account details, cryptocurrency wallet addresses, or other payout method details you provide.</li>
								<li><strong>Communications:</strong> messages sent through live chat, support tickets, email, or contact forms.</li>
							</ul>

							<h3 className="text-lg font-semibold text-[#0b0b0f] mt-6 mb-2">1.2 Information Collected Automatically</h3>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Usage data:</strong> pages visited, time spent on the Site, referring URLs, click patterns.</li>
								<li><strong>Device data:</strong> IP address, browser type, operating system, device identifiers.</li>
								<li><strong>Trading activity data:</strong> simulated trading account activity, performance metrics, and rule-compliance data generated during your evaluation program.</li>
								<li><strong>Cookies and similar technologies:</strong> see Section 7.</li>
							</ul>

							<h3 className="text-lg font-semibold text-[#0b0b0f] mt-6 mb-2">1.3 Information from Third Parties</h3>
							<ul className="list-disc pl-6 space-y-2">
								<li>Verification and fraud-prevention providers.</li>
								<li>Payment processors and payment gateways (for transaction confirmation, fraud checks, and chargeback data).</li>
								<li>Analytics providers (e.g., website traffic tools).</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">2. How We Use Your Information</h2>
							<p className="leading-relaxed mb-3">We use the information we collect to:</p>
							<ol className="list-decimal pl-6 space-y-2">
								<li>Create and manage your account and evaluation program access.</li>
								<li>Process payments, refunds, and payouts.</li>
								<li>Verify your identity and prevent fraud, money laundering, and abuse of promotional offers.</li>
								<li>Monitor trading activity for compliance with program rules.</li>
								<li>Provide customer support and respond to inquiries.</li>
								<li>Send transactional communications (account status, payout confirmations, policy updates).</li>
								<li>Send marketing communications, where you have opted in (you may opt out at any time).</li>
								<li>Improve the Site, our Services, and user experience.</li>
								<li>Comply with legal, regulatory, and payment-network obligations, including responding to lawful requests from authorities and payment processors.</li>
							</ol>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">3. Legal Basis for Processing</h2>
							<p className="leading-relaxed">
								Where applicable data protection law requires it, we process personal data on the basis of: performance of a contract with you, your consent, our legitimate interests (fraud prevention, service improvement), and compliance with legal obligations.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">4. Sharing of Information</h2>
							<p className="leading-relaxed mb-3">We do not sell your personal information. We may share information with:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Payment processors and payment gateways</strong> (including card networks and providers such as our payment gateway partners) to process transactions, refunds, and payouts, and to conduct fraud and chargeback checks.</li>
								<li><strong>Identity verification / KYC providers.</strong></li>
								<li><strong>Service providers</strong> who support hosting, analytics, customer support, and email delivery, under confidentiality obligations.</li>
								<li><strong>Regulators, law enforcement, or courts</strong>, where required by law or to protect our legal rights.</li>
								<li><strong>Business transfers</strong>, in connection with a merger, acquisition, or sale of assets, subject to this policy or a materially similar one.</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">5. Data Retention</h2>
							<p className="leading-relaxed">
								We retain personal data for as long as necessary to provide the Services, comply with our legal and regulatory obligations (including anti-fraud and financial record-keeping requirements), resolve disputes, and enforce our agreements. KYC and payment-related records are typically retained for a minimum period required by applicable financial regulations, even after account closure.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">6. Data Security</h2>
							<p className="leading-relaxed">
								We implement industry-standard technical and organizational measures &mdash; including encryption in transit, access controls, and secure payment processing through PCI-DSS-compliant partners &mdash; to protect your information. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
							</p>
						</section>

						<section id="cookies" className="scroll-mt-24">
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">7. Cookies and Tracking Technologies</h2>
							<p className="leading-relaxed">
								We use cookies and similar technologies to operate the Site, remember preferences, and analyze traffic. You can control cookies through your browser settings. Disabling cookies may affect Site functionality.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">8. Your Rights</h2>
							<p className="leading-relaxed mb-3">Depending on your jurisdiction, you may have the right to:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Access the personal data we hold about you.</li>
								<li>Request correction of inaccurate data.</li>
								<li>Request deletion of your data, subject to our legal and regulatory retention obligations.</li>
								<li>Object to or restrict certain processing.</li>
								<li>Withdraw consent for marketing communications at any time.</li>
								<li>Request a copy of your data in a portable format.</li>
							</ul>
							<p className="leading-relaxed mt-3">
								To exercise these rights, contact us at <strong>{COMPANY.supportEmail}</strong>.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">9. International Data Transfers</h2>
							<p className="leading-relaxed">
								As {COMPANY.brand} serves traders in multiple countries, your information may be transferred to and processed in countries other than your country of residence, including {COMPANY.country} and countries where our service providers operate. We take steps to ensure appropriate safeguards are in place for such transfers.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">10. Children&apos;s Privacy</h2>
							<p className="leading-relaxed">
								Our Services are not directed to individuals under 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete it.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">11. Third-Party Links</h2>
							<p className="leading-relaxed">
								The Site may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their policies.
							</p>
						</section>

						<section id="risk-disclosure" className="scroll-mt-24">
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">12. Risk Disclosure</h2>
							<p className="leading-relaxed">
								Trading in financial markets carries substantial risk. Our evaluation programs are educational and skill-based and are conducted on simulated accounts; simulated results do not represent actual trading and have inherent limitations, including that they do not account for the impact of real market factors such as liquidity. Past performance, including payout history, is not indicative of future results. Full risk terms are set out in our{' '}
								<a href="/terms" className="text-[#5235ff] underline underline-offset-2">Terms and Conditions</a>.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">13. Changes to This Policy</h2>
							<p className="leading-relaxed">
								We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Site after changes constitutes acceptance.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">14. Contact Us</h2>
							<p className="leading-relaxed">
								If you have questions about this Privacy Policy or how your data is handled, contact:
							</p>
							<div className="mt-4 p-4 bg-[#f9f9f9] rounded-lg">
								<p className="font-semibold text-[#0b0b0f]">{COMPANY.legalName} (operating {COMPANY.brand})</p>
								<p className="text-sm text-[#37353E]/80">Company Registration No. {COMPANY.registrationNumber}</p>
								<p className="text-sm text-[#37353E]/80">Email: {COMPANY.supportEmail}</p>
							</div>
						</section>
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8">
						<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">Questions about privacy?</h3>
						<p className="text-sm text-[#37353E]/80 mb-4">
							Our privacy team is here to help you understand how we protect your data.
						</p>
						<a
							href="/contact"
							className="inline-block rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
						>
							Contact Privacy Team
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
