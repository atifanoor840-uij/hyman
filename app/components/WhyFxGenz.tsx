import Image from "next/image";
import Link from "next/link";

export default function WhyFxGenz() {
	return (
		<section id="why" className="relative overflow-hidden bg-black">
			<div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 font-display">
				{/* Section heading at top (red circle area) - subheading + main heading */}
				<header className="mb-10 lg:mb-12">
					<p className="text-sm text-white/60 mb-1">/ Why Fx Genz?</p>
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
						Why Traders Choose Fx Genz Trader Development Programs
					</h2>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
					{/* Left: image with heading/subheading overlay + CTAs below */}
					<div className="lg:col-span-5 flex flex-col">
						<div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg mb-6">
							<Image
								src="/lap.WEBP"
								alt="FxGenz trading"
								fill
								className="object-cover"
								unoptimized
							/>
						</div>
						<div className="flex flex-wrap gap-6 mt-auto">
							<Link
								href="/signup"
								className="text-purple-400 font-semibold hover:underline inline-flex items-center gap-1"
							>
								Start skills assessment &gt;
							</Link>
							<Link
								href="/pricing"
								className="text-purple-400 font-semibold hover:underline inline-flex items-center gap-1"
							>
								View pricing &gt;
							</Link>
						</div>
					</div>

					{/* Right: four benefits with horizontal dividers (exact like reference image) */}
					<div className="lg:col-span-7 border-l border-white/10 pl-8 lg:pl-10 flex flex-col">
						<BenefitRow
							icon={<ScalePriceIcon />}
							title="Competitive pricing"
							desc="Experience quality without breaking the bank—we offer fair and competitive pricing."
						/>
						<div className="border-t border-white/10 my-5" />
						<BenefitRow
							icon={<FinancingIcon />}
							title="Easy financing"
							desc={
								<>
									Don&apos;t let budget constraints stop you—explore our hassle-free <span className="text-purple-400 font-semibold">Financing</span> options.
								</>
							}
						/>
						<div className="border-t border-white/10 my-5" />
						<BenefitRow
							icon={<CertifiedIcon />}
							title="Certified experts"
							desc="Choose FxGenz for proven excellence backed by certified professionals and pro infrastructure."
						/>
						<div className="border-t border-white/10 my-5" />
						<BenefitRow
							icon={<SatisfactionIcon />}
							title="Satisfaction Focus"
							desc={
								<>
									Don&apos;t just take our word for it—<span className="text-purple-400 font-semibold">see</span> what traders say about FxGenz.
								</>
							}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

function BenefitRow({
	icon,
	title,
	desc,
}: {
	icon: React.ReactNode;
	title: string;
	desc: React.ReactNode;
}) {
	return (
		<div className="flex gap-4">
			<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
				{icon}
			</div>
			<div>
				<h3 className="text-lg font-bold text-white">{title}</h3>
				<p className="mt-1 text-white/70 text-sm leading-relaxed">{desc}</p>
			</div>
		</div>
	);
}

function ScalePriceIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
			<path d="M12 5v14M5 9l2 2-2 2M19 9l-2 2 2 2M8 9h1a1 1 0 011 1v2a1 1 0 01-1 1H8M16 9h1a1 1 0 011 1v2a1 1 0 01-1 1h-1" />
		</svg>
	);
}

function FinancingIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
			<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
			<path d="M14 2v6h6M12 13h4M12 17h2" />
			<circle cx="17" cy="18" r="2" />
		</svg>
	);
}

function CertifiedIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
			<path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z" />
		</svg>
	);
}

function SatisfactionIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
			<circle cx="8" cy="9" r="2.5" />
			<circle cx="16" cy="9" r="2.5" />
			<path d="M6 15c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5M13 15c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5" />
			<path d="M12 19l1.5 2 3-4-4.5 2z" />
		</svg>
	);
}
