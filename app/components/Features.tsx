export default function Features() {
	const items = [
		{
			title: "Instant Payouts",
			desc: "Automated withdrawals with lightning processing and no hidden fees.",
		},
		{
			title: "Low Latency",
			desc: "Premium routing to Tier‑1 liquidity for precise execution.",
		},
		{
			title: "Risk Engine",
			desc: "Transparent limits, real‑time telemetry, and fair drawdown logic.",
		},
		{
			title: "Scaling Plan",
			desc: "Hit targets and scale to larger accounts with better splits.",
		},
		{
			title: "24/7 Support",
			desc: "Expert team available around the clock for pro traders.",
		},
		{
			title: "Analytics Suite",
			desc: "Advanced performance insights to refine your edge.",
		},
	];
	return (
		<section id="features" className="relative bg-white">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
				<h2 className="text-3xl font-semibold tracking-tight text-[#0b0b0f] md:text-4xl">
					Built for performance
				</h2>
				<p className="mt-3 max-w-2xl text-[#37353E]/70">
					Frictionless funding and pro‑grade execution wrapped in a modern fintech experience.
				</p>
				<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((it) => (
						<div
							key={it.title}
							className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6"
						>
							<div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#00f0ff]/15 blur-2xl transition group-hover:scale-[1.2]" />
							<div className="mb-2 text-sm font-semibold text-[#7c3aed]">{it.title}</div>
							<p className="text-sm text-[#37353E]">{it.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}




