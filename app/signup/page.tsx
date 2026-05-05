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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import SuccessPopup from '../components/SuccessPopup';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import CountrySelector from '../components/CountrySelector';
import { signup } from '../../lib/api/auth';
import { ApiClientError } from '../../lib/api/client';
import {
	sanitizeInput,
	isValidEmail,
	isStrongPassword,
	setAuthToken,
	setUser,
} from '../../lib/auth-utils';
import { trackSignup } from '../../components/MetaPixel';

const createEventId = (prefix: string) =>
	`${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`;

type SignupStep = 'details' | 'verify' | 'complete';

const initialFormState = {
	name: '',
	email: '',
	password: '',
	confirmPassword: '',
	country: '',
	referralCode: '',
};

const generateVerificationCode = () =>
	Math.floor(1000 + Math.random() * 9000).toString();

const CURRENT_YEAR = new Date().getFullYear();

export default function SignupPage() {
	const router = useRouter();
	const [step, setStep] = useState<SignupStep>('details');
	const [formData, setFormData] = useState(initialFormState);
	const [formErrors, setFormErrors] = useState<Partial<typeof initialFormState>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [generatedCode, setGeneratedCode] = useState('');
	const [verificationDigits, setVerificationDigits] = useState<string[]>(Array(4).fill(''));
	const [verificationError, setVerificationError] = useState('');
	const [resendCooldown, setResendCooldown] = useState(0);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'loading'>('success');
	const [toastTitle, setToastTitle] = useState<string | undefined>(undefined);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
		const sanitizedName = sanitizeInput(formData.name);
		const sanitizedEmail = sanitizeInput(formData.email);

		if (!sanitizedName.trim()) {
			nextErrors.name = 'Full name is required.';
		} else if (sanitizedName.trim().length < 2) {
			nextErrors.name = 'Name should be at least 2 characters.';
		} else if (sanitizedName.length > 100) {
			nextErrors.name = 'Name is too long (max 100 characters).';
		}

		if (!sanitizedEmail.trim()) {
			nextErrors.email = 'We need an email to send confirmations and alerts.';
		} else if (!isValidEmail(sanitizedEmail)) {
			nextErrors.email = 'Use a valid email address (e.g. name@domain.com).';
		}

		if (!formData.country.trim()) {
			nextErrors.country = 'Please select your country.';
		}

		if (!formData.password) {
			nextErrors.password = 'Create a password to protect your account.';
		} else if (!isStrongPassword(formData.password)) {
			nextErrors.password = 'Mix upper, lower, numbers and make it at least 8 characters.';
		} else if (formData.password.length > 128) {
			nextErrors.password = 'Password is too long (max 128 characters).';
		}

		if (!formData.confirmPassword) {
			nextErrors.confirmPassword = 'Confirm your password so we know it was typed correctly.';
		} else if (formData.confirmPassword !== formData.password) {
			nextErrors.confirmPassword = 'That confirmation does not match.';
		}

		if (formData.referralCode.trim()) {
			const sanitizedReferral = sanitizeInput(formData.referralCode);
			if (sanitizedReferral.length > 50) {
				nextErrors.referralCode = 'Referral code is invalid.';
			}
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
		setToastType('loading');
		setToastTitle('Creating Account');
		setToastMessage('Please wait while we set up your GenzProp account...');

		try {
			const signupData = {
				name: sanitizeInput(formData.name).trim(),
				email: sanitizeInput(formData.email).trim().toLowerCase(),
				password: formData.password,
				country: formData.country.trim(),
				referral_code: formData.referralCode.trim() ? sanitizeInput(formData.referralCode).trim() : undefined,
				phone_no: '',
				address: '',
			};

			const response = await signup(signupData);
			const authToken = response.token || response.access_token;
			if (authToken) {
				setAuthToken(authToken, true);
				if (response.user) {
					setUser(response.user, true);
				}
			}

			trackSignup(signupData.email, false, createEventId('signup'));

			setToastType('success');
			setToastTitle('Account Created!');
			setToastMessage('Please check your email to verify your account.');

			setTimeout(() => {
				// Prefill login after email verification redirect.
				try {
					sessionStorage.setItem(
						'login_prefill',
						JSON.stringify({ email: signupData.email, password: signupData.password })
					);
				} catch {
					// ignore
				}
				router.push(`/verify-email?email=${encodeURIComponent(signupData.email)}`);
			}, 2000);
		} catch (err) {
			const error = err instanceof ApiClientError ? err : null;
			if (error) {
				setToastType('error');
				setToastTitle('Email Already Registered');
				if (error.status === 409 || error.message?.toLowerCase().includes('already exists')) {
					setToastMessage('This email is already registered. Please sign in or use a different email address.');
				} else if (error.status === 422) {
					setToastMessage('Please check your information and try again.');
				} else {
					setToastMessage(error.message || 'Unable to create your account. Please try again.');
				}
				if (error.errors) {
					const fieldErrors: Partial<typeof initialFormState> = {};
					Object.keys(error.errors).forEach((key) => {
						let mappedKey = key;
						if (key === 'phone_no') mappedKey = 'phoneNo';
						if (key === 'referral_code') mappedKey = 'referralCode';
						if (mappedKey in initialFormState) {
							fieldErrors[mappedKey as keyof typeof initialFormState] = error.errors![key][0];
						}
					});
					setFormErrors(fieldErrors);
				}
			} else {
				setToastType('error');
				setToastTitle('Connection Error');
				setToastMessage('Unable to connect to the server. Please check your internet connection and try again.');
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

	const handleVerificationPaste = (event: ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const pasted = event.clipboardData.getData('text');
		const digits = pasted.replace(/\D/g, '').slice(0, 4).split('');
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
		if (code.length < 4) {
			setVerificationError('Enter the 4 digit code we just sent you.');
			return;
		}
		if (code !== generatedCode) {
			setVerificationError('That code looks off. Double-check your inbox or resend it.');
			return;
		}
		setStep('complete');
		setToastType('success');
		setToastTitle('All Set!');
		setToastMessage('Signup successful. You can now log in to your GenzProp dashboard.');
	};

	const handleResendCode = () => {
		if (resendCooldown > 0) return;
		const code = generateVerificationCode();
		setGeneratedCode(code);
		setVerificationDigits(Array(4).fill(''));
		setVerificationError('');
		setResendCooldown(45);
		verificationInputs.current[0]?.focus();
		console.info('GenzProp demo verification code (resent):', code);
	};

	const handleBackToDetails = () => {
		setStep('details');
		setVerificationDigits(Array(4).fill(''));
		setVerificationError('');
		setResendCooldown(0);
	};

	const verificationComplete = verificationDigits.join('').length === 4;

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-white to-zinc-50 text-black">
			<Navbar variant="sticky" />
			<main className="flex-1 min-h-0">
				<div className="mx-auto flex w-full max-w-[720px] flex-col items-stretch px-6 py-10 sm:py-14">
					{/* Header */}
					<div className="flex flex-col items-center text-center">
						<div className="flex items-center justify-center gap-3">
							<Image src="/logo.png" alt="GenzProp" width={44} height={44} className="object-contain" />
							<span className="text-2xl font-bold text-black tracking-tight">GenzProp</span>
						</div>
						<h1 className="mt-4 text-2xl font-bold tracking-tight text-black">
							{step === 'details' ? 'Create your account' : step === 'verify' ? 'Verify email' : 'You’re all set'}
						</h1>
						<p className="mt-1 text-sm text-zinc-600">
							{step === 'details'
								? 'Start your evaluation journey in minutes.'
								: step === 'verify'
									? 'Enter the 4 digit code we sent to your inbox.'
									: 'Your account is ready. You can sign in now.'}
						</p>
					</div>

					{step === 'details' && (
						<form onSubmit={handleDetailsSubmit} className="mt-8">
							<div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
									{/* Full name */}
									<div className="space-y-1.5">
									<label htmlFor="name" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
										Full name
									</label>
									<div
										className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
											formErrors.name ? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10' : 'border-zinc-200 hover:border-zinc-300'
										}`}
									>
										<User className={`w-5 h-5 shrink-0 ${formErrors.name ? 'text-red-400' : 'text-zinc-400'}`} />
										<input
											id="name"
											type="text"
											value={formData.name}
											onChange={handleFormChange('name')}
											placeholder="John Smith"
											className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
										/>
									</div>
									{formErrors.name && <p className="text-xs font-medium text-red-600">{formErrors.name}</p>}
								</div>

								{/* Email */}
								<div className="space-y-1.5">
									<label htmlFor="email" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
										Email address
									</label>
									<div
										className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
											formErrors.email ? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10' : 'border-zinc-200 hover:border-zinc-300'
										}`}
									>
										<Mail className={`w-5 h-5 shrink-0 ${formErrors.email ? 'text-red-400' : 'text-zinc-400'}`} />
										<input
											id="email"
											type="email"
											value={formData.email}
											onChange={handleFormChange('email')}
											placeholder="name@company.com"
											className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
										/>
									</div>
									{formErrors.email && <p className="text-xs font-medium text-red-600">{formErrors.email}</p>}
								</div>

								{/* Country */}
								<div className="space-y-1.5">
									<label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
										Country
									</label>
									<CountrySelector
										value={formData.country}
										onChange={(value) => {
											setFormData((prev) => ({ ...prev, country: value }));
											if (formErrors.country) setFormErrors((prev) => ({ ...prev, country: undefined }));
										}}
										error={formErrors.country}
										disabled={isLoading}
									/>
									{formErrors.country && <p className="text-xs font-medium text-red-600">{formErrors.country}</p>}
								</div>

								{/* Referral code (optional) */}
								<div className="space-y-1.5">
									<label htmlFor="referralCode" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
										Referral code <span className="font-normal normal-case text-zinc-400">(optional)</span>
									</label>
									<div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black hover:border-zinc-300">
										<span className="text-zinc-400 text-sm font-medium w-5 text-center">#</span>
										<input
											id="referralCode"
											type="text"
											value={formData.referralCode}
											onChange={handleFormChange('referralCode')}
											placeholder="Enter code if you have one"
											className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
										/>
									</div>
								</div>

								{/* Password + Confirm */}
								<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
									<div className="space-y-1.5">
										<label htmlFor="password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
											Password
										</label>
										<div
											className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
												formErrors.password ? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10' : 'border-zinc-200 hover:border-zinc-300'
											}`}
										>
											<Lock className={`w-5 h-5 shrink-0 ${formErrors.password ? 'text-red-400' : 'text-zinc-400'}`} />
											<input
												id="password"
												type={showPassword ? 'text' : 'password'}
												value={formData.password}
												onChange={handleFormChange('password')}
												placeholder="Min. 8 characters"
												className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
											/>
											<button
												type="button"
												onClick={() => setShowPassword((p) => !p)}
												className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition-colors"
												aria-label={showPassword ? 'Hide password' : 'Show password'}
											>
												{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
										{formErrors.password && <p className="text-xs font-medium text-red-600">{formErrors.password}</p>}
									</div>
									<div className="space-y-1.5">
										<label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
											Confirm password
										</label>
										<div
											className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
												formErrors.confirmPassword ? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10' : 'border-zinc-200 hover:border-zinc-300'
											}`}
										>
											<Lock className={`w-5 h-5 shrink-0 ${formErrors.confirmPassword ? 'text-red-400' : 'text-zinc-400'}`} />
											<input
												id="confirmPassword"
												type={showConfirmPassword ? 'text' : 'password'}
												value={formData.confirmPassword}
												onChange={handleFormChange('confirmPassword')}
												placeholder="Re-enter password"
												className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword((p) => !p)}
												className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition-colors"
												aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
											>
												{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
										{formErrors.confirmPassword && <p className="text-xs font-medium text-red-600">{formErrors.confirmPassword}</p>}
									</div>
								</div>

								{/* Terms */}
								<label className="sm:col-span-2 flex items-start gap-2.5 cursor-pointer group">
									<input
										type="checkbox"
										required
										className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black/20 focus:ring-offset-0"
									/>
									<span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">
										I agree to the <Link href="/terms" className="font-medium text-black underline underline-offset-2 hover:no-underline">Terms</Link> and <Link href="/policy" className="font-medium text-black underline underline-offset-2 hover:no-underline">Privacy Policy</Link>.
									</span>
								</label>

								<button
									type="submit"
									disabled={isLoading}
									className="sm:col-span-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
											Creating account…
										</>
									) : (
										'Create account'
									)}
								</button>
								</div>
							</div>
						</form>
					)}

				{step === 'verify' && (
					<div className="mt-8">
						<div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm text-zinc-600">
										Code sent to <span className="font-semibold text-black">{formData.email}</span>
									</p>
									<p className="mt-1 text-xs text-zinc-400">
										Demo code: <span className="font-mono font-semibold text-black">{generatedCode || '------'}</span>
									</p>
								</div>
								<div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
									<Mail className="w-5 h-5" />
								</div>
							</div>

							<form onSubmit={handleVerificationSubmit} className="mt-6 space-y-6">
							<div className="flex justify-between items-center">
								<label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verification code</label>
								<button
									type="button"
									onClick={handleResendCode}
									disabled={resendCooldown > 0}
									className="text-xs font-medium text-black hover:text-zinc-600 disabled:text-zinc-400 transition-colors"
								>
									{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
								</button>
							</div>
							<div className="grid grid-cols-4 gap-3">
								{verificationDigits.map((digit, index) => (
									<input
										key={index}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={digit}
										onChange={(e) => handleVerificationChange(index, e.target.value)}
										onKeyDown={(e) => handleVerificationKeyDown(e, index)}
										onPaste={index === 0 ? handleVerificationPaste : undefined}
										ref={(el) => { if (el) verificationInputs.current[index] = el; }}
										className="h-14 rounded-xl border border-zinc-200 bg-zinc-50/80 text-center text-xl font-bold tracking-[0.35em] text-zinc-900 transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
									/>
								))}
							</div>
							{verificationError && (
								<p className="text-xs font-medium text-red-600">{verificationError}</p>
							)}
							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleBackToDetails}
									className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
								>
									Edit email
								</button>
								<button
									type="submit"
									disabled={!verificationComplete}
									className="flex-1 py-3 rounded-xl bg-black text-sm font-bold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
								>
									Verify
								</button>
							</div>
						</form>
					</div>
				</div>
				)}

				{step === 'complete' && (
					<div className="mt-8">
						<div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.10)] text-center">
							<div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm mx-auto mb-4">
								<Lock className="w-5 h-5" />
							</div>
							<p className="text-sm text-zinc-600">
								Your account is ready. Sign in with your email and password to access the dashboard.
							</p>
							<Link
								href="/login"
								className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
							>
								Go to login
							</Link>
						</div>
					</div>
				)}

					{step === 'details' && (
						<p className="mt-6 text-center text-sm text-zinc-600">
							Already have an account?{' '}
							<Link href="/login" className="font-semibold text-black underline underline-offset-2 hover:no-underline">
								Log in
							</Link>
						</p>
					)}

					<p className="mt-10 text-center text-xs text-zinc-400">© {CURRENT_YEAR} GenzProp. All rights reserved.</p>

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

			{toastType !== 'success' && toastMessage && (
				<Toast
					message={toastMessage}
					type={toastType}
					title={toastTitle}
					duration={5000}
					onClose={() => {
						setToastMessage(null);
						setToastTitle(undefined);
					}}
				/>
			)}
				</div>
			</main>
		</div>
	);
}
