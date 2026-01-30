'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inter, Syne } from 'next/font/google';
import Toast from '../components/Toast';
import { login } from '../../lib/api/auth';
import { ApiClientError } from '../../lib/api/client';
import {
	sanitizeInput,
	isValidEmail,
	setAuthToken,
	setUser,
	trackLoginAttempt,
	clearLoginAttempts,
	getRemainingLockoutTime,
} from '../../lib/auth-utils';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });
const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

const CURRENT_YEAR = new Date().getFullYear();

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

	const validateForm = () => {
		const nextErrors: typeof formErrors = {};

		const sanitizedEmail = sanitizeInput(email);

		if (!sanitizedEmail.trim()) {
			nextErrors.email = 'Please enter the email linked to your FxGenz account.';
		} else if (!isValidEmail(sanitizedEmail)) {
			nextErrors.email = 'Use a valid email address (e.g. name@domain.com).';
		}

		if (!password) {
			nextErrors.password = 'Enter your password to continue.';
		} else if (password.length < 8) {
			nextErrors.password = 'Passwords must be at least 8 characters.';
		}

		// Check rate limiting
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

		const sanitizedEmail = sanitizeInput(email).trim().toLowerCase();

		// Check if user is rate-limited
		if (!trackLoginAttempt(sanitizedEmail)) {
			const lockoutTime = getRemainingLockoutTime(sanitizedEmail);
			setToastType('error');
			setToastTitle('Account Locked');
			setToastMessage(`Too many failed login attempts. Please try again in ${Math.ceil(lockoutTime / 60)} minutes.`);
			return;
		}

		setIsLoading(true);
		setFormErrors({});
		
		// Show loading toast
		setToastType('loading');
		setToastTitle('Signing In');
		setToastMessage('Verifying your credentials...');

		try {
			const response = await login({
				username: sanitizedEmail,
				password: password,
			});

			// Handle both 'token' and 'access_token' response formats
			const authToken = response.token || response.access_token;

			if (authToken) {
				// Clear failed login attempts on successful login
				clearLoginAttempts(sanitizedEmail);

				// Store token and user data securely
				setAuthToken(authToken, rememberMe);
				if (response.user) {
					setUser(response.user, rememberMe);
				}
			}

			setToastType('success');
			setToastTitle('Welcome Back!');
			setToastMessage('Login successful. Taking you to your trading dashboard...');

			setTimeout(() => {
				router.push('/dashboard');
			}, 2000);
		} catch (error) {
			setIsLoading(false);
			if (error instanceof ApiClientError) {
				setToastType('error');
				
				if (error.status === 401 || error.status === 400) {
					setToastTitle('Login Failed');
					setToastMessage('Invalid email or password. Please check your credentials and try again.');
					setFormErrors({
						password: 'Invalid email or password. Please try again.',
					});
				} else if (error.status === 429) {
					setToastTitle('Too Many Attempts');
					setToastMessage('You have made too many login attempts. Please wait a few minutes and try again.');
					setFormErrors({
						email: 'Too many requests. Please try again later.',
					});
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
							Sign in to your FxGenz account
						</h1>
						<p className="mt-3 text-sm text-zinc-500">
							Use the same credentials to access all FxGenz products and your trading dashboard.
						</p>
					</div>

					<div className="mt-auto pt-10 text-xs text-zinc-400">
						© {CURRENT_YEAR} FxGenz. All rights reserved.
					</div>
				</aside>

				<section className="flex flex-1 items-center justify-center pt-6 lg:pt-0">
					<div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
						<div className="flex items-center justify-between gap-6">
							<div>
								<h2 className="text-xl font-semibold text-black sm:text-2xl">
									Log in
								</h2>
								<p className="mt-2 text-sm text-zinc-600">
									Enter your email and password to access your FxGenz dashboard.
								</p>
							</div>
							<Link
								href="/signup"
								className="hidden shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700 transition hover:bg-zinc-900 hover:text-white md:inline-flex"
							>
								Create account
							</Link>
						</div>

						<form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
									value={email}
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
										The email you used to create your FxGenz account.
									</p>
								)}
							</div>

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
									value={password}
									onChange={handleFormChange('password')}
									className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide text-zinc-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
										formErrors.password ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'
									}`}
									placeholder="Your password"
								/>
								{formErrors.password ? (
									<p className="mt-2 text-xs font-medium text-red-500">{formErrors.password}</p>
								) : (
									<p className="mt-2 text-xs text-zinc-500">
										Minimum 8 characters. Forgot?{' '}
										<Link href="/forgot-password" className="font-semibold text-black underline underline-offset-4">
											Reset password
										</Link>
									</p>
								)}
							</div>

							<div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
								<input
									id="remember"
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className="mt-1 h-4 w-4 rounded border-zinc-300 bg-white text-black focus:ring-black/20"
								/>
								<label htmlFor="remember" className="text-xs text-zinc-700">
									Remember this device so I don&apos;t have to sign in again next time.
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
										Signing in…
									</>
								) : (
									'Sign in'
								)}
							</button>
						</form>

						<div className="mt-10 text-center text-xs text-zinc-500">
							Don&apos;t have an account?{' '}
							<Link href="/signup" className="font-semibold text-black underline underline-offset-4">
								Create one
							</Link>
						</div>
					</div>
				</section>
			</div>
			<Toast 
				message={toastMessage} 
				type={toastType}
				title={toastTitle}
				duration={toastType === 'success' ? 6000 : 5000}
				onClose={() => {
					setToastMessage(null);
					setToastTitle(undefined);
				}} 
			/>
		</main>
	);
}
