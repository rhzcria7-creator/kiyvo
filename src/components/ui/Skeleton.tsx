'use client'
// ─────────────────────────────────────────────────────────────
// Skeleton — Shimmer loading placeholder
// Animação em CSS com SVG gradient (não usa backdrop-filter, leve)
// Mobile-first, acessível (aria-busy + sr-only label)
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  animate?: boolean
  /** Largura em % ou px/rem */
  width?: string | number
  /** Altura em px/rem */
  height?: string | number
}

export function Skeleton({
  className,
  rounded = 'md',
  animate = true,
  width,
  height,
}: SkeletonProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded]

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
      transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      className={cn(
        'relative overflow-hidden bg-surface-200 dark:bg-surface-800',
        roundedClass,
        className
      )}
      style={{ width, height }}
      role="status"
      aria-busy="true"
      aria-label="Carregando"
    >
      {/* Shimmer via gradient translation */}
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          animation: animate ? 'kiyvo-shimmer 1.6s infinite' : 'none',
        }}
      />
    </motion.div>
  )
}

/**
 * SkeletonCard — Card placeholder pré-montado.
 */
export function SkeletonCard() {
  return (
    <div className="card-base p-5 space-y-4">
      <Skeleton className="h-44 w-full" rounded="lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20" rounded="full" />
        <Skeleton className="h-9 w-24" rounded="lg" />
      </div>
    </div>
  )
}

/**
 * SkeletonList — Linha de lista placeholder.
 */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10" rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2 w-1/3" />
          </div>
          <Skeleton className="w-16 h-8" rounded="md" />
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonText — Bloco de texto placeholder com múltiplas linhas.
 */
export function SkeletonText({ lines = 3, lastLinePercent = 60 }: { lines?: number; lastLinePercent?: number }) {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1
        return (
          <Skeleton
            key={i}
            className="h-3"
            width={isLast ? `${lastLinePercent}%` : '100%'}
            rounded="full"
          />
        )
      })}
    </div>
  )
}
