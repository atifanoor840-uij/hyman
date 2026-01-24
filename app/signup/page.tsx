'use client';

import {
	ChangeEvent,
	ClipboardEvent,
	FormEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inter, Syne } from 'next/font/google';
import Toast from '../components/Toast';
import { signup } from '../../lib/api/auth';
import { ApiClientError } from '../../lib/api/client';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });
const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

type SignupStep = 'details' | 'verify' | 'complete';

const initialFormState = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
	phoneNo: '',
	referralCode: '',
};

const generateVerificationCode = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

const isStrongPassword = (password: string) =>
	/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && password.length >= 8;

const CURRENT_YEAR = new Date().getFullYear();

export default function SignupPage() {
	const router = useRouter();
	const [step, setStep] = useState<SignupStep>('details');
	const [formData, setFormData] = useState(initialFormState);
	const [formErrors, setFormErrors] = useState<Partial<typeof initialFormState>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [generatedCode, setGeneratedCode] = useState('');
	const [verificationDigits, setVerificationDigits] = useState<string[]>(Array(6).fill(''));
	const [verificationError, setVerificationError] = useState('');
	const [resendCooldown, setResendCooldown] = useState(0);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
	const verificationInputs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (step !== 'verify' || resendCooldown === 0) return;

		const interval = setInterval(
			() =>
				setResendCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				}),
			1000
		);

		return () => clearInterval(interval);
	}, [step, resendCooldown]);

	const validateDetails = () => {
		const nextErrors: Partial<typeof initialFormState> = {};

		if (!formData.firstName.trim()) {
			nextErrors.firstName = 'First name is required.';
		} else if (formData.firstName.trim().length < 2) {
			nextErrors.firstName = 'First name should be at least 2 characters.';
		}

		if (!formData.lastName.trim()) {
			nextErrors.lastName = 'Last name is required.';
		} else if (formData.lastName.trim().length < 2) {
			nextErrors.lastName = 'Last name should be at least 2 characters.';
		}

		if (!formData.email.trim()) {
			nextErrors.email = 'We need an email to send confirmations and alerts.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			nextErrors.email = 'Use a valid email address (e.g. name@domain.com).';
		}

		if (!formData.phoneNo.trim()) {
			nextErrors.phoneNo = 'Phone number is required.';
		} else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNo.trim())) {
			nextErrors.phoneNo = 'Please enter a valid phone number.';
		}

		if (!formData.password) {
			nextErrors.password = 'Create a password to protect your account.';
		} else if (!isStrongPassword(formData.password)) {
			nextErrors.password = 'Mix upper, lower, numbers and make it at least 8 characters.';
		}

		if (!formData.confirmPassword) {
			nextErrors.confirmPassword = 'Confirm your password so we know it was typed correctly.';
		} else if (formData.confirmPassword !== formData.password) {
			nextErrors.confirmPassword = 'That confirmation does not match.';
		}

		setFormErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleFormChange =
		(field: keyof typeof initialFormState) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, [field]: event.target.value }));
			if (formErrors[field]) {
				setFormErrors((prev) => ({ ...prev, [field]: undefined }));
			}
		};

	const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateDetails()) return;

		setIsLoading(true);
		setFormErrors({});

		try {
			const signupData = {
				first_name: formData.firstName.trim(),
				last_name: formData.lastName.trim(),
				email: formData.email.trim(),
				password: formData.password,
				phone_no: formData.phoneNo.trim(),
				referral_code: formData.referralCode.trim() || undefined,
			};

			await signup(signupData);

			// For now, we'll skip verification and go straight to complete
			// If the backend requires email verification, we can add that step back
			setStep('complete');
			setToastType('success');
			setToastMessage('Signup successful! You can now log in to your FxGenz dashboard.');
		} catch (err) {
			const error = err instanceof ApiClientError ? err : null;
			if (error) {
				// Handle API errors
				const errorMessage = error.message || 'Failed to sign up. Please try again.';
				setToastType('error');
				setToastMessage(errorMessage);
				
				// Map field errors if available
				if (error.errors) {
					const fieldErrors: Partial<typeof initialFormState> = {};
					Object.keys(error.errors).forEach((key) => {
						const mappedKey = key.replace(/_/g, '') as keyof typeof initialFormState;
						if (mappedKey in initialFormState) {
							fieldErrors[mappedKey] = error.errors![key][0];
						}
					});
					setFormErrors(fieldErrors);
				}
			} else {
				setToastType('error');
				setToastMessage('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerificationChange = (index: number, value: string) => {
		const sanitized = value.replace(/\D/g, '').slice(-1);
		setVerificationDigits((prev) => {
			const next = [...prev];
			next[index] = sanitized;
			return next;
		});
		setVerificationError('');

		if (sanitized && index < verificationInputs.current.length - 1) {
			verificationInputs.current[index + 1]?.focus();
		}
	};

	const handleVerificationKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => {
		if (event.key === 'Backspace' && !verificationDigits[index] && index > 0) {
			verificationInputs.current[index - 1]?.focus();
		}
	};

	const handleVerificationPaste = (
		event: ClipboardEvent<HTMLInputElement>
	) => {
		event.preventDefault();
		const pasted = event.clipboardData.getData('text');
		const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');

		if (!digits.length) return;

		setVerificationDigits((prev) => {
			const next = [...prev];
			digits.forEach((digit, idx) => {
				next[idx] = digit;
			});
			return next;
		});

		const targetIndex = Math.min(digits.length, verificationInputs.current.length - 1);
		verificationInputs.current[targetIndex]?.focus();
		setVerificationError('');
	};

	const handleVerificationSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const code = verificationDigits.join('');

		if (code.length < 6) {
			setVerificationError('Enter the 6 digit code we just sent you.');
			return;
		}

		if (code !== generatedCode) {
			setVerificationError('That code looks off. Double-check your inbox or resend it.');
			return;
		}

		setStep('complete');
		setToastMessage('Signup successful. You can now log in to your FxGenz dashboard.');
	};

	const handleResendCode = () => {
		if (resendCooldown > 0) return;
		const code = generateVerificationCode();
		setGeneratedCode(code);
		setVerificationDigits(Array(6).fill(''));
		setVerificationError('');
		setResendCooldown(45);
		verificationInputs.current[0]?.focus();
		console.info('FxGenz demo verification code (resent):', code);
	};

	const handleBackToDetails = () => {
		setStep('details');
		setVerificationDigits(Array(6).fill(''));
		setVerificationError('');
		setResendCooldown(0);
	};

	const verificationComplete = verificationDigits.join('').length === 6;

	return (
		<main className={`min-h-screen bg-white text-black ${bodyFont.className}`}>
			<div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10 lg:flex-row lg:items-stretch lg:gap-16">
				<aside className="flex flex-1 flex-col justify-center border-b border-zinc-200 pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
					<Link href="/" className="mb-10 inline-flex items-center gap-3 text-black transition hover:opacity-80">
						<span className={`${brandFont.className} text-3xl font-black tracking-tight`}>
							Fx<span className="text-black">Genz</span>
						</span>
					</Link>

					<div className="max-w-md">
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Create your FxGenz account
						</h1>
						<p className="mt-3 text-sm text-zinc-500">
							Set up your login once, then access all FxGenz products with the same credentials.
						</p>
					</div>

					<div className="mt-auto pt-10 text-xs text-zinc-400">
						© {CURRENT_YEAR} FxGenz. All rights reserved.
					</div>
				</aside>

				<section className="flex flex-1 items-center justify-center pt-6 lg:pt-0">
					<div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
						{step === 'details' && (
							<>
								<div className="flex items-center justify-between gap-6">
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
											Step 1 of 3
										</p>
										<h2 className="mt-2 text-xl font-semibold text-black sm:text-2xl">
											Account details
										</h2>
										<p className="mt-2 text-sm text-zinc-600">
											Enter your basic information to create your FxGenz login.
										</p>
									</div>
									<Link
										href="/login"
										className="hidden shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700 transition hover:bg-zinc-900 hover:text-white md:inline-flex"
									>
										I already have access
									</Link>
								</div>

								<form onSubmit={handleDetailsSubmit} className="mt-10 space-y-6">
									<div className="grid gap-6 sm:grid-cols-2">
										<div>
											<label
												htmlFor="firstName"
												className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
											>
												First name
											</label>
											<input
												id="firstName"
												type="text"
												value={formData.firstName}
												onChange={handleFormChange('firstName')}
												className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
													formErrors.firstName ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
												}`}
												placeholder="Ava"
											/>
											{formErrors.firstName && (
												<p className="mt-2 text-xs font-medium text-red-500">{formErrors.firstName}</p>
											)}
										</div>

										<div>
											<label
												htmlFor="lastName"
												className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
											>
												Last name
											</label>
											<input
												id="lastName"
												type="text"
												value={formData.lastName}
												onChange={handleFormChange('lastName')}
												className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
													formErrors.lastName ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
												}`}
												placeholder="Martinez"
											/>
											{formErrors.lastName && (
												<p className="mt-2 text-xs font-medium text-red-500">{formErrors.lastName}</p>
											)}
										</div>
									</div>

									<div>
										<label
											htmlFor="email"
											className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
										>
											Email
										</label>
										<input
											id="email"
											type="email"
											value={formData.email}
											onChange={handleFormChange('email')}
											className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
												formErrors.email ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
											}`}
											placeholder="you@fxgenz.com"
										/>
										{formErrors.email ? (
											<p className="mt-2 text-xs font-medium text-red-500">{formErrors.email}</p>
										) : (
											<p className="mt-2 text-xs text-zinc-500">
												We use this email for verification and security alerts only.
											</p>
										)}
									</div>

									<div>
										<label
											htmlFor="phoneNo"
											className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
										>
											Phone number
										</label>
										<input
											id="phoneNo"
											type="tel"
											value={formData.phoneNo}
											onChange={handleFormChange('phoneNo')}
											className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
												formErrors.phoneNo ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
											}`}
											placeholder="+1234567890"
										/>
										{formErrors.phoneNo ? (
											<p className="mt-2 text-xs font-medium text-red-500">{formErrors.phoneNo}</p>
										) : (
											<p className="mt-2 text-xs text-zinc-500">
												We'll use this for account verification and important updates.
											</p>
										)}
									</div>

									<div>
										<label
											htmlFor="referralCode"
											className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
										>
											Referral code (optional)
										</label>
										<input
											id="referralCode"
											type="text"
											value={formData.referralCode}
											onChange={handleFormChange('referralCode')}
											className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
											placeholder="Enter referral code if you have one"
										/>
										<p className="mt-2 text-xs text-zinc-500">
											Have a referral code? Enter it here to unlock special benefits.
										</p>
									</div>

									<div className="grid gap-6 sm:grid-cols-2">
										<div>
											<label
												htmlFor="password"
												className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
											>
												Password
											</label>
											<input
												id="password"
												type="password"
												value={formData.password}
												onChange={handleFormChange('password')}
												className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
													formErrors.password ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
												}`}
												placeholder="Minimum 8 characters"
											/>
											{formErrors.password && (
												<p className="mt-2 text-xs font-medium text-red-500">{formErrors.password}</p>
											)}
										</div>

										<div>
											<label
												htmlFor="confirmPassword"
												className="text-xs font-semibold uppercase tracking-wide text-zinc-700"
											>
												Confirm password
											</label>
											<input
												id="confirmPassword"
												type="password"
												value={formData.confirmPassword}
												onChange={handleFormChange('confirmPassword')}
												className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
													formErrors.confirmPassword
														? 'border-red-500 bg-red-50'
														: 'border-zinc-200 bg-zinc-50'
												}`}
												placeholder="Re-type password"
											/>
											{formErrors.confirmPassword && (
												<p className="mt-2 text-xs font-medium text-red-500">
													{formErrors.confirmPassword}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
										<input
											id="terms"
											type="checkbox"
											required
											className="mt-1 h-4 w-4 rounded border-zinc-300 bg-white text-black focus:ring-black/20"
										/>
										<label htmlFor="terms" className="text-xs text-zinc-700">
											I agree to the{' '}
											<Link href="/terms" className="text-black underline underline-offset-4">
												FxGenz Terms
											</Link>{' '}
											and{' '}
											<Link href="/privacy" className="text-black underline underline-offset-4">
												Privacy Policy
											</Link>
											.
										</label>
									</div>

									<button
										type="submit"
										disabled={isLoading}
										className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{isLoading ? (
											<>
												<svg className="h-4 w-4 animate-spin text-[#04131a]" viewBox="0 0 24 24" fill="none">
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
												Creating your account…
											</>
										) : (
											'Continue'
										)}
									</button>
								</form>
							</>
						)}

						{step === 'verify' && (
							<>
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
											Step 2 of 3
										</p>
										<h2 className="mt-2 text-xl font-semibold text-black sm:text-2xl">
											Verify your email
										</h2>
										<p className="mt-2 text-sm text-zinc-600">
											We sent a 6‑digit code to{' '}
											<span className="font-medium text-black">{formData.email}</span>. Enter it below to
											activate your account.
										</p>
										<p className="mt-3 text-[13px] text-zinc-500">
											Demo: current code{' '}
											<span className="font-semibold text-black">
												{generatedCode || '------'}
											</span>
										</p>
									</div>
									<button
										type="button"
										onClick={handleBackToDetails}
										className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-700 transition hover:bg-zinc-900 hover:text-white"
									>
										Edit email
									</button>
								</div>

								<form onSubmit={handleVerificationSubmit} className="mt-10 space-y-8">
									<div className="flex flex-col gap-6">
										<div className="flex items-center justify-between text-xs text-white/50">
											<span className="text-zinc-600">Enter your 6-digit verification code</span>
											<button
												type="button"
												onClick={handleResendCode}
												disabled={resendCooldown > 0}
												className="text-black transition hover:opacity-80 disabled:text-zinc-400"
											>
												{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
											</button>
										</div>

										<div className="grid grid-cols-6 gap-3">
											{verificationDigits.map((digit, index) => (
												<input
													key={index}
													type="text"
													inputMode="numeric"
													maxLength={1}
													value={digit}
													onChange={(event) =>
														handleVerificationChange(index, event.target.value)
													}
													onKeyDown={(event) =>
														handleVerificationKeyDown(event, index)
													}
													onPaste={index === 0 ? handleVerificationPaste : undefined}
													ref={(el) => {
														if (el) {
															verificationInputs.current[index] = el;
														}
													}}
													className="h-14 rounded-2xl border border-zinc-200 bg-white text-center text-xl font-semibold tracking-[0.3em] text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
												/>
											))}
										</div>
									</div>

									{verificationError && (
										<div className="rounded-2xl border border-red-500 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
											{verificationError}
										</div>
									)}

									<button
										type="submit"
										disabled={!verificationComplete}
										className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Verify email
									</button>
								</form>
							</>
						)}

						{step === 'complete' && (
							<div className="flex flex-col items-start gap-8">
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
										Step 3 of 3
									</p>
									<h2 className="mt-3 text-2xl font-semibold text-black">
										Your account is ready.
									</h2>
									<p className="mt-3 text-sm text-zinc-600">
										You can now sign in with your email and password to access the FxGenz dashboard.
									</p>
								</div>

								<div className="flex w-full flex-col gap-4 sm:flex-row">
									<Link
										href="/login"
										className="inline-flex flex-1 items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
									>
										Go to login
									</Link>
								</div>
							</div>
						)}

						{step !== 'complete' && (
							<div className="mt-10 text-center text-xs text-zinc-500">
								Already verified?{' '}
								<Link href="/login" className="font-semibold text-black underline underline-offset-4">
									Sign in here
								</Link>
							</div>
						)}
					</div>
				</section>
			</div>
			<Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
		</main>
	);
}
