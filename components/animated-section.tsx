"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
  id?: string
}

export function AnimatedSection({ children, className, style, delay = 0, id }: AnimatedSectionProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay * 0.2
      }}
      className={className}
      style={{
        willChange: 'transform, opacity',
        ...style
      }}
    >
      {children}
    </motion.div>
  )
}
