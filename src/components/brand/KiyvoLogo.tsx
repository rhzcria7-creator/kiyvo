// ─────────────────────────────────────────────────────────────
// KIYVO LOGO v2 — Premium, geométrico, com brilho 3D
// - Ícone "K" com cantos arredondados, gradiente vibrante
// - Brilho superior (highlight), sombra interna, e detalhe de luz
// - Wordmark com peso black, "vo" em gradiente
// ─────────────────────────────────────────────────────────────

import type { SVGProps } from 'react'

type KiyvoLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: KiyvoLogoSize | number
  variant?: 'icon' | 'full' | 'wordmark'
  textColor?: string
  withPulse?: boolean
}

const SIZE_MAP: Record<KiyvoLogoSize, number> = { xs: 20, sm: 32, md: 44, lg: 60, xl: 90 }

function resolveSize(s: KiyvoLogoSize | number): number {
  return typeof s === 'number' ? s : SIZE_MAP[s]
}

/**
 * Ícone K premium — gradiente com highlight, sombra e K cortado geométrico.
 */
export function KiyvoIcon({ size = 44, className, withPulse }: { size?: number; className?: string; withPulse?: boolean }) {
  return (
    <span className={`relative inline-flex ${withPulse ? 'animate-pulse-glow' : ''} ${className || ''}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kiyvo">
        <defs>
          <linearGradient id="kiyvo-bg-v2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="45%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="kiyvo-hi" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kiyvo-sh" x1="0" y1="48" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <filter id="kiyvo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sombra sutil */}
        <rect x="2" y="4" width="44" height="44" rx="11" fill="url(#kiyvo-bg-v2)" filter="url(#kiyvo-glow)" />
        {/* Base arredondada */}
        <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="url(#kiyvo-bg-v2)" />
        {/* Shine superior */}
        <rect x="1.5" y="1.5" width="45" height="14" rx="11" fill="url(#kiyvo-hi)" />
        {/* Sombra inferior */}
        <rect x="1.5" y="25" width="45" height="21.5" rx="11" fill="url(#kiyvo-sh)" />

        {/* K geométrico branco com cortes */}
        <g fill="#fff">
          {/* Haste vertical */}
          <path d="M11.5 9.5 L15 9.5 C15.6 9.5 16 9.9 16 10.5 L16 37.5 C16 38.1 15.6 38.5 15 38.5 L11.5 38.5 C10.9 38.5 10.5 38.1 10.5 37.5 L10.5 10.5 C10.5 9.9 10.9 9.5 11.5 9.5 Z" />
          {/* Braço superior direito (corte diagonal) */}
          <path d="M16.5 10.5 L21 10.5 C21.5 10.5 21.9 10.8 22 11.3 C22.1 11.8 21.9 12.4 21.4 12.8 L16.2 21 L16.5 10.5 Z" />
          {/* Braço superior (diagonal até canto sup dir) */}
          <path d="M22 11.5 L37.2 11.5 C37.9 11.5 38.4 12.2 38.2 12.9 L37 17 C36.8 17.6 36.2 18 35.5 18 C35.2 18 34.8 17.9 34.5 17.6 L23.5 23.5 L17.5 15.5 Z" />
          {/* Braço inferior */}
          <path d="M17.5 25.5 L34.5 38 C34.9 38.3 35.4 38.4 35.9 38.2 C36.4 38 36.8 37.5 36.9 37 L38 32.5 C38.1 31.8 37.7 31.2 37 31 C36.4 30.8 35.6 31 22 23 L16.5 30 Z" />
        </g>

        {/* Brilho pequeno no topo esquerdo */}
        <circle cx="9" cy="8" r="2" fill="#fff" opacity="0.6" />
      </svg>
    </span>
  )
}

export function KiyvoWordmark({ height = 24, textColor = 'currentColor', className }: { height?: number | string; textColor?: string; className?: string }) {
  const h = typeof height === 'number' ? height : Number.parseFloat(String(height)) || 24
  return (
    <span className={`inline-flex items-baseline font-black tracking-[-0.05em] select-none ${className || ''}`} style={{ fontSize: h, lineHeight: 1, color: textColor }} aria-label="Kiyvo">
      <span>Kiy</span>
      <span className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent" style={{ marginLeft: '0.02em' }}>vo</span>
    </span>
  )
}

export function KiyvoLogo({ variant = 'full', size = 'md', textColor = 'currentColor', className, withPulse, ...rest }: LogoProps) {
  const s = resolveSize(size)
  if (variant === 'icon') return <KiyvoIcon size={s} className={className} withPulse={withPulse} />
  if (variant === 'wordmark') return <KiyvoWordmark height={Math.round(s * 0.6)} textColor={textColor} className={className} />
  const iconSize = s
  const wmH = Math.round(s * 0.6)
  const gap = Math.max(7, Math.round(s * 0.18))
  return (
    <span className={`inline-flex items-center leading-none ${className || ''}`} style={{ gap }} aria-label="Kiyvo" {...(rest as Record<string, unknown>)}>
      <KiyvoIcon size={iconSize} withPulse={withPulse} />
      <KiyvoWordmark height={wmH} textColor={textColor} />
    </span>
  )
}

export default KiyvoLogo
