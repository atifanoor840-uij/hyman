'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import { HEADER_IMAGE_1 } from '@/lib/header-image';

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
								Terms of Service
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_1} alt="Fx Genz terms" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
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
							FXGENZ provides funded trading accounts to skilled traders. All participants are required to read and understand these legal terms before registering or trading on the platform.
						</p>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>1️⃣ Service Nature</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>FXGENZ offers prop trading accounts that allow qualified traders to trade real capital provided by FXGENZ.</li>
								<li>FXGENZ does not provide investment advice, manage personal funds, or offer financial planning services.</li>
								<li>Participation in FXGENZ accounts is performance-based, meaning profits and losses depend entirely on the trader&apos;s skill and adherence to trading rules.</li>
								<li>By using FXGENZ, traders acknowledge that past results do not guarantee future profits.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>2️⃣ Independent Contractor Status</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>Traders are considered independent contractors, not employees, partners, or agents of FXGENZ.</li>
								<li>FXGENZ does not provide salaries, benefits, or employment protections.</li>
								<li>Traders are responsible for their own tax obligations, legal compliance, and reporting in their jurisdiction.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>3️⃣ Risk & Liability</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>All trading carries risk of partial or total loss of the trading capital provided.</li>
								<li>FXGENZ&apos;s liability is strictly limited to the funded trading account and does not cover indirect losses or damages.</li>
								<li>Traders agree that they are solely responsible for following account rules including drawdown, lot size, and trade management.</li>
								<li>FXGENZ does not guarantee profits, and participating in trading is entirely voluntary.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>4️⃣ Account Usage Rules</h2>
							<p className="leading-relaxed mb-3">
								Each account is intended for single-user trading and must be used independently. Traders may own multiple accounts, but they must not hedge, mirror, or merge accounts.
							</p>
							<p className="leading-relaxed mb-2 font-medium text-[#0b0b0f]">Prohibited strategies include:</p>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed mb-3">
								<li>Scalping below the minimum trade holding time</li>
								<li>Grid trading, martingale strategies, or trade layering</li>
								<li>Use of unapproved Expert Advisors (EAs) or bots</li>
								<li>Latency or arbitrage exploitation</li>
							</ul>
							<p className="leading-relaxed">
								Violations of account rules may result in warnings, account review, or termination.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>5️⃣ Profit & Withdrawals</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>Traders retain up to 80% of profits, depending on the account and performance tier.</li>
								<li>Minimum withdrawal requirement: 5% of account balance in profit.</li>
								<li>Withdrawals are processed weekly, after verification and compliance checks.</li>
								<li>FXGENZ reserves the right to delay or reject withdrawals in cases of suspected rule violations or fraud.</li>
								<li>Large withdrawals may be subject to additional KYC verification for security purposes.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>6️⃣ KYC & Compliance</h2>
							<p className="leading-relaxed mb-3">
								Traders must complete KYC (Know Your Customer) verification before their first withdrawal.
							</p>
							<p className="leading-relaxed mb-2 font-medium text-[#0b0b0f]">Required documents include:</p>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed mb-3">
								<li>Government-issued ID (passport, driver&apos;s license, or national ID)</li>
								<li>Proof of address (utility bill, bank statement, or government-issued document)</li>
								<li>Optional selfie with ID for additional verification</li>
							</ul>
							<p className="leading-relaxed">
								All documents are stored securely and used for compliance, anti-fraud, and payout verification purposes.
							</p>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>7️⃣ Intellectual Property</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>All FXGENZ branding, logos, software, and educational materials are the property of FXGENZ.</li>
								<li>Traders are not permitted to reproduce, distribute, or resell FXGENZ intellectual property.</li>
								<li>Unauthorized use may result in legal action and account termination.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>8️⃣ Termination Policy</h2>
							<p className="leading-relaxed mb-3">
								FXGENZ may terminate accounts at any time if rules are violated or if trading is deemed abusive. Termination does not automatically void earned profits, which may be paid after compliance review.
							</p>
							<p className="leading-relaxed mb-2 font-medium text-[#0b0b0f]">Examples of account termination causes include:</p>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>Excessive drawdown breaches</li>
								<li>Rule violations (prohibited strategies, trade manipulation)</li>
								<li>Fraudulent activity or KYC non-compliance</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>9️⃣ Buyback & Account Restart</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>Traders may restart a failed account once via the Buyback Feature for a reduced fee.</li>
								<li>All original trading rules apply during the restarted account.</li>
								<li>Buyback allows traders a second chance without purchasing a completely new account.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>🔟 Governing Law & Dispute Resolution</h2>
							<ul className="list-disc pl-6 space-y-2 leading-relaxed">
								<li>FXGENZ operations are governed by [Insert Jurisdiction] law.</li>
								<li>Disputes are resolved primarily through internal review and arbitration.</li>
								<li>By registering, traders agree to resolve disputes according to the laws and regulations of the governing jurisdiction.</li>
							</ul>
						</section>

						<section>
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-4`}>1️⃣1️⃣ Risk Disclosure & Disclaimer</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">No Guarantee of Profit</h3>
									<p className="leading-relaxed text-sm">
										FXGENZ does not provide any guarantees, representations, or warranties regarding profitability. Trading outcomes are dependent on market conditions, execution quality, and individual trading decisions. No assurances of profit or income are expressed or implied.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">Risk of Loss</h3>
									<p className="leading-relaxed text-sm">
										Trading leveraged financial instruments involves a high degree of risk and may result in the loss of all trading capital provided. Participants should only engage in trading activities if they fully understand the risks involved and are financially capable of bearing such losses.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">Past Performance Disclaimer</h3>
									<p className="leading-relaxed text-sm">
										Any historical performance, simulated results, or examples shown on the FXGENZ website or platform are not indicative of future results. Market conditions vary and past success does not guarantee future profitability.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">Market Conditions & Execution Risk</h3>
									<p className="leading-relaxed text-sm">
										Trading performance may be adversely affected by factors including, but not limited to, market volatility, liquidity constraints, slippage, pricing delays, and execution latency. FXGENZ is not responsible for losses resulting from such conditions.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">Limitation of Liability</h3>
									<p className="leading-relaxed text-sm">
										To the maximum extent permitted by applicable law, FXGENZ shall not be liable for any indirect, incidental, consequential, special, or third-party damages, including loss of profits, revenue, business opportunity, or anticipated earnings, arising from the use of FXGENZ services.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">No Investment Advice</h3>
									<p className="leading-relaxed text-sm">
										FXGENZ does not provide investment, financial, legal, or tax advice. All trading decisions are made independently by the trader and at their own discretion.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-[#0b0b0f] mb-1">Voluntary Participation Acknowledgment</h3>
									<p className="leading-relaxed text-sm">
										By accessing FXGENZ services, traders acknowledge that participation is voluntary, undertaken at their own risk, and not based on any expectation of guaranteed financial returns.
									</p>
								</div>
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
							className="inline-block rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
						>
							Contact Legal Team
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}

