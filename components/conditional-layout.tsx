"use client"
import { usePathname } from "next/navigation"
import { Suspense, useEffect, useState, useRef } from "react"
import { Toaster } from "@/components/ui/toaster"
import SimpleNavbar from "@/components/simple-navbar"
import PromoTicker from "@/components/promo-ticker"
import { FooterSection } from "@/components/footer-section"
// Analytics removed

interface ConditionalLayoutProps {
  children: React.ReactNode
}

// Loading overlay component for professional page load
function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Dragon Funded Logo */}
        <img
          src="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png"
          alt="Dragon Funded"
          className="w-16 h-16 animate-pulse"
        />
        {/* Loading indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isAuthRoute, setIsAuthRoute] = useState(false)
  const [isDashboardRoute, setIsDashboardRoute] = useState(false)
  const [isAdminRoute, setIsAdminRoute] = useState(false)
  const [isPageReady, setIsPageReady] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    setIsClient(true)
    setIsAuthRoute(
      pathname.startsWith('/login') || 
      pathname.startsWith('/signup') || 
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/verify-email') ||
      pathname.startsWith('/partners/login') ||
      pathname.startsWith('/partners/signup')
    )
    setIsAdminRoute(pathname.startsWith("/admin"))
    // Dashboard routes include /dashboard/* and root-level dashboard pages
    const dashboardRoutes = [
      '/kyc',
      '/stats',
      '/withdraw',
      '/downloads',
      '/graph',
      '/symbol',
      '/economic-calendar',
      '/heat-map',
      '/social-community',
      '/buy-challenge'
    ]
    setIsDashboardRoute(
      pathname.startsWith('/dashboard') || 
      dashboardRoutes.includes(pathname) ||
      dashboardRoutes.some(route => pathname.startsWith(route + '/'))
    )
  }, [pathname])

  useEffect(() => {
    // Prevent running multiple times
    if (hasInitialized.current) return
    
    if (isClient) {
      hasInitialized.current = true
      
      const isDashboardOrAuthOrAdmin = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/login') || 
        pathname.startsWith('/signup') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/verify-email') ||
        pathname.startsWith('/partners/login') ||
        pathname.startsWith('/partners/signup') ||
        ['/kyc', '/stats', '/withdraw', '/downloads', '/graph', '/symbol', '/economic-calendar', '/heat-map', '/social-community', '/buy-challenge'].some(
          route => pathname === route || pathname.startsWith(route + '/')
        )
      
      if (isDashboardOrAuthOrAdmin) {
        // No loading overlay for dashboard/auth routes
        setIsPageReady(true)
        return
      }
      
      const isLanding = pathname === '/'
      
      // Function to check if content is ready
      const checkContentReady = () => {
        if (isLanding) {
          const heroSection = document.querySelector('[data-hero-section]')
          return heroSection && (heroSection as HTMLElement).offsetHeight > 0
        }
        return true
      }
      
      // Try to detect when content is ready
      const attemptReady = () => {
        if (checkContentReady()) {
          // Small delay to ensure smooth transition
          requestAnimationFrame(() => {
            setIsPageReady(true)
          })
          return true
        }
        return false
      }
      
      // Initial check
      if (attemptReady()) return
      
      // Use requestAnimationFrame for smooth detection
      let rafId: number
      let attempts = 0
      const maxAttempts = 30 // ~500ms max wait
      
      const checkLoop = () => {
        attempts++
        if (attemptReady() || attempts >= maxAttempts) {
          setIsPageReady(true)
          return
        }
        rafId = requestAnimationFrame(checkLoop)
      }
      
      rafId = requestAnimationFrame(checkLoop)
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId)
      }
    }
  }, [isClient, pathname])

  // Reset initialization on route change
  useEffect(() => {
    hasInitialized.current = false
    setIsPageReady(false)
  }, [pathname])

  // Determine if we should show the loading overlay
  const showPublicLayout = !isAuthRoute && !isDashboardRoute && !isAdminRoute
  const showLoadingOverlay = isClient && showPublicLayout && !isPageReady

  return (
    <>
      {/* Professional loading overlay - only for public pages */}
      {showPublicLayout && <LoadingOverlay isVisible={showLoadingOverlay} />}
      
      {/* Main page wrapper with flex layout to keep footer at bottom */}
      <div className={`flex flex-col min-h-screen ${showPublicLayout ? 'bg-black' : ''}`}>
        {/* Show Navbar on all pages except admin, dashboard, and auth routes */}
        {showPublicLayout && (
          <>
            <PromoTicker />
            <SimpleNavbar />
          </>
        )}
        
        {/* Main content area - flex-grow to push footer down */}
        <main className="flex-grow">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        
        {/* Footer - always rendered but positioned properly */}
        {showPublicLayout && (
          <FooterSection />
        )}
      </div>
      
      <Toaster />
      {/* Analytics removed */}
    </>
  )
}

