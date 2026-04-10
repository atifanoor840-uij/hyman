"use client";

import Image from "next/image";
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
		art: <RetryArt />,
		bullets: ["One retry per phase", "No additional cost", "Continue where you left off"],
	},
	{
		title: "Account in 2 Seconds",
		desc: "Get your funded account credentials instantly. No waiting — start trading within seconds of passing.",
		icon: <Zap className="h-6 w-6" />,
		art: <InstantArt />,
		bullets: ["Instant credentials", "Same-day access", "No approval delays"],
	},
	{
		title: "24/7 Live Chat Support",
		desc: "Real humans, real-time. Get help anytime — our support team is available around the clock.",
		icon: <MessageCircle className="h-6 w-6" />,
		art: <SupportArt />,
		bullets: ["Live chat 24/7", "Fast response times", "Dedicated support team"],
	},
	{
		title: "Fast Payouts",
		desc: "Request your profits and get paid quickly. Most payouts processed within 24–48 hours.",
		icon: <DollarSign className="h-6 w-6" />,
		art: <PayoutArt />,
		bullets: ["24–48 hour processing", "Multiple payout methods", "No hidden fees"],
	},
	{
		title: "Transparent Rules",
		desc: "Clear trading rules, no surprises. Know exactly what you can and can't do before you trade.",
		icon: <FileCheck className="h-6 w-6" />,
		art: <RulesArt />,
		bullets: ["Clear limits", "Fair conditions", "No grey areas"],
	},
	{
		title: "Secure & Verified",
		desc: "Your account and data are protected. We use industry-standard security for all traders.",
		icon: <ShieldCheck className="h-6 w-6" />,
		art: <SecureArt />,
		bullets: ["Secure platform", "Verified payouts", "Trusted by traders"],
	},
];

export default function LoyaltyPrograms() {
	return (
		<section id="loyalty" className="relative overflow-hidden bg-[#f8fafc] py-20 md:py-28">
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
						<a href="#pricing" className="inline-flex items-center justify-center rounded-full bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0284c7] hover:shadow-md">
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
								art={card.art}
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
								art={card.art}
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
	art,
	imageSrc,
	bullets,
}: {
	title: string;
	desc: string;
	icon: React.ReactNode;
	art: React.ReactNode;
	imageSrc?: string;
	bullets?: string[];
}) {
	return (
		<article className="group relative flex-shrink-0 w-[320px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cbd5e1] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
			<div className="mb-4 flex items-center gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9]/10 text-[#0284c7]">
					{icon}
				</div>
				<h3 className="font-sans text-base font-semibold tracking-tight text-[#0f172a]">{title}</h3>
			</div>
			<div className="mb-4 flex h-28 items-center justify-center overflow-hidden rounded-lg border border-[#f1f5f9] bg-[#f8fafc]">
				{imageSrc ? (
					<div className="relative h-full w-full">
						<Image
							src={imageSrc}
							alt={title}
							fill
							className="object-contain"
							sizes="(max-width: 768px) 220px, 260px"
						/>
					</div>
				) : (
					art
				)}
			</div>
			<p className="mb-4 text-[13px] leading-relaxed text-[#64748b]">{desc}</p>
			{bullets && (
				<ul className="space-y-2.5">
					{bullets.map((b) => (
						<li key={b} className="flex items-center gap-2.5 text-[13px] text-[#475569]">
							<CheckIcon />
							<span>{b}</span>
						</li>
					))}
				</ul>
			)}
		</article>
	);
}

// Art Components for benefit cards
function RetryArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<path d="M100 35v25l15-15" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d="M85 55a20 20 0 1 1 30 0" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" />
		</svg>
	);
}

function InstantArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<path d="M70 70l30-40 30 40" stroke="#0ea5e9" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="100" cy="45" r="8" fill="#0ea5e9" />
		</svg>
	);
}

function SupportArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<circle cx="100" cy="50" r="25" stroke="#0ea5e9" strokeWidth="3" fill="none" />
			<path d="M85 45c0-8 7-15 15-15s15 7 15 15" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" />
			<path d="M80 70c0 0 5 10 20 10s20-10 20-10" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" />
		</svg>
	);
}

function PayoutArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<circle cx="100" cy="55" r="28" stroke="#22c55e" strokeWidth="3" fill="none" />
			<path d="M85 55h20l-10-15 10 15-10 15" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function RulesArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<rect x="55" y="35" width="90" height="50" rx="6" stroke="#0ea5e9" strokeWidth="3" fill="none" />
			<path d="M65 50h70M65 62h50M65 74h60" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
			<path d="M80 48l5 5 10-10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</svg>
	);
}

function SecureArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#f0f9ff" />
			<path d="M100 30l-35 15v20c0 20 15 30 35 35 20-5 35-15 35-35V45l-35-15z" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinejoin="round" />
			<path d="M85 55l10 10 25-25" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</svg>
	);
}


