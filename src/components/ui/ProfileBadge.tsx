// ─────────────────────────────────────────────────────────────
// KIYVO — Emblema/Insígnia de perfil
//
// Mostra badges de equipe, comprador, vendedor e conquista.
// Usado em: perfis de vendedor, header quando logado, cards de produto,
// página de conta e avaliações.
//
// Design: pill gradiente com ícone, brilho sutil (sem cara de IA),
//         escala 1.05 no hover, tooltip nativo com descrição.
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { BadgeDef, getBadgeById } from '@/lib/badges'

interface ProfileBadgeProps {
  badgeId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProfileBadge({ badgeId, size = 'sm', showLabel = false, className = '' }: ProfileBadgeProps) {
  const def = getBadgeById(badgeId)
  if (!def) return null
  return <ProfileBadgeRender def={def} size={size} showLabel={showLabel} className={className} />
}

interface ProfileBadgeRenderProps {
  def: BadgeDef
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function ProfileBadgeRender({ def, size = 'sm', showLabel = false, className = '' }: ProfileBadgeRenderProps) {
  const sizeMap = {
    sm: { container: 'h-6 px-2 text-[10px] gap-1', icon: 12 },
    md: { container: 'h-7 px-2.5 text-[11px] gap-1.5', icon: 14 },
    lg: { container: 'h-9 px-3.5 text-xs gap-2', icon: 16 },
  }[size]

  const Icon = def.icon

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.97 }}
      title={`${def.name} — ${def.description}`}
      className={`inline-flex items-center font-black uppercase tracking-wider rounded-full
        bg-gradient-to-r ${def.colorFrom} ${def.colorTo} text-white
        shadow-sm ring-2 ring-white/60 dark:ring-white/10
        ${sizeMap.container} ${className}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
    >
      <Icon size={sizeMap.icon} strokeWidth={2.5} className="shrink-0" />
      {showLabel && <span>{def.name}</span>}
    </motion.span>
  )
}

/**
 * Lista de badges (primeiros N) usada em cards de produto/perfil.
 */
interface BadgeListProps {
  badgeIds?: string[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

export function BadgeList({ badgeIds = [], max = 4, size = 'sm', showLabels = false, className = '' }: BadgeListProps) {
  if (!badgeIds?.length) return null
  const visible = badgeIds.slice(0, max)
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visible.map((id) => (
        <ProfileBadge key={id} badgeId={id} size={size} showLabel={showLabels} />
      ))}
      {badgeIds.length > max && (
        <span className="inline-flex items-center h-6 px-2 text-[10px] font-black uppercase tracking-wider rounded-full bg-black/5 dark:bg-white/10 text-[#64748B] dark:text-white/60">
          +{badgeIds.length - max}
        </span>
      )}
    </div>
  )
}
