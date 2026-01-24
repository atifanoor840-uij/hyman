import { Poppins } from "next/font/google";

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
});

const VIDEOS = [
	{ id: "1", title: "€5,000 Payout — Same Day", src: "https://www.youtube.com/embed/ysz5S6PUM-U" },
	{ id: "2", title: "Scaling To €25,000", src: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
	{ id: "3", title: "Weekend Withdrawal Proof", src: "https://www.youtube.com/embed/1La4QzGeaaQ" },
];

export default function PayoutVideos() {
	return (
		<section id="payouts" className="bg-white">
			<div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
				<header className="mb-8 flex items-end justify-between gap-4">
					<div>
						<h2 className={`${display.className} text-3xl font-semibold tracking-[-0.02em] text-[#0b0b0f] md:text-4xl`}>
							Real payout videos
						</h2>
						<p className="mt-2 text-sm text-[#2e2e35]/75">Verified clips from traders receiving payouts.</p>
					</div>
					<a
						href="#"
						className="inline-flex items-center justify-center rounded-full border border-[#0b0b0f]/15 px-4 py-2 text-sm font-semibold text-[#0b0b0f] hover:bg-[#0b0b0f] hover:text-white"
						aria-label="See more payout videos"
					>
						See more
					</a>
				</header>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{VIDEOS.map((v) => (
						<article key={v.id} className="overflow-hidden rounded-2xl border border-[#0b0b0f]/10 bg-white shadow-sm">
							<div className="relative aspect-video w-full">
								<iframe
									className="absolute inset-0 h-full w-full"
									src={v.src}
									title={v.title}
									loading="lazy"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
								/>
							</div>
							<div className="p-4">
								<h3 className="text-sm font-semibold text-[#0b0b0f]">{v.title}</h3>
							</div>
						</article>
					))}
				</div>

				<div className="mt-8 flex justify-center">
					<a
						href="#"
						className="inline-flex items-center justify-center rounded-full bg-[#0b0b0f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17171f]"
						aria-label="See more payout videos"
					>
						See more videos
					</a>
				</div>
			</div>
		</section>
	);
}









