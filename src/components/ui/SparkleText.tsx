'use client'

/**
 * SparkleText — texto que brilha como ouro/neon.
 * Efeito de glitter animado atrás do texto.
 */

import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  color?: 'blue' | 'gold' | 'rainbow'
}

export default function SparkleText({ children, className = '', color = 'blue' }: Props) {
  const gradients = {
    blue: 'linear-gradient(120deg, #2563EB 0%, #60A5FA 25%, #fff 50%, #2563EB 75%, #1D4ED8 100%)',
    gold: 'linear-gradient(120deg, #F59E0B 0%, #FBBF24 25%, #fff 50%, #F59E0B 75%, #B45309 100%)',
    rainbow: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899, #EF4444)',
  }

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{
        background: gradients[color],
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </motion.span>
  )
}
