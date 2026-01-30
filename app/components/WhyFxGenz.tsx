import Image from "next/image";

export default function WhyFxGenz() {
	return (
		<section id="why" className="relative overflow-hidden bg-black">
			<div className="mx-auto max-w-7xl px-6 py-18 md:px-10 md:py-24">
				<header className="mb-12">
					<h2 className="font-sans text-3xl font-bold tracking-tight text-white md:text-4xl">
						Why People Choose FxGenz
					</h2>
				</header>

				{/* Large Banner Card */}
				<div
					className="mb-8 relative overflow-hidden rounded-2xl border-2 border-white/10 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				>
					<div className="absolute inset-0 bg-black/40" />
					<div className="relative flex min-h-[260px] flex-col justify-between p-6 md:min-h-[320px] md:flex-row md:items-center md:p-10">
						<div className="mb-6 max-w-xl md:mb-0">
							<div className="font-sans text-3xl font-bold tracking-tight text-white md:text-4xl">More Power, Less Risk</div>
							<div className="mt-2 text-base text-white/80 md:text-lg">Up to $200K simulated capital</div>
						</div>
						{/* Laptop Image on Right */}
						<div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 opacity-80 mix-blend-lighten pointer-events-none">
							<Image
								src="/lap.WEBP"
								alt="Laptop"
								fill
								className="object-contain drop-shadow-2xl"
								unoptimized
							/>
						</div>
					</div>
				</div>

				{/* Four Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Pillar
						icon={<SpeedIcon />}
						title="Efficient, reliable payouts"
						desc="Same‑day processing with multiple global rails, including cards and crypto, so you can access your profits quickly and predictably."
					/>
					<Pillar
						icon={<ShieldIcon />}
						title="Clear and balanced conditions"
						desc="Realistic profit targets, responsible drawdowns, and transparent policies, carefully structured to reward consistency rather than luck."
					/>
					<Pillar
						icon={<ToolsIcon />}
						title="Professional trading infrastructure"
						desc="Trade on MT5, cTrader, or TradingView with low‑latency execution, institutional liquidity, and analytics that support informed decision‑making."
					/>
					<Pillar
						icon={<ScaleIcon />}
						title="Structured scaling programs"
						desc="Progress into larger account sizes through a clear scaling framework that rewards sustained discipline and risk management."
					/>
				</div>
			</div>
		</section>
	);
}

function Pillar({ icon, title, desc, image }: { icon: React.ReactNode; title: string; desc: string; image?: string }) {
	return (
		<div className={`group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-black p-6 transition-all hover:border-white/30 hover:-translate-y-1 ${image ? 'md:col-span-2 lg:col-span-1' : ''}`}>
			<div className={`flex ${image ? 'flex-row items-center gap-6' : 'flex-col'}`}>
				<div className={image ? 'flex-1' : ''}>
					<div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white/20 bg-black text-white">
						{icon}
					</div>
					<h3 className="font-sans text-lg font-semibold tracking-tight text-white mb-2">{title}</h3>
					<p className="text-sm text-white/70 leading-relaxed">{desc}</p>
				</div>
				{image && (
					<div className="relative h-40 w-40 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5">
						<Image
							src={image}
							alt={title}
							fill
							className="object-contain"
							unoptimized
						/>
					</div>
				)}
			</div>
		</div>
	);
}

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="rounded-xl border border-[#e6e9ef] bg-white px-4 py-3">
			<div className="font-sans text-2xl font-semibold tracking-tight text-[#0b0b0f]">{value}</div>
			<div className="text-xs text-[#2e2e35]/70">{label}</div>
		</div>
	);
}

function SpeedIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 3a9 9 0 109 9h-2a7 7 0 11-7-7V3z" fill="currentColor" className="text-white" />
			<path d="M13 12l4-4" stroke="currentColor" strokeWidth="2" className="text-white" />
		</svg>
	);
}

function ShieldIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 3l8 4v5c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" className="text-white" />
		</svg>
	);
}

function ToolsIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M4 4h7v7H4V4zm9 9h7v7h-7v-7zM4 15h7v3H4v-3zm12-6h3v3h-3V9z" fill="currentColor" className="text-white" />
		</svg>
	);
}

function ScaleIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M3 17h4v4H3v-4zm7-7h4v11h-4V10zm7-6h4v17h-4V4z" fill="currentColor" className="text-white" />
		</svg>
	);
}

function PriceIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" className="text-[#0b0b0f]" />
			<path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.8" className="text-[#0b0b0f]" />
		</svg>
	);
}

function SecurityIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 3l8 4v5c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.8" className="text-[#0b0b0f]" />
			<path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" />
		</svg>
	);
}


