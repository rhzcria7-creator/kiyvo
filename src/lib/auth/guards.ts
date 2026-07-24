'use client'
// ─────────────────────────────────────────────────────────────
// Guards de autenticação e autorização para KIYVO
// - requireLogin:     redireciona pro /login se não estiver logado
// - requireKYC:       exige KYC verificado (vender, sacar)
// - requireVerified:  exige e-mail verificado (comprar)
// Anti-mock: SEMPRE redireciona ou bloqueia quando falhar.
// ─────────────────────────────────────────────────────────────
import { useAuth } from './context'
import { useKYC } from '../kyc/store'

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: 'not_logged_in'; redirect?: string }
  | { allowed: false; reason: 'kyc_required'; redirect?: string }
  | { allowed: false; reason: 'banned'; message?: string }
  | { allowed: false; reason: 'needs_age_verification' }

/**
 * Verifica se o usuário pode COMPRAR.
 * Regra nova: venda SOMENTE após login (não há mais compra como visitante/demo carrinho).
 */
export function canBuy(user: { id: string } | null): GuardResult {
  if (!user) {
    return { allowed: false, reason: 'not_logged_in', redirect: '/login?buy=1' }
  }
  return { allowed: true }
}

/**
 * Verifica se o usuário pode VENDER.
 * Exige: login + KYC verificado (CPF/CNPJ válido, documentos, nome da mãe, endereço).
 */
export function canSell(
  user: { id: string } | null,
  kycVerified: boolean,
): GuardResult {
  if (!user) {
    return { allowed: false, reason: 'not_logged_in', redirect: '/login?sell=1' }
  }
  if (!kycVerified) {
    return { allowed: false, reason: 'kyc_required', redirect: '/verificacao?sell=1' }
  }
  return { allowed: true }
}

/**
 * Hook para usar em componentes client-side
 */
export function useGuards() {
  const { user, profile } = useAuth()
  const kycVerified = useKYC((s) => s.isVerified())

  return {
    canBuy: () => canBuy(user),
    canSell: () => canSell(user, kycVerified),
    isLoggedIn: !!user,
    isKycVerified: kycVerified,
    isBanned: !!profile?.is_banned,
  }
}
