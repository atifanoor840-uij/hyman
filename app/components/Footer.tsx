import {
	SiBitcoin,
	SiTether,
	SiStripe,
	SiVisa,
	SiMastercard,
	SiGooglepay,
	SiApplepay,
	SiAmazon,
} from "react-icons/si";

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
								src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
								alt="FxGenz Logo"
								className="h-16 w-16 object-contain rounded-lg bg-white/5"
								loading="lazy"
							/>
							<div className="text-3xl font-bold tracking-tight text-white">FxGenz</div>
						</div>
						<p className="text-base leading-relaxed text-gray-400 mb-6">
							Professional trading funding platform. Trade across multiple platforms with transparent rules, competitive pricing, and lightning-fast payouts.
						</p>
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<a href="/pricing" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
								Get Funded
							</a>
							<a href="https://wa.me/yourphonenumber" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-semibold text-white hover:border-gray-600 hover:bg-gray-800 transition-all">
								Chat on WhatsApp
							</a>
						</div>
						{/* Social */}
						<div className="flex items-center gap-3">
							<SocialLink label="WhatsApp" href="https://wa.me/yourphonenumber" icon={<WhatsAppIcon />} />
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
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Solana">
							<SolanaIcon className="h-6 w-6 shrink-0" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Stripe">
							<SiStripe className="h-6 w-6 text-[#635bff]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Mastercard">
							<SiMastercard className="h-6 w-6 text-[#eb001b]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Google Pay">
							<SiGooglepay className="h-6 w-6 text-[#1a73e8]" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Apple Pay">
							<SiApplepay className="h-6 w-6 text-gray-200" />
						</div>
						<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 border border-gray-700" title="Visa">
							<SiVisa className="h-6 w-6 text-[#1a1f71]" />
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
								<strong className="text-gray-300 font-semibold">General Disclaimer:</strong> FxGenz provides simulated trading evaluations and funding programs. All trading activities are conducted in a simulated environment and do not involve real money until you successfully pass the evaluation phase and receive funded account access. Trading involves substantial risk of loss and is not suitable for all investors.
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
								<strong className="text-gray-300 font-semibold">Evaluation Programs:</strong> Our evaluation programs are designed to assess your trading skills and risk management capabilities. There is no guarantee that you will pass the evaluation or receive funding. Evaluation fees are non-refundable and do not guarantee access to a funded account. All trading rules, profit targets, and risk parameters must be strictly adhered to.
							</p>
							
							<p>
								<strong className="text-gray-300 font-semibold">Regulatory Notice:</strong> FxGenz operates as a proprietary trading firm providing evaluation and funding services. We are not a broker-dealer, investment advisor, or financial institution. Our services are not regulated by financial authorities in all jurisdictions. Please ensure that our services are legal and appropriate in your jurisdiction before participating.
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
					<div className="text-sm text-gray-500">
						© {CURRENT_YEAR} <span className="text-white font-semibold">FxGenz</span>. All rights reserved.
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
			className="group inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800/50 text-gray-400 transition-all hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 hover:scale-110"
		>
			{icon}
		</a>
	);
}

function WhatsAppIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />
		</svg>
	);
}

function FacebookIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />
		</svg>
	);
}

