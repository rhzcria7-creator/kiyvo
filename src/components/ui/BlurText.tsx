'use client'
// ─────────────────────────────────────────────────────────────
// BlurText — texto desfocado que revela palavra por palavra.
// Adaptado do React Bits, apenas framer-motion.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { motion, useInView } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'

interface BlurTextProps {
  text: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  /** Delay base em segundos */
  delay?: number
  /** Duração por palavra em segundos */
  duration?: number
  /** Atraso incremental entre palavras */
  stagger?: number
  /** Desfoque inicial em px */
  blurFrom?: number
  /** Desfoque final em px */
  blurTo?: number
  /** Offset Y inicial */
  yFrom?: number
  /** Dispara apenas uma vez */
  once?: boolean
  splitBy?: 'words' | 'chars'
  /** Animar imediatamente ao montar (sem esperar inView). Ideal para heróis. */
  animateOnMount?: boolean
}

export function BlurText({
  text,
  as = 'h1',
  className,
  delay = 0,
  duration = 0.55,
  stagger = 0.06,
  blurFrom = 10,
  blurTo = 0,
  yFrom = 12,
  once = true,
  splitBy = 'words',
  animateOnMount = false,
}: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once, amount: 0.2 })
  const [mounted, setMounted] = useState(false)

  // Garante que animateOnMount realmente dispara após o mount
  // (useInView pode atrasar no mobile; mount é instantâneo)
  if (animateOnMount && !mounted) {
    // Schedula um microtask para evitar setState durante render
    queueMicrotask(() => setMounted(true))
  }

  const active = animateOnMount ? (mounted || inView) : inView

  const segments = useMemo(() => {
    if (splitBy === 'chars') return Array.from(text)
    return text.split(' ')
  }, [text, splitBy])

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial="hidden"
      animate={active ? 'visible' : 'hidden'}
      aria-label={text}
    >
      {segments.map((seg, i) => (
        <motion.span
          key={`${i}-${seg}`}
          className="blur-word"
          style={{ display: 'inline-block', whiteSpace: splitBy === 'words' ? 'normal' : 'pre' }}
          variants={{
            hidden: {
              opacity: 0,
              filter: `blur(${blurFrom}px)`,
              y: yFrom,
            },
            visible: {
              opacity: 1,
              filter: `blur(${blurTo}px)`,
              y: 0,
              transition: {
                delay: delay + i * stagger,
                duration,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {seg}
          {splitBy === 'words' && i < segments.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </MotionTag>
  )
}

export default BlurText
