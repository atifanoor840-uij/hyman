'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Syne } from 'next/font/google';
import HeroBG from '../components/HeroBG';

const brandFont = Syne({ subsets: ['latin'], weight: ['700', '800'] });

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
	const [code, setCode] = useState(Array<string>(CODE_LENGTH).fill(''));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(
		'We sent you a 6-digit verification code. Please enter it below to activate your account.',
	);

	const mergedCode = useMemo(() => code.join('').trim(), [code]);
	const isCodeComplete = useMemo(() => mergedCode.length === CODE_LENGTH, [mergedCode]);

	const handleCodeChange = (value: string, index: number) => {
		if (!/^[0-9]*$/.test(value)) return;

		const digits = value.split('').slice(0, CODE_LENGTH);
		const next = [...code];

		if (digits.length > 1) {
			digits.forEach((digit, digitIndex) => {
				if (index + digitIndex < CODE_LENGTH) {
					next[index + digitIndex] = digit;
				}
			});
		} else {
			next[index] = value;
		}

		setCode(next);
		setError(null);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!isCodeComplete) {
			setError('Please enter the full 6-digit code.');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		await new Promise((resolve) => setTimeout(resolve, 1200));

		const isValid = mergedCode === '123456';
		if (!isValid) {
			setError('The verification code you entered is incorrect. Please try again.');
			setIsSubmitting(false);
			return;
		}

		setInfo('Success! Your email is verified. Redirecting you to your dashboard...');
		await new Promise((resolve) => setTimeout(resolve, 1400));
		setIsSubmitting(false);
	};

	const handleResend = async () => {
		setIsResending(true);
		setError(null);
		setInfo('Sending a new verification code to your inbox...');

		await new Promise((resolve) => setTimeout(resolve, 1500));

		setCode(Array<string>(CODE_LENGTH).fill(''));
		setIsResending(false);
		setInfo('A fresh verification code has been sent. Check your email and enter it below.');
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
					<h1 className="text-3xl font-bold text-white">Verify your email</h1>
					<p className="mt-3 text-sm text-white/60">
						{info ?? 'Enter the verification code that was sent to your inbox.'}
					</p>

					<form className="mt-10 space-y-8" onSubmit={handleSubmit}>
						<div className="flex items-center justify-center gap-4 md:gap-5">
							{code.map((value, index) => (
								<input
									key={`code_${index}`}
									inputMode="numeric"
									autoComplete="one-time-code"
									value={value}
									onChange={(event) => handleCodeChange(event.target.value, index)}
									onFocus={(event) => event.target.select()}
									maxLength={1}
									className="h-16 w-12 rounded-xl border border-white/15 bg-white/5 text-center text-2xl font-semibold tracking-wide text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20 md:h-20 md:w-14"
								/>
							))}
						</div>
						{error && <p className="text-center text-sm text-red-400">{error}</p>}

						<button
							type="submit"
							disabled={!isCodeComplete || isSubmitting}
							className="flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b0b0f] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? (
								<span className="flex items-center gap-2">
									<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Verifying...
								</span>
							) : (
								'Verify email'
							)}
						</button>
					</form>

					<div className="mt-8 flex flex-col items-center gap-4 text-sm text-white/70 md:flex-row md:justify-between">
						<button
							type="button"
							onClick={handleResend}
							disabled={isResending}
							className="flex items-center gap-2 text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							{isResending ? (
								<>
									<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Sending new code...
								</>
							) : (
								<>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 7l-5 5 5 5"
										/>
									</svg>
									Send again
								</>
							)}
						</button>
						<Link href="/login" className="font-semibold text-white transition hover:text-white/80">
							Back to sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}


