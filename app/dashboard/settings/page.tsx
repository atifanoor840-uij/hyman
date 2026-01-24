'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardSettingsPage() {
	return (
		<main className="min-h-screen bg-[#f5f6fb]">
			<div className="p-6 md:p-8 lg:p-12">
				<div className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h1 className={`${display.className} mb-4 text-xl font-semibold text-[#0b0b0f]`}>
									Account preferences
								</h1>
								<div className="space-y-4 text-sm">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-[#0b0b0f]">Email notifications</p>
											<p className="text-xs text-[#64748b]">
												Trade confirmations, payouts, and important account updates.
											</p>
										</div>
										<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-black">
											<span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
										</button>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-[#0b0b0f]">Risk alerts</p>
											<p className="text-xs text-[#64748b]">
												Notify when drawdown or exposure exceeds your limits.
											</p>
										</div>
										<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
											<span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow" />
										</button>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className={`${display.className} mb-4 text-xl font-semibold text-[#0b0b0f]`}>
									Platform connections
								</h2>
								<div className="space-y-4 text-sm text-[#0b0b0f]">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">MetaTrader 4</p>
											<p className="text-xs text-[#64748b]">Primary funded account connection.</p>
										</div>
										<button className="rounded-full border border-[#0b0b0f] px-3 py-1.5 text-xs font-semibold text-[#0b0b0f] hover:bg-[#0b0b0f] hover:text-white">
											Manage
										</button>
									</div>
									<div className="flex items-center justify-between border-t border-dashed border-[#e5e5e5] pt-4">
										<div>
											<p className="font-medium text-[#64748b]">Connect another platform</p>
											<p className="text-xs text-[#94a3b8]">MT5, cTrader and more are supported.</p>
										</div>
										<button className="rounded-full bg-[#0b0b0f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#020617]">
											Add connection
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className={`${display.className} mb-2 text-lg font-semibold text-[#0b0b0f]`}>
									Security status
								</h2>
								<p className="mb-4 text-sm text-[#64748b]">
									Keep your account protected with up‑to‑date security controls.
								</p>
								<ul className="space-y-3 text-sm text-[#0b0b0f]">
									<li className="flex items-center justify-between">
										<span>Password</span>
										<button className="text-xs font-semibold text-[#0b0b0f] hover:underline">
											Update
										</button>
									</li>
									<li className="flex items-center justify-between">
										<span>Two‑factor authentication</span>
										<button className="text-xs font-semibold text-[#0b0b0f] hover:underline">
											Enable
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}


