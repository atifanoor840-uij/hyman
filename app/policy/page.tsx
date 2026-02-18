'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_1 } from '@/lib/header-image';

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
								Last updated: February 2025
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="Fx Genz privacy" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">1. Introduction</h2>
							<p className="leading-relaxed">
								FxGenz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading platform and services. Please read this privacy policy carefully.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">2. Information We Collect</h2>
							<p className="leading-relaxed mb-3">
								We collect information that you provide directly to us, including:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and government-issued identification</li>
								<li><strong>Financial Information:</strong> Bank account details, payment card information, and transaction history</li>
								<li><strong>Account Information:</strong> Username, password, and account preferences</li>
								<li><strong>Trading Data:</strong> Trading history, positions, and performance metrics</li>
								<li><strong>Communication Data:</strong> Records of correspondence with our support team</li>
							</ul>
							<p className="leading-relaxed mt-3">
								We also automatically collect certain information when you use our services, including IP address, device information, browser type, and usage patterns.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">3. How We Use Your Information</h2>
							<p className="leading-relaxed mb-3">
								We use the information we collect to:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Provide, maintain, and improve our services</li>
								<li>Process transactions and send related information</li>
								<li>Send technical notices, updates, and support messages</li>
								<li>Respond to your comments, questions, and requests</li>
								<li>Monitor and analyze trends, usage, and activities</li>
								<li>Detect, prevent, and address technical issues and fraudulent activity</li>
								<li>Comply with legal obligations and enforce our terms</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">4. Information Sharing and Disclosure</h2>
							<p className="leading-relaxed mb-3">
								We do not sell your personal information. We may share your information in the following circumstances:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
								<li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
								<li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
								<li><strong>With Your Consent:</strong> When you have given us explicit permission to share</li>
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">5. Data Security</h2>
							<p className="leading-relaxed">
								We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and regular security audits. However, no method of transmission over the Internet or electronic storage is 100% secure.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">6. Data Retention</h2>
							<p className="leading-relaxed">
								We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">7. Your Rights and Choices</h2>
							<p className="leading-relaxed mb-3">
								Depending on your location, you may have certain rights regarding your personal information, including:
							</p>
							<ul className="list-disc pl-6 space-y-2">
								<li><strong>Access:</strong> Request access to your personal information</li>
								<li><strong>Correction:</strong> Request correction of inaccurate information</li>
								<li><strong>Deletion:</strong> Request deletion of your personal information</li>
								<li><strong>Portability:</strong> Request transfer of your data to another service</li>
								<li><strong>Opt-out:</strong> Opt-out of certain data processing activities</li>
								<li><strong>Objection:</strong> Object to processing of your personal information</li>
							</ul>
							<p className="leading-relaxed mt-3">
								To exercise these rights, please contact us using the information provided in the Contact section.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">8. Cookies and Tracking Technologies</h2>
							<p className="leading-relaxed">
								We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">9. International Data Transfers</h2>
							<p className="leading-relaxed">
								Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to these facilities.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">10. Children's Privacy</h2>
							<p className="leading-relaxed">
								Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">11. Changes to This Privacy Policy</h2>
							<p className="leading-relaxed">
								We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-[#0b0b0f] mb-4">12. Contact Us</h2>
							<p className="leading-relaxed">
								If you have any questions about this Privacy Policy or our data practices, please contact us at:
							</p>
							<div className="mt-4 p-4 bg-[#f9f9f9] rounded-lg">
								<p className="font-semibold text-[#0b0b0f]">FxGenz Privacy Team</p>
								<p className="text-sm text-[#37353E]/80">Email: privacy@fxgenz.com</p>
								<p className="text-sm text-[#37353E]/80">Support: support@fxgenz.com</p>
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

