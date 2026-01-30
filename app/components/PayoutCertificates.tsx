'use client';

import Image from 'next/image';

// Certificate image URLs
const certificates = [
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png',
	'https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png',
];

export default function PayoutCertificates() {
	// Duplicate certificates multiple times for seamless infinite scroll
	const scrollCertificates = [...certificates, ...certificates, ...certificates, ...certificates];

	return (
		<section id="payout-certificates" className="relative overflow-hidden bg-black py-20 md:py-24">
			<div className="mx-auto max-w-7xl px-6 md:px-10">
				{/* Header */}
				<div className="mb-12 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 mb-6">
						Payout Certificates
					</div>
					<h2 className="font-sans text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
						Over $3.5M in Total Payouts
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-white/70 md:text-xl">
						Real certificates from real traders who successfully completed their challenges and received payouts.
					</p>
				</div>

				{/* Infinite Scrolling Certificates */}
				<div className="relative overflow-hidden">
					<div className="flex gap-6 animate-scroll">
						{scrollCertificates.map((cert, index) => (
							<div
								key={`cert-${index}`}
								className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 shadow-xl"
							>
								<Image
									src={cert}
									alt={`Payout Certificate ${index + 1}`}
									width={400}
									height={280}
									className="w-full h-full object-cover"
									unoptimized
								/>
							</div>
						))}
						{/* Duplicate for seamless loop */}
						{scrollCertificates.map((cert, index) => (
							<div
								key={`cert-duplicate-${index}`}
								className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 shadow-xl"
								aria-hidden="true"
							>
								<Image
									src={cert}
									alt=""
									width={400}
									height={280}
									className="w-full h-full object-cover"
									unoptimized
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes scroll {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(calc(-50% - 1.5rem));
					}
				}

				.animate-scroll {
					display: flex;
					width: fit-content;
					animation: scroll 50s linear infinite;
				}

				.animate-scroll:hover {
					animation-play-state: paused;
				}
			`}</style>
		</section>
	);
}

