'use client'
// ─────────────────────────────────────────────────────────────
// Hook useProtectedAction
// Exige LOGIN para ações sensíveis (comprar, adicionar ao carrinho, favoritar, vender).
// Se o usuário não estiver logado: mostra o DemoWarningModal com forced redirection.
// Compra/venda SEM login: BLOQUEADO (anti-mock).
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context'
import { useKYC } from '../kyc/store'
import { DemoWarningModal } from '@/components/ui/DemoWarningModal'
import { toast } from 'react-hot-toast'

type Action = 'buy' | 'cart' | 'favorite' | 'sell' | 'checkout'

interface Options {
  requireKYC?: boolean
  onSuccess: () => void
  redirectTo?: string
}

export function useProtectedAction() {
  const { user } = useAuth()
  const kycVerified = useKYC(s => s.isVerified())
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [modalContext, setModalContext] = useState<'checkout' | 'cart' | 'favorite' | 'sell' | 'default'>('default')

  const guard = useCallback((action: Action, opts: Options) => {
    // Vender SEMPRE exige login + KYC
    if (action === 'sell') {
      if (!user) {
        toast.error('Faça login para vender', { id: 'sell-login' })
        setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(opts.redirectTo || '/verificacao')}`), 800)
        return
      }
      if (opts.requireKYC !== false && !kycVerified) {
        toast.error('Complete a verificação KYC para vender', { id: 'sell-kyc' })
        setTimeout(() => router.push(`/verificacao?next=${encodeURIComponent(opts.redirectTo || '/vender')}`), 900)
        return
      }
      opts.onSuccess()
      return
    }

    // Comprar/carrinho/favoritos/checkout: EXIGE LOGIN (sem demo!)
    if (action === 'buy' || action === 'cart' || action === 'checkout') {
      if (!user) {
        toast.error('🔒 Entre na sua conta para comprar (sem modo demo)', { id: 'buy-login', duration: 3500 })
        setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(opts.redirectTo || window.location.pathname)}`), 1000)
        return
      }
      opts.onSuccess()
      return
    }

    // Favoritos: mostra modal demo (favoritos são menos sensíveis, mas ainda recomendamos login)
    if (action === 'favorite') {
      if (!user) {
        setModalContext('favorite')
        setPendingAction(() => () => {
          opts.onSuccess()
          setModalOpen(false)
        })
        setModalOpen(true)
        return
      }
      opts.onSuccess()
      return
    }

    opts.onSuccess()
  }, [user, kycVerified, router])

  const handleContinue = useCallback(() => {
    pendingAction?.()
    setPendingAction(null)
  }, [pendingAction])

  const handleClose = useCallback(() => {
    setModalOpen(false)
    setPendingAction(null)
  }, [])

  const Modal = (
    <DemoWarningModal
      open={modalOpen}
      onClose={handleClose}
      onContinue={handleContinue}
      context={modalContext}
    />
  )

  return { guard, Modal }
}
