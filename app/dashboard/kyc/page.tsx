'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardKycPage() {
	const [showGate, setShowGate] = useState(true);

	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			{showGate ? (
				<div className="flex min-h-screen items-center justify-center p-6 md:p-8 lg:p-12">
					<div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-xl">
						<h2 className={`${display.className} mb-2 text-lg font-semibold text-[#0b0b0f]`}>
							Pass your evaluation to unlock KYC
						</h2>
						<p className="mb-4 text-xs text-[#4b5563]">
							KYC becomes available once you successfully complete your evaluation. This ensures only
							qualified accounts proceed to identity verification and payouts.
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
					<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>KYC</h1>
					<p className="mb-8 text-sm text-[#4b5563]">
						Complete identity verification to unlock withdrawals and advanced account features.
					</p>

					<div className="grid gap-6 lg:grid-cols-[1.6fr_1.1fr]">
						<section className="space-y-6">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className="mb-4 text-sm font-semibold text-[#0b0b0f]">Verification status</h2>
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium text-[#111827]">Not started</span>
									<span className="rounded-full bg-[#111111] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
										Pending
									</span>
								</div>
								<p className="mt-3 text-xs text-[#6b7280]">
									When KYC is enabled, you&apos;ll be guided through document upload and review
									directly from this panel.
								</p>
							</div>

							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">What you will need</h2>
								<ul className="space-y-2 text-xs text-[#4b5563]">
									<li>• Government-issued ID (passport or national ID).</li>
									<li>• Proof of address, such as a utility bill or bank statement.</li>
									<li>• A short selfie for liveness and identity confirmation.</li>
								</ul>
							</div>
						</section>

						<section className="space-y-4">
							<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
								<h2 className="mb-3 text-sm font-semibold text-[#0b0b0f]">KYC checklist</h2>
								<ul className="space-y-2 text-xs text-[#4b5563]">
									<li>□ Confirm your personal details.</li>
									<li>□ Upload identity document.</li>
									<li>□ Upload proof of address.</li>
									<li>□ Submit verification for review.</li>
								</ul>
							</div>

							<div className="rounded-2xl border border-dashed border-[#e5e5e5] bg-white/60 p-6 text-xs text-[#6b7280]">
								Once KYC is connected, a timeline of each submission and decision will appear in this
								panel for full auditability.
							</div>
						</section>
					</div>
				</div>
			)}
		</main>
	);
}


