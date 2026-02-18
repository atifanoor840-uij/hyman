'use client';

import { useMemo, useState, useEffect } from "react";

type Review = {
	name: string;
	title: string;
	text: string;
	rating: 3 | 4 | 5;
	date: string;
	source: "Trustpilot";
};

const REVIEWS: Review[] = [
	{ name: "Aiden P.", title: "Fast payouts and clear rules", text: "Had my first payout within 48 hours. Risk rules are transparent and easy to follow.", rating: 5, date: "2025-08-12", source: "Trustpilot" },
	{ name: "Sophia R.", title: "Great support, smooth platform", text: "Support answered within minutes on Discord. The onboarding was seamless.", rating: 5, date: "2025-07-04", source: "Trustpilot" },
	{ name: "Marcus L.", title: "Evaluation feels realistic", text: "Targets and drawdowns are fair. This actually feels achievable with discipline.", rating: 4, date: "2025-06-19", source: "Trustpilot" },
	{ name: "Emily K.", title: "Best pricing for the value", text: "Compared to others, the fees make sense given the rules and payouts.", rating: 5, date: "2025-05-29", source: "Trustpilot" },
	{ name: "Noah D.", title: "Instant funding option is legit", text: "Started trading same day. Clear limits and no hidden catches so far.", rating: 4, date: "2025-05-02", source: "Trustpilot" },
	{ name: "Zara M.", title: "Smooth experience on MT5", text: "Execution was solid, spreads reasonable. Funding process was quick.", rating: 5, date: "2025-04-17", source: "Trustpilot" },
	{ name: "Liam S.", title: "Transparent and professional", text: "Everything is explained clearly. I appreciate the consistent communication.", rating: 5, date: "2025-03-30", source: "Trustpilot" },
	{ name: "Olivia H.", title: "Swing program fits me", text: "Finally a program where holding overnight around news isn't a headache.", rating: 4, date: "2025-03-08", source: "Trustpilot" },
];

export default function TrustpilotReviews() {
	// Use fixed order for SSR to avoid hydration mismatch; shuffle only on client after mount
	const initialItems = useMemo(() => REVIEWS.slice(0, 6), []);
	const [items, setItems] = useState(initialItems);
	useEffect(() => {
		setItems([...REVIEWS].sort(() => Math.random() - 0.5).slice(0, 6));
	}, []);

	return (
		<section id="reviews" className="relative overflow-hidden bg-black">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
				{/* Header */}
				<div className="mb-16 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 mb-6">
						What traders say
					</div>
					<h2 className="font-sans text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
						Real Experiences from Real Traders
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-white/70 md:text-xl">
						Join thousands of traders who trust FxGenz for transparent rules, fast payouts, and professional support.
					</p>
					
					{/* Rating Summary */}
					<div className="mt-8 inline-flex items-center gap-4 rounded-2xl border-2 border-white/10 bg-white/5 px-8 py-4">
						<div className="flex items-center gap-2">
							<Stars rating={5} />
							<span className="text-2xl font-bold text-white">4.9</span>
							<span className="text-white/60">/5</span>
						</div>
						<div className="h-8 w-px bg-white/20"></div>
						<div className="text-sm font-semibold text-white/80">
							<span className="text-white font-bold">2,500+</span> Verified Reviews
						</div>
					</div>
				</div>

				{/* Reviews - Large Cards Layout */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{items.map((r, idx) => (
						<article 
							key={`${r.name}-${idx}`} 
							className="group relative overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
						>
							{/* Quote Icon */}
							<div className="absolute top-6 right-6 opacity-20">
								<svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-white">
									<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
									<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
								</svg>
							</div>

							{/* Content */}
							<div className="relative">
								{/* Rating */}
								<div className="mb-4">
									<Stars rating={r.rating} />
								</div>

								{/* Review Text */}
								<blockquote className="mb-6 text-lg font-semibold leading-relaxed text-white">
									"{r.text}"
								</blockquote>

								{/* Title */}
								<h3 className="mb-6 text-xl font-bold text-white">{r.title}</h3>

								{/* Author Info */}
								<div className="flex items-center justify-between border-t border-white/10 pt-6">
									<div className="flex items-center gap-4">
										<Avatar name={r.name} />
										<div>
											<div className="font-bold text-white">{r.name}</div>
											<div className="text-sm text-white/60">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
										</div>
									</div>
									<VerifiedBadge />
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function Avatar({ name }: { name: string }) {
	const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
	return (
		<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-base font-bold text-white">
			{initials}
		</div>
	);
}

function VerifiedBadge() {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle cx="12" cy="12" r="10" fill="#22c55e" />
				<path d="M8.5 12.5l2.2 2.2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			Verified
		</span>
	);
}

function Stars({ rating }: { rating: 3 | 4 | 5 }) {
	return (
		<div className="flex items-center gap-1">
			{[1, 2, 3, 4, 5].map((i) => (
				<svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M12 2l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 15.9 6.7 18l1-5.8-4.2-4.1 5.9-.9L12 2z" className={i <= rating ? "fill-yellow-400" : "fill-white/20"} />
				</svg>
			))}
		</div>
	);
}

