'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import SuccessPopup from '../components/SuccessPopup';
import Toast from '../components/Toast';
import AuthShell, { authFieldClass, authInputClass, authLabelClass, authPrimaryButtonClass } from '../components/AuthShell';
import { signinRequest } from '../../lib/api/auth-client';
import { ApiClientError } from '../../lib/api/client';
import {
	sanitizeInput,
	isValidEmail,
	setUser,
	trackLoginAttempt,
	clearLoginAttempts,
	getRemainingLockoutTime,
} from '../../lib/auth-utils';

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(true);
	const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'loading'>('success');
	const [toastTitle, setToastTitle] = useState<string | undefined>(undefined);
	const [showPassword, setShowPassword] = useState(false);

	const performLogin = async (rawEmail: string, rawPassword: string, remember: boolean) => {
		const sanitizedEmail = sanitizeInput(rawEmail).trim().toLowerCase();

		if (!trackLoginAttempt(sanitizedEmail)) {
			const lockoutTime = getRemainingLockoutTime(sanitizedEmail);
			setToastType('error');
			setToastTitle('Account Locked');
			setToastMessage(`Too many failed login attempts. Please try again in ${Math.ceil(lockoutTime / 60)} minutes.`);
			return;
		}

		setIsLoading(true);
		setFormErrors({});
		setToastType('loading');
		setToastTitle('Signing In');
		setToastMessage('Verifying your credentials...');

		try {
			const response = await signinRequest({
				email: sanitizedEmail,
				password: rawPassword,
				rememberMe: remember,
			});

			clearLoginAttempts(sanitizedEmail);
			setUser(response.user, remember);

			setToastType('success');
			setToastTitle('Welcome Back!');
			setToastMessage('Login successful. Taking you to your trading dashboard...');

			setTimeout(() => {
				router.push('/dashboard/overview');
			}, 2000);
		} catch (error) {
			setIsLoading(false);
			if (error instanceof ApiClientError) {
				setToastType('error');
				if (error.status === 401 || error.status === 400) {
					setToastTitle('Login Failed');
					setToastMessage('Invalid email or password. Please check your credentials and try again.');
					setFormErrors({ password: 'Invalid email or password. Please try again.' });
				} else if (error.status === 429) {
					setToastTitle('Too Many Attempts');
					setToastMessage('You have made too many login attempts. Please wait a few minutes and try again.');
					setFormErrors({ email: 'Too many requests. Please try again later.' });
				} else if (error.status === 403) {
					setToastTitle('Account Suspended');
					setToastMessage('Your account has been suspended. Please contact support for assistance.');
				} else if (error.status === 422) {
					setToastTitle('Invalid Input');
					setToastMessage('Please check your email and password format.');
				} else if (error.errors) {
					setToastTitle('Login Failed');
					setToastMessage(error.message || 'Unable to log in. Please check your information.');
					const fieldErrors: { email?: string; password?: string } = {};
					if (error.errors.username || error.errors.email) {
						fieldErrors.email = (error.errors.username || error.errors.email)[0];
					}
					if (error.errors.password) {
						fieldErrors.password = error.errors.password[0];
					}
					setFormErrors(fieldErrors);
				} else {
					setToastTitle('Login Failed');
					setToastMessage(error.message || 'Unable to log in. Please try again.');
				}
			} else {
				setToastType('error');
				setToastTitle('Connection Error');
				setToastMessage('Unable to connect to the server. Please check your internet connection and try again.');
			}
		}
	};

	useEffect(() => {
		// Admin "login as user" handoff: reads sessionStorage and auto-submits once.
		try {
			const params = new URLSearchParams(window.location.search);
			if (params.get('adminAutoLogin') !== '1') return;
			const raw = sessionStorage.getItem('admin_auto_login');
			if (!raw) return;
			sessionStorage.removeItem('admin_auto_login');

			const parsed = JSON.parse(raw) as { email?: string; password?: string; remember?: boolean };
			if (!parsed?.email || !parsed?.password) return;

			setEmail(parsed.email);
			setPassword(parsed.password);
			setRememberMe(Boolean(parsed.remember));

			// Trigger login with provided credentials
			void performLogin(parsed.email, parsed.password, Boolean(parsed.remember));
		} catch {
			// ignore
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// After signup -> verify email -> login: prefill email/password once.
		try {
			const raw = sessionStorage.getItem('login_prefill');
			if (!raw) return;
			sessionStorage.removeItem('login_prefill');

			const parsed = JSON.parse(raw) as { email?: string; password?: string };
			if (parsed?.email) setEmail(parsed.email);
			if (parsed?.password) setPassword(parsed.password);
		} catch {
			// ignore
		}
	}, []);

	const validateForm = () => {
		const nextErrors: typeof formErrors = {};

		const sanitizedEmail = sanitizeInput(email);

		if (!sanitizedEmail.trim()) {
			nextErrors.email = 'Please enter the email linked to your GenzProp account.';
		} else if (!isValidEmail(sanitizedEmail)) {
			nextErrors.email = 'Use a valid email address (e.g. name@domain.com).';
		}

		if (!password) {
			nextErrors.password = 'Enter your password to continue.';
		} else if (password.length < 8) {
			nextErrors.password = 'Passwords must be at least 8 characters.';
		}

		const lockoutTime = getRemainingLockoutTime(sanitizedEmail);
		if (lockoutTime > 0) {
			nextErrors.email = `Too many failed attempts. Please try again in ${Math.ceil(lockoutTime / 60)} minutes.`;
		}

		setFormErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleFormChange =
		(field: 'email' | 'password') =>
		(event: ChangeEvent<HTMLInputElement>) => {
			if (field === 'email') setEmail(event.target.value);
			else setPassword(event.target.value);
			if (formErrors[field]) {
				setFormErrors((prev) => ({ ...prev, [field]: undefined }));
			}
		};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateForm()) return;
		await performLogin(email, password, rememberMe);
	};

	return (
		<AuthShell
			title="Welcome back"
			subtitle="Sign in to continue to your trading dashboard."
			footer={
				<>
					Don&apos;t have an account?{' '}
					<Link href="/signup" className="font-semibold text-[#5235ff] hover:text-[#4527f0]">
						Create one
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
							value={email}
							onChange={handleFormChange('email')}
							placeholder="name@company.com"
							className={authInputClass}
						/>
					</div>
					{formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
				</div>

				{/* Password */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label htmlFor="password" className={authLabelClass}>
							Password
						</label>
						<Link href="/forgot-password" className="text-sm font-medium text-[#5235ff] hover:text-[#4527f0]">
							Forgot password?
						</Link>
					</div>
					<div className={authFieldClass(!!formErrors.password)}>
						<Lock className={`h-[18px] w-[18px] shrink-0 ${formErrors.password ? 'text-red-400' : 'text-slate-400'}`} />
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							value={password}
							onChange={handleFormChange('password')}
							placeholder="Enter your password"
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

				<label className="flex w-fit cursor-pointer items-center gap-2.5">
					<input
						type="checkbox"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						className="h-4 w-4 rounded border-slate-300 accent-[#5235ff]"
					/>
					<span className="text-sm text-slate-600">Keep me signed in on this device</span>
				</label>

				<button type="submit" disabled={isLoading} className={authPrimaryButtonClass}>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Signing in…
						</>
					) : (
						<>
							Sign in <ArrowRight className="h-4 w-4" />
						</>
					)}
				</button>
			</form>

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
