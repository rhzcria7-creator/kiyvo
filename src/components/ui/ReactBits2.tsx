'use client'
// ─────────────────────────────────────────────────────────────
// REACT BITS v2 — Animações premium inspiradas em Aceternity/Magic UI
// - AuroraBackground: luzes em arco-íris no fundo
// - Meteors:          "estrelas cadentes" caindo
// - AnimatedGrid:     grid que acende
// - Dock:            dock macOS-like
// - SparklesText:    estrelinhas brilhando
// - Marquee:         marquee horizontal (parcerias/reviews)
// - HyperBorder:     borda gradiente animada
// - TextGenerate:    texto aparecendo palavra a palavra
// - FlipWords:       palavras trocando
// - HoverBorderGradient: botão com borda que gira
// - PulsatingButton: botão com pulse
// - NoiseBg:         ruído sutil
// ─────────────────────────────────────────────────────────────
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Aurora Background ──────────────────────────────────────
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2 }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.5), transparent 70%)' }}
      />
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-0 w-[480px] h-[480px] rounded-full blur-3xl animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)', animationDelay: '2s' }}
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/3 w-[520px] h-[520px] rounded-full blur-3xl animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)', animationDelay: '4s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,white_70%)] dark:bg-[radial-gradient(ellipse_at_top,transparent,#0B0F1A_70%)]" />
    </div>
  )
}

// ─── Meteors (estrelas cadentes) ────────────────────────────
export function Meteors({ number = 20 }: { number?: number }) {
  const meteors = useMemo(() => new Array(number).fill(true).map((_, i) => ({
    left: Math.floor(Math.random() * 100) + '%',
    top: Math.floor(Math.random() * 40) - 20 + '%',
    delay: (Math.random() * 5).toFixed(2) + 's',
    duration: (Math.floor(Math.random() * 10) + 5) + 's',
    key: i,
  })), [number])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {meteors.map(m => (
        <span
          key={m.key}
          className="absolute h-[1px] w-0.5 rotate-[215deg] animate-meteor rounded-full bg-brand-500/70"
          style={{
            top: 0, left: m.left,
            animationDelay: m.delay, animationDuration: m.duration,
          }}
        >
          <span className="absolute top-1/2 -translate-y-1/2 w-[60px] h-[1px] bg-gradient-to-r from-brand-500 to-transparent" />
        </span>
      ))}
      <style>{`@keyframes meteor {0%{transform:rotate(215deg) translateX(0)}70%{opacity:1}100%{transform:rotate(215deg) translateX(-600px);opacity:0}}.animate-meteor{animation:meteor linear infinite}`}</style>
    </div>
  )
}

// ─── Animated Grid Pattern (fundo tech) ─────────────────────
export function AnimatedGrid({ className = '' }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)} aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 80%)',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(transparent 50%, rgba(37,99,235,0.07) 50%, transparent 100%)',
          backgroundSize: '100% 4px',
        }}
        animate={{ y: [0, 48] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ─── Sparkles Text (palavras com ✨ brilhando) ─────────────
export function SparklesText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const sparkles = useMemo(() => new Array(8).fill(true).map((_, i) => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() * 4 + 2,
    key: i,
  })), [])
  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      {children}
      {sparkles.map(s => (
        <motion.svg
          key={s.key}
          className="absolute pointer-events-none text-amber-400 fill-amber-400"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size }}
          viewBox="0 0 24 24"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: s.delay, repeat: Infinity, repeatDelay: 2 }}
        >
          <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
        </motion.svg>
      ))}
    </span>
  )
}

// ─── Marquee (carrossel de logos) ──────────────────────────
export function Marquee({ children, className = '', reverse = false, pauseOnHover = true }: {
  children: React.ReactNode
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
}) {
  return (
    <div className={cn('group flex overflow-hidden', className)} style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <div
        className={cn('flex shrink-0 gap-8 pr-8 animate-marquee2', pauseOnHover && 'group-hover:[animation-play-state:paused]')}
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}{children}
      </div>
      <style>{`@keyframes marquee2{from{transform:translateX(0)}to{transform:translateX(-100%)}}.animate-marquee2{animation:marquee2 30s linear infinite}`}</style>
    </div>
  )
}

// ─── HyperBorder (borda gradiente animada) ─────────────────
export function HyperBorder({ children, className = '', borderClass = '' }: {
  children: React.ReactNode
  className?: string
  borderClass?: string
}) {
  return (
    <div className={cn('relative rounded-2xl p-[2px] overflow-hidden', className)}>
      <motion.div
        className={cn('absolute inset-[-50%] bg-[conic-gradient(from_0deg,#2563EB,#7C3AED,#EC4899,#F59E0B,#10B981,#2563EB)]', borderClass)}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative bg-white dark:bg-[#0F172A] rounded-[14px] h-full">{children}</div>
    </div>
  )
}

// ─── TextGenerate (aparição palavra por palavra) ──────────
export function TextGenerate({ words, className = '' }: { words: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const parts = words.split(' ')
  return (
    <p ref={ref} className={cn('', className)}>
      {parts.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1.5"
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  )
}

// ─── FlipWords (troca palavras tipo digitação) ─────────────
export function FlipWords({ words, className = '', duration = 2000 }: {
  words: string[]
  className?: string
  duration?: number
}) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (words.length <= 1) return
    const iv = setInterval(() => setIdx(i => (i + 1) % words.length), duration)
    return () => clearInterval(iv)
  }, [words.length, duration])
  return (
    <span className={cn('relative inline-block align-bottom min-w-[180px]', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── HoverBorderGradient (botão com borda girando) ─────────
export function HoverBorderGradient({
  children,
  as: Tag = 'button',
  containerClassName = '',
  className = '',
  onClick,
  ...props
}: {
  children: React.ReactNode
  as?: any
  containerClassName?: string
  className?: string
  onClick?: () => void
} & React.HTMLAttributes<HTMLElement>) {
  const [hovered, setHovered] = useState(false)
  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={cn(
        'relative rounded-full p-[2px] overflow-hidden transition',
        containerClassName
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#2563EB,#7C3AED,#EC4899,#F59E0B,#2563EB)]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: hovered ? 2 : 6, repeat: Infinity, ease: 'linear' }}
      />
      <span className={cn(
        'relative flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3 font-black text-sm uppercase tracking-wide',
        className
      )}>
        {children}
      </span>
    </Tag>
  )
}

// ─── Noise Background (ruído sutil) ────────────────────────
export function Noise({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      aria-hidden
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }}
    />
  )
}

// ─── Spotlight (foco de luz seguindo o mouse) ──────────────
export function Spotlight({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 200, damping: 20 })
  const sy = useSpring(my, { stiffness: 200, damping: 20 })
  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }, [mx, my])
  return (
    <div ref={ref} onMouseMove={handleMove} className={cn('absolute inset-0 pointer-events-auto', className)}>
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          left: useTransform(sx, (v: number) => v - 192),
          top: useTransform(sy, (v: number) => v - 192),
        }}
      />
    </div>
  )
}

// ─── NumberTicker (contador subindo) ───────────────────────
export function NumberTicker({ value, decimals = 0, prefix = '', suffix = '', duration = 1.5, className = '' }: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const from = 0
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(2, -10 * p)
      setN(from + (value - from) * eased)
      if (p < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <span className={className}>
      {prefix}{n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

// ─── Pulsating Button ─────────────────────────────────────
export function PulsatingButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn('relative inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-4 text-white font-black uppercase text-sm tracking-wide shadow-lg', className)}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-brand-500"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

// ─── Confetti (simple) ────────────────────────────────────
export function SimpleConfetti({ show }: { show: boolean }) {
  const pieces = useMemo(() => new Array(40).fill(true).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#2563EB','#7C3AED','#EC4899','#F59E0B','#10B981','#0F172A'][Math.floor(Math.random() * 6)],
    key: i,
    dur: 1.5 + Math.random() * 1.5,
  })), [show])
  if (!show) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[300]" aria-hidden>
      {pieces.map(p => (
        <motion.span
          key={p.key}
          initial={{ top: -20, opacity: 1, rotate: 0 }}
          animate={{ top: '100vh', opacity: 0, rotate: 720 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          className="absolute w-2 h-3 rounded-sm"
          style={{ left: `${p.left}%`, background: p.color }}
        />
      ))}
    </div>
  )
}

// ─── Background Beams (linhas de luz) ─────────────────────
export function BackgroundBeams({ className = '' }: { className?: string }) {
  const paths = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const x1 = Math.random() * 100
    return {
      d: `M${x1} 0 Q${Math.random() * 100} ${50 + Math.random() * 200} ${Math.random() * 100} ${800 + Math.random() * 200}`,
      delay: Math.random() * 4,
      dur: 5 + Math.random() * 5,
      key: i,
    }
  }), [])
  return (
    <svg className={cn('absolute inset-0 h-full w-full stroke-slate-300/10 dark:stroke-white/5', className)} aria-hidden>
      {paths.map(p => (
        <path key={p.key} d={p.d} fill="none" strokeWidth="1">
          <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" from="0" to="1000" dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  )
}
