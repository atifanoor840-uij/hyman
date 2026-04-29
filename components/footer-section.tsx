"use client"

export function FooterSection() {
  return (
    <footer className="w-full bg-white relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8 py-8 sm:py-10 lg:py-12">
          {/* Left: Branding */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png"
                alt="Dragon Funded"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover"
              />
              <div className="text-lg sm:text-xl font-bold">
                <span className="text-gray-900">DRAGON</span>
                <span className="ml-1" style={{ color: '#DEBF74' }}>FUNDED</span>
              </div>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs">© 2025 Dragon Funded. All rights reserved.</p>
          </div>

          {/* Right: Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 w-full lg:w-auto">
            {/* Navigation */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <h3 className="text-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">NAVIGATION</h3>
              <div className="flex flex-col gap-2 sm:gap-2.5">
                <a href="/" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">HOME</a>
                <a href="/symbols" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">SYMBOLS</a>
                <a href="/account-types" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">ACCOUNT TYPES</a>
                <a href="/programs" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">DRAGON CLUB</a>
                <a href="/payouts" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">PAYOUTS</a>
                <a href="/faqs" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">FAQS</a>
                <a href="/contact" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">CONTACT</a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <h3 className="text-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">SOCIALS</h3>
              <div className="flex flex-col gap-2 sm:gap-2.5">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 transition-all flex items-center gap-2 px-2 py-1 rounded-md -ml-2">
                  <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-100 border border-green-200 flex-shrink-0">
                    <img src="https://cdn.simpleicons.org/facebook/16a34a" alt="Facebook" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                  <span className="truncate">Facebook</span>
                </a>
                <a href="https://www.instagram.com/dragonfundedcom?igsh=MTJhd25hbjNxcHFxZg==" target="_blank" rel="noopener noreferrer" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 transition-all flex items-center gap-2 px-2 py-1 rounded-md -ml-2">
                  <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-100 border border-green-200 flex-shrink-0">
                    <img src="https://cdn.simpleicons.org/instagram/16a34a" alt="Instagram" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                  <span className="truncate">Instagram</span>
                </a>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 transition-all flex items-center gap-2 px-2 py-1 rounded-md -ml-2">
                  <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-100 border border-green-200 flex-shrink-0">
                    <img src="https://cdn.simpleicons.org/telegram/16a34a" alt="Telegram" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                  <span className="truncate">Telegram</span>
                </a>
              </div>
            </div>

            {/* Policy */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <h3 className="text-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">POLICY</h3>
              <div className="flex flex-col gap-2 sm:gap-2.5">
                <a href="/legal/privacy" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">PRIVACY POLICY</a>
                <a href="/legal/terms" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">TERMS OF SERVICE</a>
                <a href="/rules" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">RULES</a>
                <a href="/legal/risk-disclosure" className="text-gray-800 text-[11px] sm:text-xs font-semibold hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md -ml-2 transition-all">RISK DISCLOSURE</a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - All in One Row */}
        <div className="border-t border-gray-200 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
              <h3 className="text-gray-900 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Payment Methods</h3>
              <span className="hidden sm:inline text-gray-400 text-xs">•</span>
              <p className="text-gray-500 text-[10px] sm:text-xs">Pay with crypto</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Crypto */}
              {[
                { sym: 'btc', alt: 'BTC' },
                { sym: 'usdt', alt: 'USDT' },
                { sym: 'eth', alt: 'ETH' },
              ].map((c) => (
                <div key={c.sym} className="h-6 w-6 sm:h-7 sm:w-7 rounded-md overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <img
                    src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.0/svg/color/${c.sym}.svg`}
                    alt={c.alt}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="border-t border-gray-200 py-6 sm:py-8">
          <h3 className="text-gray-900 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Disclaimer</h3>
          <div className="text-gray-500 text-[11px] sm:text-xs leading-relaxed space-y-2.5 sm:space-y-3">
            <p>
              Dragon Funded provides simulated trading services solely for educational and skill-assessment purposes. All trading activities during our evaluation phases take place in a risk-free simulated environment and do not involve the use of real funds. Successful completion of the program may lead to opportunities for performance-based capital allocation under separate terms and conditions.
            </p>
            <p>
              The content and services provided through our platform are not to be interpreted as financial, investment, tax, or legal advice. Nothing on this website (www.dragonfunded.com) constitutes an offer, solicitation, or recommendation to engage in the purchase or sale of any financial instruments. You are solely responsible for evaluating the potential benefits and risks before participating in any of our programs.
            </p>
            <p>
              While we aim to ensure accuracy and reliability, all information on this website is provided "as is" without any guarantees of completeness or timeliness. Dragon Funded and its associated entities accept no liability for any decisions made based on the information presented here.
            </p>
            <p>
              All program fees are used to cover operational costs, including technology, staff, and other business-related expenses. Participation in our programs should not be considered a deposit or investment.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
