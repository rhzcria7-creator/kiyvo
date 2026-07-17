'use client'

import { motion } from 'framer-motion'

// ─── Animated Shield (Security) ──────────────────────────────
export function AnimatedShield({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="text-brand-500"
      />
      <motion.path
        d="M22 32l7 7 13-13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
        className="text-brand-600"
      />
    </svg>
  )
}

// ─── Animated Lightning (Speed) ──────────────────────────────
export function AnimatedLightning({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M36 4L12 36h16L24 60l28-32H36L44 4H36z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="text-amber-500"
      />
      <motion.path
        d="M36 4L12 36h16L24 60l28-32H36L44 4H36z"
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.15 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-amber-400"
      />
    </svg>
  )
}

// ─── Animated Star (Rewards) ─────────────────────────────────
export function AnimatedStar({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M32 4l8.18 16.58L58 23.16l-13 12.68L48.18 54 32 45.16 15.82 54l3.18-18.16-13-12.68 17.82-2.58L32 4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
        whileInView={{ pathLength: 1, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="text-purple-500"
      />
      <motion.path
        d="M32 4l8.18 16.58L58 23.16l-13 12.68L48.18 54 32 45.16 15.82 54l3.18-18.16-13-12.68 17.82-2.58L32 4z"
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.15 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-purple-400"
      />
    </svg>
  )
}

// ─── Animated Globe (Digital) ────────────────────────────────
export function AnimatedGlobe({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.circle
        cx="32" cy="32" r="28"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-brand-500"
      />
      <motion.ellipse
        cx="32" cy="32" rx="12" ry="28"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-brand-400"
      />
      <motion.line
        x1="4" y1="32" x2="60" y2="32"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-brand-400"
      />
      <motion.path
        d="M8 20h48M8 44h48"
        stroke="currentColor"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-brand-300"
      />
    </svg>
  )
}

// ─── Animated Cart (Shopping) ────────────────────────────────
export function AnimatedCart({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M4 8h8l6 30h30l6-22H18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-brand-500"
      />
      <motion.circle
        cx="22" cy="50" r="5"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-brand-600"
      />
      <motion.circle
        cx="42" cy="50" r="5"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 1 }}
        className="text-brand-600"
      />
    </svg>
  )
}

// ─── Animated Handshake (Trust) ──────────────────────────────
export function AnimatedHandshake({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M8 32l10-10 8 4 8-8 8 4 14-8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="text-emerald-500"
      />
      <motion.path
        d="M8 32l6 12 8-4 8 8 10-6 6 4 10-12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="text-emerald-600"
      />
    </svg>
  )
}

// ─── Floating Dots Background ────────────────────────────────
export function FloatingDots({ count = 20, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-brand-200/30"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated Wave Divider ───────────────────────────────────
export function WaveDivider({ className = '', color = 'text-brand-50' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 1440 120" className={`w-full ${color} ${className}`} preserveAspectRatio="none">
      <motion.path
        d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z"
        fill="currentColor"
        initial={{ d: "M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z" }}
        animate={{
          d: [
            "M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z",
            "M0,80 C360,20 720,100 1080,48 C1260,20 1380,40 1440,80 L1440,120 L0,120 Z",
            "M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}
