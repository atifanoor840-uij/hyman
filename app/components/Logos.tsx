export default function Logos() {
	return (
		<section className="bg-white">
			<div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
				<div className="grid grid-cols-2 items-center gap-8 opacity-80 sm:grid-cols-3 md:grid-cols-6">
					{["AlphaX", "PrimeFlow", "DeepRate", "VoltEdge", "AstraFX", "ClearRisk"].map((b) => (
						<div key={b} className="text-center text-sm font-semibold tracking-wide text-[#37353E]/60">
							{b}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}




