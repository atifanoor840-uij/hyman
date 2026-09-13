'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Syne } from 'next/font/google';
import HeroBG from '../components/HeroBG';
import { forgotPasswordRequest, resetPasswordRequest } from '../../lib/api/auth-client';
import { ApiClientError } from '../../lib/api/client';
import { isStrongPassword } from '../../lib/auth-utils';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<'idle' | 'loading' | 'code-sent' | 'resetting' | 'done'>('idle');

	const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

	const handleRequestCode = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!email.trim()) {
			setError('Email is required');
			return;
		}
		if (!validateEmail(email)) {
			setError('Please enter a valid email address');
			return;
		}

		setError(null);
		setStatus('loading');

		try {
			await forgotPasswordRequest({ email: email.trim().toLowerCase() });
			setStatus('code-sent');
		} catch (err) {
			const message = err instanceof ApiClientError ? err.message : 'Unable to send reset code. Please try again.';
			setError(message);
			setStatus('idle');
		}
	};

	const handleResetPassword = async (event: React.FormEvent) => {
		event.preventDefault();

		if (code.trim().length !== 4) {
			setError('Enter the 4-digit code we sent you.');
			return;
		}
		if (!isStrongPassword(password)) {
			setError('Mix upper, lower, numbers and make it at least 8 characters.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setError(null);
		setStatus('resetting');

		try {
			await resetPasswordRequest({ email: email.trim().toLowerCase(), code: code.trim(), password });
			setStatus('done');
			setTimeout(() => router.push('/login'), 2000);
		} catch (err) {
			const message = err instanceof ApiClientError ? err.message : 'Unable to reset your password. Please try again.';
			setError(message);
			setStatus('code-sent');
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden">
			<HeroBG />
			<div className="relative z-10 w-full max-w-xl px-6 py-12">
				<Link href="/" className="mb-12 flex items-center justify-center gap-3">
					<span className={`${brandFont.className} flex items-center text-white`}>
						<span className="text-2xl font-extrabold tracking-tight md:text-3xl">
							<span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent">X</span>
						</span>
						<span className="ml-2 text-xl font-semibold tracking-wide text-white/90 md:text-2xl">GenzProp</span>
					</span>
				</Link>

				<div className="rounded-3xl border border-white/10 bg-[#37353E]/60 p-10 shadow-2xl backdrop-blur-xl">
					<h1 className="text-3xl font-bold text-white">Forgot password</h1>
					<p className="mt-3 text-sm text-white/60">
						{status === 'idle' || status === 'loading'
							? "Enter your account email and we'll send you a reset code."
							: status === 'done'
								? 'Your password has been reset.'
								: 'Enter the code we sent you and choose a new password.'}
					</p>

					{status === 'done' ? (
						<div className="mt-10 space-y-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-sm text-emerald-200">
							<p className="font-semibold text-emerald-100">Password reset</p>
							<p>Redirecting you to sign in...</p>
						</div>
					) : status === 'code-sent' || status === 'resetting' ? (
						<form className="mt-10 space-y-6" onSubmit={handleResetPassword}>
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
								If an account exists for <span className="font-semibold text-white">{email}</span>, a 4-digit code has been sent.
							</div>
							<div>
								<label htmlFor="code" className="mb-2 block text-sm font-medium text-white/80">
									Verification code
								</label>
								<input
									id="code"
									type="text"
									inputMode="numeric"
									maxLength={4}
									value={code}
									onChange={(event) => {
										setCode(event.target.value.replace(/\D/g, '').slice(0, 4));
										if (error) setError(null);
									}}
									className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-xl tracking-[0.4em] text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
									placeholder="0000"
								/>
							</div>
							<div>
								<label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
									New password
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(event) => {
										setPassword(event.target.value);
										if (error) setError(null);
									}}
									className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
									placeholder="Min. 8 characters"
								/>
							</div>
							<div>
								<label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/80">
									Confirm new password
								</label>
								<input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(event) => {
										setConfirmPassword(event.target.value);
										if (error) setError(null);
									}}
									className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
									placeholder="Re-enter password"
								/>
							</div>
							{error && <p className="text-sm text-red-400">{error}</p>}
							<button
								type="submit"
								disabled={status === 'resetting'}
								className="flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b0b0f] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							>
								{status === 'resetting' ? 'Resetting...' : 'Reset password'}
							</button>
							<button
								type="button"
								onClick={() => {
									setStatus('idle');
									setCode('');
									setPassword('');
									setConfirmPassword('');
									setError(null);
								}}
								className="w-full text-center text-sm text-white/60 hover:text-white"
							>
								Use a different email
							</button>
						</form>
					) : (
						<form className="mt-10 space-y-6" onSubmit={handleRequestCode}>
							<div>
								<label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
									Email address
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(event) => {
										setEmail(event.target.value);
										if (error) setError(null);
									}}
									className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20 ${
										error ? 'border-red-500/50' : 'border-white/15'
									}`}
									placeholder="you@example.com"
								/>
								{error && <p className="mt-2 text-sm text-red-400">{error}</p>}
							</div>

							<button
								type="submit"
								disabled={status === 'loading'}
								className="flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b0b0f] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							>
								{status === 'loading' ? (
									<span className="flex items-center gap-2">
										<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Sending reset code...
									</span>
								) : (
									'Send reset code'
								)}
							</button>
						</form>
					)}

					<div className="mt-10 flex flex-col items-center gap-5 text-sm text-white/70 md:flex-row md:justify-between">
						<Link href="/login" className="font-semibold text-white transition hover:text-white/80">
							Back to sign in
						</Link>
						<Link href="/signup" className="font-semibold text-white/80 transition hover:text-white">
							Create a new account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
