'use client'

// ─────────────────────────────────────────────────────────────
// Toast Pro v0.0.1 — Toasts customizados com react-hot-toast
// Ícone + título + descrição + ação "Ver Carrinho"
// Evento customizado kiyvo:open-cart
// ─────────────────────────────────────────────────────────────

import React from 'react'
import toast, { Toast, ToastOptions } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, ShoppingCart, X, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProProps {
  t: Toast
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  type: ToastType
}

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  error: 'text-red-500 bg-red-50 dark:bg-red-500/10',
  warning: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
}

function ToastProContent({ t, icon: Icon, title, description, action, type }: ToastProProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg border ${
        t.visible ? 'pointer-events-auto' : 'pointer-events-none'
      } bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-w-sm`}
    >
      {/* Icon */}
      <div className={`p-1.5 rounded-full shrink-0 ${ICON_COLORS[type]}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        )}
        {action && (
          <button
            onClick={() => {
              action.onClick()
              toast.dismiss(t.id)
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5 text-zinc-400" />
      </button>
    </motion.div>
  )
}

/**
 * Mostra toast de sucesso
 */
export function showSuccessToast(title: string, description?: string, action?: { label: string; onClick: () => void }, options?: ToastOptions) {
  return toast.custom((t) => (
    <ToastProContent t={t} icon={CheckCircle} title={title} description={description} action={action} type="success" />
  ), { duration: 4000, ...options })
}

/**
 * Mostra toast de erro
 */
export function showErrorToast(title: string, description?: string, options?: ToastOptions) {
  return toast.custom((t) => (
    <ToastProContent t={t} icon={XCircle} title={title} description={description} type="error" />
  ), { duration: 6000, ...options })
}

/**
 * Mostra toast de aviso
 */
export function showWarningToast(title: string, description?: string, options?: ToastOptions) {
  return toast.custom((t) => (
    <ToastProContent t={t} icon={AlertTriangle} title={title} description={description} type="warning" />
  ), { duration: 5000, ...options })
}

/**
 * Mostra toast informativo
 */
export function showInfoToast(title: string, description?: string, options?: ToastOptions) {
  return toast.custom((t) => (
    <ToastProContent t={t} icon={Info} title={title} description={description} type="info" />
  ), { duration: 4000, ...options })
}

/**
 * Toast de carrinho (pré-configurado com ação Ver Carrinho)
 */
export function showCartToast(productName: string, options?: ToastOptions) {
  return showSuccessToast(
    'Adicionado ao carrinho!',
    productName,
    {
      label: 'Ver Carrinho',
      onClick: () => window.dispatchEvent(new CustomEvent('kiyvo:open-cart')),
    },
    options
  )
}

/**
 * Hook para listener do evento kiyvo:open-cart
 */
export function useCartToast() {
  React.useEffect(() => {
    const handler = () => {
      // Open mini cart logic - dispatches to parent
      window.dispatchEvent(new CustomEvent('kiyvo:open-cart-ui'))
    }
    window.addEventListener('kiyvo:open-cart', handler)
    return () => window.removeEventListener('kiyvo:open-cart', handler)
  }, [])
}
