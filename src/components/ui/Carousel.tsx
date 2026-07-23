'use client'
// ─────────────────────────────────────────────────────────────
// Carousel — carrossel drag + autoplay com framer-motion.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  slides: ReactNode[]
  autoPlay?: boolean
  interval?: number
  showControls?: boolean
  showDots?: boolean
  className?: string
  slideClassName?: string
  /** Pausa autoplay no hover */
  pauseOnHover?: boolean
  /** Loop infinito */
  loop?: boolean
}

export function Carousel({
  slides,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showDots = true,
  className = '',
  slideClassName = '',
  pauseOnHover = true,
  loop = true,
}: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = slides.length
  const canPrev = loop || index > 0
  const canNext = loop || index < total - 1

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir)
    if (loop) {
      setIndex(((next % total) + total) % total)
    } else {
      setIndex(Math.max(0, Math.min(total - 1, next)))
    }
  }, [loop, total])

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  useEffect(() => {
    if (!autoPlay || paused || total <= 1) return
    timerRef.current = setInterval(() => {
      setDirection(1)
      setIndex(i => (loop ? (i + 1) % total : Math.min(total - 1, i + 1)))
    }, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, paused, interval, total, loop])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const SWIPE = 60
    if (info.offset.x < -SWIPE && canNext) next()
    else if (info.offset.x > SWIPE && canPrev) prev()
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
    }),
  }

  if (total === 0) return null

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Carrossel de destaques"
    >
      <motion.div
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        drag={total > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full h-full ${slideClassName}`}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showControls && total > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={prev}
            disabled={!canPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-surface-800/90 text-surface-700 dark:text-white shadow-lg backdrop-blur flex items-center justify-center hover:bg-white dark:hover:bg-surface-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={next}
            disabled={!canNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-surface-800/90 text-surface-700 dark:text-white shadow-lg backdrop-blur flex items-center justify-center hover:bg-white dark:hover:bg-surface-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {showDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand-500' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
