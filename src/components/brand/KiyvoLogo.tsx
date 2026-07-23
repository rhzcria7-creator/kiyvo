'use client'
// ─────────────────────────────────────────────────────────────
// KiyvoLogo — Wrapper client com Framer Motion
// Usa KiyvoLogoSvg (que é SVG+HTML, server-safe) internamente.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { KiyvoLogoSvg } from './KiyvoLogoSvg'

type KiyvoLogoVariant = 'icon' | 'wordmark' | 'full'
type KiyvoLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface KiyvoLogoProps {
  variant?: KiyvoLogoVariant
  size?: KiyvoLogoSize | number
  textColor?: string
  animated?: boolean
  className?: string
  style?: React.CSSProperties
  id?: string
  onClick?: () => void
}

export function KiyvoLogo({
  variant = 'full',
  size = 'md',
  textColor,
  animated = false,
  className,
  style,
  id,
  onClick,
}: KiyvoLogoProps) {
  const logo = (
    <KiyvoLogoSvg
      variant={variant}
      size={size}
      textColor={textColor}
      className={className}
      style={style}
      id={id}
      onClick={onClick}
    />
  )

  if (!animated) return logo

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      {logo}
    </motion.span>
  )
}

export default KiyvoLogo
