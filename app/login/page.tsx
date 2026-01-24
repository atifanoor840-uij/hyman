'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inter, Syne } from 'next/font/google';
import Toast from '../components/Toast';
import { login } from '../../lib/api/auth';
import { ApiClientError } from '../../lib/api/client';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });
const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

const highlights = [
	{
		title: 'Secure Access',
		description: 'Enterprise-grade security with real-time monitoring.',
	},
	{
		title: '24/7 Support',
		description: 'Access your trading platform anytime, anywhere.',
	},
];

const CURRENT_YEAR = new Date().getFullYear();

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
	const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
	const [statusMessage, setStatusMessage] = useState('');
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

	const validateForm = () => {
		const nextErrors: typeof formErrors = {};

		if (!email.trim()) {
			nextErrors.email = 'Please enter the email linked to your FxGenz account.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			nextErrors.email = 'Use a valid email address (e.g. name@domain.com).';
		}

		if (!password) {
			nextErrors.password = 'Enter your password to continue.';
		} else if (password.length < 8) {
			nextErrors.password = 'Passwords must be at least 8 characters.';
		}

		setFormErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validateForm()) return;

		setStatus('loading');
		setStatusMessage('');
		setFormErrors({});

		try {
			const response = await login({
				username: email.trim(),
				password: password,
			});

			// Store token if provided
			if (response.token) {
				if (rememberMe) {
					localStorage.setItem('auth_token', response.token);
				} else {
					sessionStorage.setItem('auth_token', response.token);
				}
			}

			setStatus('success');
			setStatusMessage('Success! Redirecting you to your dashboard…');
			setToastType('success');
			setToastMessage('Login successful. Redirecting you to your FxGenz dashboard.');

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				router.push('/dashboard');
			}, 1500);
		} catch (error) {
			setStatus('idle');
			if (error instanceof ApiClientError) {
				const errorMessage = error.message || 'Failed to log in. Please check your credentials.';
				setToastType('error');
				setToastMessage(errorMessage);
				
				// Handle specific field errors
				if (error.status === 401) {
					setFormErrors({
						password: 'Invalid email or password. Please try again.',
					});
				} else if (error.errors) {
					const fieldErrors: { email?: string; password?: string } = {};
					if (error.errors.username) {
						fieldErrors.email = error.errors.username[0];
					}
					if (error.errors.password) {
						fieldErrors.password = error.errors.password[0];
					}
					setFormErrors(fieldErrors);
				}
			} else {
				setToastType('error');
				setToastMessage('An unexpected error occurred. Please try again.');
			}
		}
	};

	return (
		<main className={`relative min-h-screen overflow-hidden bg-[#050608] text-white ${bodyFont.className}`}>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/30 blur-[120px]" />
				<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
				<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/20 blur-[160px]" />
			</div>

			<div className="relative z-10 grid min-h-screen grid-cols-1 gap-y-10 lg:grid-cols-[1fr_1.1fr]">
				<section className="flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-14">
					<div className="mb-12">
						<Link href="/" className="inline-flex items-center gap-3 text-white transition hover:text-white/80">
							<span className={`${brandFont.className} text-3xl font-extrabold tracking-tight`}>
								Fx<span className="text-[#61f9e7]">Genz</span>
							</span>
						</Link>
					</div>

					<div className="max-w-md">
						<h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
							Welcome Back
						</h1>
						<p className="mt-4 text-lg text-white/80">
							Sign in to access your trading dashboard and manage your funded accounts.
						</p>
					</div>

					<div className="mt-12 space-y-4">
						{highlights.map((item) => (
							<div
								key={item.title}
								className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
							>
								<div className="mt-1 h-2 w-2 rounded-full bg-[#61f9e7]" />
								<div>
									<h3 className="text-base font-semibold text-white">{item.title}</h3>
									<p className="mt-1 text-sm text-white/60">{item.description}</p>
								</div>
							</div>
						))}
					</div>

					<div className="mt-auto pt-12 text-xs text-white/40">
						© {CURRENT_YEAR} FxGenz. All rights reserved.
					</div>
				</section>

				<section className="flex items-center justify-center bg-[#f7f7fa]/90 px-6 py-20 backdrop-blur-xl lg:px-12">
					<div className="w-full max-w-md rounded-[32px] border border-slate-200/60 bg-white p-10 shadow-[0_25px_80px_rgba(15,20,35,0.18)]">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Welcome back 👋</h2>
							<Link href="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
								Create account
							</Link>
						</div>
						<p className="mt-2 text-sm text-slate-500">
							Enter your credentials to access trading workspaces, market automation, and insights.
						</p>

						<form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
							<div>
								<label htmlFor="email" className="text-sm font-medium text-slate-700">
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(event) => {
										setEmail(event.target.value);
										if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
									}}
									className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
										formErrors.email ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-900'
									}`}
									placeholder="you@fxgenz.com"
								/>
								{formErrors.email ? (
									<p className="mt-2 text-xs font-medium text-red-500">{formErrors.email}</p>
								) : (
									<p className="mt-2 text-xs text-slate-400">
										Prefer passkeys? Enable passwordless access once you sign in.
									</p>
								)}
							</div>

							<div>
								<label htmlFor="password" className="text-sm font-medium text-slate-700">
									Password
								</label>
								<div
									className={`mt-2 flex items-center rounded-2xl border px-4 ${
										formErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
									}`}
								>
									<input
										id="password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(event) => {
											setPassword(event.target.value);
											if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
										}}
										className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
										placeholder="Your secure password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((prev) => !prev)}
										className="ml-3 text-xs font-semibold uppercase tracking-wide text-indigo-600 transition hover:text-indigo-500"
									>
										{showPassword ? 'Hide' : 'Show'}
									</button>
								</div>
								{formErrors.password ? (
									<p className="mt-2 text-xs font-medium text-red-500">{formErrors.password}</p>
								) : (
									<p className="mt-2 text-xs text-slate-400">Minimum 8 characters with numbers & symbols recommended.</p>
								)}
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<label className="inline-flex items-center gap-2 text-xs text-slate-500">
									<input
										type="checkbox"
										checked={rememberMe}
										onChange={(event) => setRememberMe(event.target.checked)}
										className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
									/>
									Remember this device
								</label>
								<Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
									Forgot password?
								</Link>
							</div>

							<button
								type="submit"
								disabled={status === 'loading'}
								className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{status === 'loading' ? (
									<>
										<svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Processing...
									</>
								) : (
									'Sign in to FxGenz'
								)}
							</button>

							<div className="flex items-center gap-2 text-xs text-slate-500">
								<span className="h-px flex-1 bg-slate-200" />
								Or continue with
								<span className="h-px flex-1 bg-slate-200" />
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<button
									type="button"
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
								>
									<span className="text-lg">🔐</span>
									Passkey
								</button>
								<button
									type="button"
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
								>
									<span className="text-lg">G</span>
									Google
								</button>
							</div>

							{statusMessage && (
								<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-600">
									{statusMessage}
								</div>
							)}
						</form>
					</div>
				</section>
			</div>
			<Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
		</main>
	);
}

