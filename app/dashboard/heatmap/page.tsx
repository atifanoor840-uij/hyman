'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardHeatmapPage() {
	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			<div className="p-6 md:p-8 lg:p-12">
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Heat Map</h1>
				<p className="mb-8 text-sm text-[#4b5563]">
					High-level view of market strength and volatility by asset class and symbol.
				</p>

				<div className="space-y-6">
					<section className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
						<div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
							<h2 className="text-sm font-semibold text-[#0b0b0f]">Filters</h2>
							<div className="flex flex-wrap gap-2 text-xs">
								<button className="rounded-full border border-[#e5e5e5] bg-black px-3 py-1.5 font-semibold text-white">
									All
								</button>
								<button className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 font-medium text-[#111827]">
									Forex
								</button>
								<button className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 font-medium text-[#111827]">
									Indices
								</button>
								<button className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 font-medium text-[#111827]">
									Commodities
								</button>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							{['Strong', 'Neutral', 'Weak'].map((label) => (
								<div
									key={label}
									className="rounded-xl border border-[#e5e5e5] bg-[#f9fafb] p-4 text-xs text-[#4b5563]"
								>
									<p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
										{label} basket
									</p>
									<p className="text-[11px]">
										Placeholder for aggregated symbols in the {label.toLowerCase()} group.
									</p>
								</div>
							))}
						</div>
					</section>

					<section className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
						<div className="h-[420px] w-full overflow-hidden rounded-xl border border-dashed border-[#e5e5e5] bg-[#0b1220]">
							<iframe
								title="TradingView Forex Heatmap"
								src="https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A400%2C%22currencies%22%3A%5B%5B%22EUR%22%5D%2C%5B%22USD%22%5D%2C%5B%22JPY%22%5D%2C%5B%22GBP%22%5D%2C%5B%22CHF%22%5D%2C%5B%22AUD%22%5D%2C%5B%22CAD%22%5D%2C%5B%22NZD%22%5D%5D%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22dark%22%2C%22locale%22%3A%22en%22%7D"
								className="h-full w-full border-0"
								loading="lazy"
							/>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}


