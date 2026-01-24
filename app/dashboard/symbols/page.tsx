'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardSymbolsPage() {
	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			<div className="p-6 md:p-8 lg:p-12">
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Symbol</h1>
				<p className="mb-8 text-sm text-[#4b5563]">
					Manage and review the trading symbols that are available on your account.
				</p>

				<section className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-sm font-semibold text-[#0b0b0f]">Symbol catalogue (preview)</h2>
						<div className="flex gap-2 text-xs">
							<button className="rounded-full border border-[#e5e5e5] bg-black px-3 py-1.5 font-semibold text-white">
								All
							</button>
							<button className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 font-medium text-[#111827]">
								Majors
							</button>
							<button className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 font-medium text-[#111827]">
								Metals
							</button>
						</div>
					</div>

					<div className="h-[420px] w-full overflow-hidden rounded-xl border border-dashed border-[#e5e5e5] bg-[#f9fafb]">
						<iframe
							title="TradingView Market Quotes"
							src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview-symbols&symbol=FX:EURUSD&interval=60&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=&hideideas=1&theme=light&style=1&timezone=Etc%2FUTC&withdateranges=1&hide_side_toolbar=1&allow_symbol_change=1&watchlist=FX%3AEURUSD%2CFX%3AGBPUSD%2CFX%3AUSDJPY%2CFX%3AUSDCHF%2CFX%3AAUDUSD%2CFX%3AUSDCAD&locale=en&utm_source=&utm_medium=widget_new&utm_campaign=market-quotes"
							className="h-full w-full border-0"
							loading="lazy"
						/>
					</div>
				</section>
			</div>
		</main>
	);
}


