import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { HelpBreadcrumbs } from '@/components/rules/help-breadcrumbs';
import { HelpArticleBody } from '@/components/rules/help-article-body';
import { getHelpArticle } from '@/lib/rules-help-data';
import type { Metadata } from 'next';

type Props = { params: Promise<{ category: string; article: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { category, article } = await params;
	const data = getHelpArticle(category, article);
	if (!data) return { title: 'Not found' };
	return {
		title: `${data.article.title} — GenzProp`,
		description: data.article.title,
	};
}

export default async function HelpArticlePage({ params }: Props) {
	const { category: categorySlug, article: articleSlug } = await params;
	const data = getHelpArticle(categorySlug, articleSlug);
	if (!data) notFound();

	const { category, article } = data;

	return (
		<div className="flex min-h-screen flex-col font-sans">
			<div className="border-b border-[#e8ecf1] bg-white">
				<div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
					<Navbar />
				</div>
			</div>

			<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
				<HelpBreadcrumbs
					items={[
						{ label: 'All collections', href: '/rules' },
						{ label: category.title, href: `/rules/help/${category.slug}` },
						{ label: article.title },
					]}
				/>

				<article className="mt-8 overflow-hidden rounded-xl border border-[#e8ecf1] bg-white shadow-sm">
					<div className="border-l-[6px] border-l-sky-500 px-6 py-8 sm:px-8 sm:py-10">
						<h1 className="text-2xl font-bold tracking-tight text-[#0b0b0f] sm:text-3xl">{article.title}</h1>
						<div className="my-6 border-t border-[#eef1f5]" />
						<HelpArticleBody body={article.body} />
					</div>
				</article>

				<p className="mt-10">
					<Link
						href={`/rules/help/${category.slug}`}
						className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#0ea5e9]"
					>
						<span aria-hidden>←</span> Back to categories
					</Link>
				</p>
			</main>

			<Footer />
		</div>
	);
}
