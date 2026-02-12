"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VerificationCodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  error?: boolean
  autoFocus?: boolean
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
  placeholder = "0",
  error = false,
  autoFocus = true
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize input refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Handle input change
  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '')
    
    if (sanitizedValue.length > 1) {
      // Handle paste operation - take only the first 6 digits
      const pastedDigits = sanitizedValue.slice(0, length)
      onChange(pastedDigits)
      
      // Focus the last input after paste
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1]?.focus()
      }
      
      // Call onComplete if we have all digits
      if (pastedDigits.length === length) {
        onComplete?.(pastedDigits)
      }
      return
    }

    // Update the value
    const newValue = value.split('')
    newValue[index] = sanitizedValue
    const updatedValue = newValue.join('').slice(0, length)
    onChange(updatedValue)

    // Move to next input if current input is filled
    if (sanitizedValue && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
      }
    }

    // Call onComplete if we have all digits
    if (updatedValue.length === length) {
      onComplete?.(updatedValue)
    }
  }

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const sanitizedValue = pastedData.replace(/[^0-9]/g, '')
    
    if (sanitizedValue.length > 0) {
      const pastedDigits = sanitizedValue.slice(0, length)
      onChange(pastedDigits)
      
      // Focus the last input after paste
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1]?.focus()
      }
      
      // Call onComplete if we have all digits
      if (pastedDigits.length === length) {
        onComplete?.(pastedDigits)
      }
    }
  }

  // Handle key down
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        const prevInput = inputRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle focus
  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  // Handle blur
  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-14 h-14 text-center text-xl font-semibold border-2 rounded-xl transition-all duration-200",
            "bg-white border-gray-200 text-gray-900 shadow-sm",
            "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50",
            focusedIndex === index && "border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg scale-105",
            value[index] && "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
          )}
        />
      ))}
    </div>
  )
}

export default VerificationCodeInput
