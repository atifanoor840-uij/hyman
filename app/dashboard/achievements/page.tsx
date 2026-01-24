'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const certificates = [
	{
		id: 'cert-001',
		title: 'Evaluation Passed – 100K Challenge',
		date: 'Jan 15, 2025',
		description: 'Successfully completed the FxGenz 100K evaluation with all rules respected.',
	},
	{
		id: 'cert-002',
		title: 'First Payout – 50K Account',
		date: 'Feb 2, 2025',
		description: 'Received first payout while maintaining risk parameters.',
	},
];

export default function DashboardAchievementsPage() {
	return (
		<main className="min-h-screen bg-[#f5f5f5]">
			<div className="p-6 md:p-8 lg:p-12">
				<div
					className="mb-8 h-28 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-sm"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				/>
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Achievements</h1>
				<p className="mb-8 text-sm text-[#4b5563]">
					View certificates earned for passed evaluations and milestones. You can preview and download each
					certificate.
				</p>

				<section className="grid gap-6 lg:grid-cols-3">
					{certificates.map((cert) => (
						<div
							key={cert.id}
							className="flex flex-col rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm"
						>
							<div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-[#e5e5e5] bg-gradient-to-br from-[#f9fafb] via-white to-[#e5e7eb]">
								<div className="w-full px-4 text-[10px]">
									<div className="mb-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
										<span>FxGenz</span>
										<span>Certificate</span>
									</div>
									<div className={`${display.className} text-[11px] font-semibold text-[#111827]`}>
										{cert.title}
									</div>
									<div className="mt-1 text-[9px] text-[#6b7280]">Issued: {cert.date}</div>
								</div>
							</div>
							<h2 className={`${display.className} text-sm font-semibold text-[#0b0b0f]`}>{cert.title}</h2>
							<p className="mt-1 text-[11px] text-[#6b7280]">{cert.date}</p>
							<p className="mt-2 flex-1 text-xs text-[#4b5563]">{cert.description}</p>
							<div className="mt-3 flex gap-2 text-[11px] font-semibold">
								<button className="flex-1 rounded-full border border-[#e5e5e5] bg-white px-3 py-2 text-[#111827] hover:bg-[#f3f4f6]">
									View
								</button>
								<button className="flex-1 rounded-full bg-black px-3 py-2 text-white hover:bg-[#111827]">
									Download
								</button>
							</div>
						</div>
					))}
				</section>
			</div>
		</main>
	);
}


