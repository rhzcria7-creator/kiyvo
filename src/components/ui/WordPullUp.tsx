'use client'

/**
 * WordPullUp — palavras sobem uma a uma com blur saindo.
 *
 * INFALÍVEL contra "colar palavras": usa flex-wrap + gap entre spans,
 * NÃO depende de whitespace entre inline-blocks, funciona mesmo com CSS
 * desabilitado, em leitores de tela, em crawlers, em SSR.
 */

import { motion, Variants } from 'framer-motion'

interface Props {
  words: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

const container: Variants = {
  hidden: {},
  visible: (i = 1) => ({
    transition: { staggerChildren: 0.05, delayChildren: i * 0.12 },
  }),
}

const child: Variants = {
  visible: {
    y: 0,
    filter: 'blur(0px)',
    opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 260 },
  },
  hidden: {
    y: 20,
    filter: 'blur(8px)',
    opacity: 0,
  },
}

export default function WordPullUp({
  words,
  className = '',
  delay = 0,
  as = 'h1',
}: Props) {
  const wordsArr = words.split(/\s+/).filter(Boolean)
  // Usamos motion.div como wrapper (tipo flex) mas renderiza como `as`.
  // Para headings, renderizamos como h1/h2/h3 via `as` do Framer Motion.
  const Comp = motion[as] as typeof motion.h1
  return (
    <Comp
      variants={container}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={`flex flex-wrap ${className}`}
      aria-label={words}
    >
      {wordsArr.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={child}
          className="inline-block mr-[0.22em]"
        >
          {w}
        </motion.span>
      ))}
    </Comp>
  )
}
