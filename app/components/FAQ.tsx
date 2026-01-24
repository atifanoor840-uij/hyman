'use client';

import { useState } from "react";

const faqs = [
	{
		q: "How fast are payouts?",
		a: "Most payouts are processed instantly. Card and bank methods may take up to 24 hours depending on the provider.",
	},
	{
		q: "What are the evaluation rules?",
		a: "Two-phase evaluation with clear profit targets and maximum drawdown. No hidden rules. See full rules in Programs.",
	},
	{
		q: "What platforms do you support?",
		a: "We support multiple platforms and provide low-latency access to Tier‑1 liquidity venues.",
	},
	{
		q: "Do you offer scaling?",
		a: "Yes. Hit targets consistently and scale to larger accounts with improved revenue splits.",
	},
];

export default function FAQ() {
	const [open, setOpen] = useState<number | null>(0);
	return (
		<section id="faq" className="bg-white">
			<div className="mx-auto max-w-3xl px-6 py-20 md:px-10 lg:py-28">
				<h2 className="text-3xl font-semibold tracking-tight text-[#0b0b0f] md:text-4xl">FAQ</h2>
				<div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
					{faqs.map((item, i) => {
						const isOpen = open === i;
						return (
							<div key={item.q}>
								<button
									type="button"
									onClick={() => setOpen(isOpen ? null : i)}
									className="flex w-full items-center justify-between gap-6 p-5 text-left"
								>
									<span className="text-sm font-semibold text-[#0b0b0f]">{item.q}</span>
									<span className="text-xl text-[#7c3aed]">{isOpen ? "–" : "+"}</span>
								</button>
								{isOpen && <div className="px-5 pb-5 text-sm text-[#37353E]">{item.a}</div>}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}




