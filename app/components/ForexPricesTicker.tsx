'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';

interface ForexPair {
	symbol: string;
	tradingViewSymbol: string;
	baseCurrency: string;
	quoteCurrency: string;
	bid: number;
	ask: number;
	change: number;
	changePercent: number;
	prevClose?: number;
}

// Currency to country code mapping for flags
const currencyToCountry: Record<string, string> = {
	EUR: 'eu',
	USD: 'us',
	GBP: 'gb',
	JPY: 'jp',
	CHF: 'ch',
	AUD: 'au',
	CAD: 'ca',
	NZD: 'nz',
};

// Fallback mock prices
const getMockPrice = (symbol: string): number => {
	const mockPrices: Record<string, number> = {
		'EUR/USD': 1.08542,
		'GBP/USD': 1.26458,
		'USD/JPY': 149.823,
		'USD/CHF': 0.88452,
		'AUD/USD': 0.65842,
		'USD/CAD': 1.35248,
		'NZD/USD': 0.61234,
		'EUR/GBP': 0.85842,
	};
	return mockPrices[symbol] || 1.0;
};

const forexPairs: Omit<ForexPair, 'bid' | 'ask' | 'change' | 'changePercent'>[] = [
	{ symbol: 'EUR/USD', tradingViewSymbol: 'FX:EURUSD', baseCurrency: 'EUR', quoteCurrency: 'USD' },
	{ symbol: 'GBP/USD', tradingViewSymbol: 'FX:GBPUSD', baseCurrency: 'GBP', quoteCurrency: 'USD' },
	{ symbol: 'USD/JPY', tradingViewSymbol: 'FX:USDJPY', baseCurrency: 'USD', quoteCurrency: 'JPY' },
	{ symbol: 'USD/CHF', tradingViewSymbol: 'FX:USDCHF', baseCurrency: 'USD', quoteCurrency: 'CHF' },
	{ symbol: 'AUD/USD', tradingViewSymbol: 'FX:AUDUSD', baseCurrency: 'AUD', quoteCurrency: 'USD' },
	{ symbol: 'USD/CAD', tradingViewSymbol: 'FX:USDCAD', baseCurrency: 'USD', quoteCurrency: 'CAD' },
	{ symbol: 'NZD/USD', tradingViewSymbol: 'FX:NZDUSD', baseCurrency: 'NZD', quoteCurrency: 'USD' },
	{ symbol: 'EUR/GBP', tradingViewSymbol: 'FX:EURGBP', baseCurrency: 'EUR', quoteCurrency: 'GBP' },
];

// Fetch price from TradingView/Yahoo Finance API
const fetchTradingViewPrice = async (symbol: string, pairSymbol: string): Promise<{ price: number; prevClose: number } | null> => {
	try {
		// Convert TradingView symbol to Yahoo Finance format
		const yahooSymbol = pairSymbol.replace('/', '') + '=X';
		
		// Using Yahoo Finance API (free, no auth required)
		const quoteResponse = await fetch(
			`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
			{
				mode: 'cors',
				headers: {
					'Accept': 'application/json',
				},
			}
		);
		
		if (quoteResponse.ok) {
			const data = await quoteResponse.json();
			const result = data.chart?.result?.[0];
			if (result && result.meta) {
				const currentPrice = result.meta.regularMarketPrice || result.meta.previousClose;
				const prevClose = result.meta.previousClose || currentPrice;
				if (currentPrice && prevClose) {
					return { price: currentPrice, prevClose };
				}
			}
		}
	} catch (error) {
		// Silently fail - will use fallback data
		console.error(`Error fetching price for ${symbol}:`, error);
	}
	return null;
};

export default function ForexPricesTicker() {
	const [pairs, setPairs] = useState<ForexPair[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const pairsRef = useRef<ForexPair[]>([]);

	useEffect(() => {
		// Initialize with default values
		const initializePairs = async () => {
			const initialData: ForexPair[] = forexPairs.map((pair) => ({
				...pair,
				bid: 0,
				ask: 0,
				change: 0,
				changePercent: 0,
			}));

			// Fetch initial prices
			const pricePromises = forexPairs.map(async (pair, index) => {
				try {
					// Try to fetch from TradingView or Yahoo Finance
					const priceData = await fetchTradingViewPrice(pair.tradingViewSymbol, pair.symbol);
					if (priceData && priceData.price > 0) {
						const spread = pair.symbol.includes('JPY') ? 0.003 : 0.00003;
						const change = priceData.price - priceData.prevClose;
						const changePercent = (change / priceData.prevClose) * 100;
						return {
							...pair,
							bid: priceData.price,
							ask: priceData.price + spread,
							prevClose: priceData.prevClose,
							change,
							changePercent,
						};
					}
				} catch (error) {
					console.error(`Error fetching ${pair.symbol}:`, error);
				}
				// Fallback to default values with mock data
				const mockPrice = getMockPrice(pair.symbol);
				return {
					...pair,
					bid: mockPrice,
					ask: mockPrice + (pair.symbol.includes('JPY') ? 0.003 : 0.00003),
					prevClose: mockPrice,
					change: 0,
					changePercent: 0,
				};
			});

			const resolvedPairs = await Promise.all(pricePromises);
			const validPairs = resolvedPairs.filter((p) => p.bid > 0);
			setPairs(validPairs);
			pairsRef.current = validPairs;
			setIsLoading(false);
		};

		initializePairs();

		// Update prices periodically
		const updateInterval = setInterval(async () => {
			if (pairsRef.current.length === 0) return;
			
			const updatedPairs = await Promise.all(
				pairsRef.current.map(async (pair) => {
					try {
						const priceData = await fetchTradingViewPrice(pair.tradingViewSymbol, pair.symbol);
						if (priceData && priceData.price > 0) {
							const spread = pair.symbol.includes('JPY') ? 0.003 : 0.00003;
							const prevClose = pair.prevClose || priceData.prevClose || priceData.price;
							const change = priceData.price - prevClose;
							const changePercent = (change / prevClose) * 100;
							return {
								...pair,
								bid: priceData.price,
								ask: priceData.price + spread,
								prevClose: priceData.prevClose || prevClose,
								change,
								changePercent,
							};
						}
					} catch (error) {
						console.error(`Error updating ${pair.symbol}:`, error);
					}
					return pair;
				})
			);
			setPairs(updatedPairs);
			pairsRef.current = updatedPairs;
		}, 10000); // Update every 10 seconds

		return () => clearInterval(updateInterval);
	}, []);

	const formatPrice = (price: number, symbol: string): string => {
		if (price === 0) return '--';
		if (symbol.includes('JPY')) {
			return price.toFixed(3);
		}
		return price.toFixed(5);
	};

	const getFlagUrl = (currency: string): string => {
		const countryCode = currencyToCountry[currency] || currency.toLowerCase();
		return `https://flagcdn.com/w40/${countryCode}.png`;
	};

	if (isLoading && pairs.length === 0) {
		return (
			<div className="relative overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-md py-5">
				<div className="flex items-center justify-center">
					<div className="text-base text-white/60">Loading forex prices...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-md">
			<div className="animate-scroll-fast flex items-center gap-8 whitespace-nowrap py-5">
				{/* Duplicate content for seamless loop */}
				{[...Array(2)].map((_, i) => (
					<div key={i} className="flex items-center gap-8">
						{pairs.map((pair) => {
							const isPositive = pair.change >= 0;
							const priceColor = isPositive ? 'text-[#00ff88]' : 'text-red-400';
							const bgColor = isPositive ? 'bg-[#00ff88]/10' : 'bg-red-400/10';

							return (
								<div
									key={`${pair.symbol}-${i}`}
									className="flex items-center gap-4 rounded-xl border border-white/10 px-6 py-3.5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
								>
									{/* Currency Flags */}
									<div className="flex items-center gap-2">
										<div className="relative h-7 w-10 overflow-hidden rounded border border-white/20">
											<Image
												src={getFlagUrl(pair.baseCurrency)}
												alt={pair.baseCurrency}
												width={40}
												height={28}
												className="h-full w-full object-cover"
												unoptimized
											/>
										</div>
										<div className="relative h-7 w-10 overflow-hidden rounded border border-white/20">
											<Image
												src={getFlagUrl(pair.quoteCurrency)}
												alt={pair.quoteCurrency}
												width={40}
												height={28}
												className="h-full w-full object-cover"
												unoptimized
											/>
										</div>
									</div>
									
									{/* Symbol */}
									<span className="text-sm font-semibold text-white/90 md:text-base">{pair.symbol}</span>
									
									{/* Price and Change */}
									<div className="flex items-center gap-3">
										<span className={`text-sm font-bold md:text-base ${priceColor}`}>
											{formatPrice(pair.bid, pair.symbol)}
										</span>
										<div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${bgColor} border ${isPositive ? 'border-[#00ff88]/20' : 'border-red-400/20'}`}>
											{isPositive ? (
												<TrendingUp className="h-4 w-4 text-[#00ff88]" />
											) : (
												<TrendingDown className="h-4 w-4 text-red-400" />
											)}
											<span className={`text-sm font-semibold ${priceColor}`}>
												{isPositive ? '+' : ''}
												{pair.changePercent.toFixed(2)}%
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
