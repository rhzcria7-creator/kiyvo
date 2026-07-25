'use client'

// ─────────────────────────────────────────────────────────────
// Empty State v0.0.1 — Estado vazio ilustrado com SVG animado
// Título + descrição + CTA, nunca só texto
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ShoppingBag, PackageSearch, Heart, Bell, Inbox, FileSearch, SearchX, AlertCircle, LucideIcon } from 'lucide-react'

export type EmptyStateType =
  | 'cart'
  | 'orders'
  | 'favorites'
  | 'notifications'
  | 'inbox'
  | 'reviews'
  | 'search'
  | 'library'
  | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  icon?: LucideIcon
  className?: string
}

const DEFAULT_CONFIG: Record<EmptyStateType, {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}> = {
  cart: {
    icon: ShoppingBag,
    title: 'Carrinho vazio',
    description: 'Seu carrinho está esperando por produtos incríveis. Explore o marketplace!',
    action: { label: 'Explorar Produtos', href: '/' },
  },
  orders: {
    icon: PackageSearch,
    title: 'Nenhum pedido ainda',
    description: 'Você ainda não fez nenhuma compra. Comece explorando o marketplace.',
    action: { label: 'Ver Produtos', href: '/' },
  },
  favorites: {
    icon: Heart,
    title: 'Nenhum favorito',
    description: 'Salve seus produtos favoritos para encontrar rápido depois.',
    action: { label: 'Descobrir Produtos', href: '/' },
  },
  notifications: {
    icon: Bell,
    title: 'Tudo silencioso',
    description: 'Você não tem notificações no momento. Elas aparecerão aqui.',
  },
  inbox: {
    icon: Inbox,
    title: 'Caixa de entrada vazia',
    description: 'Nenhuma mensagem ainda. Inicie uma conversa com um vendedor.',
    action: { label: 'Ver Produtos', href: '/' },
  },
  reviews: {
    icon: FileSearch,
    title: 'Nenhuma avaliação',
    description: 'Você ainda não avaliou nenhum produto. Sua opinião ajuda outros compradores!',
    action: { label: 'Avaliar Produtos', href: '/account/orders' },
  },
  search: {
    icon: SearchX,
    title: 'Nada encontrado',
    description: 'Tente ajustar sua busca ou usar termos diferentes.',
    action: { label: 'Limpar Filtros', href: '/' },
  },
  library: {
    icon: PackageSearch,
    title: 'Biblioteca vazia',
    description: 'Seus produtos comprados aparecerão aqui.',
    action: { label: 'Explorar Marketplace', href: '/' },
  },
  generic: {
    icon: AlertCircle,
    title: 'Nada aqui ainda',
    description: 'Esta seção está vazia no momento.',
  },
}

export default function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  icon: CustomIcon,
  className,
}: EmptyStateProps) {
  const config = DEFAULT_CONFIG[type]
  const Icon = CustomIcon || config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22 }}
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6',
        'rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700',
        'bg-zinc-50/50 dark:bg-zinc-900/30',
        className
      )}
    >
      {/* Animated SVG Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
          </div>
          {/* Animated ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-300 dark:border-t-zinc-600"
          />
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title || config.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6">
        {description || config.description}
      </p>

      {/* CTA */}
      {(action || config.action) && (
        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href={action?.href || config.action?.href || '#'}
          onClick={action?.onClick}
          className={clsx(
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-full',
            'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
            'text-sm font-medium hover:opacity-90 transition-opacity',
            'shadow-sm'
          )}
        >
          {action?.label || config.action?.label}
          <span aria-hidden="true" className="ml-1">→</span>
        </motion.a>
      )}
    </motion.div>
  )
}
