'use client';

import Link from 'next/link';
import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardPartnerPage() {
	return (
		<main className="min-h-screen bg-[#f5f6fb]">
			<div className="p-6 md:p-8 lg:p-12">
				<div className="rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm">
					<div className="mb-6 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#0891d1] text-lg font-semibold uppercase tracking-[0.3em] text-white">
							FX
						</div>
						<h1 className={`${display.className} mb-2 text-3xl font-semibold text-[#0b0b0f]`}>
							Become a Partner
						</h1>
						<p className="mx-auto max-w-2xl text-[#37353E]/70">
							Join our partner program and earn competitive commissions by referring traders to FxGenz.
						</p>
					</div>

					<div className="mb-8 grid gap-6 md:grid-cols-3">
						<div className="rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] p-6 text-center">
							<div className={`${display.className} mb-2 text-3xl font-bold text-[#0ea5e9]`}>Up to 30%</div>
							<div className="text-sm text-[#37353E]/70">Commission rate</div>
						</div>
						<div className="rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] p-6 text-center">
							<div className={`${display.className} mb-2 text-3xl font-bold text-[#0ea5e9]`}>50K+</div>
							<div className="text-sm text-[#37353E]/70">Active partners</div>
						</div>
						<div className="rounded-xl border border-[#e5e5e5] bg-[#f9f9f9] p-6 text-center">
							<div className={`${display.className} mb-2 text-3xl font-bold text-[#0ea5e9]`}>$2M+</div>
							<div className="text-sm text-[#37353E]/70">Paid out</div>
						</div>
					</div>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Link
							href="/partner"
							className="rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#0891d1] px-8 py-3 text-center text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0ea5e9]/50"
						>
							Apply now
						</Link>
						<Link
							href="/partner"
							className="rounded-full border border-[#e5e5e5] bg-white px-8 py-3 text-center text-sm font-semibold text-[#0b0b0f] transition-all hover:bg-[#f9f9f9]"
						>
							Learn more
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}






