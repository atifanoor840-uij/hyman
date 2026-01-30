'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function formatTwo(num: number) {
	return num.toString().padStart(2, '0');
}

export default function SaleBanner() {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	useEffect(() => {
		const saleEndDate = new Date();
		saleEndDate.setDate(saleEndDate.getDate() + 7);
		saleEndDate.setHours(23, 59, 59, 999);

		const calculate = () => {
			const diff = saleEndDate.getTime() - Date.now();
			if (diff > 0) {
				setTimeLeft({
					days: Math.floor(diff / (1000 * 60 * 60 * 24)),
					hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
					minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
					seconds: Math.floor((diff % (1000 * 60)) / 1000),
				});
			} else {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			}
		};
		calculate();
		const t = setInterval(calculate, 1000);
		return () => clearInterval(t);
	}, []);

	return (
		<div className="relative z-50 border-b border-white/5 bg-black/80 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-6 py-6 md:px-10 md:py-8">
				{/* Top: Enjoy three amazing offers + countdown (desktop: countdown right; mobile: below) */}
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<p className="font-sans text-sm font-semibold tracking-tight text-white md:text-base">
						Enjoy three amazing offers this Black Friday season
					</p>
					<div className="flex items-center gap-4">
						<div className="font-sans inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white">
							<span className="tabular-nums font-bold">{formatTwo(timeLeft.days)}</span>
							<span className="text-xs text-white/70">d</span>
							<span className="tabular-nums font-bold">{formatTwo(timeLeft.hours)}</span>
							<span className="text-xs text-white/70">h</span>
							<span className="tabular-nums font-bold">{formatTwo(timeLeft.minutes)}</span>
							<span className="text-xs text-white/70">m</span>
							<span className="tabular-nums font-bold">{formatTwo(timeLeft.seconds)}</span>
							<span className="text-xs text-white/70">s</span>
						</div>
						<p className="hidden max-w-[180px] text-xs leading-tight text-white/80 md:block">
							Final hours to build momentum in your trading
						</p>
					</div>
				</div>
				<p className="mb-6 text-center text-xs leading-tight text-white/70 md:hidden">
					Final hours to build momentum in your trading
				</p>

				{/* Three promo code columns */}
				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="font-sans mb-2 text-xs leading-relaxed text-white/80">
							Single-use code for 30% off now, 20% off on Jan 15, and double PlusPoints
						</p>
						<p className="font-sans text-sm font-bold tracking-tight text-[#00ff88]">OURBEST</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="font-sans mb-2 text-xs leading-relaxed text-white/80">
							Multi-use code for 10% off, four free add-ons, and double PlusPoints
						</p>
						<p className="font-sans text-sm font-bold tracking-tight text-[#00ff88]">BFBOOST</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="font-sans mb-2 text-xs leading-relaxed text-white/80">
							Multi-use code for 20% off, a free 90% profit split, and double PlusPoints
						</p>
						<p className="font-sans text-sm font-bold tracking-tight text-[#00ff88]">BF2090</p>
					</div>
				</div>

				{/* Year of the Trader */}
				<div className="flex flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:gap-10">
					<h4 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl md:leading-tight">
						Year of
						<br />
						the Trader
					</h4>
					<p className="font-sans text-sm leading-relaxed text-white/85 md:max-w-xl">
						Our main goal for 2026 is to{' '}
						<strong className="text-white">make every FxGenz product and process as clear and reliable</strong>{' '}
						as possible by simplifying trading rules and explaining them better to our traders.{' '}
						<strong className="text-white">Save 35%</strong> and get a 90% profit split add-on for free by using code{' '}
						<strong className="text-[#00ff88]">TRADER2026</strong>
					</p>
				</div>
			</div>
		</div>
	);
}
