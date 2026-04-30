"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function SimpleNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (isLandingPage) {
        const scrollPosition = window.scrollY;
        const heroHeight = window.innerHeight;
        setIsScrolled(scrollPosition > heroHeight * 0.8);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigationItems = [
    { label: "Rules", href: "/rules" },
    { label: "Pricing", href: "/#pricing-section" },
    { label: "Symbols", href: "/symbols" },
    { label: "Payouts", href: "/payouts" },
    { label: "FAQs", href: "/faqs" },
  ];

  return (
    <nav className={`fixed left-0 right-0 z-[100] transition-all duration-300 pointer-events-auto top-[var(--promo-ticker-height)] ${
      isScrolled 
        ? 'bg-[#0a1f0a]/95 backdrop-blur-md border-b border-green-500/20' 
        : isLandingPage 
          ? 'bg-transparent backdrop-blur-0 border-b border-transparent'
          : 'bg-[#0a1f0a]/95 backdrop-blur-md border-b border-green-500/20'
    }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[100] pointer-events-auto">
        <div className="flex items-center justify-between h-16 sm:h-18 relative z-[100]">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            <img 
              src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png" 
              alt="Dragon Funded" 
              className="h-10 sm:h-12 w-auto object-contain" 
            />
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">DRAGON</span>
              <span className="text-base sm:text-lg font-extrabold text-green-400 tracking-tight">FUNDED</span>
            </div>
          </div>

          {/* Desktop Navigation - Center Buttons */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-200"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-3 pt-3 pb-4 space-y-2 bg-[#0a1f0a]/98 backdrop-blur-xl border-t border-green-500/20 mt-2 rounded-b-xl">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile CTA Buttons */}
              <div className="pt-3 border-t border-green-500/20 space-y-2 mt-3">
                <Link 
                  href="/login" 
                  className="block px-4 py-3 rounded-lg text-sm font-semibold text-white text-center border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block px-4 py-3 rounded-lg text-sm font-bold bg-green-500 text-white text-center hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/25"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
