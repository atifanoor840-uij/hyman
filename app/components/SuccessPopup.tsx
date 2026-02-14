'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

type SuccessPopupProps = {
	message: string | null;
	title?: string;
	duration?: number;
	onClose: () => void;
};

function playSuccessChime() {
	if (typeof window === 'undefined') return;
	try {
		const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
		const now = audioContext.currentTime;
		const osc1 = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		osc1.type = 'sine';
		osc1.frequency.setValueAtTime(523.25, now);
		osc1.frequency.setValueAtTime(659.25, now + 0.1);
		osc1.frequency.setValueAtTime(783.99, now + 0.2);

		gainNode.gain.setValueAtTime(0.15, now);
		gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

		osc1.connect(gainNode);
		gainNode.connect(audioContext.destination);
		osc1.start(now);
		osc1.stop(now + 0.5);
	} catch {
		// Ignore audio errors (e.g. autoplay policy)
	}
}

export default function SuccessPopup({
	message,
	title,
	duration = 4000,
	onClose,
}: SuccessPopupProps) {
	const [isExiting, setIsExiting] = useState(false);
	const [tickVisible, setTickVisible] = useState(false);
	const hasPlayedSound = useRef(false);

	useEffect(() => {
		if (!message) return;

		// Play success chime when popup appears (after tick animates in)
		const soundTimer = setTimeout(() => {
			if (!hasPlayedSound.current) {
				playSuccessChime();
				hasPlayedSound.current = true;
			}
		}, 400);

		const timer = setTimeout(() => {
			setIsExiting(true);
			setTimeout(onClose, 350);
		}, duration);

		return () => {
			clearTimeout(timer);
			clearTimeout(soundTimer);
		};
	}, [message, onClose, duration]);

	useEffect(() => {
		if (!message) return;
		hasPlayedSound.current = false;
		setTickVisible(false);
		const t = setTimeout(() => setTickVisible(true), 100);
		return () => clearTimeout(t);
	}, [message]);

	if (!message) return null;

	return (
		<div
			className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
				isExiting ? 'opacity-0' : 'opacity-100'
			}`}
			aria-modal
			aria-live="polite"
			role="alertdialog"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={() => {
					setIsExiting(true);
					setTimeout(onClose, 350);
				}}
			/>

			{/* Popup card - centered, grow animation */}
			<div
				className={`relative z-10 w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-white px-8 py-10 shadow-2xl shadow-emerald-500/10 ${
					isExiting ? 'animate-success-popup-out' : 'animate-success-popup-in'
				}`}
			>
				{/* Green tick in center */}
				<div className="flex flex-col items-center text-center">
					<div className="relative mb-5 flex h-24 w-24 items-center justify-center">
						{/* Expanding ring when tick appears */}
						{tickVisible && (
							<div
								className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-success-ring-expand"
								aria-hidden
							/>
						)}
						{/* Tick circle */}
						<div
							className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-500 ${
								tickVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
							}`}
						>
							<Check
								className="h-10 w-10 text-white stroke-[3.5]"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</div>
					</div>

					{title && (
						<h4 className="mb-1.5 text-lg font-bold text-emerald-900">{title}</h4>
					)}
					<p className="text-sm font-medium leading-relaxed text-zinc-700">
						{message}
					</p>
				</div>
			</div>

			<style jsx>{`
				@keyframes success-popup-in {
					0% {
						opacity: 0;
						transform: scale(0.7);
					}
					100% {
						opacity: 1;
						transform: scale(1);
					}
				}
				@keyframes success-popup-out {
					0% {
						opacity: 1;
						transform: scale(1);
					}
					100% {
						opacity: 0;
						transform: scale(0.95);
					}
				}
				@keyframes success-ring-expand {
					0% {
						transform: scale(0.8);
						opacity: 0.8;
					}
					100% {
						transform: scale(1.8);
						opacity: 0;
					}
				}
				.animate-success-popup-in {
					animation: success-popup-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
				}
				.animate-success-popup-out {
					animation: success-popup-out 0.3s ease-out forwards;
				}
				.animate-success-ring-expand {
					animation: success-ring-expand 0.7s ease-out forwards;
				}
			`}</style>
		</div>
	);
}
