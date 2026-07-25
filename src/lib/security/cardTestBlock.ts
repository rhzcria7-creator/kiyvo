// ─────────────────────────────────────────────────────────────
// Card Test Block v0.0.1 — Prevenção de cartões de teste em produção
// Stripe test cards + Luhn validation + BIN blacklist
// ─────────────────────────────────────────────────────────────

import { validateCreditCardLuhn, isTestCard } from './cpfPhoneValidator'

export interface CardValidationResult {
  valid: boolean
  brand?: string
  reason?: string
  isTestCard: boolean
  luhnValid: boolean
  formatted?: string
}

// BINs de cartões de teste conhecidos
const TEST_BINS: ReadonlySet<string> = new Set([
  '424242', '400005', '555555', '222300', '520082',
  '510510', '378282', '371449', '601111', '601100',
  '305693', '385200', '356600', '620000', '400000',
  '000000',
])

// BINs de cartões virtuais temporários (usados para fraude)
const HIGH_RISK_BINS: ReadonlySet<string> = new Set([
  '489537', '529471', '553131', '516194', '420767',
])

/**
 * Valida cartão de crédito completo com múltiplas camadas
 */
export function validateCardForPayment(
  cardNumber: string,
  cvc?: string,
  envMode: 'test' | 'production' = 'production'
): CardValidationResult {
  const digits = cardNumber.replace(/\D/g, '')

  // 1. Validar Luhn
  const luhnResult = validateCreditCardLuhn(digits)
  if (!luhnResult.valid) {
    return {
      valid: false,
      isTestCard: false,
      luhnValid: false,
      reason: 'Número de cartão inválido (falha no algoritmo Luhn)',
    }
  }

  // 2. Verificar cartão de teste
  if (isTestCard(digits)) {
    if (envMode === 'production') {
      return {
        valid: false,
        brand: luhnResult.brand,
        isTestCard: true,
        luhnValid: true,
        reason: 'Cartão de teste não é aceito em produção',
      }
    }
    // Em modo test, permitir
    return {
      valid: true,
      brand: luhnResult.brand,
      isTestCard: true,
      luhnValid: true,
      formatted: luhnResult.formatted,
    }
  }

  // 3. Verificar BIN de teste
  const bin = digits.slice(0, 6)
  if (TEST_BINS.has(bin) && envMode === 'production') {
    return {
      valid: false,
      brand: luhnResult.brand,
      isTestCard: true,
      luhnValid: true,
      reason: 'BIN de cartão de teste rejeitado',
    }
  }

  // 4. Verificar BIN de alto risco
  if (HIGH_RISK_BINS.has(bin)) {
    return {
      valid: false,
      brand: luhnResult.brand,
      isTestCard: false,
      luhnValid: true,
      reason: 'Cartão de BIN de risco elevado requer verificação adicional',
    }
  }

  // 5. Validar CVC
  if (cvc && !validateCVC(cvc, luhnResult.brand)) {
    return {
      valid: false,
      brand: luhnResult.brand,
      isTestCard: false,
      luhnValid: true,
      reason: 'CVC inválido',
    }
  }

  return {
    valid: true,
    brand: luhnResult.brand,
    isTestCard: false,
    luhnValid: true,
    formatted: luhnResult.formatted,
  }
}

/**
 * Valida CVC/CVV conforme bandeira
 */
function validateCVC(cvc: string, brand?: string): boolean {
  const digits = cvc.replace(/\D/g, '')
  if (!digits) return true // CVC opcional para alguns casos

  if (brand === 'Amex') {
    return digits.length === 4
  }

  return digits.length >= 3 && digits.length <= 4
}

/**
 * Mascara número do cartão para exibição (mostra só últimos 4)
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 4) return cardNumber
  return `•••• •••• •••• ${digits.slice(-4)}`
}
