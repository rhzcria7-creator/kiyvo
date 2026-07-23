'use client'

/**
 * ShimmerButton — botão preto padrão do design system.
 * Simples e premium: sem firulas de IA.
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function ShimmerButton({
  children, onClick, href, variant = 'primary', size = 'md',
  className = '', icon, type = 'button', disabled,
}: Props) {
  const sizes = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-4 text-base',
  }

  const base = `inline-flex items-center justify-center gap-2 font-display font-black rounded-full
               transition-all duration-200 select-none
               disabled:opacity-50 disabled:pointer-events-none
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2`

  const variants = {
    primary: `bg-[#0F172A] text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)]
              hover:bg-brand-600 hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.5)]
              active:bg-brand-700`,
    secondary: `bg-white text-[#0F172A] border-2 border-black/10
                hover:border-[#0F172A] active:bg-[#FAFAFA]`,
    ghost: `text-[#0F172A] dark:text-white hover:bg-black/5 dark:hover:bg-white/10`,
  }

  const content = (
    <span className="inline-flex items-center gap-2 leading-none">
      {icon}
      {children}
    </span>
  )

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined}>
        {content}
      </Link>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {content}
    </motion.button>
  )
}
