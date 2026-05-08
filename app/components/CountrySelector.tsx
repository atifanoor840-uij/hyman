'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { ChevronDown, Search, X } from 'lucide-react';
import worldCountries from 'world-countries';

interface Country {
	name: string;
	code: string;
}

type WorldCountry = {
	name?: { common?: string; official?: string };
	cca2?: string;
};

function normalizeText(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

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

	const countries = useMemo<Country[]>(() => {
		const list = (worldCountries as unknown as WorldCountry[])
			.map((c) => {
				const name =
					c?.name?.common ??
					c?.name?.official ??
					'';
				const code = c?.cca2 ?? '';
				return { name: String(name).trim(), code: String(code).trim() };
			})
			.filter((c) => c.name && c.code && c.code.length === 2);

		list.sort((a, b) => a.name.localeCompare(b.name));
		// De-dupe by code (safeguard).
		const seen = new Set<string>();
		return list.filter((c) => {
			if (seen.has(c.code)) return false;
			seen.add(c.code);
			return true;
		});
	}, []);

	const selectedCountry = useMemo(
		() => countries.find((c) => c.name === value),
		[countries, value]
	);

	const filteredCountries = useMemo(() => {
		const q = normalizeText(searchQuery);
		if (!q) return countries;
		return countries.filter((country) => normalizeText(country.name).includes(q));
	}, [countries, searchQuery]);

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
