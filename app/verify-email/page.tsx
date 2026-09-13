'use client';

import { useMemo, useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import SuccessPopup from '../components/SuccessPopup';
import { verifyEmailRequest, resendCodeRequest } from '../../lib/api/auth-client';
import { ApiClientError } from '../../lib/api/client';

const brandFont = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'] });
const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

const CODE_LENGTH = 4;
const CURRENT_YEAR = new Date().getFullYear();

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get('email') || '';
	
	const [code, setCode] = useState(Array<string>(CODE_LENGTH).fill(''));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isVerified, setIsVerified] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'loading'>('success');
	const [toastTitle, setToastTitle] = useState<string | undefined>(undefined);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const mergedCode = useMemo(() => code.join('').trim(), [code]);
	const isCodeComplete = useMemo(() => mergedCode.length === CODE_LENGTH, [mergedCode]);

	// Redirect if no email provided
	useEffect(() => {
		if (!email) {
			router.push('/signup');
		}
	}, [email, router]);

	// Cooldown timer for resend
	useEffect(() => {
		if (resendCooldown === 0) return;

		const interval = setInterval(() => {
			setResendCooldown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [resendCooldown]);

	const handleCodeChange = (value: string, index: number) => {
		if (!/^[0-9]*$/.test(value)) return;

		const digits = value.split('').slice(0, CODE_LENGTH);
		const next = [...code];

		if (digits.length > 1) {
			// Handle paste
			digits.forEach((digit, digitIndex) => {
				if (index + digitIndex < CODE_LENGTH) {
					next[index + digitIndex] = digit;
				}
			});
			// Focus last filled input
			const lastIndex = Math.min(index + digits.length - 1, CODE_LENGTH - 1);
			inputRefs.current[lastIndex]?.focus();
		} else {
			next[index] = value;
			// Auto-focus next input
			if (value && index < CODE_LENGTH - 1) {
				inputRefs.current[index + 1]?.focus();
			}
		}

		setCode(next);
		setError(null);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
		if (event.key === 'Backspace' && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const pastedData = event.clipboardData.getData('text');
		const digits = pastedData.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
		
		if (digits.length > 0) {
			const next = [...code];
			digits.forEach((digit, idx) => {
				if (idx < CODE_LENGTH) {
					next[idx] = digit;
				}
			});
			setCode(next);
			setError(null);
			
			// Focus last filled input
			const lastIndex = Math.min(digits.length - 1, CODE_LENGTH - 1);
			inputRefs.current[lastIndex]?.focus();
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!isCodeComplete) {
			setError('Please enter the complete 4-digit verification code.');
			return;
		}

		setIsSubmitting(true);
		setError(null);
		
		// Show loading toast
		setToastType('loading');
		setToastTitle('Verifying Code');
		setToastMessage('Please wait while we verify your email address...');

		try {
			await verifyEmailRequest({ email, code: mergedCode });

			setIsVerified(true);
			setToastType('success');
			setToastTitle('Email Verified!');
			setToastMessage('Your email has been successfully verified. Redirecting to login...');

			setTimeout(() => {
				router.push('/login');
			}, 2500);
		} catch (err) {
			const message = err instanceof ApiClientError ? err.message : 'Invalid verification code. Please check your email and try again.';
			setError(message);
			setToastType('error');
			setToastTitle('Verification Failed');
			setToastMessage(message);
			setIsSubmitting(false);
		}
	};

	const handleResend = async () => {
		if (resendCooldown > 0) return;
		
		setIsResending(true);
		setError(null);
		
		setToastType('loading');
		setToastTitle('Sending Code');
		setToastMessage('Sending a new verification code to your email...');

		try {
			await resendCodeRequest({ email });

			setCode(Array<string>(CODE_LENGTH).fill(''));
			setResendCooldown(60); // 60 seconds cooldown

			setToastType('success');
			setToastTitle('Code Sent!');
			setToastMessage('A new verification code has been sent to your email. Please check your inbox.');

			// Focus first input
			inputRefs.current[0]?.focus();
		} catch (err) {
			const message = err instanceof ApiClientError ? err.message : 'Unable to send verification code. Please try again later.';
			setToastType('error');
			setToastTitle('Failed to Send');
			setToastMessage(message);
		} finally {
			setIsResending(false);
		}
	};

	if (!email) {
		return null; // Will redirect in useEffect
	}

	return (
		<main className={`h-dvh bg-white text-black ${bodyFont.className}`}>
			<div className="flex h-dvh flex-col lg:flex-row">
				{/* Left Side - Info Section */}
				<aside className="flex flex-1 flex-col justify-between bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 py-8 lg:px-12 lg:py-12">
					<div>
						<Link href="/" className="mb-10 inline-flex items-center gap-3 text-white transition hover:opacity-80">
							<img
								src="/logo.png"
								alt="GenzProp Logo"
								className="h-11 w-11 object-contain rounded-lg"
								loading="lazy"
							/>
							<span className={`${brandFont.className} text-[28px] font-extrabold tracking-[-0.02em]`}>
								Fx<span className="text-white">Genz</span>
							</span>
						</Link>

						<div className="max-w-md">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent ring-1 ring-white/10 shadow-[0_0_30px_rgba(168,85,247,0.35)] mb-5">
								<Image
									src="/icons/email-3d-transparent.png"
									alt="Email icon"
									width={52}
									height={52}
									className="h-[52px] w-[52px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)]"
									priority
								/>
							</div>
							
							<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
								Check your email
							</h1>
							<p className="mt-4 text-base text-gray-300 leading-relaxed">
								We've sent a 4-digit verification code to:
							</p>
							<p className="mt-2 text-lg font-semibold text-white break-all">
								{email}
							</p>
						</div>
					</div>

					<div className="mt-auto pt-10 text-xs text-gray-500">
						© {CURRENT_YEAR} GenzProp. All rights reserved.
					</div>
				</aside>

				{/* Right Side - Verification Form */}
				<section className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 lg:py-12">
					<div className="w-full max-w-xl">
						{isVerified ? (
							<div className="rounded-3xl border border-green-200 bg-green-50 px-8 py-10 text-center">
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
									<CheckCircle2 className="h-8 w-8 text-green-600" />
								</div>
								<h2 className="text-2xl font-bold text-green-900 mb-2">
									Email Verified!
								</h2>
								<p className="text-green-700">
									Redirecting you to login...
								</p>
							</div>
						) : (
							<div className="rounded-3xl border border-zinc-200 bg-white px-8 py-8 shadow-sm">
								<div className="flex items-center justify-between mb-5">
									<div>
										<h2 className="text-xl font-semibold text-black sm:text-2xl">
											Enter verification code
										</h2>
										<p className="mt-2 text-sm text-zinc-600">
											Enter the 4-digit code sent to your email
										</p>
									</div>
									<Link
										href="/login"
										className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-black"
									>
										Skip
									</Link>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Code Input */}
									<div className="flex justify-center gap-3">
										{code.map((value, index) => (
											<input
												key={`code_${index}`}
												ref={(el) => { inputRefs.current[index] = el; }}
												type="text"
												inputMode="numeric"
												autoComplete="one-time-code"
												value={value}
												onChange={(event) => handleCodeChange(event.target.value, index)}
												onKeyDown={(event) => handleKeyDown(event, index)}
												onPaste={index === 0 ? handlePaste : undefined}
												onFocus={(event) => event.target.select()}
												maxLength={1}
												disabled={isSubmitting}
												className="h-14 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-2xl font-bold text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 sm:h-16 sm:w-14"
											/>
										))}
									</div>

									{error && (
										<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
											{error}
										</div>
									)}

									{/* Submit Button */}
									<button
										type="submit"
										disabled={!isCodeComplete || isSubmitting}
										className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{isSubmitting ? (
											<>
												<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													/>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
												Verifying code...
											</>
										) : (
											'Verify email'
										)}
									</button>

									{/* Resend Section */}
									<div className="flex flex-col gap-4 text-center text-sm">
										<p className="text-zinc-600">
											Didn't receive the code?
										</p>
										<button
											type="button"
											onClick={handleResend}
											disabled={isResending || resendCooldown > 0}
											className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-black transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
										>
											{isResending ? (
												<>
													<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														/>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														/>
													</svg>
													Sending...
												</>
											) : resendCooldown > 0 ? (
												`Resend in ${resendCooldown}s`
											) : (
												<>
													<RefreshCw className="h-4 w-4" />
													Resend code
												</>
											)}
										</button>
									</div>
								</form>

								{/* Back to login */}
								<div className="mt-6 text-center">
									<Link 
										href="/login" 
										className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-black"
									>
										<ArrowLeft className="h-4 w-4" />
										Back to login
									</Link>
								</div>
							</div>
						)}
					</div>
				</section>
			</div>

			{toastType === 'success' && toastMessage && (
				<SuccessPopup
					message={toastMessage}
					title={toastTitle}
					duration={5000}
					onClose={() => {
						setToastMessage(null);
						setToastTitle(undefined);
					}}
				/>
			)}
		</main>
	);
}

function VerifyEmailPageSkeleton() {
	return (
		<main className={`h-dvh bg-white text-black ${bodyFont.className}`}>
			<div className="flex h-dvh flex-col lg:flex-row">
				{/* Left Side - Info Section */}
				<aside className="flex flex-1 flex-col justify-between bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 py-8 lg:px-12 lg:py-12">
					<div>
						<Link href="/" className="mb-10 inline-flex items-center gap-3 text-white transition hover:opacity-80">
							<img
								src="/logo.png"
								alt="GenzProp Logo"
								className="h-11 w-11 object-contain rounded-lg"
								loading="lazy"
							/>
							<span className={`${brandFont.className} text-[28px] font-extrabold tracking-[-0.02em]`}>
								Fx<span className="text-white">Genz</span>
							</span>
						</Link>
						<div className="max-w-md">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent ring-1 ring-white/10 shadow-[0_0_30px_rgba(168,85,247,0.35)] mb-5">
								<Image
									src="/icons/email-3d-transparent.png"
									alt="Email icon"
									width={52}
									height={52}
									className="h-[52px] w-[52px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)]"
								/>
							</div>
							<div className="h-8 w-3/4 bg-gray-700 rounded animate-pulse mb-4"></div>
							<div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-2"></div>
							<div className="h-4 w-2/3 bg-gray-700 rounded animate-pulse"></div>
						</div>
					</div>
					<div className="mt-auto pt-10 text-xs text-gray-500">
						© {CURRENT_YEAR} GenzProp. All rights reserved.
					</div>
				</aside>
				
				{/* Right Side - Loading */}
				<section className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 lg:py-12">
					<div className="w-full max-w-xl">
						<div className="rounded-3xl border border-zinc-200 bg-white px-8 py-8 shadow-sm">
							<div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
							<div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
							<div className="flex justify-center gap-3 mb-8">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="h-14 w-12 rounded-xl bg-gray-200 animate-pulse sm:h-16 sm:w-14"></div>
								))}
							</div>
							<div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<VerifyEmailPageSkeleton />}>
			<VerifyEmailContent />
		</Suspense>
	);
}

