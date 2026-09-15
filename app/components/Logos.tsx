/* eslint-disable @next/next/no-img-element */
const imageLogos = [
	{ name: "Bloomberg", src: "https://upload.wikimedia.org/wikipedia/commons/5/56/Bloomberg_logo.svg" },
	{ name: "Business Insider", src: "https://upload.wikimedia.org/wikipedia/commons/1/11/Business_Insider_Logo.svg" },
	{ name: "Yahoo News", src: "https://upload.wikimedia.org/wikipedia/commons/0/07/Yahoo_news_logo.svg" },
];

// No official logos exist online for these, so they stay as styled wordmarks
const textLogos = [
	{ name: "ForexInsider", className: "font-sans text-xl font-bold tracking-tight" },
	{ name: "Pip Report", className: "font-serif text-xl font-bold italic" },
	{ name: "ForexIntel", className: "font-mono text-lg font-semibold uppercase tracking-wider" },
	{ name: "FX Bulletin", className: "font-serif text-xl font-semibold tracking-wide" },
];

export default function Logos() {
	return (
		<section className="bg-slate-50/80">
			<div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
				<div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-80 md:justify-between">
					{imageLogos.map((l) => (
						<img
							key={l.name}
							src={l.src}
							alt={l.name}
							loading="lazy"
							className="h-7 w-auto select-none opacity-60 grayscale"
						/>
					))}
					{textLogos.map((l) => (
						<div key={l.name} className={`select-none text-center text-[#37353E]/60 ${l.className}`}>
							{l.name}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
