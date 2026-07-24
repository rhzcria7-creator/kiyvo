'use client'
// ─────────────────────────────────────────────────────────────
// AnimatedList — lista com entrada escalonada (stagger).
// Adaptado do React Bits; framer-motion.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedListProps {
  children: ReactNode
  className?: string
  /** Delay inicial em segundos */
  delay?: number
  /** Gap entre itens em segundos */
  stagger?: number
  /** Direção de entrada */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Distância de deslocamento em px */
  offset?: number
  as?: 'ul' | 'ol' | 'div'
  itemClassName?: string
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
}

function directionOffset(direction: AnimatedListProps['direction'], offset: number) {
  switch (direction) {
    case 'up':    return { x: 0, y: offset }
    case 'down':  return { x: 0, y: -offset }
    case 'left':  return { x: offset, y: 0 }
    case 'right': return { x: -offset, y: 0 }
    default:      return { x: 0, y: 0 }
  }
}

export function AnimatedList({
  children,
  className = '',
  delay = 0,
  stagger = 0.06,
  direction = 'up',
  offset = 12,
  as = 'ul',
  itemClassName = '',
}: AnimatedListProps) {
  const { x, y } = directionOffset(direction, offset)

  const itemVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(6px)', x, y },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const MotionContainer = motion[as as 'ul'] as typeof motion.ul
  const MotionItem = motion.li

  // Garantir que children são iteráveis e encapsular cada um em um item com variantes.
  const items = Array.isArray(children) ? children : [children]

  return (
    <MotionContainer
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      custom={{ stagger, delay }}
    >
      {items.map((child, i) => (
        <MotionItem
          key={i}
          className={`animated-list-item ${itemClassName}`}
          variants={itemVariants}
        >
          {child}
        </MotionItem>
      ))}
    </MotionContainer>
  )
}

export default AnimatedList
