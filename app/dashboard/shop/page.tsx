'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';
import { Tag, X, CheckCircle2, Wallet, Monitor, Zap, TrendingUp, DollarSign } from 'lucide-react';
import Toast from '../../components/Toast';
import SaleTimer from '../../components/SaleTimer';
import SaleBanner from '../../components/SaleBanner';

const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const accountSizes = [
	{ value: '10K', price: 99, icon: DollarSign },
	{ value: '25K', price: 199, icon: DollarSign },
	{ value: '50K', price: 299, icon: DollarSign },
	{ value: '100K', price: 499, icon: DollarSign },
	{ value: '200K', price: 899, icon: DollarSign },
];

const platforms = [
	{ id: 'mt4', label: 'MetaTrader 4', code: 'MT4', icon: Monitor },
	{ id: 'mt5', label: 'MetaTrader 5', code: 'MT5', icon: Monitor },
	{ id: 'ctrader', label: 'cTrader', code: 'cTR', icon: Monitor },
];

const challengeTypes = [
	{ value: 'One-phase', icon: Zap, description: 'Single evaluation phase' },
	{ value: 'Two-phase', icon: TrendingUp, description: 'Two-phase challenge' },
	{ value: 'Express', icon: Zap, description: 'Fast-track option' },
];

export default function DashboardShopPage() {
	const [selectedSize, setSelectedSize] = useState('100K');
	const [selectedPlatform, setSelectedPlatform] = useState('MetaTrader 4');
	const [selectedChallenge, setSelectedChallenge] = useState('Two-phase');
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [promoCode, setPromoCode] = useState<string>('');
	const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
	const [promoError, setPromoError] = useState<string>('');

	const selectedSizeObj = accountSizes.find((s) => s.value === selectedSize);
	const basePrice = selectedSizeObj?.price || 299;

	// Promo code validation
	const promoCodes: Record<string, number> = {
		newyear50: 50,
		newyear30: 30,
	};

	const handleApplyPromo = () => {
		const code = promoCode.toLowerCase().trim();
		if (promoCodes[code]) {
			setAppliedPromo(code);
			setPromoError('');
			setPromoCode('');
		} else {
			setPromoError('Invalid promo code');
			setAppliedPromo(null);
		}
	};

	const handleRemovePromo = () => {
		setAppliedPromo(null);
		setPromoCode('');
		setPromoError('');
	};

	// Calculate discounted price
	const discountPercent = appliedPromo ? promoCodes[appliedPromo] : 0;
	const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

	const handlePlaceOrder = () => {
		setToastMessage(
			`Order placed for ${selectedSize} • ${selectedChallenge} • ${selectedPlatform} via ${
				paymentMethod === 'card' ? 'card payment' : 'crypto'
			}.`
		);
	};

	return (
		<main className="min-h-screen bg-[#f3f4f6]">
			<div className="mx-auto max-w-7xl p-6 md:p-8 lg:p-12">
				<div
					className="mb-10 flex flex-col gap-4 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-cover bg-center bg-no-repeat shadow-[0_18px_45px_rgba(15,23,42,0.18)] md:flex-row md:items-center md:justify-between"
					style={{
						backgroundImage:
							"url('https://res.cloudinary.com/dejjuhzug/image/upload/v1766053584/resized_banner_pvdrfo.png')",
					}}
				>
					<div className="flex-1 bg-black/55 p-8 md:p-9">
						<h1 className={`${display.className} mb-2 text-3xl font-semibold text-white`}>
							Configure your FxGenz account
						</h1>
						<p className="text-sm font-medium text-white/90">
							Select your funded account size, trading platform and challenge type, then complete a secure
							checkout.
						</p>
					</div>
					<div className="flex flex-col items-start gap-2 bg-black/55 p-8 text-[11px] font-semibold text-white md:items-end">
						<span className="rounded-full border border-white px-3 py-1 text-white">1 • Configure</span>
						<span className="rounded-full border border-white/40 px-3 py-1 text-white/80">
							2 • Checkout
						</span>
						<span className="rounded-full border border-white/40 px-3 py-1 text-white/80">3 • Access</span>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-[1.7fr_1.3fr]">
					{/* Configuration */}
					<section className="space-y-8 rounded-3xl border-2 border-[#e5e5e5] bg-white p-10 shadow-xl">
						<div className="mb-6">
							<h2 className={`${display.className} mb-2 text-2xl font-semibold text-[#0b0b0f]`}>
								Account Configuration
							</h2>
							<p className="text-sm font-medium text-[#6b7280] leading-relaxed">
								Customize your funded trading account by selecting your preferred size, platform, and challenge type.
							</p>
						</div>

						<div className="space-y-8">
							{/* Account Size */}
							<div>
								<div className="mb-4 flex items-center gap-2">
									<Wallet className="h-5 w-5 text-[#0b0b0f]" />
									<p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0b0b0f]">
										Account Size
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
									{accountSizes.map((size) => {
										const Icon = size.icon;
										const isSelected = selectedSize === size.value;
										return (
											<button
												key={size.value}
												onClick={() => setSelectedSize(size.value)}
												className={`group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 ${
													isSelected
														? 'border-black bg-black shadow-lg shadow-black/20'
														: 'border-[#e5e5e5] bg-white hover:border-black/30 hover:shadow-md'
												}`}
											>
												<div className={`absolute inset-0 bg-gradient-to-br from-black/5 to-transparent ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
												<div className="relative flex flex-col items-center gap-2">
													<div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
														isSelected ? 'bg-white' : 'bg-[#f3f4f6] group-hover:bg-black/5'
													}`}>
														<Icon className={`h-6 w-6 ${isSelected ? 'text-black' : 'text-[#6b7280]'}`} />
													</div>
													<span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-[#0b0b0f]'}`}>
														{size.value}
													</span>
													<span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-[#6b7280]'}`}>
														${size.price}
													</span>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							{/* Platform Selection */}
							<div>
								<div className="mb-4 flex items-center gap-2">
									<Monitor className="h-5 w-5 text-[#0b0b0f]" />
									<p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0b0b0f]">
										Trading Platform
									</p>
								</div>
								<div className="grid gap-4 sm:grid-cols-3">
									{platforms.map((platform) => {
										const Icon = platform.icon;
										const isSelected = selectedPlatform === platform.label;
										return (
											<button
												key={platform.id}
												onClick={() => setSelectedPlatform(platform.label)}
												className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
													isSelected
														? 'border-black bg-black shadow-lg shadow-black/20'
														: 'border-[#e5e5e5] bg-white hover:border-black/30 hover:shadow-md'
												}`}
											>
												<div className={`absolute inset-0 bg-gradient-to-br from-black/5 to-transparent ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
												<div className="relative flex flex-col items-center gap-3">
													<div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
														isSelected ? 'bg-white' : 'bg-[#f3f4f6] group-hover:bg-black/5'
													}`}>
														<Icon className={`h-7 w-7 ${isSelected ? 'text-black' : 'text-[#6b7280]'}`} />
													</div>
													<div className="flex flex-col items-center gap-1">
														<span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold ${
															isSelected ? 'border-white/30 bg-white/10 text-white' : 'border-[#e5e5e5] bg-white text-[#111827]'
														}`}>
															{platform.code}
														</span>
														<span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#0b0b0f]'}`}>
															{platform.label}
														</span>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							{/* Challenge Type */}
							<div>
								<div className="mb-4 flex items-center gap-2">
									<Zap className="h-5 w-5 text-[#0b0b0f]" />
									<p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0b0b0f]">
										Challenge Type
									</p>
								</div>
								<div className="grid gap-4 sm:grid-cols-3">
									{challengeTypes.map((type) => {
										const Icon = type.icon;
										const isSelected = selectedChallenge === type.value;
										return (
											<button
												key={type.value}
												onClick={() => setSelectedChallenge(type.value)}
												className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
													isSelected
														? 'border-black bg-black shadow-lg shadow-black/20'
														: 'border-[#e5e5e5] bg-white hover:border-black/30 hover:shadow-md'
												}`}
											>
												<div className={`absolute inset-0 bg-gradient-to-br from-black/5 to-transparent ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
												<div className="relative flex flex-col items-center gap-3">
													<div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
														isSelected ? 'bg-white' : 'bg-[#f3f4f6] group-hover:bg-black/5'
													}`}>
														<Icon className={`h-7 w-7 ${isSelected ? 'text-black' : 'text-[#6b7280]'}`} />
													</div>
													<div className="flex flex-col items-center gap-1">
														<span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-[#0b0b0f]'}`}>
															{type.value}
														</span>
														<span className={`text-xs font-medium ${isSelected ? 'text-white/70' : 'text-[#6b7280]'}`}>
															{type.description}
														</span>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</section>

					{/* Checkout */}
					<section className="space-y-6 rounded-3xl border-2 border-[#e5e5e5] bg-white p-10 shadow-lg">
						<h2 className={`${display.className} mb-1 text-xl font-semibold text-[#0b0b0f]`}>
							Checkout
						</h2>
						<p className="mb-4 text-sm font-medium text-[#111827]">
							Review your configuration and select how you&apos;d like to pay.
						</p>

						{/* Promo Code Section */}
						<div className="rounded-xl border-2 border-[#e5e5e5] bg-gradient-to-br from-[#f9fafb] to-white p-5">
							<div className="mb-3 flex items-center gap-2">
								<Tag className="h-5 w-5 text-[#0b0b0f]" />
								<p className="text-sm font-semibold text-[#0b0b0f]">Promo Code / Discount Code</p>
							</div>
							{!appliedPromo ? (
								<div className="space-y-2">
									<div className="flex gap-2">
										<input
											type="text"
											value={promoCode}
											onChange={(e) => {
												setPromoCode(e.target.value);
												setPromoError('');
											}}
											onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
											placeholder="Enter code (e.g., newyear50)"
											className="flex-1 rounded-lg border-2 border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
										<button
											onClick={handleApplyPromo}
											className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827] whitespace-nowrap"
										>
											Apply
										</button>
									</div>
									{promoError && (
										<p className="text-xs font-semibold text-red-600">{promoError}</p>
									)}
									<div className="flex flex-wrap gap-2 mt-2">
										<span className="text-xs font-semibold text-[#6b7280]">Try: </span>
										<button
											onClick={() => {
												setPromoCode('newyear50');
												setPromoError('');
											}}
											className="rounded-lg bg-white border-2 border-[#e5e5e5] px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-[#f3f4f6] transition"
										>
											NEWYEAR50 (50% OFF)
										</button>
										<button
											onClick={() => {
												setPromoCode('newyear30');
												setPromoError('');
											}}
											className="rounded-lg bg-white border-2 border-[#e5e5e5] px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-[#f3f4f6] transition"
										>
											NEWYEAR30 (30% OFF)
										</button>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between rounded-lg bg-green-100 border-2 border-green-500 px-4 py-2.5">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-green-600" />
										<span className="text-sm font-semibold text-green-800">
											{appliedPromo.toUpperCase()} Applied - {discountPercent}% OFF
										</span>
									</div>
									<button
										onClick={handleRemovePromo}
										className="rounded-full p-1 hover:bg-green-200 transition"
									>
										<X className="h-4 w-4 text-green-600" />
									</button>
								</div>
							)}
						</div>

						<div className="rounded-xl border-2 border-[#e5e5e5] bg-[#f9fafb] p-5">
							<p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
								Order summary
							</p>
							<p className="mb-3 text-sm font-semibold text-[#111827]">
								{selectedSize} • {selectedChallenge} • {selectedPlatform}
							</p>
							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold text-[#6b7280]">Subtotal:</span>
									<span className={`${display.className} text-sm font-semibold text-[#111827]`}>
										${basePrice}
									</span>
								</div>
								{discountPercent > 0 && (
									<div className="flex items-center justify-between">
										<span className="text-xs font-semibold text-green-600">
											Discount ({discountPercent}%):
										</span>
										<span className={`${display.className} text-sm font-semibold text-green-600`}>
											-${(basePrice - finalPrice).toFixed(2)}
										</span>
									</div>
								)}
								<div className="border-t border-[#e5e5e5] pt-2 mt-2">
									<div className="flex items-center justify-between">
										<span className="text-sm font-semibold text-[#0b0b0f]">Total:</span>
										<span className={`${display.className} text-xl font-bold ${discountPercent > 0 ? 'text-green-600' : 'text-[#0b0b0f]'}`}>
											${finalPrice.toFixed(2)}
										</span>
									</div>
									{discountPercent > 0 && (
										<span className="text-xs font-normal text-[#6b7280] line-through">
											${basePrice}
										</span>
									)}
								</div>
								<p className="mt-2 text-xs font-normal text-[#6b7280]">
									(one-time evaluation fee)
								</p>
							</div>
						</div>

						<div className="space-y-3 text-xs font-semibold text-[#111827]">
							<p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7280]">Payment method</p>
							<div className="flex flex-wrap gap-2">
								<button
									onClick={() => setPaymentMethod('card')}
									className={`rounded-full border px-3 py-1.5 text-xs ${
										paymentMethod === 'card'
											? 'border-black bg-black text-white'
											: 'border-[#e5e5e5] bg-white text-[#111827] hover:bg-[#f3f4f6]'
									}`}
								>
									Card payment
								</button>
								<button
									onClick={() => setPaymentMethod('crypto')}
									className={`rounded-full border px-3 py-1.5 text-xs ${
										paymentMethod === 'crypto'
											? 'border-black bg-black text-white'
											: 'border-[#e5e5e5] bg-white text-[#111827] hover:bg-[#f3f4f6]'
									}`}
								>
									Crypto
								</button>
							</div>

							{paymentMethod === 'card' ? (
								<div className="mt-2 space-y-3 text-xs font-normal text-[#4b5563]">
									<p className="text-[11px] font-semibold text-[#111827]">Card details (demo)</p>
									<div className="grid gap-3 md:grid-cols-2">
										<input
											placeholder="Card number"
											className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
										<input
											placeholder="Name on card"
											className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
									</div>
									<div className="grid gap-3 md:grid-cols-3">
										<input
											placeholder="MM/YY"
											className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
										<input
											placeholder="CVC"
											className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
										<input
											placeholder="Country"
											className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[11px] font-semibold text-[#111827] placeholder:text-[#9ca3af] focus:border-black focus:outline-none"
										/>
									</div>
								</div>
							) : (
								<div className="mt-2 space-y-2 text-xs font-normal text-[#4b5563]">
									<p className="text-[11px] font-semibold text-[#111827]">Crypto checkout (demo)</p>
									<p className="text-[#6b7280]">
										When enabled, wallet addresses and QR codes for BTC, USDT and supported tokens
										will be displayed here.
									</p>
								</div>
							)}
						</div>

						<button
							type="button"
							onClick={handlePlaceOrder}
							className="mt-2 w-full rounded-xl bg-black px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#111827] hover:shadow-xl"
						>
							Place Order →
						</button>
					</section>
				</div>
			</div>
			<Toast message={toastMessage} onClose={() => setToastMessage(null)} />
		</main>
	);
}


