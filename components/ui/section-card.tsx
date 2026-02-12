"use client"
import { ReactNode } from "react"

interface SectionCardProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  padded?: boolean
  className?: string
  onClick?: () => void
}

export default function SectionCard({ title, icon, children, footer, padded = true, className = "", onClick }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 px-6 pt-6">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 border border-gray-200">
              {icon}
            </div>
          )}
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
        </div>
      )}
      <div className={`${padded ? 'p-6' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </div>
  )
}



