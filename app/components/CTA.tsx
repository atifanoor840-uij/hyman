import Link from "next/link";

export default function CTA() {
	return (
		<section className="relative bg-slate-50/80">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
				<div className="relative overflow-hidden rounded-3xl border border-black/10 p-8 sm:p-12">
					<div className="pointer-events-none absolute -inset-40 rounded-[40px] bg-gradient-to-r from-[#00f0ff]/30 to-[#7c3aed]/30 blur-3xl" />
					<div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-2xl font-semibold text-[#0b0b0f] sm:text-3xl">
								Get funded and trade like a pro
							</h3>
							<p className="mt-2 max-w-xl text-[#37353E]/70">
								Start your challenge today and unlock institutional-grade capital with premium support.
							</p>
						</div>
						<Link
							href="#programs"
							className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] px-6 py-3 text-sm font-semibold text-[#0b0b0f]"
						>
							Start now
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}




