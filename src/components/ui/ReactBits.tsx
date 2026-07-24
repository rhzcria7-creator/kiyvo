'use client'
// ─────────────────────────────────────────────────────────────
// React Bits — Animações avançadas inspiradas em React Bits / Motion Primitives
// - ShinyButton:    botão com brilho animado passando
// - GlowCard:       card com glow seguindo o mouse
// - ParticleField:  partículas conectadas flutuantes
// - GradientText:   texto com gradient animado
// - TextShimmer:    shimmer passando no texto
// - NumberFlow:     contador animado suave
// - RippleButton:   botão com ripple no clique
// - NeonGradientCard: card com borda neon gradiente animada
// - HyperText:      character scramble reveal
// ─────────────────────────────────────────────────────────────
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── ShinyButton ────────────────────────────────────────────
export function ShinyButton({
  children,
  onClick,
  className = '',
  shinyColor = 'rgba(255,255,255,0.4)',
  disabled,
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  shinyColor?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-full font-black uppercase tracking-wide text-sm',
        'bg-[#0F172A] text-white dark:bg-white dark:text-black',
        'px-6 py-3.5 shadow-lg shadow-brand-500/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!disabled && (
        <motion.span
          className="absolute inset-y-0 w-1/3 -skew-x-12"
          style={{
            background: `linear-gradient(90deg, transparent, ${shinyColor}, transparent)`,
            left: '-30%',
          }}
          animate={{ left: ['-30%', '130%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  )
}

// ─── GlowCard ──────────────────────────────────────────────
export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(37, 99, 235, 0.35)',
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springCfg = { stiffness: 200, damping: 20 }
  const sx = useSpring(x, springCfg)
  const sy = useSpring(y, springCfg)

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(-100); y.set(-100)
  }, [x, y])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn('relative overflow-hidden rounded-[1.5rem]', className)}
    >
      <motion.div
        className="pointer-events-none absolute w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: glowColor, left: sx, top: sy, transform: 'translate(-50%, -50%)' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── ParticleField (fundo decorativo) ─────────────────────
export function ParticleField({
  color = '#2563EB',
  count = 20,
  className = '',
}: {
  color?: string
  count?: number
  className?: string
}) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      dur: Math.random() * 8 + 8,
      delay: Math.random() * 5,
    }))
  )
  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)} aria-hidden>
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: 0.25,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── GradientText (texto com gradiente animado) ───────────
// Usa CSS keyframes (mais robusto que JS animation, não para em tab oculta)
export function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'kiyvo-gradient-text inline-block',
        'bg-clip-text text-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── TextShimmer ──────────────────────────────────────────
export function TextShimmer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block bg-[length:200%_100%] bg-clip-text text-transparent',
      'bg-gradient-to-r from-slate-400 via-slate-900 to-slate-400 dark:from-slate-500 dark:via-white dark:to-slate-500',
      className)}
      style={{ animation: 'shimmerText 3s linear infinite' }}
    >
      {children}
    </span>
  )
}

// ─── NumberFlow (contador suave) ─────────────────────────
export function NumberFlow({ value, duration = 1.2, format = (n: number) => n.toLocaleString('pt-BR'), className = '' }: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let rafId: number
    const start = performance.now()
    const from = display
    const to = value
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(from + (to - from) * eased))
      if (p < 1) rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])
  return <span className={className}>{format(display)}</span>
}

// ─── RippleButton ────────────────────────────────────────
export function RippleButton({ children, onClick, className = '', color = 'rgba(255,255,255,0.4)' }: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  color?: string
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number; size: number }[]>([])
  const ref = useRef<HTMLButtonElement>(null)
  const idRef = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = idRef.current++
    setRipples(r => [...r, { x, y, id, size }])
    setTimeout(() => setRipples(r => r.filter(ri => ri.id !== id)), 600)
    onClick?.()
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute rounded-full pointer-events-none"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size, background: color }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── NeonGradientCard ───────────────────────────────────
export function NeonGradientCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative rounded-[1.75rem] p-[2px] overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 bg-[conic-gradient(from_0deg,#2563EB,#7C3AED,#EC4899,#F59E0B,#2563EB)]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ filter: 'blur(6px)' }}
      />
      <div className="relative z-10 bg-white dark:bg-[#0F172A] rounded-[1.7rem] h-full">
        {children}
      </div>
    </div>
  )
}

// ─── HyperText (scramble reveal) ────────────────────────
export function HyperText({ text, className = '', duration = 800 }: { text: string; className?: string; duration?: number }) {
  const [display, setDisplay] = useState(text.replace(/./g, (c) => c === ' ' ? ' ' : '?'))
  const CHARS = '!<>-_\\/[]{}—=+*^?#_'

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const length = text.length
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const revealed = Math.floor(length * p)
      let out = ''
      for (let i = 0; i < length; i++) {
        if (i < revealed || text[i] === ' ') out += text[i]
        else out += CHARS[Math.floor(Math.random() * CHARS.length)]
      }
      setDisplay(out)
      if (p < 1) raf = requestAnimationFrame(animate)
      else setDisplay(text)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [text, duration])

  return <span className={cn('font-mono', className)}>{display}</span>
}

// ─── FloatingBadge (badge flutuante tipo Apple) ─────────
export function FloatingBadge({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        className={cn('', className)}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── AnimatedCounter (usa NumberFlow com suffix/prefix) ─
export function AnimatedCounter({ value, prefix = '', suffix = '', ...rest }: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  return (
    <span {...rest as any}>
      {prefix}<NumberFlow value={value} {...rest} />{suffix}
    </span>
  )
}
