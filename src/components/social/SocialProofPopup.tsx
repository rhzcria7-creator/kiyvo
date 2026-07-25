'use client'

// ─────────────────────────────────────────────────────────────
// SocialProofPopup v0.0.1 — Popup de vendas recentes
// Aparece no canto inferior, animado, desaparece após 8s
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star, UserPlus, X, Download } from 'lucide-react'

interface SaleNotification {
  id: string
  type: 'sale' | 'review' | 'signup' | 'download'
  productName: string
  buyerName: string
  buyerCity?: string
  amount: number
  rating?: number
  timestamp: string
}

const ICONS = { sale: ShoppingBag, review: Star, signup: UserPlus, download: Download }
const COLORS = { sale: 'bg-emerald-500', review: 'bg-amber-500', signup: 'bg-blue-500', download: 'bg-purple-500' }

export default function SocialProofPopup() {
  const [notifications, setNotifications] = useState<SaleNotification[]>([])
  const [current, setCurrent] = useState<SaleNotification | null>(null)
  const [visible, setVisible] = useState(false)

  const addNotification = useCallback((n: SaleNotification) => {
    setNotifications(prev => [...prev, n])
  }, [])

  useEffect(() => {
    if (notifications.length === 0 || visible) return
    const next = notifications[0]
    setCurrent(next)
    setVisible(true)
    setNotifications(prev => prev.slice(1))
    const timer = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(timer)
  }, [notifications, visible])

  // Simular vendas a cada 30-60s
  useEffect(() => {
    const names = ['Ana Silva', 'Carlos Mendes', 'Julia Rocha', 'Pedro Alves', 'Maria Farias', 'Lucas Oliveira']
    const products = ['Curso Marketing Digital', 'Template Premium', 'E-book Guia Completo', 'Plugin WordPress', 'Curso Design']
    const cities = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Salvador, BA']

    const generate = () => {
      const type: SaleNotification['type'] = Math.random() > 0.7 ? 'review' : 'sale'
      addNotification({
        id: `notif_${Date.now()}`,
        type,
        productName: products[Math.floor(Math.random() * products.length)],
        buyerName: names[Math.floor(Math.random() * names.length)],
        buyerCity: cities[Math.floor(Math.random() * cities.length)],
        amount: [27, 47, 97, 197, 297][Math.floor(Math.random() * 5)],
        timestamp: new Date().toISOString(),
      })
    }

    const interval = setInterval(generate, 30000 + Math.random() * 30000)
    return () => clearInterval(interval)
  }, [addNotification])

  if (!current) return null

  const Icon = ICONS[current.type]
  const colorClass = COLORS[current.type]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-24 md:bottom-8 left-4 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {current.buyerName}
                  {current.buyerCity && <span className="text-zinc-400 font-normal"> de {current.buyerCity}</span>}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {current.type === 'sale' && `acabou de comprar ${current.productName}`}
                  {current.type === 'review' && `avaliou ${current.productName}`}
                  {current.type === 'signup' && 'acabou de se cadastrar'}
                </p>
                {current.type === 'sale' && (
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    R$ {current.amount.toFixed(2)}
                  </p>
                )}
              </div>
              <button onClick={() => setVisible(false)} className="p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
