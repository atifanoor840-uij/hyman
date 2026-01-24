'use client';

import { useEffect, useState } from 'react';

interface TextSplitProps {
	text: string;
	className?: string;
	delay?: number;
	splitBy?: 'char' | 'word';
}

export default function TextSplit({ text, className = '', delay = 0, splitBy = 'char' }: TextSplitProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, delay);

		return () => clearTimeout(timer);
	}, [delay]);

	if (splitBy === 'word') {
		const words = text.split(' ');
		return (
			<span className={className}>
				{words.map((word, index) => (
					<span
						key={index}
						className="inline-block"
						style={{
							animation: isVisible
								? `textSplitIn 0.6s ease-out ${index * 0.05}s both`
								: 'none',
							opacity: isVisible ? 1 : 0,
						}}
					>
						{word}
						{index < words.length - 1 && '\u00A0'}
					</span>
				))}
			</span>
		);
	}

	// Split by character
	return (
		<span className={className}>
			{text.split('').map((char, index) => (
				<span
					key={index}
					className="inline-block"
					style={{
						animation: isVisible
							? `textSplitIn 0.6s ease-out ${index * 0.03}s both`
							: 'none',
						opacity: isVisible ? 1 : 0,
					}}
				>
					{char === ' ' ? '\u00A0' : char}
				</span>
			))}
		</span>
	);
}
