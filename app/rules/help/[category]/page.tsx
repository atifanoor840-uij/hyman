import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { HelpBrandMark } from '@/components/rules/help-brand-mark';
import { HelpBreadcrumbs } from '@/components/rules/help-breadcrumbs';
import { getHelpCategory } from '@/lib/rules-help-data';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { category: slug } = await params;
	const cat = getHelpCategory(slug);
	if (!cat) return { title: 'Not found' };
	return {
		title: `${cat.title} — Help`,
		description: `Browse ${cat.articles.length} articles: ${cat.title} at GenzProp.`,
	};
}

export default async function HelpCategoryPage({ params }: Props) {
	const { category: slug } = await params;
	const category = getHelpCategory(slug);
	if (!category) notFound();

	const count = category.articles.length;
	const countLabel = count === 1 ? '1 article' : `${count} articles`;

	return (
		<div className="flex min-h-screen flex-col font-sans">
			<Navbar variant="hero" />

			<main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32">
				<HelpBreadcrumbs
					items={[
						{ label: 'All collections', href: '/rules' },
						{ label: category.title },
					]}
				/>

				<div className="mt-8 flex flex-col gap-6 border-b border-[#e5e7eb] pb-8 sm:flex-row sm:items-center">
					<HelpBrandMark />
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-[#0b0b0f] sm:text-3xl">{category.title}</h1>
						<p className="mt-1 text-sm text-[#6b7280]">{countLabel}</p>
					</div>
				</div>

				<div className="mt-8 overflow-hidden rounded-xl border border-[#e8ecf1] bg-white shadow-sm">
					<div className="border-l-[5px] border-l-sky-500">
						<ul className="divide-y divide-[#eef1f5]">
							{category.articles.map((article) => (
								<li key={article.slug}>
									<Link
										href={`/rules/help/${category.slug}/${article.slug}`}
										className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-sky-50/60"
									>
										<span className="text-[15px] font-medium text-[#0b0b0f] group-hover:text-[#0ea5e9]">
											{article.title}
										</span>
										<ChevronRight
											className="h-5 w-5 shrink-0 text-[#c4c8d0] transition group-hover:text-[#0ea5e9]"
											aria-hidden
										/>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<p className="mt-10">
					<Link
						href="/rules"
						className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#0ea5e9]"
					>
						<span aria-hidden>←</span> Back to Rules
					</Link>
				</p>
			</main>

			<Footer />
		</div>
	);
}
