'use client';

export default function SaleBanner() {
	return (
		<div className="relative z-50 overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black border-b border-white/5 py-3">
			<div className="animate-scroll flex items-center gap-12 whitespace-nowrap">
				{/* Duplicate content for seamless loop */}
				{[...Array(2)].map((_, i) => (
					<div key={i} className="flex items-center gap-12">
						<span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/90 md:text-sm">
							NEW YEAR SALE - UP TO 50% OFF - USE CODE: NEWYEAR50
						</span>
						<div className="h-1 w-1 rounded-full bg-[#00ff88]" />
						<span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/90 md:text-sm">
							LIMITED TIME OFFER - DON'T MISS OUT
						</span>
						<div className="h-1 w-1 rounded-full bg-[#00ff88]" />
						<span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/90 md:text-sm">
							30% OFF WITH CODE: NEWYEAR30
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

