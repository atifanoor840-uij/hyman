'use client';

import { useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const faqs = [
	{
		q: "How fast are payouts?",
		a: "Most payouts are processed instantly. Card and bank methods may take up to 24 hours depending on the provider. We prioritize speed and transparency in all financial transactions.",
	},
	{
		q: "What are the evaluation rules?",
		a: "Two-phase evaluation with clear profit targets and maximum drawdown. No hidden rules. See full rules in Programs. We provide transparent guidelines to help you succeed.",
	},
	{
		q: "What platforms do you support?",
		a: "We support multiple platforms and provide low-latency access to Tier‑1 liquidity venues. Our infrastructure ensures optimal trading conditions across all supported platforms.",
	},
	{
		q: "Do you offer scaling?",
		a: "Yes. Hit targets consistently and scale to larger accounts with improved revenue splits. Our scaling program rewards consistent performance and helps you grow your trading capital.",
	},
	{
		q: "What is the minimum deposit?",
		a: "There is no minimum deposit required to start. We offer various account sizes to suit different trading styles and experience levels.",
	},
	{
		q: "How do I withdraw my profits?",
		a: "Withdrawals can be processed through multiple methods including bank transfer, card, and cryptocurrency. Most withdrawals are processed within 24 hours of request.",
	},
	{
		q: "What happens if I violate trading rules?",
		a: "We have clear trading rules outlined in our terms. Violations may result in account restrictions. We always communicate clearly about any issues and provide opportunities to correct them.",
	},
	{
		q: "Can I trade on weekends?",
		a: "Trading availability depends on the markets and instruments you're trading. Forex markets are closed on weekends, while cryptocurrencies trade 24/7. Check our platform for specific market hours.",
	},
	{
		q: "Do you provide trading education?",
		a: "Yes, we offer comprehensive educational resources including webinars, tutorials, and market analysis to help you improve your trading skills.",
	},
	{
		q: "What customer support do you offer?",
		a: "We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our support team is always ready to assist you with any questions or issues.",
	},
];

export default function FAQPage() {
	const [open, setOpen] = useState<number | null>(0);

	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Header Section with background */}
			<section className="relative overflow-hidden bg-[#050406]">
				{/* Decorative gradient overlays */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				{/* Subtle vignette */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="mx-auto max-w-4xl space-y-6 text-left mt-16 lg:mt-20">
						<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
							Frequently Asked Questions
						</h1>
						<p className="text-lg text-white/70 md:text-xl max-w-2xl">
							Find answers to common questions about FxGenz trading, funding, and services.
						</p>
					</div>
				</div>
				{/* Subtle divider curve */}
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			{/* Main content with white background */}
			<main className="bg-white">
				<div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">

					<div className="divide-y divide-[#e5e5e5] rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
						{faqs.map((item, i) => {
							const isOpen = open === i;
							return (
								<div key={i} className="transition-all">
									<button
										type="button"
										onClick={() => setOpen(isOpen ? null : i)}
										className="flex w-full items-center justify-between gap-6 p-6 text-left hover:bg-[#f9f9f9] transition-colors"
									>
										<span className="text-base font-semibold text-[#0b0b0f] md:text-lg">{item.q}</span>
										<span className="flex-shrink-0 text-2xl font-light text-[#7c3aed] transition-transform">
											{isOpen ? "–" : "+"}
										</span>
									</button>
									{isOpen && (
										<div className="px-6 pb-6 text-sm leading-relaxed text-[#37353E]/90 md:text-base">
											{item.a}
										</div>
									)}
								</div>
							);
						})}
					</div>

					<div className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-8 text-center">
						<h3 className="text-xl font-semibold text-[#0b0b0f]">Still have questions?</h3>
						<p className="mt-2 text-sm text-[#37353E]/80">
							Our support team is here to help. Contact us anytime.
						</p>
						<a
							href="/contact"
							className="mt-6 inline-block rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
						>
							Contact Support
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}

