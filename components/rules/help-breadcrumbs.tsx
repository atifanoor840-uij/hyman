import Link from 'next/link';

type Crumb = { label: string; href?: string };

export function HelpBreadcrumbs({ items }: { items: Crumb[] }) {
	return (
		<nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
			<ol className="flex flex-wrap items-center gap-x-1">
				{items.map((item, i) => (
					<li key={i} className="flex items-center gap-1">
						{i > 0 && <span className="text-[#c4c8d0]">/</span>}
						{item.href ? (
							<Link href={item.href} className="transition hover:text-[#0ea5e9]">
								{item.label}
							</Link>
						) : (
							<span className="font-semibold text-[#0b0b0f]">{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
