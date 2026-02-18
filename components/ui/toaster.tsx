'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === 'destructive'
        const isSuccess = variant === 'success' || (!isDestructive && variant !== 'destructive')
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3.5 flex-1">
              <div className={`mt-0.5 flex-shrink-0 h-5 w-5 ${
                isDestructive 
                  ? 'text-red-600' 
                  : isSuccess
                  ? 'text-emerald-600'
                  : 'text-gray-600'
              }`}>
                {isDestructive ? (
                  <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
                ) : isSuccess ? (
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Info className="h-5 w-5" strokeWidth={2.5} />
                )}
              </div>
              <div className="grid gap-1 flex-1 min-w-0">
                {title && (
                  <ToastTitle className={
                    isDestructive 
                      ? "text-red-900 font-semibold" 
                      : isSuccess
                      ? "text-emerald-900 font-semibold"
                      : "text-gray-900 font-semibold"
                  }>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className={
                    isDestructive 
                      ? "text-red-800" 
                      : isSuccess
                      ? "text-emerald-800"
                      : "text-gray-700"
                  }>
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
