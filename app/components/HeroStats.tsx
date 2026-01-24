function Laurel() {
	return (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M6.5 18c-2.2-1.4-3.5-3.7-3.5-6.5 2.3.2 4.1 1.3 5.5 3-1 1.2-1.5 2.3-2 3.5Z" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.2" strokeLinecap="round" />
			<path d="M17.5 18c2.2-1.4 3.5-3.7 3.5-6.5-2.3.2-4.1 1.3-5.5 3 1 1.2 1.5 2.3 2 3.5Z" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.2" strokeLinecap="round" />
		</svg>
	);
}

export default function HeroStats() {
	const items = [
		{ value: "3M+", labelTop: "Customers", labelBottom: "worldwide" },
		{ value: "4.8/5", labelTop: "Trustpilot", labelBottom: "rating" },
		{ value: "$450M+", labelTop: "Paid in", labelBottom: "rewards worldwide" },
		{ value: "140+", labelTop: "Countries", labelBottom: "served" },
	];
	return (
		<div className="mt-10 border-t border-white/10 pt-8">
			<div className="grid grid-cols-2 gap-8 text-center text-white/90 sm:grid-cols-4">
				{items.map((it) => (
					<div key={it.value} className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-2 text-white/70">
							<Laurel />
							<div className="text-2xl font-semibold text-white">{it.value}</div>
							<Laurel />
						</div>
						<div className="text-xs leading-tight text-white/60">
							<div>{it.labelTop}</div>
							<div>{it.labelBottom}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}




