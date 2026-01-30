'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { ChevronDown, Search, X } from 'lucide-react';

interface Country {
	name: string;
	code: string;
}

const COUNTRIES: Country[] = [
	{ name: 'United States', code: 'US' },
	{ name: 'United Kingdom', code: 'GB' },
	{ name: 'Canada', code: 'CA' },
	{ name: 'Australia', code: 'AU' },
	{ name: 'Germany', code: 'DE' },
	{ name: 'France', code: 'FR' },
	{ name: 'Spain', code: 'ES' },
	{ name: 'Italy', code: 'IT' },
	{ name: 'Netherlands', code: 'NL' },
	{ name: 'Switzerland', code: 'CH' },
	{ name: 'United Arab Emirates', code: 'AE' },
	{ name: 'Singapore', code: 'SG' },
	{ name: 'Hong Kong', code: 'HK' },
	{ name: 'Japan', code: 'JP' },
	{ name: 'South Korea', code: 'KR' },
	{ name: 'India', code: 'IN' },
	{ name: 'Brazil', code: 'BR' },
	{ name: 'Mexico', code: 'MX' },
	{ name: 'South Africa', code: 'ZA' },
	{ name: 'Nigeria', code: 'NG' },
	{ name: 'Argentina', code: 'AR' },
	{ name: 'Belgium', code: 'BE' },
	{ name: 'Austria', code: 'AT' },
	{ name: 'Sweden', code: 'SE' },
	{ name: 'Norway', code: 'NO' },
	{ name: 'Denmark', code: 'DK' },
	{ name: 'Finland', code: 'FI' },
	{ name: 'Poland', code: 'PL' },
	{ name: 'Portugal', code: 'PT' },
	{ name: 'Greece', code: 'GR' },
	{ name: 'Turkey', code: 'TR' },
	{ name: 'Saudi Arabia', code: 'SA' },
	{ name: 'Egypt', code: 'EG' },
	{ name: 'Israel', code: 'IL' },
	{ name: 'New Zealand', code: 'NZ' },
	{ name: 'Thailand', code: 'TH' },
	{ name: 'Malaysia', code: 'MY' },
	{ name: 'Indonesia', code: 'ID' },
	{ name: 'Philippines', code: 'PH' },
	{ name: 'Vietnam', code: 'VN' },
	{ name: 'China', code: 'CN' },
	{ name: 'Pakistan', code: 'PK' },
	{ name: 'Bangladesh', code: 'BD' },
	{ name: 'Chile', code: 'CL' },
	{ name: 'Colombia', code: 'CO' },
	{ name: 'Peru', code: 'PE' },
	{ name: 'Venezuela', code: 'VE' },
	{ name: 'Kenya', code: 'KE' },
	{ name: 'Ghana', code: 'GH' },
	{ name: 'Morocco', code: 'MA' },
];

interface CountrySelectorProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
	disabled?: boolean;
}

export default function CountrySelector({
	value,
	onChange,
	error,
	disabled = false,
}: CountrySelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const selectedCountry = COUNTRIES.find((c) => c.name === value);
	const filteredCountries = COUNTRIES.filter((country) =>
		country.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchQuery('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	const handleSelect = (country: Country) => {
		onChange(country.name);
		setIsOpen(false);
		setSearchQuery('');
	};

	const handleClear = () => {
		onChange('');
		setSearchQuery('');
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold tracking-wide transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${
					error
						? 'border-red-500 bg-red-50 text-red-900'
						: 'border-zinc-200 bg-zinc-50 text-zinc-900'
				} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-zinc-300'}`}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{selectedCountry ? (
							<>
								<ReactCountryFlag
									countryCode={selectedCountry.code}
									svg
									style={{
										width: '1.5em',
										height: '1.5em',
										borderRadius: '4px',
									}}
									title={selectedCountry.name}
								/>
								<span>{selectedCountry.name}</span>
							</>
						) : (
							<span className="text-zinc-500">Select your country</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						{selectedCountry && !disabled && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleClear();
								}}
								className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
							>
								<X className="h-4 w-4" />
							</button>
						)}
						<ChevronDown
							className={`h-5 w-5 text-zinc-500 transition-transform ${
								isOpen ? 'rotate-180' : ''
							}`}
						/>
					</div>
				</div>
			</button>

			{isOpen && (
				<div className="absolute z-50 mt-2 w-full rounded-2xl border border-zinc-200 bg-white shadow-2xl">
					{/* Search Input */}
					<div className="border-b border-zinc-200 p-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
							<input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search countries..."
								className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>

					{/* Country List */}
					<div className="max-h-64 overflow-y-auto p-2">
						{filteredCountries.length > 0 ? (
							filteredCountries.map((country) => (
								<button
									key={country.code}
									type="button"
									onClick={() => handleSelect(country)}
									className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
										value === country.name
											? 'bg-zinc-900 text-white'
											: 'text-zinc-900 hover:bg-zinc-100'
									}`}
								>
									<ReactCountryFlag
										countryCode={country.code}
										svg
										style={{
											width: '1.5em',
											height: '1.5em',
											borderRadius: '4px',
										}}
										title={country.name}
									/>
									<span>{country.name}</span>
								</button>
							))
						) : (
							<div className="py-8 text-center text-sm text-zinc-500">
								No countries found
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
