'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export default function SaleTimer() {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	useEffect(() => {
		// Set sale end date (7 days from now as example)
		const saleEndDate = new Date();
		saleEndDate.setDate(saleEndDate.getDate() + 7);
		saleEndDate.setHours(23, 59, 59, 999);

		const calculateTimeLeft = () => {
			const now = new Date().getTime();
			const difference = saleEndDate.getTime() - now;

			if (difference > 0) {
				setTimeLeft({
					days: Math.floor(difference / (1000 * 60 * 60 * 24)),
					hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
					minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
					seconds: Math.floor((difference % (1000 * 60)) / 1000),
				});
			} else {
				setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			}
		};

		calculateTimeLeft();
		const interval = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, []);

	const formatNumber = (num: number): string => {
		return num.toString().padStart(2, '0');
	};

	return (
		<div className="bg-slate-50/80 py-12">
			<div className="mx-auto max-w-4xl px-6">
				<div className="text-center mb-8">
					<h3 className="font-sans text-2xl font-bold tracking-tight text-black mb-2 md:text-3xl">
						Sale end
					</h3>
					<div className="mt-6 inline-block">
						<div className="relative overflow-hidden rounded-md border border-slate-900/10 bg-white px-8 py-3 shadow-sm">
							<div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50"></div>
							<div className="relative flex items-center gap-3">
								<div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
								<p className="font-sans text-sm font-semibold uppercase tracking-[0.15em] text-slate-900 md:text-base">
									Limited Offer: Buy One Get One Free
								</p>
								<div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="flex items-center justify-center gap-4 md:gap-6">
					{/* Days */}
					<div className="flex flex-col items-center">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent rounded-xl blur-sm"></div>
							<div className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 md:p-6 shadow-2xl border-2 border-black/20">
								<div className="text-center">
									<div className="font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl tracking-tight">
										{formatNumber(timeLeft.days)}
									</div>
								</div>
							</div>
						</div>
						<span className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/60 md:text-sm">
							Days
						</span>
					</div>

					{/* Separator */}
					<div className="text-3xl font-bold text-black/30 md:text-4xl">:</div>

					{/* Hours */}
					<div className="flex flex-col items-center">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent rounded-xl blur-sm"></div>
							<div className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 md:p-6 shadow-2xl border-2 border-black/20">
								<div className="text-center">
									<div className="font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl tracking-tight">
										{formatNumber(timeLeft.hours)}
									</div>
								</div>
							</div>
						</div>
						<span className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/60 md:text-sm">
							Hours
						</span>
					</div>

					{/* Separator */}
					<div className="text-3xl font-bold text-black/30 md:text-4xl">:</div>

					{/* Minutes */}
					<div className="flex flex-col items-center">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent rounded-xl blur-sm"></div>
							<div className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 md:p-6 shadow-2xl border-2 border-black/20">
								<div className="text-center">
									<div className="font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl tracking-tight">
										{formatNumber(timeLeft.minutes)}
									</div>
								</div>
							</div>
						</div>
						<span className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/60 md:text-sm">
							Minutes
						</span>
					</div>

					{/* Separator */}
					<div className="text-3xl font-bold text-black/30 md:text-4xl">:</div>

					{/* Seconds */}
					<div className="flex flex-col items-center">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent rounded-xl blur-sm"></div>
							<div className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 md:p-6 shadow-2xl border-2 border-black/20">
								<div className="text-center">
									<div className="font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl tracking-tight">
										{formatNumber(timeLeft.seconds)}
									</div>
								</div>
							</div>
						</div>
						<span className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/60 md:text-sm">
							Seconds
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
