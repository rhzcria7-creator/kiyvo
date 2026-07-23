// ─────────────────────────────────────────────────────────────
// KiyvoLogoSvg — SVG puro (Server-Safe, sem 'use client').
// O ÍCONE "K" é SVG traçado (linhas, stroke) para render limpo.
// O WORDMARK "Kiyvo" é HTML <span> (NÃO SVG <text>), porque
// fontes dentro de <text> SVG carregam de forma inconsistente
// em browsers antigos e em SSR, causando espaçamento bugado.
// Comentários em PT-BR, variáveis em EN.
// ─────────────────────────────────────────────────────────────

import type { SVGProps } from 'react'

type KiyvoLogoVariant = 'icon' | 'wordmark' | 'full'
type KiyvoLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface KiyvoLogoSvgProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  variant?: KiyvoLogoVariant
  size?: KiyvoLogoSize | number
  textColor?: string
}

const SIZE_MAP: Record<KiyvoLogoSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
}

function resolveSize(size: KiyvoLogoSize | number): number {
  return typeof size === 'number' ? size : SIZE_MAP[size]
}

/**
 * KiyvoIconMarkSvg — o "K" no quadrado azul, feito com TRAÇOS (stroke),
// viewBox 0 0 40 40. Sempre limpo, sem artefatos.
 */
export function KiyvoIconMarkSvg({
  size = 32,
  className,
  ...rest
}: { size?: number; className?: string } & Omit<SVGProps<SVGSVGElement>, 'size'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kiyvo"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="kiyvo-ic-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="kiyvo-ic-sh" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="39" height="39" rx="9" fill="url(#kiyvo-ic-bg)" />
      <rect x="0.5" y="0.5" width="39" height="10" rx="9" fill="url(#kiyvo-ic-sh)" />
      <g stroke="#FFFFFF" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="9" x2="10" y2="31" />
        <line x1="28" y1="10" x2="10" y2="20" />
        <line x1="10" y1="20" x2="28" y2="30" />
      </g>
    </svg>
  )
}

/**
 * KiyvoWordmark — HTML puro com a fonte Plus Jakarta Sans aplicada via CSS.
 * Garante espaçamento PERFEITO sempre.
 */
export function KiyvoWordmark({
  height = 24,
  textColor = 'currentColor',
  className,
  style,
}: {
  height?: number | string
  textColor?: string
  className?: string
  style?: React.CSSProperties
}) {
  const h = typeof height === 'number' ? height : Number.parseFloat(String(height)) || 24
  // Aproximadamente 3.6x a altura para "Kiyvo" em ExtraBold com tracking -0.04em
  return (
    <span
      className={`inline-flex items-baseline font-display font-extrabold tracking-[-0.06em] select-none ${className ?? ''}`}
      style={{
        fontSize: h,
        lineHeight: 1,
        color: textColor,
        ...style,
      }}
      aria-label="Kiyvo"
    >
      <span style={{ color: textColor }}>Kiy</span>
      <span style={{ color: '#2563EB', marginLeft: '0.03em' }}>vo</span>
    </span>
  )
}

/**
 * KiyvoLogoSvg — full = ícone + wordmark (HTML).
 */
export function KiyvoLogoSvg({
  variant = 'full',
  size = 'md',
  textColor = 'currentColor',
  className,
  style,
  ...rest
}: KiyvoLogoSvgProps) {
  const s = resolveSize(size)

  if (variant === 'icon') {
    return <KiyvoIconMarkSvg size={s} className={className} {...rest} />
  }

  if (variant === 'wordmark') {
    return (
      <KiyvoWordmark
        height={Math.round(s * 0.58)}
        textColor={textColor}
        className={className}
        style={style}
      />
    )
  }

  // FULL: ícone (SVG) + wordmark (HTML), espaçamento GAP correto
  const iconSize = s
  const wmH = Math.round(s * 0.58)
  const gap = Math.max(8, Math.round(s * 0.2))

  return (
    <span
      className={`inline-flex items-center leading-none ${className ?? ''}`}
      style={{ gap: `${gap}px`, ...style }}
      aria-label="Kiyvo"
      {...(rest as Record<string, unknown>)}
    >
      <KiyvoIconMarkSvg size={iconSize} />
      <KiyvoWordmark height={wmH} textColor={textColor} />
    </span>
  )
}

export default KiyvoLogoSvg
