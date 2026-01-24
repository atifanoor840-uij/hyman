'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardRewardsPage() {
	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			<div className="p-6 md:p-8 lg:p-12">
				<div
					className="mb-8 h-32 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-sm"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				/>
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Reward Studio</h1>
				<p className="mb-8 text-sm text-[#4b5563]">
					Track your loyalty points, tiers, and benefits unlocked from consistent trading performance.
				</p>

				<div className="grid gap-6 xl:grid-cols-[1.8fr_1.4fr]">
					{/* Progress & points */}
					<section className="space-y-6">
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
							<h2 className="mb-4 text-sm font-semibold text-[#0b0b0f]">Tier progress</h2>
							<div className="mb-3 flex items-center justify-between text-xs text-[#6b7280]">
								<span>Current tier: Starter</span>
								<span>Next: Silver</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
								<div className="h-full w-1/3 bg-[#111111]" />
							</div>
							<p className="mt-3 text-xs text-[#6b7280]">
								You&apos;re 35% of the way to the next tier. As you complete evaluations and funded
								cycles, new rewards will unlock here.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
									Points
								</p>
								<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>0</p>
								<p className="mt-1 text-[11px] text-[#6b7280]">Earned from evaluations &amp; payouts.</p>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
									Unlocked perks
								</p>
								<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>0</p>
								<p className="mt-1 text-[11px] text-[#6b7280]">Perks appear as your tier increases.</p>
							</div>
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
									Next review
								</p>
								<p className={`${display.className} mt-2 text-2xl font-semibold text-[#0b0b0f]`}>—</p>
								<p className="mt-1 text-[11px] text-[#6b7280]">
									Visible once your first trading cycle is complete.
								</p>
							</div>
						</div>
					</section>

					{/* Reviews & how it works */}
					<section className="space-y-4">
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
							<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">Share your experience</h2>
							<p className="mb-3 text-xs text-[#4b5563]">
								Help other traders by leaving a review. Written and video feedback may unlock bonus
								rewards in future campaigns.
							</p>
							<div className="grid gap-3 md:grid-cols-2 text-xs text-[#111827] font-semibold">
								<button className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left hover:bg-[#f3f4f6]">
									<p className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
										Text review
									</p>
									<p className="mt-1 text-[13px]">
										Write a Trustpilot-style review about your FxGenz experience.
									</p>
								</button>
								<button className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left hover:bg-[#f3f4f6]">
									<p className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
										Video review
									</p>
									<p className="mt-1 text-[13px]">
										Record or upload a short video sharing your trading journey.
									</p>
								</button>
							</div>
						</div>

						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
							<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">How rewards work</h2>
							<ul className="space-y-2 text-xs text-[#4b5563]">
								<li>• Trade consistently and pass evaluations to earn points.</li>
								<li>• Points accumulate towards higher tiers and better payouts.</li>
								<li>• Future perks include fee discounts and priority support.</li>
							</ul>
						</div>

						<div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white/60 p-6 text-xs text-[#6b7280]">
							No reward activity yet. Once you start trading, a timeline of points and perks will appear
							in this panel.
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}


