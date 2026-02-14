'use client';

import Image from 'next/image';

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
		name: 'DXtrade', 
		image: 'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769771735/dxtrade_s7srnv.png',
		label: 'DXtrade'
	},
];

export default function Platforms() {
	return (
		<section className="relative overflow-hidden bg-black">
			<div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
				<h2 className="text-center font-sans text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl mb-12 md:mb-14">
					Trading Platforms for Our Evaluation Programs
				</h2>

				<div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-20">
					{platforms.map((platform) => (
						<div
							key={platform.name}
							className="group flex flex-col items-center gap-3 transition duration-200 hover:opacity-90"
						>
							<div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 md:h-28 md:w-28 md:p-5">
								<Image
									src={platform.image}
									alt={platform.name}
									width={112}
									height={112}
									className="object-contain"
								/>
							</div>
							<span className="text-xs font-medium uppercase tracking-wider text-white/60 md:text-sm">
								{platform.label === 'MetaTrader 4' ? 'MT4' : platform.label === 'MetaTrader 5' ? 'MT5' : platform.label}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

