import { Fragment } from 'react';

/**
 * Renders a help article body.
 *
 * Blocks are separated by blank lines. Within a block:
 *   `## Heading`      → section heading
 *   `- item`          → bullet list (one item per line)
 *   `1. item`         → numbered list (one item per line)
 *   `| a | b |`       → table (first row is the header; a `---` row is ignored)
 *   `> note`          → callout
 *   anything else     → paragraph, with single newlines kept as line breaks
 *
 * `**bold**` works inside every block type.
 */
export function HelpArticleBody({ body }: { body: string }) {
	const blocks = body.trim().split(/\n\n+/);

	return (
		<div className="space-y-4 text-[15px] leading-relaxed text-[#37353E]">
			{blocks.map((block, i) => (
				<Block key={i} text={block} />
			))}
		</div>
	);
}

function Block({ text }: { text: string }) {
	const lines = text.split('\n').filter((l) => l.trim().length > 0);
	if (lines.length === 0) return null;

	if (lines[0].startsWith('## ')) {
		return (
			<h2 className="pt-2 text-lg font-bold tracking-tight text-[#0b0b0f]">
				<InlineBold text={lines[0].slice(3)} />
			</h2>
		);
	}

	if (lines.every((l) => l.startsWith('> '))) {
		return (
			<div className="rounded-lg border-l-4 border-l-purple-500 bg-purple-50/60 px-4 py-3 text-[15px] text-[#37353E]">
				{lines.map((l, i) => (
					<p key={i} className="[&_strong]:font-semibold [&_strong]:text-[#0b0b0f]">
						<InlineBold text={l.slice(2)} />
					</p>
				))}
			</div>
		);
	}

	if (lines.every((l) => l.startsWith('|'))) {
		return <Table lines={lines} />;
	}

	if (lines.every((l) => /^[-•]\s/.test(l))) {
		return (
			<ul className="list-disc space-y-1.5 pl-5 marker:text-purple-500">
				{lines.map((l, i) => (
					<li key={i} className="[&_strong]:font-semibold [&_strong]:text-[#0b0b0f]">
						<InlineBold text={l.replace(/^[-•]\s/, '')} />
					</li>
				))}
			</ul>
		);
	}

	if (lines.every((l) => /^\d+\.\s/.test(l))) {
		return (
			<ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-purple-600">
				{lines.map((l, i) => (
					<li key={i} className="[&_strong]:font-semibold [&_strong]:text-[#0b0b0f]">
						<InlineBold text={l.replace(/^\d+\.\s/, '')} />
					</li>
				))}
			</ol>
		);
	}

	return (
		<p className="[&_strong]:font-semibold [&_strong]:text-[#0b0b0f]">
			{lines.map((l, i) => (
				<Fragment key={i}>
					{i > 0 && <br />}
					<InlineBold text={l} />
				</Fragment>
			))}
		</p>
	);
}

function splitRow(line: string): string[] {
	return line
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((c) => c.trim());
}

function Table({ lines }: { lines: string[] }) {
	const rows = lines.filter((l) => !/^\|[\s|:-]+\|?$/.test(l)).map(splitRow);
	if (rows.length === 0) return null;
	const [head, ...body] = rows;

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[420px] border-collapse text-left text-sm">
				<thead>
					<tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
						{head.map((cell, i) => (
							<th key={i} className="px-3 py-2.5 font-semibold text-[#0b0b0f]">
								<InlineBold text={cell} />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{body.map((row, i) => (
						<tr key={i} className="border-b border-[#eef1f5] last:border-0">
							{row.map((cell, j) => (
								<td
									key={j}
									className={`px-3 py-2.5 align-top ${j === 0 ? 'font-medium text-[#0b0b0f]' : 'text-[#37353E]'}`}
								>
									<InlineBold text={cell} />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function InlineBold({ text }: { text: string }) {
	const parts = text.split(/(\*\*[^*]+\*\*)/g);
	return (
		<>
			{parts.map((part, i) => {
				if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
					return <strong key={i}>{part.slice(2, -2)}</strong>;
				}
				return <Fragment key={i}>{part}</Fragment>;
			})}
		</>
	);
}
