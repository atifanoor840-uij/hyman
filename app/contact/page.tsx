'use client';

import { FormEvent, useState } from 'react';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HEADER_IMAGE_2 } from '@/lib/header-image';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [statusMessage, setStatusMessage] = useState('');

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setStatus('loading');
		setStatusMessage('');

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1200));

		setStatus('success');
		setStatusMessage('Thank you! We\'ll get back to you within 24 hours.');
		setFormData({ name: '', email: '', subject: '', message: '' });
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Header Section with background */}
			<section className="relative overflow-hidden bg-[#050406]">
				{/* Decorative gradient overlays */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				{/* Subtle vignette */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12 mt-16 lg:mt-20">
						<div className="max-w-4xl space-y-6 text-left">
							<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
								Contact Us
							</h1>
							<p className="text-lg text-white/70 md:text-xl max-w-2xl">
								Have questions? We're here to help. Reach out to our support team anytime.
							</p>
						</div>
						<div className="flex-shrink-0 lg:max-w-md xl:max-w-lg">
							<img src={HEADER_IMAGE_2} alt="Fx Genz contact" className="w-full h-auto rounded-xl object-contain shadow-2xl" />
						</div>
					</div>
				</div>
				{/* Subtle divider curve */}
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			{/* Main content with white background */}
			<main className="bg-white">
				<div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
					<div className="grid gap-12 lg:grid-cols-2">
						{/* Contact Information */}
						<div>
							<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-6`}>
								Get in Touch
							</h2>
							<p className="text-[#37353E]/80 mb-8 leading-relaxed">
								Our support team is available 24/7 to assist you with any questions about trading, account management, or technical issues.
							</p>

							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 rounded-full bg-[#f0f9ff] p-3">
										<svg className="h-6 w-6 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-[#0b0b0f] mb-1">Email</h3>
										<a href="mailto:support@fxgenz.com" className="text-[#0ea5e9] hover:underline">
											support@fxgenz.com
										</a>
										<p className="text-sm text-[#37353E]/70 mt-1">We respond within 24 hours</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 rounded-full bg-[#f0f9ff] p-3">
										<svg className="h-6 w-6 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-[#0b0b0f] mb-1">Live Chat</h3>
										<p className="text-[#37353E]/80">Available 24/7 on our platform</p>
										<p className="text-sm text-[#37353E]/70 mt-1">Instant responses</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 rounded-full bg-[#f0f9ff] p-3">
										<svg className="h-6 w-6 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-[#0b0b0f] mb-1">Response Time</h3>
										<p className="text-[#37353E]/80">Average response: Under 2 hours</p>
										<p className="text-sm text-[#37353E]/70 mt-1">Priority support for funded traders</p>
									</div>
								</div>
							</div>

							<div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-[#f9f9f9] p-6">
								<h3 className="font-semibold text-[#0b0b0f] mb-2">Business Hours</h3>
								<p className="text-sm text-[#37353E]/80">
									Our support team operates 24/7. For urgent matters, use live chat for immediate assistance.
								</p>
							</div>
						</div>

						{/* Contact Form */}
						<div>
							<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-6`}>
								Send us a Message
							</h2>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label htmlFor="name" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										Full Name
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
										placeholder="John Doe"
									/>
								</div>

								<div>
									<label htmlFor="email" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										Email Address
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
										placeholder="john@example.com"
									/>
								</div>

								<div>
									<label htmlFor="subject" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										Subject
									</label>
									<select
										id="subject"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										required
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
									>
										<option value="">Select a subject</option>
										<option value="general">General Inquiry</option>
										<option value="account">Account Support</option>
										<option value="trading">Trading Questions</option>
										<option value="technical">Technical Support</option>
										<option value="billing">Billing & Payments</option>
										<option value="other">Other</option>
									</select>
								</div>

								<div>
									<label htmlFor="message" className="block text-sm font-medium text-[#0b0b0f] mb-2">
										Message
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={6}
										className="w-full rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#0b0b0f] transition focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 resize-none"
										placeholder="Tell us how we can help..."
									/>
								</div>

								{statusMessage && (
									<div
										className={`rounded-xl border px-4 py-3 text-sm font-medium ${
											status === 'success'
												? 'border-emerald-200 bg-emerald-50 text-emerald-600'
												: 'border-red-200 bg-red-50 text-red-600'
										}`}
									>
										{statusMessage}
									</div>
								)}

								<button
									type="submit"
									disabled={status === 'loading'}
									className="w-full rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{status === 'loading' ? (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												/>
											</svg>
											Sending...
										</span>
									) : (
										'Send Message'
									)}
								</button>
							</form>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}





