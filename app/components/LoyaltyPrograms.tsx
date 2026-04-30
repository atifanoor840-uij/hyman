"use client";

import {
	RotateCcw,
	Zap,
	MessageCircle,
	DollarSign,
	FileCheck,
	ShieldCheck,
} from "lucide-react";

const loyaltyCards = [
	{
		title: "Free Retry",
		desc: "One free retry per evaluation phase. If you hit a rule, use your retry and continue — no extra fee.",
		icon: <RotateCcw className="h-6 w-6" />,
		bullets: ["One retry per phase", "No additional cost", "Continue where you left off"],
	},
	{
		title: "Account in 2 Seconds",
		desc: "Get your funded account credentials instantly. No waiting — start trading within seconds of passing.",
		icon: <Zap className="h-6 w-6" />,
		bullets: ["Instant credentials", "Same-day access", "No approval delays"],
	},
	{
		title: "24/7 Live Chat Support",
		desc: "Real humans, real-time. Get help anytime — our support team is available around the clock.",
		icon: <MessageCircle className="h-6 w-6" />,
		bullets: ["Live chat 24/7", "Fast response times", "Dedicated support team"],
	},
	{
		title: "Fast Payouts",
		desc: "Request your profits and get paid quickly. Most payouts processed within 24–48 hours.",
		icon: <DollarSign className="h-6 w-6" />,
		bullets: ["24–48 hour processing", "Multiple payout methods", "No hidden fees"],
	},
	{
		title: "Transparent Rules",
		desc: "Clear trading rules, no surprises. Know exactly what you can and can't do before you trade.",
		icon: <FileCheck className="h-6 w-6" />,
		bullets: ["Clear limits", "Fair conditions", "No grey areas"],
	},
	{
		title: "Secure & Verified",
		desc: "Your account and data are protected. We use industry-standard security for all traders.",
		icon: <ShieldCheck className="h-6 w-6" />,
		bullets: ["Secure platform", "Verified payouts", "Trusted by traders"],
	},
];

export default function LoyaltyPrograms() {
	return (
		<section id="loyalty" className="relative overflow-hidden bg-white py-20 md:py-28">
			{/* Aura background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.20),transparent_60%)] blur-2xl" />
				<div className="absolute -bottom-28 -left-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_60%)] blur-2xl" />
				<div className="absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.14),transparent_60%)] blur-2xl" />
			</div>
			<div className="mx-auto max-w-7xl px-6 md:px-10">
				{/* Header row */}
				<div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div>
						<h2 className="font-sans text-2xl font-bold tracking-tight text-[#0b0b0f] md:text-3xl">
							Why Trade with GenzProp
						</h2>
						<p className="mt-1 text-sm text-[#64748b]">
							Professional benefits for serious traders.
						</p>
					</div>
					<div className="flex gap-3">
						<a
							href="#pricing"
							className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 hover:shadow-md"
						>
							Start evaluation →
						</a>
						<a href="#" className="inline-flex items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:border-[#cbd5e1] hover:bg-slate-50">
							Learn more
						</a>
					</div>
				</div>

				{/* Infinite Scrolling Carousel */}
				<div className="relative overflow-hidden">
					<div className="flex animate-scroll gap-6 py-1">
						{/* First set of cards */}
						{loyaltyCards.map((card, index) => (
							<LoyaltyCard
								key={`first-${index}`}
								title={card.title}
								desc={card.desc}
								icon={card.icon}
								bullets={card.bullets}
							/>
						))}
						{/* Duplicate set for seamless loop */}
						{loyaltyCards.map((card, index) => (
							<LoyaltyCard
								key={`second-${index}`}
								title={card.title}
								desc={card.desc}
								icon={card.icon}
								bullets={card.bullets}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function CheckIcon() {
	return (
		<svg className="h-4 w-4 shrink-0 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
		</svg>
	);
}

function LoyaltyCard({
	title,
	desc,
	icon,
	bullets,
}: {
	title: string;
	desc: string;
	icon: React.ReactNode;
	bullets?: string[];
}) {
	return (
		<article className="group relative flex-shrink-0 w-[320px] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
			{/* Aura */}
			<div className="pointer-events-none absolute -inset-1 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100">
				<div className="absolute inset-0 rounded-[18px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(168,85,247,0.18)_0deg,rgba(147,51,234,0.14)_120deg,rgba(16,185,129,0.16)_240deg,rgba(168,85,247,0.18)_360deg)]" />
			</div>
			<div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(80%_60%_at_30%_0%,rgba(168,85,247,0.10),transparent_60%)]" />
			<div className="relative">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-900 shadow-sm">
						<span className="text-purple-600">{icon}</span>
					</div>
					<h3 className="font-sans text-base font-semibold tracking-tight text-slate-900">{title}</h3>
				</div>
				<p className="mb-4 text-[13px] leading-relaxed text-slate-600">{desc}</p>
			{bullets && (
				<ul className="space-y-2.5">
					{bullets.map((b) => (
						<li key={b} className="flex items-center gap-2.5 text-[13px] text-slate-700">
							<CheckIcon />
							<span>{b}</span>
						</li>
					))}
				</ul>
			)}
				<div className="mt-5 h-px w-full bg-gradient-to-r from-slate-200/0 via-slate-200/80 to-slate-200/0" />
			</div>
		</article>
	);
}
