'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

// ─── Scroll Progress Bar ────────────────────────────────────
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-purple-500 origin-left z-50"
      style={{ scaleX }}
    />
  )
}

// ─── Magnetic Hover Effect ───────────────────────────────────
export function MagneticHover({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e
    const rect = currentTarget.getBoundingClientRect()
    const x = (clientX - rect.left - rect.width / 2) * 0.15
    const y = (clientY - rect.top - rect.height / 2) * 0.15
    setPosition({ x, y })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── 3D Tilt Card ───────────────────────────────────────────
export function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    setRotate({ x: rotateX, y: rotateY })
  }

  const reset = () => setRotate({ x: 0, y: 0 })

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Parallax Section ───────────────────────────────────────
export function ParallaxSection({ children, speed = 0.5, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
  const { scrollY } = useScroll()
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (y) => {
      setOffset(y * speed * 0.1)
    })
    return () => unsubscribe()
  }, [scrollY, speed])

  return (
    <div className={`relative ${className}`}>
      <div style={{ transform: `translateY(${offset}px)` }}>
        {children}
      </div>
    </div>
  )
}

// ─── Glow Effect on Hover ───────────────────────────────────
export function GlowCard({ children, className = '', color = 'brand' }: { children: React.ReactNode; className?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    brand: 'hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]',
    purple: 'hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]',
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`card-base transition-shadow duration-500 ${colorMap[color] || colorMap.brand} ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated Gradient Background ────────────────────────────
export function AnimatedGradient({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-purple-400/10 to-brand-600/20"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(147,51,234,0.1) 50%, rgba(37,99,235,0.15) 100%)',
            'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(37,99,235,0.1) 50%, rgba(147,51,234,0.15) 100%)',
            'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(147,51,234,0.1) 50%, rgba(37,99,235,0.15) 100%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── Morphing Blob Background ────────────────────────────────
export function MorphingBlob({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-brand-400/10 blur-3xl"
        animate={{
          borderRadius: ['40% 60% 60% 40% / 60% 30% 70% 40%', '50% 50% 50% 50% / 50% 50% 50% 50%', '40% 60% 60% 40% / 60% 30% 70% 40%'],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-3xl"
        animate={{
          borderRadius: ['50% 50% 50% 50% / 50% 50% 50% 50%', '40% 60% 60% 40% / 60% 30% 70% 40%', '50% 50% 50% 50% / 50% 50% 50% 50%'],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── Stagger Reveal Text ─────────────────────────────────────
export function RevealText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1.5"
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.08 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Pulse Ring Effect ───────────────────────────────────────
export function PulseRing({ className = '', color = 'bg-brand-500' }: { className?: string; color?: string }) {
  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  )
}

// ─── Confetti Button ─────────────────────────────────────────
export function useConfetti() {
  const [show, setShow] = useState(false)
  const fire = () => { setShow(true); setTimeout(() => setShow(false), 3000) }
  const ConfettiComponent = show ? (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {/* Simple CSS confetti */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][Math.floor(Math.random() * 6)],
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '100vh', rotate: Math.random() * 720, opacity: 0 }}
          transition={{ duration: Math.random() * 2 + 1, delay: Math.random() * 0.5, ease: 'easeIn' }}
        />
      ))}
    </div>
  ) : null
  return { fire, ConfettiComponent }
}

// ─── Number Ticker ───────────────────────────────────────────
export function NumberTicker({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        let start = 0
        const end = value
        const duration = 2000
        const startTime = Date.now()
        const animate = () => {
          const now = Date.now()
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 4)
          setDisplay(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(animate)
        }
        animate()
      }}
    >
      {display.toLocaleString('pt-BR')}
    </motion.span>
  )
}

// ─── Skeleton Grid ───────────────────────────────────────────
export function SkeletonGrid({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-base overflow-hidden">
          <div className="aspect-[4/3] skeleton" />
          <div className="p-4 space-y-3">
            <div className="h-4 skeleton w-3/4" />
            <div className="h-3 skeleton w-1/2" />
            <div className="h-6 skeleton w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Re-export from animations module ────────────────────────
export { FadeInOnScroll, ScaleInOnScroll, StaggerContainer, StaggerItem, AnimatedCounter, LoadingSkeleton, FullPageLoader, TypingText } from '@/components/animations'
