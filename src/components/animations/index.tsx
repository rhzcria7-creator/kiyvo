'use client'

import { motion, AnimatePresence } from 'framer-motion'

// ─── Page Transition Wrapper ─────────────────────────────────
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Stagger Children ────────────────────────────────────────
export function StaggerContainer({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Fade In on Scroll ───────────────────────────────────────
export function FadeInOnScroll({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Scale In on Scroll ──────────────────────────────────────
export function ScaleInOnScroll({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Slide In from Direction ─────────────────────────────────
export function SlideIn({ children, direction = 'left', className, delay = 0 }: { children: React.ReactNode; direction?: 'left' | 'right' | 'up' | 'down'; className?: string; delay?: number }) {
  const directions = {
    left: { x: -60, y: 0 },
    right: { x: 60, y: 0 },
    up: { x: 0, y: -60 },
    down: { x: 0, y: 60 },
  }
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated Counter ────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = (Date.now() - startTime) / (duration * 1000)
            const progress = Math.min(elapsed, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          animate()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>
}

// ─── Loading Skeleton with Pulse ─────────────────────────────
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ─── Full Page Loading ───────────────────────────────────────
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="text-surface-500 text-sm font-display font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Carregando...
        </motion.p>
      </motion.div>
    </div>
  )
}

// ─── Ripple Button Effect ────────────────────────────────────
export function Ripple({ x, y }: { x: number; y: number }) {
  return (
    <motion.span
      className="absolute rounded-full bg-white/30 pointer-events-none"
      style={{ left: x, top: y, width: 0, height: 0 }}
      initial={{ width: 0, height: 0, opacity: 0.5, x: 0, y: 0 }}
      animate={{ width: 300, height: 300, opacity: 0, x: -150, y: -150 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

// ─── Typing Effect ───────────────────────────────────────────
export function TypingText({ text, className, speed = 40 }: { text: string; className?: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => prev + text[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [index, text, speed])

  return (
    <span className={className}>
      {displayed}
      {index < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-brand-600 ml-0.5 align-middle"
        />
      )}
    </span>
  )
}
