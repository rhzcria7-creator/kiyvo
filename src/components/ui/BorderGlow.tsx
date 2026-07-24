'use client'
// ─────────────────────────────────────────────────────────────
// BorderGlow — borda brilhante que segue o cursor.
// Adaptado do React Bits; leve, sem libs adicionais.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { useRef, type ElementType, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface BorderGlowProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Cor principal do glow */
  color?: string
  /** Raio de alcance do brilho (px) */
  radius?: number
}

export function BorderGlow({
  children,
  as = 'div',
  className = '',
  color,
  radius = 220,
}: BorderGlowProps) {
  const ref = useRef<HTMLElement | null>(null)
  const MotionTag = motion(as as ElementType) as typeof motion.div

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const style = color
    ? ({ '--glow-color': color, '--glow-radius': `${radius}px` } as React.CSSProperties)
    : ({ '--glow-radius': `${radius}px` } as React.CSSProperties)

  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      onMouseMove={handleMove}
      className={`border-glow ${className}`}
      style={style}
    >
      {children}
    </MotionTag>
  )
}

export default BorderGlow
