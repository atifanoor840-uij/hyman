import { Fragment } from 'react';

/** Renders paragraphs split by blank lines; supports **bold** segments. */
export function HelpArticleBody({ body }: { body: string }) {
	const paragraphs = body.trim().split(/\n\n+/);

	return (
		<div className="space-y-4 text-[15px] leading-relaxed text-[#37353E]">
			{paragraphs.map((para, i) => (
				<p key={i} className="[&_strong]:font-semibold [&_strong]:text-[#0b0b0f]">
					<InlineBold text={para} />
				</p>
			))}
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
