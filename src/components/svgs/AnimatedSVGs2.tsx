'use client'

import { motion } from 'framer-motion'

// ─── Animated Rocket ─────────────────────────────────────────
export function AnimatedRocket({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path
        d="M32 4C32 4 20 16 20 32l-8 8 4 4 8-8C40 36 52 24 52 24L32 4z"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 1 }}
        className="text-brand-500"
      />
      <motion.circle cx="36" cy="18" r="4" stroke="currentColor" strokeWidth="2"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.8, type: 'spring' }} className="text-brand-400"
      />
      <motion.path d="M20 32l-4 4 8 4-4-8z" fill="currentColor"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }} transition={{ delay: 1 }} className="text-orange-400"
      />
      <motion.path d="M12 44l-4 12 12-4" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
        className="text-amber-500"
      />
    </svg>
  )
}

// ─── Animated Wallet ─────────────────────────────────────────
export function AnimatedWallet({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.rect x="6" y="16" width="52" height="36" rx="4"
        stroke="currentColor" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="text-brand-500"
      />
      <motion.path d="M6 24h52" stroke="currentColor" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
        className="text-brand-400"
      />
      <motion.circle cx="48" cy="36" r="4" fill="currentColor"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }}
        viewport={{ once: true }} transition={{ delay: 0.8, type: 'spring' }}
        className="text-emerald-500"
      />
      <motion.path d="M42 8l-8 8h-8l8-8h8z" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }}
        className="text-brand-300"
      />
    </svg>
  )
}

// ─── Animated Users/Community ────────────────────────────────
export function AnimatedUsers({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5 }} className="text-brand-500"
      />
      <motion.path d="M8 48c0-10 7-16 16-16s16 6 16 16" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }} className="text-brand-500"
      />
      <motion.circle cx="44" cy="22" r="6" stroke="currentColor" strokeWidth="2"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }} className="text-purple-400"
      />
      <motion.path d="M36 48c0-8 5-12 12-12s8 4 8 12" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.7 }} className="text-purple-400"
      />
    </svg>
  )
}

// ─── Animated Document ───────────────────────────────────────
export function AnimatedDocument({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path d="M12 4h28l12 12v44H12V4z" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-brand-500"
      />
      <motion.path d="M40 4v12h12" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.6 }} className="text-brand-400"
      />
      <motion.path d="M20 28h24M20 36h24M20 44h16" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }} className="text-surface-400"
      />
    </svg>
  )
}

// ─── Animated Search ─────────────────────────────────────────
export function AnimatedSearch({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.circle cx="28" cy="28" r="16" stroke="currentColor" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-brand-500"
      />
      <motion.line x1="40" y1="40" x2="56" y2="56" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.6 }} className="text-brand-600"
      />
    </svg>
  )
}

// ─── Animated Gift ───────────────────────────────────────────
export function AnimatedGift({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.rect x="8" y="28" width="48" height="28" rx="3" stroke="currentColor" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-brand-500"
      />
      <motion.rect x="8" y="20" width="48" height="12" rx="3" stroke="currentColor" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-brand-600"
      />
      <motion.line x1="32" y1="20" x2="32" y2="56" stroke="currentColor" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }} className="text-purple-400"
      />
      <motion.path d="M32 20c-4-8-14-8-14 0" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.7 }} className="text-purple-500"
      />
      <motion.path d="M32 20c4-8 14-8 14 0" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }} className="text-purple-500"
      />
    </svg>
  )
}

// ─── Animated Megaphone ──────────────────────────────────────
export function AnimatedMegaphone({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <motion.path d="M8 24h8l20-12v40L16 40H8V24z" stroke="currentColor" strokeWidth="2.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-amber-500"
      />
      <motion.path d="M42 22c4 2 6 6 6 10s-2 8-6 10" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="text-amber-400"
      />
      <motion.path d="M46 16c6 3 10 10 10 16s-4 13-10 16" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeDasharray="4 4"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8 }} className="text-amber-300"
      />
    </svg>
  )
}

// ─── Spinning Coin ───────────────────────────────────────────
export function SpinningCoin({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <motion.div className={className} style={{ perspective: 200 }}>
      <motion.div
        className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-4 border-amber-300 shadow-lg"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <span className="font-display font-extrabold text-amber-900 text-lg">P</span>
      </motion.div>
    </motion.div>
  )
}

// ─── Orbiting Dots ───────────────────────────────────────────
export function OrbitingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-40 h-40 ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-brand-400"
          style={{ top: '50%', left: '50%', marginLeft: -6, marginTop: -6 }}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 2) * 60, 0],
            y: [0, Math.sin((i * Math.PI) / 2) * 60, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.75,
            ease: 'easeInOut',
          }}
        />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-600"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}
