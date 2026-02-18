'use client';

import Image from 'next/image';

// Same certificate images as Hero section for consistent professional look
const certificates = [
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1771386812/8_ubnumg.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1771386876/7_hocszn.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1771386838/9_g8surp.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1771386916/5_ugzdtq.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png',
];

export default function PayoutCertificates() {
	// Build one set, then duplicate for seamless infinite loop (identical halves)
	const oneSet = [...certificates, ...certificates, ...certificates, ...certificates];
	const infiniteSet = [...oneSet, ...oneSet];

	return (
		<section id="payout-certificates" className="relative overflow-hidden bg-[#050406] py-20 md:py-28">
			{/* Subtle background gradient */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(82,53,255,0.08),transparent_50%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(28,241,255,0.05),transparent_50%)]" />

			<div className="relative mx-auto max-w-7xl px-6 md:px-10">
				{/* Header */}
				<div className="mb-14 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6 backdrop-blur-sm">
						Payout Certificates
					</div>
					<h2 className="font-sans text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
						Over $3.5M in Total Payouts
					</h2>
					<p className="mx-auto max-w-2xl text-base md:text-lg font-medium text-white/60 leading-relaxed">
						Real certificates from real traders who successfully completed their challenges and received payouts.
					</p>
				</div>

				{/* Infinite Scrolling Certificates - professional card styling */}
				<div className="relative -mx-6 md:-mx-10">
					{/* Edge fade overlays for seamless look */}
					<div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-[#050406] to-transparent z-10" aria-hidden />
					<div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-[#050406] to-transparent z-10" aria-hidden />
					<div className="overflow-hidden">
						<div className="flex gap-6 md:gap-8 py-2 animate-infinite-scroll w-max">
							{infiniteSet.map((cert, index) => (
								<div
									key={`cert-${index}`}
									className="flex-shrink-0 w-[340px] md:w-[380px] h-[240px] md:h-[268px] rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
								>
									<Image
										src={cert}
										alt={`Payout Certificate ${index + 1}`}
										width={380}
										height={268}
										className="w-full h-full object-cover"
										unoptimized
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes infinite-scroll-cert {
					0% { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}
				.animate-infinite-scroll {
					animation: infinite-scroll-cert 45s linear infinite;
				}
				.animate-infinite-scroll:hover {
					animation-play-state: paused;
				}
			`}</style>
		</section>
	);
}

