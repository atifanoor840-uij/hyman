"use client"

import { useEffect, useState } from 'react'

interface MetaPixelVerificationProps {
  pixelId: string
  showDebugInfo?: boolean
}

export default function MetaPixelVerification({ pixelId, showDebugInfo = false }: MetaPixelVerificationProps) {
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    const checkPixelStatus = () => {
      if (typeof window === 'undefined') return

      const debugMessages: string[] = []
      
      try {
        // Check if fbq is available
        if (window.fbq) {
          setPixelStatus('connected')
          debugMessages.push('✅ Meta Pixel (fbq) is loaded and available')
          
          // Check if pixel is initialized
          if (window._fbq && window._fbq.loaded) {
            debugMessages.push('✅ Meta Pixel is initialized and loaded')
          } else {
            debugMessages.push('⚠️ Meta Pixel may not be fully initialized')
          }
          
          // Test pixel functionality
          try {
            window.fbq('track', 'PageView')
            debugMessages.push('✅ Meta Pixel tracking is working')
          } catch (error) {
            debugMessages.push('❌ Meta Pixel tracking failed: ' + error)
            setPixelStatus('error')
          }
        } else {
          setPixelStatus('error')
          debugMessages.push('❌ Meta Pixel (fbq) is not available')
        }
      } catch (error) {
        setPixelStatus('error')
        debugMessages.push('❌ Error checking Meta Pixel: ' + error)
      }
      
      setDebugInfo(debugMessages)
    }

    // Check immediately
    checkPixelStatus()
    
    // Check again after a short delay to ensure pixel is loaded
    const timeout = setTimeout(checkPixelStatus, 2000)
    
    return () => clearTimeout(timeout)
  }, [pixelId])

  if (!showDebugInfo) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${
          pixelStatus === 'connected' ? 'bg-green-500' : 
          pixelStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
        <span className="font-semibold">
          Meta Pixel Status: {pixelStatus.toUpperCase()}
        </span>
      </div>
      <div className="text-xs space-y-1">
        <div>Pixel ID: {pixelId}</div>
        {debugInfo.map((info, index) => (
          <div key={index} className="text-gray-300">{info}</div>
        ))}
      </div>
    </div>
  )
}
