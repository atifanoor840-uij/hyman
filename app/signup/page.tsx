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
import { User, Lock, Mail, Eye, EyeOff, Gift, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import SuccessPopup from '../components/SuccessPopup';
import Toast from '../components/Toast';
import AuthShell, { authFieldClass, authInputClass, authLabelClass, authPrimaryButtonClass } from '../components/AuthShell';
import CountrySelector from '../components/CountrySelector';
import { signupRequest } from '../../lib/api/auth-client';
import { ApiClientError } from '../../lib/api/client';
import {
	sanitizeInput,
	isValidEmail,
	isStrongPassword,
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
				referralCode: formData.referralCode.trim() ? sanitizeInput(formData.referralCode).trim() : undefined,
			};

			await signupRequest(signupData);

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
				if (error.status === 409 || error.message?.toLowerCase().includes('already exists')) {
					setToastTitle('Email Already Registered');
					setToastMessage('This email is already registered. Please sign in or use a different email address.');
				} else if (error.status === 422) {
					setToastTitle('Invalid Information');
					setToastMessage('Please check your information and try again.');
				} else {
					setToastTitle('Signup Failed');
					setToastMessage(error.message || 'Unable to create your account. Please try again.');
				}
				if (error.errors) {
					const fieldErrors: Partial<typeof initialFormState> = {};
					Object.keys(error.errors).forEach((key) => {
						if (key in initialFormState) {
							fieldErrors[key as keyof typeof initialFormState] = error.errors![key][0];
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
		<AuthShell
			wide={step === 'details'}
			title={step === 'details' ? 'Create your account' : step === 'verify' ? 'Verify your email' : 'You’re all set'}
			subtitle={
				step === 'details'
					? 'Start your evaluation journey in minutes.'
					: step === 'verify'
						? 'Enter the 4 digit code we sent to your inbox.'
						: 'Your account is ready. You can sign in now.'
			}
			footer={
				step === 'details' ? (
					<>
						Already have an account?{' '}
						<Link href="/login" className="font-semibold text-[#5235ff] hover:text-[#4527f0]">
							Sign in
						</Link>
					</>
				) : undefined
			}
		>
			{step === 'details' && (
				<form onSubmit={handleDetailsSubmit} noValidate>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						{/* Full name */}
						<div className="space-y-2">
							<label htmlFor="name" className={authLabelClass}>
								Full name
							</label>
							<div className={authFieldClass(!!formErrors.name)}>
								<User className={`h-[18px] w-[18px] shrink-0 ${formErrors.name ? 'text-red-400' : 'text-slate-400'}`} />
								<input
									id="name"
									type="text"
									autoComplete="name"
									value={formData.name}
									onChange={handleFormChange('name')}
									placeholder="John Smith"
									className={authInputClass}
								/>
							</div>
							{formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
						</div>

						{/* Email */}
						<div className="space-y-2">
							<label htmlFor="email" className={authLabelClass}>
								Email address
							</label>
							<div className={authFieldClass(!!formErrors.email)}>
								<Mail className={`h-[18px] w-[18px] shrink-0 ${formErrors.email ? 'text-red-400' : 'text-slate-400'}`} />
								<input
									id="email"
									type="email"
									autoComplete="email"
									value={formData.email}
									onChange={handleFormChange('email')}
									placeholder="name@company.com"
									className={authInputClass}
								/>
							</div>
							{formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
						</div>

						{/* Country */}
						<div className="space-y-2">
							<label className={authLabelClass}>Country</label>
							<CountrySelector
								value={formData.country}
								onChange={(value) => {
									setFormData((prev) => ({ ...prev, country: value }));
									if (formErrors.country) setFormErrors((prev) => ({ ...prev, country: undefined }));
								}}
								error={formErrors.country}
								disabled={isLoading}
							/>
							{formErrors.country && <p className="text-sm text-red-600">{formErrors.country}</p>}
						</div>

						{/* Referral code (optional) */}
						<div className="space-y-2">
							<label htmlFor="referralCode" className={authLabelClass}>
								Referral code <span className="font-normal text-slate-400">(optional)</span>
							</label>
							<div className={authFieldClass(!!formErrors.referralCode)}>
								<Gift className="h-[18px] w-[18px] shrink-0 text-slate-400" />
								<input
									id="referralCode"
									type="text"
									value={formData.referralCode}
									onChange={handleFormChange('referralCode')}
									placeholder="Enter code"
									className={authInputClass}
								/>
							</div>
							{formErrors.referralCode && <p className="text-sm text-red-600">{formErrors.referralCode}</p>}
						</div>

						{/* Password */}
						<div className="space-y-2">
							<label htmlFor="password" className={authLabelClass}>
								Password
							</label>
							<div className={authFieldClass(!!formErrors.password)}>
								<Lock className={`h-[18px] w-[18px] shrink-0 ${formErrors.password ? 'text-red-400' : 'text-slate-400'}`} />
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="new-password"
									value={formData.password}
									onChange={handleFormChange('password')}
									placeholder="Min. 8 characters"
									className={authInputClass}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((p) => !p)}
									className="-mr-1.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
								</button>
							</div>
							{formErrors.password && <p className="text-sm text-red-600">{formErrors.password}</p>}
						</div>

						{/* Confirm password */}
						<div className="space-y-2">
							<label htmlFor="confirmPassword" className={authLabelClass}>
								Confirm password
							</label>
							<div className={authFieldClass(!!formErrors.confirmPassword)}>
								<Lock className={`h-[18px] w-[18px] shrink-0 ${formErrors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
								<input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									autoComplete="new-password"
									value={formData.confirmPassword}
									onChange={handleFormChange('confirmPassword')}
									placeholder="Re-enter password"
									className={authInputClass}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((p) => !p)}
									className="-mr-1.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
									aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
								>
									{showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
								</button>
							</div>
							{formErrors.confirmPassword && <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>}
						</div>

						{/* Terms */}
						<label className="flex cursor-pointer items-start gap-2.5 sm:col-span-2">
							<input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#5235ff]" />
							<span className="text-sm text-slate-600">
								I agree to the{' '}
								<Link href="/terms" className="font-medium text-[#0b1020] underline underline-offset-2 hover:text-[#5235ff]">
									Terms
								</Link>{' '}
								and{' '}
								<Link href="/policy" className="font-medium text-[#0b1020] underline underline-offset-2 hover:text-[#5235ff]">
									Privacy Policy
								</Link>
								.
							</span>
						</label>

						<button type="submit" disabled={isLoading} className={`${authPrimaryButtonClass} sm:col-span-2`}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Creating account…
								</>
							) : (
								<>
									Create account <ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</div>
				</form>
			)}

			{step === 'verify' && (
				<div>
					<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efecff] text-[#5235ff]">
							<Mail className="h-5 w-5" />
						</span>
						<div className="min-w-0">
							<p className="truncate text-sm text-slate-600">
								Code sent to <span className="font-semibold text-[#0b1020]">{formData.email}</span>
							</p>
							<p className="mt-0.5 text-xs text-slate-400">
								Demo code: <span className="font-mono font-semibold text-[#0b1020]">{generatedCode || '------'}</span>
							</p>
						</div>
					</div>

					<form onSubmit={handleVerificationSubmit} className="mt-6 space-y-5">
						<div className="flex items-center justify-between">
							<label className={authLabelClass}>Verification code</label>
							<button
								type="button"
								onClick={handleResendCode}
								disabled={resendCooldown > 0}
								className="text-sm font-medium text-[#5235ff] transition-colors hover:text-[#4527f0] disabled:text-slate-400"
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
									ref={(el) => {
										if (el) verificationInputs.current[index] = el;
									}}
									className="h-16 rounded-xl border border-slate-200 bg-white text-center text-2xl font-semibold text-[#0b1020] transition-all focus:border-[#5235ff] focus:outline-none focus:ring-4 focus:ring-[#5235ff]/10"
								/>
							))}
						</div>
						{verificationError && <p className="text-sm text-red-600">{verificationError}</p>}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleBackToDetails}
								className="h-12 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
							>
								Edit email
							</button>
							<button type="submit" disabled={!verificationComplete} className={`${authPrimaryButtonClass} flex-1`}>
								Verify
							</button>
						</div>
					</form>
				</div>
			)}

			{step === 'complete' && (
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
					<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
						<CheckCircle2 className="h-6 w-6" />
					</span>
					<p className="mt-4 text-sm text-slate-600">
						Your account is ready. Sign in with your email and password to access the dashboard.
					</p>
					<Link href="/login" className={`${authPrimaryButtonClass} mt-6`}>
						Go to login <ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			)}

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
		</AuthShell>
	);
}
