'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme/useTheme'

/**
 * ThemeToggle — Botão arredondado que alterna entre claro e escuro.
 * Design consistente com o sistema: pill, preto/branco, animação suave.
 */
export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { mounted, isDark, toggleTheme } = useTheme()

  const sizes = {
    sm: { button: 'w-8 h-8', icon: 15 },
    md: { button: 'w-10 h-10', icon: 18 },
    lg: { button: 'w-11 h-11', icon: 20 },
  }

  const { button, icon } = sizes[size]

  // Evita hydration mismatch: mostra placeholder até montar
  if (!mounted) {
    return <div aria-hidden className={`${button} rounded-full bg-transparent`} />
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      className={`
        ${button} relative rounded-full
        bg-white/70 dark:bg-white/10
        border border-[#0F172A]/10 dark:border-white/15
        text-[#0F172A] dark:text-white
        backdrop-blur
        flex items-center justify-center
        hover:bg-white dark:hover:bg-white/20
        transition-colors
      `}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
        >
          {isDark ? <Moon size={icon} /> : <Sun size={icon} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/** Alias legado — alguns arquivos ainda importam como ThemeSelector */
export const ThemeSelector = ThemeToggle
