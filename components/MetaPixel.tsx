"use client"

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

interface MetaPixelProps {
  pixelId: string
  debug?: boolean
}

interface MetaPixelEvent {
  eventName: string
  parameters?: Record<string, any>
}

export default function MetaPixel({ pixelId, debug = false }: MetaPixelProps) {
  useEffect(() => {
    // Initialize Facebook Pixel with enhanced error handling
    if (typeof window !== 'undefined' && !window.fbq) {
      try {
        if (debug) {
          console.log('🚀 Initializing Meta Pixel with ID:', pixelId)
        }

        const pixelScript = function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
          if (f.fbq) return
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          }
          if (!f._fbq) f._fbq = n
          n.push = n
          n.loaded = !0
          n.version = '2.0'
          n.queue = []
          t = b.createElement(e)
          t.async = !0
          t.src = v
          s = b.getElementsByTagName(e)[0]
          s.parentNode.insertBefore(t, s)
        }
        pixelScript(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined)

        // Wait for script to load and then initialize
        const initializePixel = () => {
          if (window.fbq) {
            try {
              window.fbq('init', pixelId)
              window.fbq('track', 'PageView')
              
              if (debug) {
                console.log('✅ Meta Pixel initialized successfully with ID:', pixelId)
                console.log('✅ PageView event tracked')
                console.log('🔍 Pixel verification:', {
                  pixelId,
                  fbqAvailable: !!window.fbq,
                  _fbqLoaded: !!window._fbq?.loaded,
                  userAgent: navigator.userAgent
                })
              }
            } catch (initError) {
              if (debug) {
                console.error('❌ Meta Pixel init failed:', initError)
              }
            }
          } else {
            if (debug) {
              console.warn('⚠️ fbq not available yet, retrying...')
            }
            setTimeout(initializePixel, 100)
          }
        }

        // Initialize immediately or after a short delay
        setTimeout(initializePixel, 50)

      } catch (error) {
        if (debug) {
          console.error('❌ Meta Pixel initialization failed:', error)
        }
      }
    } else if (window.fbq && debug) {
      console.log('ℹ️ Meta Pixel already initialized')
    }
  }, [pixelId, debug])

  return null
}

// Utility function to track custom events with enhanced error handling
export const trackMetaPixelEvent = (eventName: string, parameters?: Record<string, any>, debug = false) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', eventName, parameters)
      if (debug) {
        console.log('✅ Meta Pixel event tracked:', eventName, parameters)
        console.log('🔍 Event verification:', {
          eventName,
          parameters,
          timestamp: new Date().toISOString(),
          pixelId: window._fbq?.pixelId || 'unknown'
        })
      }
    } catch (error) {
      if (debug) {
        console.error('❌ Meta Pixel event tracking failed:', error)
        console.error('🔍 Error details:', {
          eventName,
          parameters,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    }
  } else if (debug) {
    console.warn('⚠️ Meta Pixel not available for event tracking')
    console.warn('🔍 Debug info:', {
      windowAvailable: typeof window !== 'undefined',
      fbqAvailable: !!window.fbq,
      _fbqAvailable: !!window._fbq
    })
  }
}

// Predefined event tracking functions with enhanced parameters
export const trackSignup = (email?: string, debug = false) => {
  trackMetaPixelEvent('CompleteRegistration', {
    content_name: 'Dragon Funded User Registration',
    content_category: 'Trading Platform Signup',
    value: 0,
    currency: 'USD',
    ...(email && { email })
  }, debug)
}

export const trackPurchase = (value: number, currency: string = 'USD', contentName?: string, debug = false) => {
  trackMetaPixelEvent('Purchase', {
    content_name: contentName || 'Dragon Funded Trading Challenge',
    content_category: 'Trading Program',
    value,
    currency,
    content_type: 'product'
  }, debug)
}

export const trackLead = (contentName?: string, debug = false) => {
  trackMetaPixelEvent('Lead', {
    content_name: contentName || 'Dragon Funded Lead Generation',
    content_category: 'Trading Education'
  }, debug)
}

export const trackViewContent = (contentName: string, contentCategory?: string, debug = false) => {
  trackMetaPixelEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory || 'Trading Program',
    content_type: 'product'
  }, debug)
}

// Additional professional tracking functions
export const trackAddToCart = (value: number, currency: string = 'USD', contentName?: string, debug = false) => {
  trackMetaPixelEvent('AddToCart', {
    content_name: contentName || 'Trading Challenge',
    content_category: 'Trading Program',
    value,
    currency,
    content_type: 'product'
  }, debug)
}

export const trackInitiateCheckout = (value: number, currency: string = 'USD', debug = false) => {
  trackMetaPixelEvent('InitiateCheckout', {
    content_name: 'Dragon Funded Checkout',
    content_category: 'Trading Program',
    value,
    currency,
    content_type: 'product'
  }, debug)
}

// Enhanced purchase tracking with more details
export const trackPurchaseEnhanced = (
  value: number, 
  currency: string = 'USD', 
  contentName?: string, 
  accountType?: string,
  platform?: string,
  debug = false
) => {
  trackMetaPixelEvent('Purchase', {
    content_name: contentName || 'Dragon Funded Trading Challenge',
    content_category: 'Trading Program',
    value,
    currency,
    content_type: 'product',
    ...(accountType && { custom_data: { account_type: accountType } }),
    ...(platform && { custom_data: { platform } })
  }, debug)
}
