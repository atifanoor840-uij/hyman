'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";

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
  { href: "/blog", label: "Reviews" },
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
  { href: "/blog", label: "Reviews" },
  { href: "/contact", label: "Contacts" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "X", href: "https://x.com", icon: "x" },
];

function SocialIcons({ dark = false }: { dark?: boolean }) {
  const className = dark
    ? "flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
    : "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-black hover:bg-black hover:text-white transition-colors";
  return (
    <div className="flex items-center gap-2">
      {SOCIAL_LINKS.map(({ label, href, icon }) => (
        <a key={icon} href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>
          {icon === "instagram" && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          )}
          {icon === "facebook" && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          )}
          {icon === "linkedin" && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          )}
          {icon === "x" && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          )}
        </a>
      ))}
    </div>
  );
}

export default function Navbar({ variant = "sticky" }: { variant?: NavbarVariant }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero variant: two-bar layout, full width, attached to top and sides, black theme
  if (variant === "hero") {
    const links = heroNavLinks;
    return (
      <header className="sticky top-0 z-50 w-full left-0 right-0" style={{ fontFamily: 'var(--font-plus-jakarta-sans), var(--font-geist-sans), sans-serif' }}>
        {/* Top bar - light gray with black accents, full width, rounded bottom */}
        <div className="w-full bg-zinc-200 border-b border-zinc-300 rounded-b-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 md:px-10">
            <div className="flex items-center gap-6 text-sm text-zinc-700">
              <a href="mailto:contact@fxgenz.com" className="flex items-center gap-2 hover:text-black transition-colors">
                <Mail className="h-4 w-4 text-black" />
                <span>contact@fxgenz.com</span>
              </a>
              <a href="tel:+14165551234" className="flex items-center gap-2 hover:text-black transition-colors">
                <Phone className="h-4 w-4 text-black" />
                <span>+1 416 555 1234</span>
              </a>
            </div>
            <div className="hidden sm:block">
              <SocialIcons dark={false} />
            </div>
          </div>
        </div>

        {/* Main nav bar - white with black accents, full width, rounded bottom */}
        <div className={`w-full rounded-b-xl transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white'}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-10">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769659705/ChatGPT_Image_Jan_28_2026_08_06_49_PM_moryyr.png"
                alt="Fxgenz"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-black">Fxgenz</span>
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
            alt="Fx Genz"
            className="h-9 w-9 md:h-10 md:w-10 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white md:text-xl">Fx Genz</span>
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
