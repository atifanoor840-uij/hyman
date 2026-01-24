'use client';

import { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

type ToastProps = {
	message: string | null;
	type?: 'success' | 'error' | 'info';
	onClose: () => void;
};

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(onClose, 5000);
		return () => clearTimeout(timer);
	}, [message, onClose]);

	if (!message) return null;

	const isSuccess = type === 'success';
	const isError = type === 'error';

	return (
		<div className="fixed top-6 right-6 z-[9999] max-w-md animate-slide-in">
			<div
				className={`flex items-start gap-4 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${
					isSuccess
						? 'border-emerald-500/30 bg-emerald-50 text-emerald-900'
						: isError
							? 'border-red-500/30 bg-red-50 text-red-900'
							: 'border-blue-500/30 bg-blue-50 text-blue-900'
				}`}
			>
				<div className="mt-0.5 flex-shrink-0">
					{isSuccess ? (
						<CheckCircle2 className="h-5 w-5 text-emerald-600" />
					) : isError ? (
						<AlertCircle className="h-5 w-5 text-red-600" />
					) : (
						<AlertCircle className="h-5 w-5 text-blue-600" />
					)}
				</div>
				<div className="flex-1">
					<p className="text-sm font-semibold leading-relaxed">{message}</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className={`ml-2 flex-shrink-0 rounded-lg p-1 transition hover:bg-black/5 ${
						isSuccess
							? 'text-emerald-700 hover:text-emerald-900'
							: isError
								? 'text-red-700 hover:text-red-900'
								: 'text-blue-700 hover:text-blue-900'
					}`}
					aria-label="Close notification"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<style jsx>{`
				@keyframes slide-in {
					0% {
						opacity: 0;
						transform: translateX(100%);
					}
					100% {
						opacity: 1;
						transform: translateX(0);
					}
				}
				.animate-slide-in {
					animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
				}
			`}</style>
		</div>
	);
}


