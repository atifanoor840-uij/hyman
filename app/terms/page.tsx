'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_1 } from '@/lib/header-image';
import { COMPANY, COMPANY_LINE, LEGAL_LAST_UPDATED } from '@/lib/company';

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
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12 mt-16 lg:mt-20">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Terms and Conditions
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Last updated: {LEGAL_LAST_UPDATED}
							</p>
							<p className="text-sm text-white/50">{COMPANY_LINE}</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="GenzProp terms" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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

					<div className="prose prose-slate max-w-none space-y-10 text-[#37353E]">
						<p className="leading-relaxed text-[#37353E]/90">
							These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of {COMPANY.site} (the &ldquo;Site&rdquo;) and the trader development, skills-assessment, and evaluation programs offered by <strong>{COMPANY.legalName}</strong> (&ldquo;{COMPANY.brand},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a company registered in {COMPANY.country} under Company Registration No. {COMPANY.registrationNumber}.
						</p>
						<p className="leading-relaxed text-[#37353E]/90">
							By purchasing an evaluation program, creating an account, or otherwise using the Site, you agree to be bound by these Terms. If you do not agree, do not use the Site or Services.
						</p>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>1. Nature of the Services</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>1.1 {COMPANY.brand} provides <strong>educational trader development programs and skills assessments</strong> conducted on <strong>simulated trading accounts</strong>. No real capital is placed in financial markets during the evaluation phases described on this Site unless explicitly stated otherwise.</li>
								<li>1.2 {COMPANY.brand} is <strong>not</strong> a broker-dealer, investment advisor, bank, or financial institution, and does not provide financial, investment, tax, or legal advice. Nothing on the Site constitutes an offer or solicitation to trade real financial instruments.</li>
								<li>1.3 Participation in our programs does not guarantee funding, profit, or income of any kind. Passing an evaluation grants eligibility for a simulated or funded account subject to these Terms and the specific program rules in effect at the time of purchase.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>2. Eligibility</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>2.1 You must be at least 18 years old and have the legal capacity to enter into a binding contract to use our Services.</li>
								<li>2.2 You are responsible for ensuring that participation in our programs is lawful in your country of residence. {COMPANY.brand} reserves the right to restrict access from jurisdictions where our Services are prohibited or unregulated.</li>
								<li>2.3 You must provide accurate, current, and complete information during registration and keep it updated.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>3. Account Registration and Security</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>3.1 You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</li>
								<li>3.2 You must notify us immediately of any unauthorized use of your account.</li>
								<li>3.3 One trader may hold only one active account per evaluation program unless otherwise permitted in writing.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>4. Evaluation Programs and Trading Rules</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>4.1 Each evaluation program has specific rules, including but not limited to minimum trading days, daily and maximum drawdown limits, profit targets, permitted strategies, and prohibited practices (e.g., certain forms of arbitrage, exploiting platform errors, or coordinated trading across accounts).</li>
								<li>4.2 Current trading rules are published on our <a href="/rules" className="text-[#5235ff] underline underline-offset-2">Rules page</a> and form part of these Terms. We reserve the right to update program rules for future purchases; rules applicable to an account are those in effect at the time of that account&apos;s activation.</li>
								<li>4.3 Violation of program rules may result in disqualification from the evaluation, termination of a funded account, and forfeiture of eligibility for payouts, at our sole discretion.</li>
								<li>4.4 Free retries, where offered, apply only as described in the specific program terms in effect at purchase and are limited to one per evaluation phase unless stated otherwise.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>5. Fees and Payment</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>5.1 Evaluation program fees are displayed in USD at checkout and must be paid in full before program access is granted.</li>
								<li>5.2 Payments are processed through third-party payment processors and gateways. By making a payment, you agree to the terms of those processors in addition to these Terms.</li>
								<li>5.3 Promotional discounts and codes are subject to their own stated terms and expiration dates and cannot be combined unless explicitly stated.</li>
								<li>5.4 See our <a href="/refund" className="text-[#5235ff] underline underline-offset-2">Refund Policy</a> for the terms under which fees may be refunded.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>6. Funded Accounts and Payouts</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>6.1 Upon successfully passing an evaluation program, you may become eligible for a funded account, subject to a separate funded account agreement and continued compliance with all applicable trading rules.</li>
								<li>6.2 Profit splits, payout eligibility, minimum payout thresholds, and processing timelines are disclosed on the Site and/or your account dashboard and may be updated from time to time for future evaluations.</li>
								<li>6.3 Payouts are processed via the methods available in your dashboard (e.g., cryptocurrency, bank transfer). Processing times are estimates and may vary due to factors outside our control, including third-party payment network delays.</li>
								<li>6.4 We reserve the right to withhold or delay a payout pending verification of identity, investigation of suspected rule violations, or fraud/AML review.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>7. Prohibited Conduct</h2>
							<p className="leading-relaxed mb-3">You agree not to:</p>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>Use bots, algorithms, or automated systems in violation of stated program rules.</li>
								<li>Exploit software bugs, latency arbitrage, or pricing errors on our platforms.</li>
								<li>Provide false information during registration, verification, or payout requests.</li>
								<li>Use the Services for money laundering, fraud, or any unlawful purpose.</li>
								<li>Attempt to reverse-engineer, hack, or disrupt the Site or our systems.</li>
								<li>Share, sell, or transfer your account to another individual.</li>
							</ul>
							<p className="leading-relaxed mt-3">
								Violation of this section may result in immediate termination of your account and forfeiture of any pending payouts.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>8. Intellectual Property</h2>
							<p className="leading-relaxed">
								All content on the Site &mdash; including text, graphics, logos, software, and trading rule frameworks &mdash; is the property of {COMPANY.legalName} or its licensors and is protected by applicable intellectual property laws. You may not copy, reproduce, or distribute Site content without prior written consent.
							</p>
						</section>

						<section id="risk-disclosure" className="scroll-mt-24">
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>9. Risk Disclosure</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>9.1 Trading in financial markets carries substantial risk. Evaluation programs are educational and skill-based; simulated results do not represent actual trading and have inherent limitations, including that they do not account for the impact of real market factors such as liquidity.</li>
								<li>9.2 Past performance, including payout history, is not indicative of future results.</li>
								<li>9.3 You acknowledge participation in our programs at your own risk and that {COMPANY.brand} is not liable for trading losses.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>10. Limitation of Liability</h2>
							<p className="leading-relaxed">
								To the maximum extent permitted by applicable law, {COMPANY.brand}, {COMPANY.legalName}, and their officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of the Services, whether based on warranty, contract, tort, or any other legal theory, even if advised of the possibility of such damages.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>11. Indemnification</h2>
							<p className="leading-relaxed">
								You agree to indemnify and hold harmless {COMPANY.brand} and {COMPANY.legalName} from any claims, damages, losses, or expenses (including legal fees) arising from your breach of these Terms or misuse of the Services.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>12. Termination</h2>
							<p className="leading-relaxed">
								We may suspend or terminate your account at our discretion, with or without notice, for violation of these Terms, program rules, suspected fraud, or unlawful activity. You may close your account at any time by contacting support.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>13. Changes to These Terms</h2>
							<p className="leading-relaxed">
								We may revise these Terms from time to time. Material changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Services after changes take effect constitutes acceptance of the revised Terms.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>14. Governing Law and Dispute Resolution</h2>
							<p className="leading-relaxed">
								These Terms are governed by the laws of {COMPANY.country}, without regard to conflict-of-law principles. Any disputes arising from these Terms or the Services shall first be addressed through good-faith negotiation with our support team, and if unresolved, submitted to the courts of competent jurisdiction in {COMPANY.country}, unless mandatory local consumer-protection law provides otherwise.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>15. Contact Us</h2>
							<div className="mt-4 p-4 bg-[#f9f9f9] rounded-lg">
								<p className="font-semibold text-[#0b0b0f]">{COMPANY.legalName} (operating {COMPANY.brand})</p>
								<p className="text-sm text-[#37353E]/80">Company Registration No. {COMPANY.registrationNumber}</p>
								<p className="text-sm text-[#37353E]/80">Email: {COMPANY.supportEmail}</p>
							</div>
						</section>
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8">
						<h3 className="text-xl font-semibold text-[#0b0b0f] mb-2">Questions about our terms?</h3>
						<p className="text-sm text-[#37353E]/80 mb-4">
							Our legal team is available to answer any questions you may have.
						</p>
						<a
							href="/contact"
							className="inline-block rounded-full bg-[#5235ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#452cff]"
						>
							Contact Legal Team
						</a>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
