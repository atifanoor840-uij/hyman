"use client";

import Image from "next/image";
import { Poppins } from "next/font/google";

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
});

const loyaltyCards = [
	{
		title: "Trade",
		desc: "Each trade, profitable or losing, yields tokens based on your activity. All phases participate.",
		icon: <ChartIcon />,
		art: <ChartArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055812/topup_200x110_cruheq.png",
		bullets: ["Lots‑based accrual", "Eligible in all phases", "Daily streak bonus"],
	},
	{
		title: "Earn",
		desc: "Tokens stack up in your wallet as you progress. Higher activity unlocks higher tiers.",
		icon: <CoinsIcon />,
		art: <CoinsArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055814/earning_200x110_qsewzt.png",
		bullets: ["Tiered multipliers", "Weekly snapshots", "Wallet overview"],
	},
	{
		title: "Spend",
		desc: "Redeem tokens for free challenges, fee rebates, and payout boosts. Choose your perks.",
		icon: <CardIcon />,
		art: <CardArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055813/spend_200x110_qdyodk.png",
		bullets: ["Free tryouts", "Fee discounts", "Payout boosts"],
	},
	{
		title: "Tier Up",
		desc: "Progress through multiple tiers as your trading activity increases. Higher tiers unlock enhanced multipliers.",
		icon: <TierIcon />,
		art: <TierArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055812/topup_200x110_cruheq.png",
		bullets: ["5 progressive tiers", "Tiered multipliers", "Auto upgrades"],
	},
	{
		title: "Fee Rebates",
		desc: "Reduce your trading costs by redeeming tokens for fee discounts. The more you trade, the more you save.",
		icon: <RebateIcon />,
		art: <RebateArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055812/fee_rebate_200x110_vohvxe.png",
		bullets: ["Up to 50% reduction", "Flexible redemption", "Stack discounts"],
	},
	{
		title: "Free Challenges",
		desc: "Use accumulated tokens to access evaluation challenges at no cost. Start new funding opportunities.",
		icon: <ChallengeIcon />,
		art: <ChallengeArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055812/free_challenge_200x110_x2pizn.png",
		bullets: ["100% token-funded", "All challenge types", "No expiration"],
	},
	{
		title: "Payout Boost",
		desc: "Enhance your profit splits and payout speeds by applying token-based boosts. Maximize your earnings.",
		icon: <BoostIcon />,
		art: <BoostArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055812/topup_200x110_cruheq.png",
		bullets: ["Increased splits", "Faster processing", "Temporary boosts"],
	},
	{
		title: "Daily Streak",
		desc: "Maintain consistent trading activity to unlock daily streak multipliers. Build momentum and maximize earnings.",
		icon: <StreakIcon />,
		art: <StreakArt />,
		imageSrc: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766055814/earning_200x110_qsewzt.png",
		bullets: ["Progressive bonuses", "Weekly resets", "Multiplier caps"],
	},
];

export default function LoyaltyPrograms() {
	return (
		<section id="loyalty" className="relative overflow-hidden bg-white">
			<div className="absolute inset-0 -z-10 bg-white" />

			<div className="mx-auto max-w-7xl px-6 py-18 md:px-10 md:py-24">
				<header className="mb-8 flex items-end justify-between gap-4">
					<div>
						<div className="inline-flex items-center gap-2 rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#2e2e35]/70">
							Trade2Earn
						</div>
						<h2 className={`${display.className} mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#0b0b0f] md:text-5xl`}>
							Discover our Loyalty Program
						</h2>
						<p className="mt-3 max-w-3xl text-[#2e2e35]/75">
							Get rewarded for consistent trading—regardless of daily outcome. Earn tokens and unlock perks.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
							<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">Tokenized perks</span>
							<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">Fee rebates</span>
							<span className="rounded-full border border-[#0b0b0f]/10 bg-white px-3 py-1">Free challenges</span>
						</div>
					</div>
					<div className="hidden gap-3 sm:flex">
						<a href="#pricing" className="inline-flex items-center justify-center rounded-full bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0891d1]">
							Get funded →
						</a>
						<a href="#" className="inline-flex items-center justify-center rounded-full border border-[#0b0b0f]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0b0b0f] hover:bg-[#f6f7fb]">
							Learn more
						</a>
					</div>
				</header>

				{/* Infinite Scrolling Carousel */}
				<div className="relative overflow-hidden">
					<div className="flex animate-scroll gap-6">
						{/* First set of cards */}
						{loyaltyCards.map((card, index) => (
							<LoyaltyCard
								key={`first-${index}`}
								title={card.title}
								desc={card.desc}
								icon={card.icon}
								art={card.art}
								imageSrc={card.imageSrc}
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
								imageSrc={card.imageSrc}
								bullets={card.bullets}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
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
		<article className="group relative flex-shrink-0 w-[320px] overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
			<div className="absolute -inset-1 -z-10 rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(14,165,233,0.1)_0deg,rgba(99,102,241,0.08)_120deg,rgba(20,184,166,0.08)_240deg,rgba(14,165,233,0.1)_360deg)] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
			<div className="mb-3 flex items-center gap-3">
				<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e6e9ef] bg-[#f7fbff] text-[#0ea5e9]">
					{icon}
				</div>
				<h3 className={`${display.className} text-lg font-semibold text-[#0b0b0f]`}>{title}</h3>
			</div>
			<div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-[#e6e9ef] bg-[#f7fbff]">
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
			<p className="mt-1 text-sm text-[#2e2e35]/75">{desc}</p>
			{bullets && (
				<ul className="mt-3 space-y-1 text-xs text-[#2e2e35]/70">
					{bullets.map((b) => (
						<li key={b}>— {b}</li>
					))}
				</ul>
			)}
		</article>
	);
}

// Icons
function ChartIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function CoinsIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
			<circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function CardIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
			<path d="M3 10h18M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function TierIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M3 21h18M5 21V7l6-4 6 4v14M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function RebateIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function ChallengeIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="12" cy="12" r="2" fill="currentColor" />
		</svg>
	);
}

function BoostIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function StreakIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
		</svg>
	);
}

// Art Components
function ChartArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<path d="M25 80 L45 60 L65 70 L85 40 L105 55 L125 35 L145 60 L165 50" stroke="#00c2ff" strokeWidth="3" fill="none" />
		</svg>
	);
}

function CoinsArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<circle cx="70" cy="55" r="26" fill="#0ea5e9" opacity="0.8" />
			<circle cx="120" cy="50" r="18" fill="#0ea5e9" opacity="0.5" />
			<circle cx="150" cy="65" r="12" fill="#0ea5e9" opacity="0.35" />
		</svg>
	);
}

function CardArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect x="40" y="30" width="120" height="60" rx="10" fill="#0d1326" />
			<rect x="55" y="50" width="60" height="8" rx="4" fill="#00c2ff" />
			<rect x="55" y="66" width="30" height="8" rx="4" fill="#3ee9bf" />
		</svg>
	);
}

function TierArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<rect x="30" y="70" width="40" height="30" rx="4" fill="#0ea5e9" opacity="0.6" />
			<rect x="80" y="50" width="40" height="50" rx="4" fill="#0ea5e9" opacity="0.8" />
			<rect x="130" y="30" width="40" height="70" rx="4" fill="#0ea5e9" />
		</svg>
	);
}

function RebateArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<circle cx="100" cy="55" r="35" stroke="#3ee9bf" strokeWidth="3" fill="none" />
			<path d="M85 55l8 8 22-22" stroke="#3ee9bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function ChallengeArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<rect x="50" y="30" width="100" height="50" rx="8" fill="#6366f1" opacity="0.8" />
			<path d="M70 55h60M90 40v30" stroke="#00c2ff" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function BoostArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<path d="M60 80 L100 30 L140 80" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M100 30v50" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
		</svg>
	);
}

function StreakArt() {
	return (
		<svg width="200" height="110" viewBox="0 0 200 110" fill="none" aria-hidden="true">
			<rect width="200" height="110" rx="12" fill="#0d1326" />
			<circle cx="50" cy="55" r="8" fill="#0ea5e9" />
			<circle cx="80" cy="55" r="10" fill="#0ea5e9" opacity="0.8" />
			<circle cx="110" cy="55" r="12" fill="#0ea5e9" opacity="0.6" />
			<circle cx="140" cy="55" r="14" fill="#0ea5e9" opacity="0.4" />
			<circle cx="170" cy="55" r="16" fill="#0ea5e9" opacity="0.3" />
		</svg>
	);
}


