'use client'
// ─────────────────────────────────────────────────────────────
// LoadingScreen — Tela de carregamento premium da Kiyvo
// Animações 100% em SVG + Framer Motion (sem imagens)
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  /** Texto abaixo do logo (padrão: "Carregando...") */
  message?: string
  /** Tamanho do logo em px (padrão: 72) */
  size?: number
  /** Se verdadeiro, o fundo ocupa 100vh com blur */
  fullscreen?: boolean
}

/**
 * KiyvoLoaderLogo — o "K" da marca com animação de progresso anel circular.
 * SVG puro, sem dependências de imagens.
 */
function KiyvoLoaderLogo({ size = 72 }: { size: number }) {
  const ringSize = size * 1.35
  return (
    <div className="relative" style={{ width: ringSize, height: ringSize }}>
      {/* Anel externo giratório */}
      <motion.svg
        width={ringSize}
        height={ringSize}
        viewBox="0 0 100 100"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <linearGradient id="kloader-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="url(#kloader-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200 80"
        />
      </motion.svg>

      {/* Anel secundário (contra-rotação) */}
      <motion.svg
        width={ringSize}
        height={ringSize}
        viewBox="0 0 100 100"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          cx="50" cy="50" r="38"
          fill="none"
          stroke="#2563EB"
          strokeOpacity="0.25"
          strokeWidth="2"
          strokeDasharray="40 200"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Logo K central com glow pulse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          style={{ filter: 'drop-shadow(0 6px 18px rgba(37, 99, 235, 0.35))' }}
        >
          <defs>
            <linearGradient id="klogo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect x="0.5" y="0.5" width="39" height="39" rx="8" fill="url(#klogo-grad)" />
          <path d="M11 10h4.2v20H11z" fill="white" />
          <path
            d="M15.2 10H20l5.5 7.5L30 10h4.5l-6.8 8.7L29.3 30h-4.7l-4.6-8.3-4.8 5.8V10z"
            fill="white"
          />
        </svg>
      </motion.div>
    </div>
  )
}

/**
 * Três pontinhos piscando em sequência (estilo Apple/Netflix).
 */
function DotsBounce() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-brand-500 rounded-full"
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

export function LoadingScreen({
  message = 'Carregando',
  size = 72,
  fullscreen = false,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullscreen
          ? 'fixed inset-0 z-[60] bg-white/80 dark:bg-surface-950/80 backdrop-blur-md'
          : 'min-h-[60vh] w-full'
      }`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-5"
      >
        <KiyvoLoaderLogo size={size} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
            <span className="text-sm font-medium">{message}</span>
            <DotsBounce />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * InlineLoader — loader pequeno para botões, cards, etc.
 */
export function InlineLoader({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </motion.svg>
  )
}

/**
 * ProgressBar — barra de progresso animada indeterminada (estilo Netflix/YouTube).
 */
export function ProgressBar({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-1 bg-surface-200 dark:bg-surface-800 overflow-hidden rounded-full ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
        initial={{ width: '0%', left: 0 }}
        animate={{ width: ['0%', '70%', '100%'], left: ['-5%', '0%', '0%'], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
