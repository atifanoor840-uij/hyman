'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardLiveGraphPage() {
	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			<div className="p-6 md:p-8 lg:p-12">
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Live Graph</h1>
				<p className="mb-8 text-sm text-[#4b5563]">Monitor live price action for your key instruments.</p>

				<section className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
					<div className="h-[420px] w-full overflow-hidden rounded-xl border border-dashed border-[#e5e5e5] bg-[#f9fafb]">
						<iframe
							title="TradingView Live Chart"
							src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview-livechart&symbol=FX:EURUSD&interval=60&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=&hideideas=1&theme=light&style=1&timezone=Etc%2FUTC&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&locale=en&utm_source=&utm_medium=widget_new&utm_campaign=chart"
							className="h-full w-full border-0"
							loading="lazy"
						/>
					</div>
				</section>
			</div>
		</main>
	);
}


