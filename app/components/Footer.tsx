const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="relative border-t border-gray-800">
			{/* Base color matching HeroBG */}
			<div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
			<div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
				{/* Brand + Actions */}
				<div className="mb-16 flex flex-col items-start justify-between gap-10 md:flex-row md:items-start">
					<div className="max-w-md">
						<div className="text-3xl font-bold tracking-tight text-white mb-4">FxGenz</div>
						<p className="text-base leading-relaxed text-gray-400 mb-6">
							Professional trading funding platform. Trade across multiple platforms with transparent rules, competitive pricing, and lightning-fast payouts.
						</p>
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<a href="/pricing" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
								Get Funded
							</a>
							<a href="/social" className="inline-flex items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-semibold text-white hover:border-gray-600 hover:bg-gray-800 transition-all">
								Join Discord
							</a>
						</div>
						{/* Social */}
						<div className="flex items-center gap-3">
							<SocialLink label="Twitter" href="/social" icon={<TwitterIcon />} />
							<SocialLink label="Discord" href="/social" icon={<DiscordIcon />} />
							<SocialLink label="LinkedIn" href="/social" icon={<LinkedInIcon />} />
							<SocialLink label="YouTube" href="/social" icon={<YouTubeIcon />} />
						</div>
					</div>
					
					{/* Links Grid */}
					<div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
						<div className="space-y-4">
							<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Navigate</div>
							<ul className="space-y-3 text-sm">
								<li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors font-medium">Pricing</a></li>
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
								<li><a href="/blog" className="text-gray-400 hover:text-white transition-colors font-medium">Blog</a></li>
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

				{/* Payment Methods */}
				<div className="mb-12 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
					<div className="text-sm font-bold uppercase tracking-wider text-white mb-4">Accepted Payment Methods</div>
					<div className="flex flex-wrap items-center gap-4">
						<PayIcon label="Visa"><VisaIcon /></PayIcon>
						<PayIcon label="Mastercard"><MastercardIcon /></PayIcon>
						<PayIcon label="Amex"><AmexIcon /></PayIcon>
						<PayIcon label="Bitcoin"><BitcoinIcon /></PayIcon>
						<PayIcon label="USDT"><UsdtIcon /></PayIcon>
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

function PayIcon({ children, label }: { children: React.ReactNode; label: string }) {
	return (
		<div className="group inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-xs font-semibold text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800 hover:text-white hover:scale-105">
			{children}
			<span>{label}</span>
		</div>
	);
}

function TwitterIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M21 5.5c-.7.3-1.4.5-2.1.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.6.8-2.4 1-1.4-1.4-3.7-1.4-5.1 0-1.4 1.4-1.4 3.6 0 5.1-2.7-.1-5.2-1.4-6.9-3.6-.9 1.6-.4 3.6 1.1 4.6-.6 0-1.2-.2-1.7-.5 0 1.9 1.3 3.6 3.2 4-.6.2-1.3.2-1.9.1.5 1.6 2 2.8 3.8 2.8C7.8 19 6 19.6 4 19.4c1.9 1.2 4.2 1.9 6.6 1.7 7.9-.5 11.7-6.8 11.2-12.8.8-.6 1.5-1.3 2-2.1-.7.3-1.5.6-2.3.7z" fill="currentColor" />
		</svg>
	);
}

function DiscordIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M20 4.5A16.4 16.4 0 0015.5 3l-.6 1.2a13 13 0 00-5.8 0L8.5 3C7.2 3.2 5.9 3.6 4.7 4.2 2.6 7.3 2 10.4 2.2 13.4c1.8 1.3 3.6 2.1 5.4 2.6l.7-1.6c.2 0 .5.1.8.2a13 13 0 005.8 0l.8-.2.6 1.6c1.9-.5 3.7-1.3 5.5-2.6.2-3-.4-6.1-2.8-8.9zM9.8 13.1c-.8 0-1.5-.7-1.5-1.6s.7-1.6 1.5-1.6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6zm4.5 0c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.5.7 1.5 1.6-.7 1.6-1.5 1.6z" fill="currentColor" />
		</svg>
	);
}

function LinkedInIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.85-2.05 3.81-2.05 4.07 0 4.83 2.68 4.83 6.16V23h-4v-6.65c0-1.58-.03-3.6-2.19-3.6-2.19 0-2.52 1.71-2.52 3.49V23h-4V8z" fill="currentColor" />
		</svg>
	);
}

function YouTubeIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
			<path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.1 3.5 12 3.5 12 3.5s-7.1 0-9.4.6A3 3 0 00.5 6.2 31.1 31.1 0 000 12a31.1 31.1 0 00.5 5.8 3 3 0 002.1 2.1c2.3.6 9.4.6 9.4.6s7.1 0 9.4-.6a3 3 0 002.1-2.1 31.1 31.1 0 00.5-5.8 31.1 31.1 0 00-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z" fill="currentColor" />
		</svg>
	);
}

function VisaIcon() {
	return (
		<svg width="28" height="18" viewBox="0 0 36 24" fill="none" aria-hidden="true">
			<rect width="36" height="24" rx="4" fill="currentColor" className="text-white/10" />
			<path d="M9 16h2l1.5-8H10L9 16zm6.5 0l1.8-8H20l-1.8 8h-2.7zm8.5-4.7c-.1-1.9 1.6-2.8 3.8-2.8 1 0 1.8.2 2.4.4l-.4 1.9c-.6-.3-1.3-.5-2.2-.5-1.2 0-2 .5-2 1.2 0 .6.7 1 1.7 1.5 1.6.7 2.3 1.6 2.3 2.8 0 2-1.8 3.2-4.4 3.2-1 0-2-.2-2.6-.4l.4-1.9c.7.3 1.6.5 2.6.5 1.2 0 2.1-.5 2.1-1.3 0-.6-.5-.9-1.6-1.4-1.6-.7-2.1-1.6-2.1-2.7z" fill="currentColor" className="text-white/80" />
		</svg>
	);
}

function MastercardIcon() {
	return (
		<svg width="28" height="18" viewBox="0 0 36 24" fill="none" aria-hidden="true">
			<rect width="36" height="24" rx="4" fill="currentColor" className="text-white/10" />
			<circle cx="16" cy="12" r="6" fill="currentColor" className="text-white/80" />
			<circle cx="20" cy="12" r="6" fill="currentColor" className="text-white/50" />
		</svg>
	);
}

function AmexIcon() {
	return (
		<svg width="28" height="18" viewBox="0 0 36 24" fill="none" aria-hidden="true">
			<rect width="36" height="24" rx="4" fill="currentColor" className="text-white/10" />
			<rect x="6" y="6" width="24" height="12" rx="2" fill="currentColor" className="text-white/15" />
			<path d="M9 15h2l.7-2h2.6l.7 2h2l-2.1-6h-1.9L9 15zm9.3 0h4.5c1.6 0 2.2-.7 2.2-1.6 0-.7-.4-1.1-1-1.3.5-.2.9-.6.9-1.3 0-.8-.6-1.5-2-1.5h-4.6V15zm2-3.6v-1.2h2.1c.5 0 .8.2.8.6s-.3.6-.8.6h-2.1zm0 2.3v-1.3h2.2c.6 0 .9.2.9.7s-.3.6-.9.6h-2.2z" fill="currentColor" className="text-white/70" />
		</svg>
	);
}

function BitcoinIcon() {
	return (
		<svg width="28" height="18" viewBox="0 0 36 24" fill="none" aria-hidden="true">
			<rect width="36" height="24" rx="4" fill="currentColor" className="text-white/10" />
			<path d="M22.7 11.8c.8-.5 1.2-1.3 1.1-2.2-.2-1.7-1.9-2.4-3.9-2.6V5h-1.6v1.9H16V5h-1.6v1.9H12v1.6h2.4V16H12v1.6h2.4V20H16v-2.3h2.2V20h1.6v-2.4c2.5-.1 4.1-1 4.3-2.8.2-1.1-.3-2-1.4-2.6zM18.2 9.2h1.8c1.1 0 1.8.4 1.9 1.1.1.7-.4 1.2-1.5 1.3h-2.2V9.2zm1.9 5.9h-1.9v-2.6h2.1c1.2 0 1.9.4 2 .1.2.9-.5 1.4-2.2 1.5z" fill="currentColor" className="text-white/80" />
		</svg>
	);
}

function UsdtIcon() {
	return (
		<svg width="28" height="18" viewBox="0 0 36 24" fill="none" aria-hidden="true">
			<rect width="36" height="24" rx="4" fill="currentColor" className="text-white/10" />
			<path d="M18 7c3.7 0 6.6.5 6.6 1.1 0 .6-2.9 1.1-6.6 1.1s-6.6-.5-6.6-1.1C11.4 7.5 14.3 7 18 7zm1.2 2.8V10c2.9-.2 4.9-.7 4.9-1.3 0-.1 0-.1-.1-.2 1.9.3 3.1.8 3.1 1.4 0 .8-3.3 1.5-7.5 1.6v4.9h-3.2v-4.9c-4.2-.1-7.5-.8-7.5-1.6 0-.6 1.2-1.1 3.1-1.4 0 .1-.1.1-.1.2 0 .6 2 .1 4.9 1.3v-.2H19.2z" fill="currentColor" className="text-white/80" />
		</svg>
	);
}


