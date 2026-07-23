// ─────────────────────────────────────────────────────────────
// KIYVO — Magnetic Button (React Bit)
//
// Botão que é "puxado" magneticamente em direção ao cursor.
// Leve (não usa spring caro), sutil, com reset automático.
//
// Uso:
//   <MagneticButton><button ...>Clique</button></MagneticButton>
// ou wrap do ShimmerButton/Link.
// ─────────────────────────────────────────────────────────────

'use client'

import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number // 0-1, quanto mais forte mais "puxa"
  className?: string
  as?: 'div' | 'span'
}

export default function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  as = 'div',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) * strength
    const dy = (e.clientY - centerY) * strength
    setPos({ x: dx, y: dy })
  }

  const onLeave = () => setPos({ x: 0, y: 0 })

  const Tag = as as 'div'

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
      style={{ perspective: 600 }}
    >
      <motion.div
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.5 }}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </Tag>
  )
}
