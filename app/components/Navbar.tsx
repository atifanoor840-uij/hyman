'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

type NavbarVariant = "sticky" | "hero";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/platforms", label: "Services", sub: [
    { href: "/platforms", label: "Platforms" },
    { href: "/rules", label: "Trading Rules" },
    { href: "/scaling", label: "Scaling Program" },
    { href: "/pricing", label: "Pricing" },
  ]},
  { href: "/resources", label: "How It Works" },
  { href: "/contact", label: "Contacts" },
];

const heroNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/platforms", label: "Services", sub: [
    { href: "/platforms", label: "Platforms" },
    { href: "/pricing", label: "Pricing" },
    { href: "/rules", label: "Rules" },
  ]},
  { href: "/resources", label: "How It Works" },
  { href: "/contact", label: "Contacts" },
];

export default function Navbar({ variant = "sticky" }: { variant?: NavbarVariant }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero variant: full width main nav, fixed at top of viewport
  if (variant === "hero") {
    const links = heroNavLinks;
    return (
      <header className="fixed top-0 left-0 right-0 z-50 w-full" style={{ fontFamily: 'var(--font-plus-jakarta-sans), var(--font-geist-sans), sans-serif' }}>
        {/* Main nav bar - white with black accents, full width, rounded bottom */}
        <div className={`w-full rounded-b-xl transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white'}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-10">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
                alt="GenzProp"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-black">GenzProp</span>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex lg:mx-auto">
              {links.map((item) => (
                'sub' in item && item.sub ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(item.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-black rounded-md transition-colors">
                      {item.label}
                      <svg className={`h-3.5 w-3.5 text-black transition-transform ${dropdownOpen === item.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen === item.label && (
                      <div className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-zinc-200 bg-white py-1.5 shadow-xl z-50">
                        {item.sub.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-black rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-bold text-white bg-black rounded-lg border-2 border-black hover:bg-zinc-800 hover:border-zinc-800 transition-colors"
              >
                Dashboard
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-black hover:bg-zinc-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-zinc-200 bg-white">
              <nav className="px-6 py-4 space-y-0.5">
                {links.map((item) => (
                  'sub' in item && item.sub ? (
                    <div key={item.label} className="space-y-0.5">
                      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{item.label}</div>
                      {item.sub.map((sub) => (
                        <Link key={sub.href} href={sub.href} className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="pt-4 mt-4 border-t border-zinc-200">
                  <Link href="/signup" className="block w-full py-2.5 text-sm font-bold text-center text-white bg-black rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Sticky variant (default) - single bar, dark
  const base = "sticky top-0 z-50 w-full border-b border-white/5 bg-black/95 backdrop-blur-md";

  return (
    <header className={base} style={{ fontFamily: 'var(--font-plus-jakarta-sans), var(--font-geist-sans), sans-serif' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
            alt="GenzProp"
            className="h-9 w-9 md:h-10 md:w-10 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white md:text-xl">GenzProp</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex lg:mx-auto">
          {navLinks.map((item) => (
            'sub' in item && item.sub ? (
              <div key={item.label} className="relative" onMouseEnter={() => setDropdownOpen(item.label)} onMouseLeave={() => setDropdownOpen(null)}>
                <button className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white rounded-md transition-colors">
                  {item.label}
                  <svg className={`h-3.5 w-3.5 transition-transform ${dropdownOpen === item.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen === item.label && (
                  <div className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-white/10 bg-black/98 backdrop-blur-xl py-1.5 shadow-xl">
                    {item.sub.map((sub) => (
                      <Link key={sub.href} href={sub.href} className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white rounded-md transition-colors">
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="px-5 py-2 text-sm font-semibold text-black bg-white rounded-full hover:bg-white/95 transition-colors">
            Start evaluation
          </Link>
        </div>

        <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-white/80 hover:text-white" aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-black/98 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-6 py-4 space-y-0.5">
            {navLinks.map((item) => (
              'sub' in item && item.sub ? (
                <div key={item.label} className="space-y-0.5">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">{item.label}</div>
                  {item.sub.map((sub) => (
                    <Link key={sub.href} href={sub.href} className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>{sub.label}</Link>
                  ))}
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
              )
            ))}
            <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-2">
              <Link href="/dashboard" className="py-2.5 text-sm font-semibold text-center text-white border border-white/30 rounded-full hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <div className="flex gap-2">
                <Link href="/login" className="flex-1 py-2.5 text-sm font-semibold text-center text-white border border-white/30 rounded-full hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                <Link href="/signup" className="flex-1 py-2.5 text-sm font-semibold text-center text-black bg-white rounded-full hover:bg-white/95" onClick={() => setMobileMenuOpen(false)}>Start evaluation</Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
