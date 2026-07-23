'use client'
// ─────────────────────────────────────────────────────────────
// DecorativeSVGs — Ilustrações SVG próprias da marca Kiyvo
// Todas responsivas, com suporte a dark mode via currentColor.
// Comentários em PT-BR, variáveis em EN.
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'

/**
 * GridPattern — malha sutil de fundo (estilo Apple/Linear).
 */
export function GridPattern({
  className = '',
  color = 'rgba(37,99,235,0.08)',
}: { className?: string; color?: string }) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="kiyvo-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={color} strokeWidth="1" />
        </pattern>
        <linearGradient id="kiyvo-grid-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="kiyvo-grid-mask">
          <rect width="100%" height="100%" fill="url(#kiyvo-grid-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#kiyvo-grid)" mask="url(#kiyvo-grid-mask)" />
    </svg>
  )
}

/**
 * DotPattern — padrão de pontos sutil.
 */
export function DotPattern({
  className = '',
  color = 'rgba(37,99,235,0.15)',
  size = 2,
  spacing = 24,
}: { className?: string; color?: string; size?: number; spacing?: number }) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`kiyvo-dots-${size}-${spacing}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r={size} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#kiyvo-dots-${size}-${spacing})`} />
    </svg>
  )
}

/**
 * GradientBlur — blob de gradiente desfocado (hero e destaques).
 */
export function GradientBlob({
  className = '',
  from = '#2563EB',
  to = '#7C3AED',
  size = 500,
}: { className?: string; from?: string; to?: string; size?: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${from}40 0%, ${to}20 30%, transparent 70%)`,
        filter: 'blur(60px)',
        borderRadius: '50%',
      }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  )
}

/**
 * CheckMark — SVG de check animado (para sucessos).
 */
export function AnimatedCheck({ size = 64, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      <motion.circle
        cx="32" cy="32" r="28"
        fill="none"
        stroke={color}
        strokeWidth="3"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        custom={{ length: 175 }}
      />
      <motion.path
        d="M20 33l8 8 16-18"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

/**
 * Escrow Shield — escudo com cadeado (para proteção/escrow).
 */
export function EscrowShield({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="es-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M24 4L6 10v12c0 11 7.5 21 18 24 10.5-3 18-13 18-24V10L24 4z"
        fill="url(#es-grad)"
      />
      <rect x="19" y="22" width="10" height="9" rx="2" fill="white" />
      <path d="M21 22v-3a3 3 0 016 0v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="27" r="1.5" fill="#2563EB" />
    </svg>
  )
}

/**
 * Lightning — raio (velocidade/PIX instantâneo).
 */
export function LightningIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="li-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path
        d="M28 6L14 28h10l-4 14L34 22H24l4-16z"
        fill="url(#li-grad)"
      />
    </svg>
  )
}

/**
 * KD Points coin — moeda dourada para o programa de recompensas.
 */
export function KDPointsCoin({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kd-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#kd-grad)" stroke="#B45309" strokeWidth="1" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <text
        x="20" y="26"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="16"
        fontWeight="900"
        fill="#78350F"
      >
        K
      </text>
    </svg>
  )
}

/**
 * WaveDivider — separador em forma de onda para seções.
 */
export function WaveDivider({
  className = '',
  flip = false,
  color = '#2563EB',
}: { className?: string; flip?: boolean; color?: string }) {
  return (
    <svg
      className={`w-full ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : undefined }}
      aria-hidden="true"
    >
      <path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        fill={color}
        opacity="0.06"
      />
      <path
        d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  )
}

/**
 * PageTransition — wrapper com animação de entrada/saída para páginas.
 */
export function PageTransitionAdvanced({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
