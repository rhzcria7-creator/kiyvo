'use client'

// ─────────────────────────────────────────────────────────────
// Bento Grid v0.0.1 — Grid de 12 colunas responsivo
// Cards de tamanhos variados com glassmorphism
// backdrop-blur-xl desliga em mobile < 768px
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export type BentoSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export interface BentoCard {
  id: string
  size: BentoSize
  colSpan?: number // 1-12
  rowSpan?: number // 1-3
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

interface BentoGridProps {
  cards: BentoCard[]
  className?: string
  cols?: 12
}

const SIZE_MAP: Record<BentoSize, { defaultCols: number; defaultRows: number; mobileCols: number }> = {
  sm: { defaultCols: 2, defaultRows: 1, mobileCols: 6 },
  md: { defaultCols: 3, defaultRows: 1, mobileCols: 6 },
  lg: { defaultCols: 4, defaultRows: 1, mobileCols: 6 },
  xl: { defaultCols: 6, defaultRows: 2, mobileCols: 6 },
  '2xl': { defaultCols: 8, defaultRows: 2, mobileCols: 6 },
  full: { defaultCols: 12, defaultRows: 1, mobileCols: 6 },
}

export default function BentoGrid({ cards, className }: BentoGridProps) {
  return (
    <div className={clsx(
      'grid grid-cols-6 md:grid-cols-12 gap-3 md:gap-4 auto-rows-auto',
      className
    )}>
      {cards.map((card, index) => {
        const sizeInfo = SIZE_MAP[card.size]
        const colSpan = card.colSpan || sizeInfo.defaultCols
        const rowSpan = card.rowSpan || sizeInfo.defaultRows

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, type: 'spring', damping: 22 }}
            className={clsx(
              'col-span-6',
              `md:col-span-${Math.min(colSpan, 12)}`,
              `md:row-span-${Math.min(rowSpan, 3)}`,
              'relative overflow-hidden rounded-2xl',
              'bg-white/80 dark:bg-zinc-900/80',
              // Glassmorphism: desliga no mobile < 768px
              'backdrop-blur-xl max-md:backdrop-blur-none',
              'border border-zinc-200/50 dark:border-zinc-800/50',
              'shadow-sm hover:shadow-xl transition-shadow duration-300',
              card.gradient && 'bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950',
              card.className,
            )}
            style={{
              gridColumn: `span ${Math.min(colSpan, 12)}`,
              gridRow: `span ${Math.min(rowSpan, 3)}`,
            }}
          >
            {card.children}
          </motion.div>
        )
      })}
    </div>
  )
}
