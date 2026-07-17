'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme/useTheme'

/**
 * ThemeToggle — Botão animado para alternar Dark/Light mode
 * - Ícone muda com animação suave (Sun ↔ Moon)
 * - Suporta 3 estados: Light, Dark, System
 * - Efeito de glow no hover
 * - Skeleton enquanto monta (evita hydration mismatch)
 */
export function ThemeToggle({ showLabel = false, size = 'md' }: { showLabel?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const { resolvedTheme, setTheme, mounted, isDark } = useTheme()

  const sizes = {
    sm: { button: 'w-8 h-8', icon: 16 },
    md: { button: 'w-10 h-10', icon: 20 },
    lg: { button: 'w-12 h-12', icon: 24 },
  }

  const { button, icon } = sizes[size]

  // Skeleton para evitar hydration mismatch
  if (!mounted) {
    return (
      <div className={`${button} rounded-xl bg-surface-200 dark:bg-surface-700 animate-pulse`} />
    )
  }

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        ${button} relative rounded-xl 
        bg-surface-100 dark:bg-surface-800 
        border border-surface-200 dark:border-surface-700
        flex items-center justify-center
        hover:bg-surface-200 dark:hover:bg-surface-700
        hover:shadow-glow dark:hover:shadow-dark-glow
        transition-all duration-300
        focus-ring
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Sun size={icon} className="text-brand-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Moon size={icon} className="text-brand-600" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-brand-500/20"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-surface-600 dark:text-surface-400">
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </motion.button>
  )
}

/**
 * ThemeSelector — Seletor com 3 opções (Light / System / Dark)
 */
export function ThemeSelector() {
  const { theme, setTheme, mounted, resolvedTheme } = useTheme()

  if (!mounted) {
    return <div className="h-10 w-48 rounded-xl bg-surface-200 dark:bg-surface-700 animate-pulse" />
  }

  const options = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'system', label: 'Sistema', icon: Monitor },
    { value: 'dark', label: 'Escuro', icon: Moon },
  ] as const

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
      {options.map(({ value, label, icon: Icon }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${theme === value
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-selector-bg"
              className="absolute inset-0 bg-white dark:bg-surface-700 rounded-lg shadow-sm"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Icon size={14} />
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
