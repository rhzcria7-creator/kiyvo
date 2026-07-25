'use client'

// ─────────────────────────────────────────────────────────────
// SellerBadge v0.0.1 — Badge de nível do vendedor
// Bronze→Legend com cores, ícones e glow efeito
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Shield, Star, Zap, Crown, Diamond, Award, Sparkles } from 'lucide-react'

interface SellerBadgeProps {
  level: string
  rating?: number
  verified?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  bronze: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: <Shield className="w-3 h-3" />,
    label: 'Bronze',
  },
  silver: {
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
    icon: <Star className="w-3 h-3" />,
    label: 'Silver',
  },
  gold: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
    icon: <Zap className="w-3 h-3" />,
    label: 'Gold',
  },
  platinum: {
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700',
    icon: <Diamond className="w-3 h-3" />,
    label: 'Platinum',
  },
  diamond: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    icon: <Crown className="w-3 h-3" />,
    label: 'Diamond',
  },
  master: {
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    icon: <Award className="w-3 h-3" />,
    label: 'Master',
  },
  legend: {
    color: 'text-amber-500',
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-400 dark:border-amber-600',
    icon: <Sparkles className="w-3 h-3" />,
    label: 'Legend',
  },
}

export default function SellerBadge({ level, rating, verified, size = 'sm', showLabel = true }: SellerBadgeProps) {
  const config = LEVEL_CONFIG[level.toLowerCase()] || LEVEL_CONFIG.bronze

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-2 py-1 text-[10px] gap-1'

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={clsx(
        'inline-flex items-center rounded-full border font-semibold',
        config.bg,
        config.color,
        sizeClasses,
        level === 'legend' && 'shadow-sm shadow-amber-500/20'
      )}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
      {verified && (
        <span className="ml-0.5 text-emerald-500" title="Verificado">
          ✅
        </span>
      )}
      {rating && (
        <span className="ml-1 opacity-70">{rating.toFixed(1)}</span>
      )}
    </motion.div>
  )
}
