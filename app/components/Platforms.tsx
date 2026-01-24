'use client';

import Image from 'next/image';
import { Poppins } from 'next/font/google';

const display = Poppins({
	subsets: ['latin'],
	weight: ['600', '700'],
});

const platforms = [
	{ 
		name: 'MetaTrader 4', 
		image: 'https://res.cloudinary.com/dejjuhzug/image/upload/v1764395131/d1b7332b-1650-4a91-a1a0-8d09b53936ec_ougmpe.png',
		label: 'MetaTrader 4'
	},
	{ 
		name: 'MetaTrader 5', 
		image: 'https://res.cloudinary.com/dejjuhzug/image/upload/v1764395181/f0bdc4ec-31ba-43db-af2d-990985a4827d_ezvlm9.png',
		label: 'MetaTrader 5'
	},
	{ 
		name: 'cTrader', 
		image: null,
		label: 'cTrader'
	},
];

export default function Platforms() {
	return (
		<section className="relative overflow-hidden bg-white">
			<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
				{/* Heading and Subheading */}
				<div className="mb-16 text-center">
					<h2 className={`${display.className} text-4xl font-bold text-black md:text-5xl lg:text-6xl mb-4`}>
						We Support Major Platforms
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-black/70 md:text-xl">
						At FxGenz, we want to give you options. That's why we offer the flexibility to tailor your experience and choose between MT4, MT5, and cTrader. Pick the professional trading platform that suits you best.
					</p>
				</div>

				{/* Platform Logos in One Row */}
				<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
					{platforms.map((platform) => (
						<div
							key={platform.name}
							className="group flex flex-col items-center justify-center transition hover:scale-105"
						>
							<div className="flex h-24 w-24 items-center justify-center md:h-32 md:w-32">
								{platform.image ? (
									<Image
										src={platform.image}
										alt={platform.name}
										width={128}
										height={128}
										className="object-contain"
									/>
								) : (
									<CTraderIcon />
								)}
							</div>
							<div className="mt-4 text-center">
								<h3 className="text-sm font-bold text-black md:text-base">
									{platform.label === 'MetaTrader 4' ? (
										<>
											MetaTrader <span className="text-orange-500">4</span>
										</>
									) : platform.label === 'MetaTrader 5' ? (
										<>
											MetaTrader <span className="text-orange-500">5</span>
										</>
									) : (
										platform.label
									)}
								</h3>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CTraderIcon() {
	return (
		<svg width="128" height="128" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
			<text x="10" y="50" fill="#FF5252" fontSize="40" fontWeight="bold" fontFamily="Arial, sans-serif">
				c
			</text>
			<text x="50" y="50" fill="#000000" fontSize="28" fontWeight="600" fontFamily="Arial, sans-serif">
				Trader
			</text>
		</svg>
	);
}

