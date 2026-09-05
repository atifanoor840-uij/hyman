import {
	SiBitcoin,
	SiEthereum,
	SiTether,
	SiGooglepay,
	SiApplepay,
	SiAmazon,
} from "react-icons/si";
import { COMPANY, COMPANY_LINE } from "@/lib/company";

// Fixed year to avoid SSR/client hydration mismatch (date can differ by timezone)
const CURRENT_YEAR = 2025;

function SolanaIcon({ className }: { className?: string }) {
	return (
		<svg width="28" height="28" viewBox="0 0 397.7 311.7" className={className} aria-hidden>
			<path fill="#14F195" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
			<path fill="#9945FF" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
			<path fill="#14F195" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
		</svg>
	);
}

export default function Footer() {
	return (
		<footer className="relative border-t border-gray-800">
			{/* Base color matching HeroBG */}
			<div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
			<div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
				{/* Brand + Actions */}
				<div className="mb-16 flex flex-col items-start justify-between gap-10 md:flex-row md:items-start">
					<div className="max-w-md">
						<div className="flex items-center mb-4 gap-3">
							<img
								src="/logo.png"
								alt="GenzProp Logo"
								className="h-16 w-16 object-contain rounded-lg bg-white/5"
								loading="lazy"
							/>
							<div className="text-3xl font-bold tracking-tight text-white">GenzProp</div>
						</div>
						<p className="text-base leading-relaxed text-gray-400 mb-6">
							Professional trading funding platform. Trade across multiple platforms with transparent rules, competitive pricing, and lightning-fast payouts.
						</p>
						<p className="text-sm leading-relaxed text-gray-500 mb-6">
							{COMPANY.brand} is a brand operated by{" "}
							<span className="font-semibold text-gray-300">{COMPANY.legalName}</span>, a company registered in {COMPANY.country}
							{" "}(Company Registration No. {COMPANY.registrationNumber}).
						</p>
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<a href="/pricing" className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30">
								Get Funded
							</a>
						</div>
						{/* Social */}
						<div className="flex items-center gap-3">
							<SocialLink label="Facebook" href="https://facebook.com/yourpage" icon={<FacebookIcon />} />
						</div>
					</div>
					
					{/* Links Grid */}
					<div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
						<div className="space-y-4">
							<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Navigate</div>
							<ul className="space-y-3 text-sm">
								<li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors font-medium">Pricing</a></li>
								<li><a href="/rules" className="text-gray-400 hover:text-white transition-colors font-medium">Rules</a></li>
								<li><a href="/faq" className="text-gray-400 hover:text-white transition-colors font-medium">FAQ</a></li>
								<li><a href="/support" className="text-gray-400 hover:text-white transition-colors font-medium">Support</a></li>
								<li><a href="/resources" className="text-gray-400 hover:text-white transition-colors font-medium">Resources</a></li>
							</ul>
						</div>
						<div className="space-y-4">
							<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Company</div>
							<ul className="space-y-3 text-sm">
								<li><a href="/about" className="text-gray-400 hover:text-white transition-colors font-medium">About Us</a></li>
								<li><a href="/partner" className="text-gray-400 hover:text-white transition-colors font-medium">Partners</a></li>
								<li><a href="/contact" className="text-gray-400 hover:text-white transition-colors font-medium">Contact</a></li>
							</ul>
						</div>
						<div className="space-y-4">
							<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Legal</div>
							<ul className="space-y-3 text-sm">
								<li><a href="/terms" className="text-gray-400 hover:text-white transition-colors font-medium">Terms of Service</a></li>
								<li><a href="/policy" className="text-gray-400 hover:text-white transition-colors font-medium">Privacy Policy</a></li>
								<li><a href="/refund" className="text-gray-400 hover:text-white transition-colors font-medium">Refund Policy</a></li>
								<li><a href="/rules" className="text-gray-400 hover:text-white transition-colors font-medium">Trading Rules</a></li>
								<li><a href="/policy#risk-disclosure" className="text-gray-400 hover:text-white transition-colors font-medium">Risk Disclosure</a></li>
							</ul>
						</div>
					</div>
				</div>

				{/* Payment Methods — same real logos as pricing section */}
				<div className="mb-12 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
					<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Accepted Payment Methods</div>
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="USDT">
							<SiTether className="h-6 w-6 text-[#26a17b]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Bitcoin">
							<SiBitcoin className="h-6 w-6 text-[#f7931a]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Ethereum">
							<SiEthereum className="h-6 w-6 text-[#627eea]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Solana">
							<SolanaIcon className="h-6 w-6 shrink-0" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Google Pay">
							<SiGooglepay className="h-6 w-6 text-[#1a73e8]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Apple Pay">
							<SiApplepay className="h-6 w-6 text-gray-200" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Amazon Pay">
							<SiAmazon className="h-6 w-6 text-[#ff9900]" />
						</div>
					</div>
				</div>

				{/* Disclaimer */}
				<div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/30 p-6 md:p-8">
					<div className="space-y-4">
						<h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Important Disclaimers & Risk Warnings</h3>
						
						<div className="space-y-3 text-xs leading-relaxed text-gray-400">
							<p>
								<strong className="text-gray-300 font-semibold">General Disclaimer:</strong> GenzProp provides simulated trading evaluations and funding programs. All trading activities are conducted in a simulated environment and do not involve real money until you successfully pass the evaluation phase and receive funded account access. Trading involves substantial risk of loss and is not suitable for all investors.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">No Financial Advice:</strong> Nothing on this website constitutes financial, investment, trading, or legal advice. All information provided is for educational and informational purposes only. You should consult with qualified financial advisors, tax professionals, and legal counsel before making any financial decisions or participating in trading programs.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Risk of Loss:</strong> Trading in financial markets carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Past Performance:</strong> Past performance is not indicative of future results. Historical results and hypothetical performance results have certain inherent limitations. Unlike an actual performance record, simulated results do not represent actual trading. Also, since the trades have not actually been executed, the results may have under- or over-compensated for the impact, if any, of certain market factors, such as lack of liquidity. Simulated trading programs in general are also subject to the fact that they are designed with the benefit of hindsight.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Evaluation Programs:</strong> Our evaluation programs are designed to assess your trading skills and risk management capabilities. There is no guarantee that you will pass the evaluation or receive funding. Evaluation fees are non-refundable once a program is activated, except as set out in our <a href="/refund" className="text-gray-300 underline underline-offset-2 hover:text-white">Refund Policy</a> — which includes a full refund of your evaluation fee once you receive your first payout from a funded account. All trading rules, profit targets, and risk parameters must be strictly adhered to.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Regulatory Notice:</strong> GenzProp operates as a proprietary trading firm providing evaluation and funding services. We are not a broker-dealer, investment advisor, or financial institution. Our services are not regulated by financial authorities in all jurisdictions. Please ensure that our services are legal and appropriate in your jurisdiction before participating.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Market Risks:</strong> Financial markets are subject to various risks including but not limited to market volatility, liquidity risks, counterparty risks, technological failures, and regulatory changes. Market conditions can change rapidly and may result in significant losses. You may lose all or more than your initial investment.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Technology & Platform:</strong> While we strive to provide reliable trading platforms and services, we do not guarantee uninterrupted, secure, or error-free operation. Technical issues, system failures, or cyber-attacks may affect your ability to trade. We are not liable for losses resulting from technical failures beyond our reasonable control.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Account Terms:</strong> All funded accounts are subject to our terms and conditions, trading rules, and risk management policies. Violation of these terms may result in account termination. Profit splits, withdrawal terms, and account management rules are detailed in your account agreement and may be subject to change.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Tax Implications:</strong> Trading profits may be subject to taxation in your jurisdiction. It is your responsibility to understand and comply with all applicable tax laws and regulations. We recommend consulting with a qualified tax professional regarding your specific tax obligations.
							</p>
							
							<p className="pt-2 border-t border-gray-800">
								<strong className="text-gray-300 font-semibold">Acknowledgment:</strong> By using our services, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions, including this disclaimer. You confirm that you understand the risks involved in trading and that you are solely responsible for your trading decisions and their outcomes.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="flex flex-col items-start justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row md:items-center">
					<div className="space-y-1">
						<div className="text-sm text-gray-500">
							© {CURRENT_YEAR} <span className="text-white font-semibold">{COMPANY.brand}</span>. All rights reserved.
						</div>
						<div className="text-xs text-gray-500">
							{COMPANY_LINE}
						</div>
					</div>
					<div className="flex items-center gap-6 text-sm">
						<a href="/policy#cookies" className="text-gray-400 hover:text-white transition-colors font-medium">Cookie Settings</a>
						<a href="/support#status" className="text-gray-400 hover:text-white transition-colors font-medium">Status</a>
						<a href="/sitemap" className="text-gray-400 hover:text-white transition-colors font-medium">Sitemap</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
	return (
		<a
			href={href}
			aria-label={label}
			className="group inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-400 transition-all hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-110"
		>
			{icon}
		</a>
	);
}

function FacebookIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />
		</svg>
	);
}

