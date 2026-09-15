"use client";

import { RotateCcw, Zap, ShieldCheck, Lock, BadgeCheck, KeyRound } from "lucide-react";

const loyaltyCards = [
	{
		title: "Free Retry",
		desc: "One free retry per evaluation phase. If you hit a rule, use your retry and continue — no extra fee.",
		visual: <RetryVisual />,
		bullets: ["One retry per phase", "No additional cost", "Continue where you left off"],
	},
	{
		title: "Account in 2 Seconds",
		desc: "Get your funded account credentials instantly. No waiting — start trading within seconds of passing.",
		visual: <AccountVisual />,
		bullets: ["Instant credentials", "Same-day access", "No approval delays"],
	},
	{
		title: "24/7 Live Chat Support",
		desc: "Real humans, real-time. Get help anytime — our support team is available around the clock.",
		visual: <ChatVisual />,
		bullets: ["Live chat 24/7", "Fast response times", "Dedicated support team"],
	},
	{
		title: "Fast Payouts",
		desc: "Request your profits and get paid quickly. Most payouts processed within 24–48 hours.",
		visual: <PayoutVisual />,
		bullets: ["24–48 hour processing", "Multiple payout methods", "No hidden fees"],
	},
	{
		title: "Transparent Rules",
		desc: "Clear trading rules, no surprises. Know exactly what you can and can't do before you trade.",
		visual: <RulesVisual />,
		bullets: ["Clear limits", "Fair conditions", "No grey areas"],
	},
	{
		title: "Secure & Verified",
		desc: "Your account and data are protected. We use industry-standard security for all traders.",
		visual: <SecurityVisual />,
		bullets: ["Secure platform", "Verified payouts", "Trusted by traders"],
	},
];

export default function LoyaltyPrograms() {
	return (
		<section id="loyalty" className="relative overflow-hidden bg-slate-50/80 py-20 md:py-28">
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
				<div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
					<div className="flex animate-scroll gap-6 py-3">
						{[...loyaltyCards, ...loyaltyCards].map((card, index) => (
							<LoyaltyCard key={index} {...card} hidden={index >= loyaltyCards.length} />
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
	visual,
	bullets,
	hidden,
}: {
	title: string;
	desc: string;
	visual: React.ReactNode;
	bullets: string[];
	hidden?: boolean;
}) {
	return (
		<article
			aria-hidden={hidden}
			className="group relative w-[340px] flex-shrink-0 overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
		>
			{visual}
			<h3 className="font-sans mt-5 text-lg font-semibold tracking-tight text-[#0b0b0f]">{title}</h3>
			<p className="mt-2 text-sm leading-relaxed text-[#2e2e35]/75">{desc}</p>
			<ul className="mt-4 space-y-2 text-xs text-[#2e2e35]/70">
				{bullets.map((b) => (
					<li key={b} className="flex items-start gap-2">
						<span className="mt-0.5 text-[#5235ff]">✓</span>
						<span>{b}</span>
					</li>
				))}
			</ul>
		</article>
	);
}

/* ---------- Card visuals (fixed h-44 panel, like the payout cards) ---------- */

function LightPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={`flex h-44 flex-col justify-center rounded-2xl border border-[#e6e9ef] bg-white p-5 ${className}`}>
			{children}
		</div>
	);
}

function DarkPanel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-44 flex-col justify-center rounded-2xl border border-[#dadfea] bg-gradient-to-b from-[#0d1326] to-[#0a0f22] p-5 text-white shadow-[inset_0_0_1px_rgba(255,255,255,0.06)]">
			{children}
		</div>
	);
}

function RetryVisual() {
	return (
		<DarkPanel>
			<div className="flex items-center justify-between">
				<div className="text-[10px] uppercase tracking-wider text-white/60">Phase 1 · Evaluation</div>
				<span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">1 retry left</span>
			</div>
			<div className="font-sans mt-2 text-3xl font-bold tracking-tight">$0.00 fee</div>
			<button
				tabIndex={-1}
				className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5235ff] to-[#00d99f] px-4 py-2.5 text-sm font-semibold text-[#0b0b0f]"
			>
				<RotateCcw className="h-4 w-4" /> Use Free Retry
			</button>
		</DarkPanel>
	);
}

function AccountVisual() {
	return (
		<LightPanel>
			<div className="flex items-center justify-between">
				<div className="text-[10px] font-semibold uppercase tracking-wider text-[#2e2e35]/50">Funded account</div>
				<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
				</span>
			</div>
			<div className="mt-3 space-y-2 rounded-xl border border-[#e6e9ef] bg-slate-50/60 p-3 font-mono text-xs text-[#0b0b0f]">
				<div className="flex justify-between"><span className="text-[#2e2e35]/50">Login</span><span>GZ-204817</span></div>
				<div className="flex justify-between"><span className="text-[#2e2e35]/50">Server</span><span>GenzProp-Live</span></div>
			</div>
			<div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#5235ff]">
				<Zap className="h-3.5 w-3.5" /> Issued in 2.0s
			</div>
		</LightPanel>
	);
}

function ChatVisual() {
	return (
		<LightPanel className="gap-2.5">
			<div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-xs text-[#0b0b0f]">
				How fast are payouts processed?
			</div>
			<div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-gradient-to-r from-[#5235ff] to-[#7c5cff] px-3 py-2 text-xs text-white">
				Most are done within 24–48 hours 👋
			</div>
			<div className="flex items-center gap-2 text-[10px] text-[#2e2e35]/50">
				<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Support online · replies in ~1 min
			</div>
		</LightPanel>
	);
}

function PayoutVisual() {
	return (
		<DarkPanel>
			<div className="text-[10px] uppercase tracking-wider text-white/60">Payout status</div>
			<div className="font-sans mt-2 text-3xl font-bold tracking-tight">$2,800.00</div>
			<div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
				<div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#5235ff] to-[#00d99f]" />
			</div>
			<div className="mt-2 flex justify-between text-[10px] text-white/60">
				<span>Approved</span>
				<span>Est. &lt; 48h</span>
			</div>
		</DarkPanel>
	);
}

function RulesVisual() {
	const rules = [
		{ label: "Profit target", value: "8%" },
		{ label: "Daily loss limit", value: "5%" },
		{ label: "Max drawdown", value: "10%" },
	];
	return (
		<LightPanel>
			<div className="divide-y divide-[#e6e9ef] rounded-xl border border-[#e6e9ef]">
				{rules.map((r) => (
					<div key={r.label} className="flex items-center justify-between px-3 py-2.5 text-xs">
						<span className="text-[#2e2e35]/70">{r.label}</span>
						<span className="font-semibold text-[#0b0b0f]">{r.value}</span>
					</div>
				))}
			</div>
		</LightPanel>
	);
}

function SecurityVisual() {
	const items = [
		{ Icon: Lock, label: "SSL" },
		{ Icon: KeyRound, label: "2FA" },
		{ Icon: BadgeCheck, label: "KYC" },
	];
	return (
		<LightPanel className="items-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e6e9ef] bg-slate-50/50">
				<ShieldCheck className="h-8 w-8 text-[#5235ff]" />
			</div>
			<div className="mt-4 flex gap-2">
				{items.map(({ Icon, label }) => (
					<span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e9ef] bg-white px-3 py-1 text-xs font-medium text-[#0b0b0f]">
						<Icon className="h-3.5 w-3.5 text-[#5235ff]" /> {label}
					</span>
				))}
			</div>
		</LightPanel>
	);
}
