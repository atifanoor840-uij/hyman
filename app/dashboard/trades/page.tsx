'use client';

import { Inter, Poppins } from 'next/font/google';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const recentTrades = [
	{ pair: 'EUR/USD', type: 'Buy', volume: '1.5 Lots', price: '1.0850', profit: '+$245.50', time: '2 min ago', status: 'win' },
	{ pair: 'GBP/USD', type: 'Sell', volume: '2.0 Lots', price: '1.2650', profit: '-$120.00', time: '15 min ago', status: 'loss' },
	{ pair: 'USD/JPY', type: 'Buy', volume: '1.0 Lot', price: '149.50', profit: '+$180.25', time: '32 min ago', status: 'win' },
	{ pair: 'AUD/USD', type: 'Buy', volume: '0.5 Lots', price: '0.6750', profit: '+$95.00', time: '1 hour ago', status: 'win' },
	{ pair: 'XAU/USD', type: 'Sell', volume: '0.3 Lots', price: '2,045.00', profit: '+$320.75', time: '2 hours ago', status: 'win' },
];

export default function DashboardTradesPage() {
	return (
		<main className={`min-h-screen bg-[#f5f6fb] ${bodyFont.className}`}>
			<div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
				<div
					className="mb-6 h-28 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-sm"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				/>
				<section className="mb-8 rounded-2xl border border-[#e5e5e5] bg-white px-6 py-8 shadow-sm md:px-10">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className={`${display.className} text-3xl font-semibold text-[#0b0b0f]`}>
								Trading activity
							</h1>
							<p className="mt-2 text-sm text-[#4b5563]">
								Review your latest executions, win rate, and P&amp;L across all funded accounts.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<button className="inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#020617]">
								Export history
							</button>
							<button className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-xs font-semibold text-[#0b0b0f] hover:border-[#0ea5e9] hover:text-[#0ea5e9]">
								Filter trades
							</button>
						</div>
					</div>
				</section>

				<section className="space-y-6">
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-[#64748b]">Closed P&amp;L</p>
							<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>+ $2,340.50</p>
							<p className="mt-1 text-xs font-semibold text-emerald-600">8.2% vs previous day</p>
						</div>
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-[#64748b]">Win rate</p>
							<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>68.5%</p>
							<p className="mt-1 text-xs text-[#64748b]">Last 100 trades</p>
						</div>
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-[#64748b]">Open exposure</p>
							<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>$45,800</p>
							<p className="mt-1 text-xs text-[#64748b]">Across 12 active positions</p>
						</div>
					</div>

					<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h2 className={`${display.className} text-xl font-semibold text-[#0b0b0f]`}>Recent trades</h2>
							<span className="text-xs font-medium text-[#64748b]">
								{recentTrades.length} latest executions
							</span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-[#e5e5e5] bg-[#f9fafb]">
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											Pair
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											Side
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											Volume
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											Entry
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											Result
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
											When
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#e5e5e5]">
									{recentTrades.map((trade, idx) => (
										<tr key={idx} className="transition-colors hover:bg-[#f9fafb]">
											<td className="px-4 py-3 text-sm font-medium text-[#0b0b0f]">{trade.pair}</td>
											<td className="px-4 py-3">
												<span
													className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
														trade.type === 'Buy'
															? 'bg-emerald-50 text-emerald-700'
															: 'bg-rose-50 text-rose-700'
													}`}
												>
													{trade.type}
												</span>
											</td>
											<td className="px-4 py-3 text-sm text-[#475569]">{trade.volume}</td>
											<td className="px-4 py-3 text-sm text-[#475569]">{trade.price}</td>
											<td
												className={`px-4 py-3 text-sm font-semibold ${
													trade.profit.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
												}`}
											>
												{trade.profit}
											</td>
											<td className="px-4 py-3 text-sm text-[#94a3b8]">{trade.time}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}


