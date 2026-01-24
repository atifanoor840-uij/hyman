'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function DashboardProfilePage() {
	return (
		<main className="min-h-screen bg-[#f5f6fb]">
			<div className="p-6 md:p-8 lg:p-12">
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="space-y-6 lg:col-span-2">
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
							<h1 className={`${display.className} mb-6 text-xl font-semibold text-[#0b0b0f]`}>
								Profile information
							</h1>
							<div className="space-y-4">
								<div>
									<label className="mb-2 block text-sm font-medium text-[#37353E]/70">Full name</label>
									<input
										type="text"
										defaultValue="John Doe"
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[#0b0b0f] placeholder-[#37353E]/40 focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-[#37353E]/70">Email</label>
									<input
										type="email"
										defaultValue="john.doe@example.com"
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[#0b0b0f] placeholder-[#37353E]/40 focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-[#37353E]/70">Phone</label>
									<input
										type="tel"
										defaultValue="+1 (555) 123-4567"
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[#0b0b0f] placeholder-[#37353E]/40 focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
									/>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium text-[#37353E]/70">Country</label>
									<select className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[#0b0b0f] focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20">
										<option value="us">United States</option>
										<option value="uk">United Kingdom</option>
										<option value="ca">Canada</option>
									</select>
								</div>
								<button className="w-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#0891d1] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0ea5e9]/50">
									Save changes
								</button>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0891d1]">
								<span className="text-3xl font-bold text-white">JD</span>
							</div>
							<h2 className={`${display.className} mb-1 text-xl font-semibold text-[#0b0b0f]`}>
								John Doe
							</h2>
							<p className="mb-4 text-sm text-[#37353E]/70">Professional trader</p>
							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-[#37353E]/70">Account level</span>
									<span className="font-semibold text-[#0b0b0f]">Level 3</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[#37353E]/70">Member since</span>
									<span className="font-semibold text-[#0b0b0f]">Jan 2024</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[#37353E]/70">Total trades</span>
									<span className="font-semibold text-[#0b0b0f]">1,247</span>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
							<h3 className={`${display.className} mb-4 text-lg font-semibold text-[#0b0b0f]`}>
								Security
							</h3>
							<div className="space-y-3 text-sm">
								<button className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left font-medium text-[#0b0b0f] transition-colors hover:bg-[#f9f9f9]">
									Change password
								</button>
								<button className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left font-medium text-[#0b0b0f] transition-colors hover:bg-[#f9f9f9]">
									Two‑factor authentication
								</button>
								<button className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-left font-medium text-[#0b0b0f] transition-colors hover:bg-[#f9f9f9]">
									Security settings
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}






