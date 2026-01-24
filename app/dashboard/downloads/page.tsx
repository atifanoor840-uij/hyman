'use client';

import { Poppins } from 'next/font/google';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const downloads = [
	{
		name: 'MT4 Platform Setup Guide',
		type: 'PDF',
		size: '2.4 MB',
		accent: 'from-black to-neutral-700',
		date: 'Dec 15, 2024',
	},
	{
		name: 'Trading Strategy Templates',
		type: 'ZIP',
		size: '5.8 MB',
		accent: 'from-black to-neutral-700',
		date: 'Dec 10, 2024',
	},
	{
		name: 'Risk Management Calculator',
		type: 'XLSX',
		size: '1.2 MB',
		accent: 'from-black to-neutral-700',
		date: 'Dec 5, 2024',
	},
	{
		name: 'Market Analysis Report Q4',
		type: 'PDF',
		size: '3.1 MB',
		accent: 'from-black to-neutral-700',
		date: 'Nov 28, 2024',
	},
	{
		name: 'Platform Comparison Chart',
		type: 'PDF',
		size: '1.9 MB',
		accent: 'from-black to-neutral-700',
		date: 'Nov 20, 2024',
	},
];

export default function DashboardDownloadsPage() {
	return (
		<main className="min-h-screen bg-[#f5f6fb]">
			<div className="p-6 md:p-8 lg:p-12">
				<div
					className="mb-6 h-28 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-sm"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				/>
				<h1 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>Downloads</h1>
				<p className="mb-6 text-sm text-[#37353E]/80">
					Access your purchased resources, platform guides, and analysis reports.
				</p>

				<div className="space-y-3">
					{downloads.map((file) => (
						<div
							key={file.name}
							className="group flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#0ea5e9] hover:shadow-md"
						>
							<div className="flex items-center gap-4">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${file.accent} text-xs font-semibold uppercase tracking-widest text-white`}
								>
									{file.type}
								</div>
								<div>
									<h2 className="mb-1 font-semibold text-[#0b0b0f]">{file.name}</h2>
									<div className="flex items-center gap-3 text-sm text-[#37353E]/70">
										<span>{file.size}</span>
										<span>•</span>
										<span>{file.date}</span>
									</div>
								</div>
							</div>
							<button className="rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#0891d1] px-6 py-2.5 text-sm font-semibold text-white opacity-0 transition-all hover:shadow-lg hover:shadow-[#0ea5e9]/50 group-hover:opacity-100">
								Download
							</button>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}


