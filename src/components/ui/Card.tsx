'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover3d?: boolean
  animate?: boolean
  delay?: number
}

export function Card({ children, className, hover3d = true, animate = true, delay = 0 }: CardProps) {
  const { ref, isVisible } = useScrollAnimation(0.1)

  const content = (
    <div
      className={cn(
        'card-base overflow-hidden group',
        hover3d && 'hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-200/60',
        className
      )}
    >
      {children}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {content}
    </motion.div>
  )
}

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('glass rounded-2xl p-6', className)}>
      {children}
    </div>
  )
}
