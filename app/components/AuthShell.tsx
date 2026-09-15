import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const HIGHLIGHTS = [
	'Payouts processed within 24–48 hours',
	'One free retry per evaluation phase',
	'Funded account credentials in seconds',
	'Real humans on live chat, 24/7',
];

/** Split-screen frame shared by login and signup. */
export default function AuthShell({
	title,
	subtitle,
	children,
	footer,
	wide = false,
}: {
	title: string;
	subtitle: string;
	children: ReactNode;
	footer?: ReactNode;
	wide?: boolean;
}) {
	return (
		<div className="flex min-h-screen bg-white text-[#0b1020]">
			{/* Brand panel */}
			<aside className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-[#0b1020] p-10 text-white lg:flex xl:p-14">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(82,53,255,0.45),transparent_65%)]" />
					<div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,217,159,0.18),transparent_65%)]" />
					<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
				</div>

				<Link href="/" className="relative flex w-fit items-center gap-3">
					<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
						<Image src="/logo.png" alt="" width={30} height={30} className="object-contain" />
					</span>
					<span className="text-xl font-semibold tracking-tight">GenzProp</span>
				</Link>

				<div className="relative">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a89bff]">Trader workspace</p>
					<h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
						Trade with discipline. Get funded with confidence.
					</h2>
					<ul className="mt-8 space-y-3.5">
						{HIGHLIGHTS.map((item) => (
							<li key={item} className="flex items-center gap-3 text-[15px] text-slate-300">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5235ff]/25 ring-1 ring-[#7c6bff]/40">
									<Check className="h-3.5 w-3.5 text-[#a89bff]" strokeWidth={3} />
								</span>
								{item}
							</li>
						))}
					</ul>

					{/* Product preview card */}
					<div className="mt-10 max-w-sm rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phase 1 · Evaluation</span>
							<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
							</span>
						</div>
						<div className="mt-3 flex items-end justify-between">
							<span className="text-2xl font-semibold tabular-nums">$50,000</span>
							<span className="text-sm text-slate-400">Profit target 8%</span>
						</div>
						<div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
							<div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#5235ff] to-[#00d99f]" />
						</div>
					</div>
				</div>

				<p className="relative text-xs text-slate-500">© {CURRENT_YEAR} GenzProp. All rights reserved.</p>
			</aside>

			{/* Form panel */}
			<main className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center justify-between px-6 py-5 sm:px-10">
					<Link href="/" className="flex items-center gap-2.5 lg:hidden">
						<Image src="/logo.png" alt="GenzProp" width={32} height={32} className="object-contain" />
						<span className="text-lg font-semibold tracking-tight">GenzProp</span>
					</Link>
					<Link
						href="/"
						className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-[#0b1020]"
					>
						<ArrowLeft className="h-4 w-4" /> Back to site
					</Link>
				</div>

				<div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
					<div className={`w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'}`}>
						<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
						<p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>
						<div className="mt-8">{children}</div>
						{footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
					</div>
				</div>
			</main>
		</div>
	);
}

/** Shared input styling for auth forms. */
export const authFieldClass = (hasError?: boolean) =>
	`flex items-center gap-3 rounded-xl border bg-white px-4 h-12 transition-all focus-within:border-[#5235ff] focus-within:ring-4 focus-within:ring-[#5235ff]/10 ${
		hasError ? 'border-red-300 bg-red-50/40 focus-within:border-red-400 focus-within:ring-red-500/10' : 'border-slate-200 hover:border-slate-300'
	}`;

export const authInputClass =
	'flex-1 min-w-0 bg-transparent text-[15px] text-[#0b1020] placeholder:text-slate-400 outline-none';

export const authLabelClass = 'block text-sm font-medium text-slate-700';

export const authPrimaryButtonClass =
	'w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#5235ff] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(82,53,255,0.55)] transition hover:bg-[#4527f0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5235ff]/30 disabled:cursor-not-allowed disabled:opacity-60';
