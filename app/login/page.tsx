'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import SuccessPopup from '../components/SuccessPopup';
import Navbar from '../components/Navbar';
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
			const response = await login({
				username: sanitizedEmail,
				password: rawPassword,
			});

			const authToken = response.token || response.access_token;

			if (authToken) {
				clearLoginAttempts(sanitizedEmail);
				setAuthToken(authToken, remember);
				if (response.user) {
					setUser(response.user, remember);
				}
			}

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
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-white to-zinc-50 text-black">
			<Navbar variant="sticky" />
			<main className="flex-1 flex min-h-0">
			{/* Left panel - professional geometric (folded planes / ribbons), black theme */}
			<div className="hidden lg:flex lg:w-[38%] xl:w-[40%] relative overflow-hidden bg-black">
				{/* Dark top bar */}
				<div className="absolute top-0 left-0 right-0 h-20 bg-black/90 z-[1]" />
				{/* Layered geometric shapes - overlapping ribbons/planes pointing right */}
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-zinc-950" />
					<div
						className="absolute -left-[10%] bottom-[5%] w-[95%] h-[75%] bg-zinc-800 shadow-2xl"
						style={{
							clipPath: 'polygon(0 15%, 92% 0, 100% 85%, 8% 100%)',
							transform: 'skewY(-1deg)',
						}}
					/>
					<div
						className="absolute -left-[5%] top-[18%] w-[88%] h-[60%] bg-zinc-700 shadow-xl"
						style={{
							clipPath: 'polygon(2% 0, 100% 12%, 98% 88%, 0 100%)',
							transform: 'skewY(2deg)',
						}}
					/>
					<div
						className="absolute right-0 top-[35%] w-[70%] h-[50%] bg-zinc-600/90 shadow-lg"
						style={{
							clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 100%)',
						}}
					/>
					<div
						className="absolute left-0 bottom-[8%] w-[45%] h-[40%] bg-zinc-500/70 shadow-md"
						style={{
							clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 70%)',
							transform: 'skewX(-8deg)',
						}}
					/>
				</div>
				{/* Tab - overlaps into white panel, professional look */}
				<div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 z-20 flex flex-col items-stretch min-w-[100px]">
					<div className="bg-white rounded-l-2xl pl-6 pr-8 py-4 shadow-[4px_0_24px_rgba(0,0,0,0.12)]">
						<span className="text-sm font-bold tracking-wide text-black">LOGIN</span>
					</div>
					<Link
						href="/signup"
						className="pl-6 pr-8 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
					>
						SIGN UP
					</Link>
				</div>
			</div>

			{/* Right panel - white login form */}
			<div className="flex-1 flex flex-col items-center justify-center min-h-0 px-6 py-12 lg:py-16 overflow-y-auto">
				{/* Mobile: LOGIN / SIGN IN tabs */}
			<div className="lg:hidden flex rounded-full bg-zinc-100 p-1 gap-1 mb-8">
				<span className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">LOGIN</span>
				<Link href="/signup" className="px-4 py-2 rounded-full text-zinc-600 text-sm font-medium">
					SIGN UP
				</Link>
			</div>

				{/* Logo + GenzProp name + LOGIN title */}
				<div className="flex flex-col items-center mb-8">
					<div className="flex items-center justify-center gap-3 mb-2">
						<Image
							src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
							alt="GenzProp"
							width={48}
							height={48}
							className="object-contain"
						/>
						<span className="text-2xl font-bold text-black tracking-tight">GenzProp</span>
					</div>
					<h1 className="text-xl font-bold text-zinc-600 tracking-tight">LOGIN</h1>
				</div>

				<form onSubmit={handleSubmit} className="w-full max-w-md">
					{/* Form card */}
					<div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.10)] space-y-5">
						{/* Email */}
						<div className="space-y-1.5">
							<label htmlFor="email" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
								Email address
							</label>
							<div
								className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-3 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
									formErrors.email
										? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10'
										: 'border-zinc-200 hover:border-zinc-300'
								}`}
							>
								<User className={`w-5 h-5 shrink-0 ${formErrors.email ? 'text-red-400' : 'text-zinc-400'} transition-colors`} />
								<input
									id="email"
									type="email"
									value={email}
									onChange={handleFormChange('email')}
									placeholder="name@company.com"
									className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
								/>
							</div>
							{formErrors.email && (
								<p className="text-xs font-medium text-red-600 flex items-center gap-1">{formErrors.email}</p>
							)}
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<label htmlFor="password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
								Password
							</label>
							<div
								className={`flex items-center gap-3 rounded-xl border bg-zinc-50/80 px-4 py-3 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black ${
									formErrors.password
										? 'border-red-300 bg-red-50/50 focus-within:border-red-400 focus-within:ring-red-500/10'
										: 'border-zinc-200 hover:border-zinc-300'
								}`}
							>
								<Lock className={`w-5 h-5 shrink-0 ${formErrors.password ? 'text-red-400' : 'text-zinc-400'} transition-colors`} />
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={handleFormChange('password')}
									placeholder="Enter your password"
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
							{formErrors.password && (
								<p className="text-xs font-medium text-red-600 flex items-center gap-1">{formErrors.password}</p>
							)}
						</div>

						{/* Remember me + Forgot password */}
						<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
							<label className="flex items-center gap-2.5 cursor-pointer group">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-2 focus:ring-black/20 focus:ring-offset-0"
								/>
								<span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">Remember this device</span>
							</label>
							<Link
								href="/forgot-password"
								className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
							>
								Forgot password?
							</Link>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<>
									<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
					</div>
				</form>

				<p className="mt-8 text-xs text-zinc-400">
					© {CURRENT_YEAR} GenzProp. All rights reserved.
				</p>
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
		</div>
	);
}
