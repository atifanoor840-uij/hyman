'use client';

import { Poppins } from "next/font/google";
import { ComposableMap, Geographies, Geography, Graticule } from "react-simple-maps";

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
});

const COUNTRIES = [
	{ code: "us", name: "United States" },
	{ code: "gb", name: "United Kingdom" },
	{ code: "de", name: "Germany" },
	{ code: "ae", name: "United Arab Emirates" },
	{ code: "in", name: "India" },
	{ code: "au", name: "Australia" },
	{ code: "ca", name: "Canada" },
	{ code: "sg", name: "Singapore" },
	{ code: "za", name: "South Africa" },
];

const LANGUAGES: { label: string; lang: string; dir?: 'rtl' | 'ltr'; color: string }[] = [
	{ label: 'English', lang: 'en', color: 'bg-[#e8f1ff] text-[#0b0b0f]' },
	{ label: 'العربية', lang: 'ar', dir: 'rtl', color: 'bg-[#f3f0ff] text-[#1f133a]' },
	{ label: 'Deutsch', lang: 'de', color: 'bg-[#eaf7f1] text-[#0b4030]' },
	{ label: 'हिन्दी', lang: 'hi', color: 'bg-[#fff4e6] text-[#5a3000]' },
	{ label: 'Français', lang: 'fr', color: 'bg-[#e6f7fb] text-[#12323b]' },
	{ label: 'Español', lang: 'es', color: 'bg-[#fff1f2] text-[#5a1220]' },
	{ label: 'Português', lang: 'pt', color: 'bg-[#eef6e6] text-[#203e14]' },
	{ label: '中文', lang: 'zh', color: 'bg-[#f6f6f6] text-[#222222]' },
	{ label: 'Русский', lang: 'ru', color: 'bg-[#f0f4ff] text-[#152044]' },
];

export default function GlobalPresence() {
	return (
		<section id="global" className="relative overflow-hidden">
			{/* Base color matching HeroBG */}
			<div className="absolute inset-0 -z-10 bg-[#050406]" />
			{/* soft vignette */}
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(100%_60%_at_50%_0%,rgba(0,0,0,0.2),transparent)]" />

			<div className="mx-auto max-w-7xl px-6 py-18 text-white md:px-10 md:py-24">
				<div className="flex flex-col items-start gap-12 md:flex-row md:items-center md:justify-between">
					<div className="max-w-xl">
						<span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
							Global presence
						</span>
						<h2 className={`${display.className} mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl`}>
							Trusted by traders worldwide
						</h2>
						<p className="mt-3 text-sm text-white/75">
							Active community and payouts across major regions. Low-latency routing and 24/5 coverage.
						</p>

						{/* Languages supported */}
						<div className="mt-6 flex flex-wrap items-center gap-2">
							{LANGUAGES.map(({ label, lang, dir, color }) => (
								<span key={lang} lang={lang} dir={dir}
									className={`inline-flex items-center rounded-full border border-[#0b0b0f]/10 px-3 py-1 text-xs font-semibold ${color}`}>
									{label}
								</span>
							))}
						</div>

						<div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
							<span className="rounded-full border border-white/20 px-3 py-1 text-white/80">24/5 Support</span>
							<span className="rounded-full border border-white/20 px-3 py-1 text-white/80">Low latency</span>
							<span className="rounded-full border border-white/20 px-3 py-1 text-white/80">Regional payouts</span>
						</div>
					</div>

					{/* World map using react-simple-maps */}
					<div className="relative mx-auto h-64 w-full max-w-xl md:h-80">
						<WorldMap />
					</div>
				</div>

				{/* Marquee flags row */}
				<div className="mt-12">
					<div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/70">
						Operating across these regions
					</div>
					<div className="marquee rounded-xl border border-white/20 bg-white/10 py-2">
						<div className="marquee-inner gap-4 pr-4">
							<div className="flex items-center gap-4 pr-8">
								{COUNTRIES.map((c) => (
									<FlagPill key={`pill-1-${c.code}`} code={c.code} name={c.name} />
								))}
							</div>
							<div className="flex items-center gap-4 pr-8" aria-hidden="true">
								{COUNTRIES.map((c) => (
									<FlagPill key={`pill-2-${c.code}`} code={c.code} name={c.name} />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function WorldMap() {
	const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
	return (
		<ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "100%" }}>
			<Graticule stroke="rgba(255,255,255,0.1)" />
			<Geographies geography={geoUrl}>
				{({ geographies }) =>
					geographies.map((geo) => (
						<Geography
							key={geo.rsmKey}
							geography={geo}
							style={{
								default: { fill: "rgba(255,255,255,0.1)", stroke: "rgba(255,255,255,0.2)", strokeWidth: 0.5 },
								hover: { fill: "rgba(255,255,255,0.15)", outline: "none" },
								pressed: { fill: "rgba(255,255,255,0.15)", outline: "none" },
							}}
						/>
					))
				}
			</Geographies>
		</ComposableMap>
	);
}

function FlagPill({ code, name }: { code: string; name: string }) {
	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
			<img
				src={`https://flagcdn.com/w40/${code}.png`}
				alt={`${name} flag`}
				title={name}
				width={24}
				height={16}
				loading="lazy"
				style={{ display: 'block' }}
			/>
			<span className="text-xs font-semibold text-white">{name}</span>
		</div>
	);
}

