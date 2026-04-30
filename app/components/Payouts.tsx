import {
	SiBitcoin,
	SiEthereum,
	SiTether,
	SiCircle,
	SiLitecoin,
	SiSolana,
	SiDogecoin,
	SiChase,
	SiBankofamerica,
	SiWellsfargo,
} from "react-icons/si";

const BANK_ICONS = [
	{ Icon: SiChase, name: "Chase", color: "#117aca" },
	{ Icon: SiBankofamerica, name: "Bank of America", color: "#ed1c24" },
	{ Icon: SiWellsfargo, name: "Wells Fargo", color: "#d71e28" },
];

const CRYPTO_ICONS = [
	{ Icon: SiBitcoin, name: "Bitcoin", color: "#f7931a" },
	{ Icon: SiEthereum, name: "Ethereum", color: "#627eea" },
	{ Icon: SiTether, name: "USDT", color: "#26a17b" },
	{ Icon: SiCircle, name: "USDC", color: "#2775ca" },
	{ Icon: SiLitecoin, name: "Litecoin", color: "#345d9d" },
	{ Icon: SiSolana, name: "Solana", color: "#14f195" },
	{ Icon: SiDogecoin, name: "Dogecoin", color: "#c2a633" },
];

const CRYPTO_LOOP = [...CRYPTO_ICONS, ...CRYPTO_ICONS, ...CRYPTO_ICONS, ...CRYPTO_ICONS];

export default function Payouts() {
	return (
		<section id="payouts-pro" className="relative overflow-hidden bg-slate-50/80">
			<div className="absolute inset-0 -z-10 bg-slate-50/80" />

			<div className="mx-auto max-w-7xl px-6 py-18 md:px-10 md:py-24">
				<header className="mb-12 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#2e2e35]/70">
						Fast payouts
					</div>
					<h2 className="font-sans mt-4 text-3xl font-bold tracking-tight text-[#0b0b0f] md:text-5xl">
						Payout Options for Program Graduates
					</h2>
					<p className="mx-auto mt-3 max-w-3xl text-[#2e2e35]/75">
						Eligible participants who complete our skills assessment may receive payouts per program terms. Processing timelines and methods are disclosed upfront. Educational trader development programs.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
						<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">USDC</span>
						<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">SEPA / SWIFT</span>
						<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">Instant rails</span>
						<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">Multi‑currency</span>
					</div>
				</header>

				{/* three feature cards */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card>
						<div className="rounded-2xl border border-[#dadfea] bg-gradient-to-b from-[#0d1326] to-[#0a0f22] p-6 text-white shadow-[inset_0_0_1px_rgba(255,255,255,0.06)]">
							<div className="text-[10px] uppercase tracking-wider text-white/60">Eligible balance</div>
							<div className="font-sans mt-2 text-3xl font-bold tracking-tight">$2,800.00</div>
							<button className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#5235ff] to-[#00d99f] px-4 py-2.5 text-sm font-semibold text-[#0b0b0f] transition hover:opacity-90">
								Request Payout
							</button>
						</div>
						<h3 className="font-sans mt-5 text-lg font-semibold tracking-tight text-[#0b0b0f]">Streamlined Request Process</h3>
						<p className="mt-2 text-sm leading-relaxed text-[#2e2e35]/75">
							Initiate payouts directly from your dashboard with full visibility into processing status and estimated completion times.
						</p>
						<ul className="mt-4 space-y-2 text-xs text-[#2e2e35]/70">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>One‑click request submission</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Real‑time status tracking</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Dedicated support channel</span>
							</li>
						</ul>
					</Card>

					<Card>
						<div className="crypto-scroll-container flex h-44 items-center overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white">
							<div className="crypto-scroll-track flex items-center gap-4 px-4">
								{CRYPTO_LOOP.map(({ Icon, name, color }, i) => (
									<div
										key={`${name}-${i}`}
										className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#e6e9ef] bg-slate-50/50 p-2.5"
										title={name}
									>
										<Icon className="h-8 w-8" style={{ color }} aria-hidden />
									</div>
								))}
							</div>
						</div>
						<h3 className="font-sans mt-5 text-lg font-semibold tracking-tight text-[#0b0b0f]">Cryptocurrency Payouts</h3>
						<p className="mt-2 text-sm leading-relaxed text-[#2e2e35]/75">
							Direct payouts via <strong>USDC</strong> with transparent network fees and secure address management for instant settlement.
						</p>
						<ul className="mt-4 space-y-2 text-xs text-[#2e2e35]/70">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Network fee transparency</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Secure address book</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Multi‑chain support</span>
							</li>
						</ul>
					</Card>

					<Card>
						<div className="flex h-44 flex-wrap items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white p-6">
							{BANK_ICONS.map(({ Icon, name, color }) => (
								<div
									key={name}
									className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#e6e9ef] bg-slate-50/50 p-2.5 transition hover:scale-105"
									title={name}
								>
									<Icon className="h-8 w-8" style={{ color }} aria-hidden />
								</div>
							))}
						</div>
						<h3 className="font-sans mt-5 text-lg font-semibold tracking-tight text-[#0b0b0f]">Traditional Banking Rails</h3>
						<p className="mt-2 text-sm leading-relaxed text-[#2e2e35]/75">
							Global bank transfers through established financial networks with comprehensive coverage and predictable settlement windows.
						</p>
						<ul className="mt-4 space-y-2 text-xs text-[#2e2e35]/70">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Global coverage</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>SEPA / SWIFT networks</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-[#5235ff]">✓</span>
								<span>Multi‑currency support</span>
							</li>
						</ul>
					</Card>
				</div>

				{/* stats band */}
				<div className="mt-12 overflow-hidden rounded-2xl border border-black/20 bg-black">
					<div className="grid grid-cols-1 items-center gap-6 py-8 text-center sm:grid-cols-3">
						<BandStat value="4h" label="Average Processing Time" />
						<BandStat value="Full" label="Upfront Disclosure" />
						<BandStat value="24/7" label="Support Availability" />
					</div>
				</div>
			</div>
		</section>
	);
}

function Card({ children }: { children: React.ReactNode }) {
	return (
		<article className="group relative overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
			<div className="absolute -inset-1 -z-10 rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(82,53,255,0.10)_0deg,rgba(168,85,247,0.08)_120deg,rgba(20,184,166,0.08)_240deg,rgba(82,53,255,0.10)_360deg)] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
			{children}
		</article>
	);
}

function BankBadge({ label }: { label: string }) {
	return (
		<div className="inline-flex items-center gap-2 rounded-xl border border-[#e6e9ef] bg-white px-3 py-2 text-xs font-semibold text-[#0b0b0f]">
			<FlagIcon />
			{label}
		</div>
	);
}

function FlagIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M5 3v18" stroke="currentColor" strokeWidth="1.5" />
			<path d="M5 4h11l-2 3h5l-2 3h-8" fill="currentColor" className="text-[#5235ff]" />
		</svg>
	);
}

function CoinIcon() {
	return (
		<svg width="140" height="140" viewBox="0 0 100 100" fill="none" aria-hidden="true">
			<circle cx="50" cy="50" r="38" fill="#f5f3ff" stroke="#ddd6fe" />
			<circle cx="50" cy="50" r="26" fill="#5235ff" />
			<text x="50" y="56" textAnchor="middle" fontSize="22" fill="white" fontFamily="Arial">S</text>
		</svg>
	);
}

function UserSilhouette() {
	return (
		<svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true" className="text-[#e6e9ef]">
			<circle cx="50" cy="28" r="14" fill="currentColor" />
			<rect x="30" y="45" width="70" height="26" rx="13" fill="currentColor" />
		</svg>
	);
}

function BandStat({ value, label }: { value: string; label: string }) {
	return (
		<div className="px-6 py-4">
			<div className="font-sans text-3xl font-bold tracking-tight text-white">{value}</div>
			<div className="mt-2 text-xs font-medium text-white/90">{label}</div>
		</div>
	);
}


