'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
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
				password: password,
			});

			const authToken = response.token || response.access_token;

			if (authToken) {
				clearLoginAttempts(sanitizedEmail);
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

	return (
		<div className="min-h-screen flex flex-col bg-white text-black">
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
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 lg:py-16">
				{/* Mobile: LOGIN / SIGN IN tabs */}
			<div className="lg:hidden flex rounded-full bg-zinc-100 p-1 gap-1 mb-8">
				<span className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">LOGIN</span>
				<Link href="/signup" className="px-4 py-2 rounded-full text-zinc-600 text-sm font-medium">
					SIGN IN
				</Link>
			</div>

				{/* Logo + Fxgenz name + LOGIN title */}
				<div className="flex flex-col items-center mb-8">
					<div className="flex items-center justify-center gap-3 mb-2">
						<Image
							src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
							alt="Fxgenz"
							width={48}
							height={48}
							className="object-contain"
						/>
						<span className="text-2xl font-bold text-black tracking-tight">Fxgenz</span>
					</div>
					<h1 className="text-xl font-bold text-zinc-600 tracking-tight">LOGIN</h1>
				</div>

				<form onSubmit={handleSubmit} className="w-full max-w-md">
					{/* Form card */}
					<div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-5">
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

				{/* Divider + Social */}
				<div className="mt-8 w-full max-w-md">
					<div className="flex items-center gap-4">
						<div className="flex-1 h-px bg-zinc-200" />
						<span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Or continue with</span>
						<div className="flex-1 h-px bg-zinc-200" />
					</div>
					<div className="flex items-center justify-center gap-3 mt-5">
						<button
							type="button"
							className="flex items-center justify-center w-11 h-11 rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
							aria-label="Login with Google"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
						</button>
						<button
							type="button"
							className="flex items-center justify-center w-11 h-11 rounded-xl border border-zinc-200 bg-[#1877F2] text-white shadow-sm hover:bg-[#166fe5] transition-colors"
							aria-label="Login with Facebook"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
							</svg>
						</button>
					</div>
				</div>

				<p className="mt-8 text-xs text-zinc-400">
					© {CURRENT_YEAR} FxGenz. All rights reserved.
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
