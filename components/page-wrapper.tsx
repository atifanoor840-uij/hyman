"use client"
import { usePathname } from "next/navigation"
import SimpleNavbar from "@/components/simple-navbar"
import PageHero from "@/components/page-hero"

interface PageWrapperProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  current?: string
}

export default function PageWrapper({ children, title, subtitle, current }: PageWrapperProps) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  
  // Don't wrap landing page - it has its own structure
  if (isLandingPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar at top with no spacing */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <SimpleNavbar />
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
      
      {/* Professional Header */}
      <PageHero 
        title={title} 
        subtitle={subtitle} 
        current={current || title}
      />
      
      {/* Page Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}







