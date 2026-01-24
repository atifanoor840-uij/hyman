'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardWithdrawPage() {
	const [showGate, setShowGate] = useState(true);

	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			{showGate ? (
				<div className="flex min-h-screen items-center justify-center p-6 md:p-8 lg:p-12">
					<div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-xl">
						<h2 className={`${display.className} mb-2 text-lg font-semibold text-[#0b0b0f]`}>
							Complete KYC before withdrawing funds
						</h2>
						<p className="mb-4 text-xs text-[#4b5563]">
							For security and compliance, you must successfully complete KYC before requesting a payout.
							Once verified, your withdrawal options will be unlocked here.
						</p>
						<button
							onClick={() => setShowGate(false)}
							className="mt-2 w-full rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#111827]"
						>
							I understand
						</button>
					</div>
				</div>
			) : (
				<div className="p-6 md:p-8 lg:p-12">
					<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Withdraw</h1>
					<p className="mb-8 text-sm text-[#4b5563]">
						Request secure withdrawals from your funded trading accounts.
					</p>

					<div className="grid gap-6 lg:grid-cols-[1.4fr_1.2fr]">
						<section className="space-y-6">
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
									<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
										Available
									</p>
									<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>
										$0.00
									</p>
									<p className="mt-1 text-[11px] text-[#6b7280]">Ready to withdraw.</p>
								</div>
								<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
									<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
										Pending
									</p>
									<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>
										$0.00
									</p>
									<p className="mt-1 text-[11px] text-[#6b7280]">Requests under review.</p>
								</div>
								<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
									<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
										Last payout
									</p>
									<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>
										—
									</p>
									<p className="mt-1 text-[11px] text-[#6b7280]">No payouts yet.</p>
								</div>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">
									Withdrawal request (coming soon)
								</h2>
								<p className="mb-2 text-xs text-[#6b7280]">
									Here you&apos;ll choose an account, method, and amount before submitting your payout
									request.
								</p>
							</div>
						</section>

						<section className="space-y-4">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">Methods</h2>
								<p className="text-xs text-[#6b7280]">
									Once live, connected methods (bank, wallet, processors) will be listed here with
									limits and processing times.
								</p>
							</div>
							<div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white/60 p-6 text-xs text-[#6b7280]">
								Your full payout history will appear here so you can track status, reference IDs, and
								settlement dates.
							</div>
						</section>
					</div>
				</div>
			)}
		</main>
	);
}


