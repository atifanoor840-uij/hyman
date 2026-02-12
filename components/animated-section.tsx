"use client"

import { motion } from "framer-motion"
import type { HTMLAttributes, ReactNode } from "react"

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0, ...props }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ 
        duration: 0.25, // Reduced from 0.3s to 0.25s for faster animations
        ease: [0.25, 0.1, 0.25, 1], 
        delay: delay * 0.2 // Further reduced delay multiplier
      }}
      className={className}
      style={{ 
        willChange: 'transform, opacity',
        ...props.style 
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
