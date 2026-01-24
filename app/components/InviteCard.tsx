import { Poppins } from "next/font/google";
import Image from "next/image";

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
});

export default function InviteCard() {
	return (
		<section className="relative mx-auto max-w-7xl px-6 py-12 md:px-10">
			<div className="group relative mx-auto w-full max-w-3xl rounded-2xl border border-black/5 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-white/5">
				{/* gradient ring */}
				<div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 dark:ring-white/10" />
				<div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.35)_0deg,rgba(20,184,166,0.35)_120deg,rgba(236,72,153,0.35)_240deg,rgba(99,102,241,0.35)_360deg)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60" />

				<div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
					<div className="space-y-2">
						<h3 className={`${display.className} text-2xl font-semibold tracking-[-0.01em] text-[#0b0b0f] dark:text-white`}>Invite your network</h3>
						<p className="max-w-xl text-sm leading-relaxed text-[#2e2e35]/80 dark:text-white/70">
							Earn rewards by bringing traders from Google, Yahoo, and top news communities.
							Professional, fast, and built for scale.
						</p>
						<div className="mt-4 flex items-center gap-3">
							<a
								href="#"
								className="inline-flex items-center justify-center rounded-full bg-[#0b0b0f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17171f] dark:bg-white dark:text-[#0b0b0f] dark:hover:bg-white/90"
							>
								Get invite link
							</a>
							<a
								href="#"
								className="inline-flex items-center justify-center rounded-full border border-[#0b0b0f]/10 px-5 py-2.5 text-sm font-semibold text-[#0b0b0f] hover:bg-[#0b0b0f]/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
							>
								Learn more
							</a>
						</div>
					</div>

					{/* Moving icon cluster */}
					<div className="float-slow relative grid h-28 w-full max-w-[260px] grid-cols-3 items-center justify-items-center gap-3 md:h-28 md:w-72">
						<BrandGoogle />
						<BrandYahoo />
						<BrandNews />
						<div className="col-span-3 mt-1 flex w-full items-center justify-center gap-3">
							<Pill text="Trusted sources" />
							<Pill text="High intent" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Pill({ text }: { text: string }) {
	return (
		<span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-[#2e2e35] shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-white/80">
			{text}
		</span>
	);
}

function BrandGoogle() {
	return (
		<div className="brand-tile">
			{/* Google 'G' SVG */}
			<svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-label="Google" role="img">
				<path d="M44.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h11.5c-.5 2.8-2.1 5.2-4.6 6.8v5.6h7.4c4.3-4 6.7-9.8 6.7-16.1z" fill="#4285F4"/>
				<path d="M24 46c6 0 11.1-2 14.8-5.4l-7.4-5.6c-2.1 1.4-4.8 2.2-7.4 2.2-5.7 0-10.4-3.8-12.1-8.9H4.3v5.7C8 41.7 15.4 46 24 46z" fill="#34A853"/>
				<path d="M11.9 28.3c-.4-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3V14H4.3C2.8 17 2 20.4 2 24s.8 7 2.3 10h7.6l0-5.7z" fill="#FBBC04"/>
				<path d="M24 9.6c3.3 0 6.3 1.1 8.6 3.2l6.4-6.4C35.1 2.3 30 0 24 0 15.4 0 8 4.3 4.3 11.3L11.9 17c1.7-5.1 6.4-8.9 12.1-8.9z" fill="#EA4335"/>
			</svg>
			<span className="brand-label">Google</span>
		</div>
	);
}

function BrandYahoo() {
	return (
		<div className="brand-tile delay-150">
			{/* Yahoo! SVG */}
			<svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-label="Yahoo" role="img">
				<path d="M52.6 10l-3.7 9.9h-4.8l-2.2 5.7h4.8l-7.1 19h6.8l7.1-19h6.4l2.2-5.7h-6.4L58.2 10h-5.6zM22.3 19.6c-7.3 0-12.8 5.6-12.8 12.9 0 7.4 5.5 13 12.8 13 5.1 0 9.1-2.5 11.1-6.5l-5.6-2.3c-.8 2.2-2.8 3.5-5.4 3.5-3.4 0-6-2.6-6-6.3 0-3.6 2.6-6.2 6-6.2 2.4 0 4.4 1.2 5.3 3.2l5.5-2.3c-1.8-4.2-5.9-6.5-11-6.5z" fill="#6001D2"/>
			</svg>
			<span className="brand-label">Yahoo</span>
		</div>
	);
}

function BrandNews() {
	return (
		<div className="brand-tile delay-300">
			{/* Generic News / Newspaper icon */}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-label="News" role="img">
				<rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" className="text-[#0b0b0f] dark:text-white" />
				<rect x="6" y="7" width="7" height="3" fill="currentColor" className="text-[#0b0b0f] dark:text-white" />
				<rect x="6" y="12" width="12" height="1.5" fill="currentColor" className="text-[#0b0b0f]/80 dark:text-white/80" />
				<rect x="6" y="15" width="9" height="1.5" fill="currentColor" className="text-[#0b0b0f]/60 dark:text-white/60" />
			</svg>
			<span className="brand-label">News</span>
		</div>
	);
}


