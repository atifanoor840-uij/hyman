export default function Metrics() {
	const stats = [
		{ label: "Avg. Payout Time", value: "3h 12m" },
		{ label: "Highest Split", value: "90%" },
		{ label: "Traders Funded", value: "3,200+" },
		{ label: "Latency (median)", value: "8ms" },
	];
	return (
		<section className="relative overflow-hidden">
			{/* Base color matching HeroBG */}
			<div className="absolute inset-0 bg-[#050406]" />
			<div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
					{stats.map((s) => (
						<div key={s.label} className="text-left">
							<div className="text-2xl font-semibold text-white">{s.value}</div>
							<div className="text-xs text-white/70">{s.label}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}




