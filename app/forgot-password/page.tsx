'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Syne } from 'next/font/google';
import HeroBG from '../components/HeroBG';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

	const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

	const handleSubmit = async (event: React.FormEvent) => {
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

		await new Promise((resolve) => setTimeout(resolve, 1200));

		setStatus('success');
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
						<span className="ml-2 text-xl font-semibold tracking-wide text-white/90 md:text-2xl">FxGenz</span>
					</span>
				</Link>

				<div className="rounded-3xl border border-white/10 bg-[#37353E]/60 p-10 shadow-2xl backdrop-blur-xl">
					<h1 className="text-3xl font-bold text-white">Forgot password</h1>
					<p className="mt-3 text-sm text-white/60">
						Enter your account email and we&apos;ll send instructions to reset your password.
					</p>

					{status === 'success' ? (
						<div className="mt-10 space-y-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-sm text-emerald-200">
							<p className="font-semibold text-emerald-100">Reset email sent</p>
							<p>
								Check your inbox for a secure link to reset your password. The link expires in 15 minutes, so be
								sure to act soon.
							</p>
							<p>
								Didn&apos;t receive it? Check your spam folder or{' '}
								<button
									type="button"
									className="font-semibold text-white hover:text-white/80"
									onClick={() => {
										setStatus('idle');
										setEmail('');
									}}
								>
									try again
								</button>
								.
							</p>
						</div>
					) : (
						<form className="mt-10 space-y-6" onSubmit={handleSubmit}>
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
										Sending reset link...
									</span>
								) : (
									'Send reset link'
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







