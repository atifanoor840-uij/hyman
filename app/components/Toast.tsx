'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastProps = {
	message: string | null;
	type?: 'success' | 'error' | 'info' | 'loading';
	title?: string;
	duration?: number;
	onClose: () => void;
};

export default function Toast({ 
	message, 
	type = 'success', 
	title,
	duration = 5000,
	onClose 
}: ToastProps) {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		if (!message || type === 'loading') return;
		
		const timer = setTimeout(() => {
			setIsExiting(true);
			setTimeout(onClose, 300); // Wait for exit animation
		}, duration);
		
		return () => clearTimeout(timer);
	}, [message, onClose, duration, type]);

	if (!message) return null;

	const isSuccess = type === 'success';
	const isError = type === 'error';
	const isInfo = type === 'info';
	const isLoading = type === 'loading';

	const getIcon = () => {
		if (isSuccess) return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
		if (isError) return <AlertCircle className="h-6 w-6 text-red-600" />;
		if (isLoading) return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
		return <Info className="h-6 w-6 text-blue-600" />;
	};

	const getStyles = () => {
		if (isSuccess) return 'border-emerald-500/40 bg-white shadow-emerald-500/20';
		if (isError) return 'border-red-500/40 bg-white shadow-red-500/20';
		if (isLoading) return 'border-blue-500/40 bg-white shadow-blue-500/20';
		return 'border-blue-500/40 bg-white shadow-blue-500/20';
	};

	const getProgressBarColor = () => {
		if (isSuccess) return 'bg-emerald-500';
		if (isError) return 'bg-red-500';
		return 'bg-blue-500';
	};

	return (
		<div className={`fixed top-6 right-6 z-[9999] max-w-md ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
			<div
				className={`relative flex items-start gap-4 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-xl ${getStyles()}`}
			>
				{/* Icon */}
				<div className="flex-shrink-0 pt-0.5">
					{getIcon()}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{title && (
						<h4 className={`text-sm font-bold mb-1 ${
							isSuccess ? 'text-emerald-900' : isError ? 'text-red-900' : 'text-blue-900'
						}`}>
							{title}
						</h4>
					)}
					<p className="text-sm text-zinc-700 leading-relaxed font-medium">
						{message}
					</p>
				</div>

				{/* Close Button */}
				{!isLoading && (
					<button
						type="button"
						onClick={() => {
							setIsExiting(true);
							setTimeout(onClose, 300);
						}}
						className="flex-shrink-0 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
						aria-label="Close notification"
					>
						<X className="h-4 w-4" />
					</button>
				)}

				{/* Progress Bar */}
				{!isLoading && (
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 rounded-b-2xl overflow-hidden">
						<div 
							className={`h-full ${getProgressBarColor()} animate-progress`}
							style={{ 
								animationDuration: `${duration}ms`,
								animationTimingFunction: 'linear'
							}}
						/>
					</div>
				)}
			</div>

			<style jsx>{`
				@keyframes slide-in {
					0% {
						opacity: 0;
						transform: translateX(100%) scale(0.95);
					}
					100% {
						opacity: 1;
						transform: translateX(0) scale(1);
					}
				}
				@keyframes slide-out {
					0% {
						opacity: 1;
						transform: translateX(0) scale(1);
					}
					100% {
						opacity: 0;
						transform: translateX(100%) scale(0.95);
					}
				}
				@keyframes progress {
					0% {
						width: 100%;
					}
					100% {
						width: 0%;
					}
				}
				.animate-slide-in {
					animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
				}
				.animate-slide-out {
					animation: slide-out 0.3s cubic-bezier(0.4, 0, 1, 1);
				}
				.animate-progress {
					animation: progress linear forwards;
				}
			`}</style>
		</div>
	);
}


