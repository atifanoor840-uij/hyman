export default function Programs() {
	return (
		<section id="programs" className="relative bg-white">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
				<div className="mb-10 flex items-end justify-between gap-6">
					<div>
						<h2 className="text-3xl font-semibold tracking-tight text-[#0b0b0f] md:text-4xl">
							Choose your program
						</h2>
						<p className="mt-3 max-w-2xl text-[#37353E]/70">
							Clear rules. Rapid scaling. Transparent payouts. Select a challenge tailored to your edge.
						</p>
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							name: "$25K Challenge",
							features: ["1:50 leverage", "Max DD 8%", "2-phase evaluation"],
							price: "$199",
							highlight: false,
						},
						{
							name: "$50K Challenge",
							features: ["1:75 leverage", "Max DD 8%", "2-phase evaluation"],
							price: "$349",
							highlight: true,
						},
						{
							name: "$100K Challenge",
							features: ["1:100 leverage", "Max DD 10%", "2-phase evaluation"],
							price: "$599",
							highlight: false,
						},
					].map((p) => (
						<div
							key={p.name}
							className={[
								"relative rounded-2xl border p-6",
								p.highlight
									? "border-[#7c3aed]/30 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(124,58,237,0)_25%),white]"
									: "border-black/10 bg-white",
							].join(" ")}
						>
							{p.highlight && (
								<div className="absolute -top-3 left-4 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 text-xs font-medium text-[#0b0b0f] shadow-[0_0_24px_#00f0ff]">
									Popular
								</div>
							)}
							<div className="mb-4 flex items-baseline justify-between">
								<h3 className="text-xl font-semibold text-[#0b0b0f]">{p.name}</h3>
								<div className="text-2xl font-semibold text-[#0b0b0f]">{p.price}</div>
							</div>
							<ul className="mb-6 space-y-2">
								{p.features.map((f) => (
									<li key={f} className="flex items-center gap-2 text-sm text-[#37353E]">
										<span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" />
										{f}
									</li>
								))}
							</ul>
							<button
								className={[
									"w-full rounded-full px-5 py-3 text-sm font-semibold transition",
									p.highlight
										? "bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-[#0b0b0f]"
										: "border border-black/10 bg-white text-[#0b0b0f] hover:bg-black/5",
								].join(" ")}
							>
								Start Challenge
							</button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}




