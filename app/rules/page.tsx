'use client';

import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Folder } from 'lucide-react';
import { HELP_CATEGORIES } from '@/lib/rules-help-data';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

/** Card order and labels on /rules — each slug must exist in HELP_CATEGORIES */
const RULES_CARD_SLUGS = [
	'getting-started',
	'dashboard',
	'prohibited-strategies',
	'funding-payouts',
	'trading-rules-guidelines',
	'general',
] as const;

const DISPLAY_TITLES: Record<(typeof RULES_CARD_SLUGS)[number], string> = {
	'getting-started': 'Get Started',
	dashboard: 'Dashboard',
	'prohibited-strategies': 'Prohibited Strategies',
	'funding-payouts': 'Funding and payout',
	'trading-rules-guidelines': 'Trading Rules and Guidelines',
	general: 'General rules',
};

const categoryBySlug = Object.fromEntries(HELP_CATEGORIES.map((c) => [c.slug, c]));

function articleCountLabel(n: number) {
	return n === 1 ? '1 article' : `${n} articles`;
}

function RulesArticleCard({
	title,
	href,
	articleLabel,
}: {
	title: string;
	href: string;
	articleLabel: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-center gap-5 rounded-xl border border-[#e5e7eb] bg-white px-5 py-5 shadow-sm transition hover:border-purple-200 hover:shadow-md sm:gap-6 sm:px-6 sm:py-6"
		>
			<div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16" aria-hidden>
				<Folder
					className="h-12 w-12 text-purple-600 sm:h-14 sm:w-14"
					strokeWidth={1.35}
					fill="none"
				/>
			</div>
			<div className="min-w-0 flex-1">
				<h3 className="text-base font-bold leading-snug tracking-tight text-[#0f172a] sm:text-lg">
					<span className="transition group-hover:text-purple-600">{title}</span>
				</h3>
				<p className="mt-1 text-sm text-[#9ca3af]">{articleLabel}</p>
			</div>
		</Link>
	);
}

export default function RulesPage() {
	const cards = RULES_CARD_SLUGS.map((slug) => {
		const cat = categoryBySlug[slug];
		if (!cat) {
			throw new Error(`Missing help category for slug: ${slug}`);
		}
		return {
			key: slug,
			title: DISPLAY_TITLES[slug],
			href: `/rules/help/${slug}`,
			articleLabel: articleCountLabel(cat.articles.length),
		};
	});

	return (
		<div className={`min-h-screen bg-[#f8fafc] ${bodyFont.className}`}>
			<Navbar variant="hero" />

			<main className="mx-auto max-w-3xl px-6 pb-12 pt-[calc(7rem+var(--promo-ticker-height))] md:px-8 md:pb-16 md:pt-[calc(8rem+var(--promo-ticker-height))]">
				<h1
					className={`${display.className} mb-10 text-center text-2xl font-semibold tracking-tight text-[#0b0b0f] md:text-left md:text-3xl`}
				>
					Rules
				</h1>
				<div className="flex flex-col gap-4">
					{cards.map((item) => (
						<RulesArticleCard
							key={item.key}
							title={item.title}
							href={item.href}
							articleLabel={item.articleLabel}
						/>
					))}
				</div>
			</main>

			<Footer />
		</div>
	);
}
