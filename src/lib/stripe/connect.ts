// ─────────────────────────────────────────────────────────────
// Stripe Connect — Motor de Pagamentos com Escrow & Split
// Fonte da verdade financeira = Stripe (não o banco local)
// Wallets no DB são apenas CACHE VISUAL
// ─────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { getStripeServer } from './server'

// ─── TYPES ────────────────────────────────────────────────────

export interface CheckoutParams {
  productId: string
  productTitle: string
  productSlug: string
  unitPrice: number
  currency: string
  quantity: number
  vendorStripeAccountId: string
  vendorId: string
  buyerId: string
  buyerEmail: string
  affiliateCode?: string
  couponCode?: string
  domain: string
}

export interface CheckoutResult {
  sessionId: string
  url: string | null
}

export interface PaymentSplit {
  platformFee: number      // % da plataforma
  vendorNet: number        // Valor líquido do vendor
  affiliateFee: number     // Comissão do afiliado
  stripeFee: number        // Taxa do Stripe (estimada)
  total: number            // Valor total
}

// ─── STRIPE CONNECT: ONBOARDING ───────────────────────────────

/**
 * Cria uma Stripe Connect Account para o vendor
 * Usa Stripe Connect Express (simplificado, o Stripe cuida do KYC)
 */
export async function createConnectAccount(params: {
  email: string
  country?: string
}): Promise<Stripe.Account | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const account = await stripe.accounts.create({
    type: 'express',
    country: params.country || 'BR',
    email: params.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      platform: 'kiyvo',
    },
  })

  return account
}

/**
 * Gera o link de onboarding para o vendor completar o cadastro no Stripe
 * Após completar, stripe_onboarding_complete = true
 */
export async function createOnboardingLink(params: {
  accountId: string
  refreshUrl: string
  returnUrl: string
}): Promise<string | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const link = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  })

  return link.url
}

/**
 * Gera o link para o vendor acessar o dashboard do Stripe Connect
 */
export async function createDashboardLink(params: {
  accountId: string
}): Promise<string | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const link = await stripe.accounts.createLoginLink(params.accountId)
  return link.url
}

// ─── CHECKOUT COM ESCROW (HOLD FUNDS) ─────────────────────────

/**
 * Calcula o split de pagamento
 * O dinheiro fica em CUSTÓDIA na Stripe até o comprador confirmar
 */
export function calculatePaymentSplit(params: {
  amount: number
  vendorCommissionRate: number  // ex: 10 = 10%
  affiliateRate?: number        // ex: 5 = 5%
}): PaymentSplit {
  const { amount, vendorCommissionRate, affiliateRate = 0 } = params

  // Taxa do Stripe (estimada — varia por método)
  // Cartão BR: ~4.99% + R$0.50 | PIX: ~0.99%
  const stripeFeePercent = 0.0399  // Média
  const stripeFeeFixed = 0.50
  const stripeFee = Math.round((amount * stripeFeePercent + stripeFeeFixed) * 100) / 100

  // Comissão do afiliado (deduzida do que o vendor recebe)
  const affiliateFee = Math.round(amount * (affiliateRate / 100) * 100) / 100

  // Comissão da plataforma (deduzida do vendor)
  const platformFee = Math.round(amount * (vendorCommissionRate / 100) * 100) / 100

  // Valor líquido do vendor = total - plataforma - afiliado
  const vendorNet = Math.round((amount - platformFee - affiliateFee) * 100) / 100

  return {
    platformFee,
    vendorNet: Math.max(0, vendorNet),
    affiliateFee,
    stripeFee,
    total: amount,
  }
}

/**
 * Cria uma Checkout Session com Stripe Connect + Escrow
 * 
 * MECANISMO DE ESCROW:
 * - O pagamento vai para a CONTA DA PLATAFORMA
 * - O transfer_data mantém o % do vendor em HOLD
 * - Após confirmação do comprador, transferimos para o vendor
 * - Se disputa, o dinheiro fica retido
 */
export async function createEscrowCheckout(params: CheckoutParams): Promise<CheckoutResult | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const split = calculatePaymentSplit({
    amount: params.unitPrice * params.quantity,
    vendorCommissionRate: 10, // Default 10% — virá do vendor.commission_rate em produção
    affiliateRate: params.affiliateCode ? 5 : 0,
  })

  // Valor em centavos (Stripe trabalha em centavos)
  const amountInCents = Math.round(params.unitPrice * params.quantity * 100)
  const platformFeeInCents = Math.round(split.platformFee * 100)

  const siteUrl = params.domain || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: params.buyerEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency?.toLowerCase() || 'brl',
          product_data: {
            name: params.productTitle,
            metadata: {
              product_id: params.productId,
              vendor_id: params.vendorId,
            },
          },
          unit_amount: Math.round(params.unitPrice * 100),
        },
        quantity: params.quantity,
      },
    ],
    // ─── ESCROW via transfer_data ───
    // O pagamento entra na plataforma, mas a parte do vendor
    // fica marcada para transferência futura (após confirmação)
    payment_intent_data: {
      transfer_group: `ORDER_${params.productId}_${Date.now()}`,
      //transfer_data: {
      //  destination: params.vendorStripeAccountId,
      //  amount: amountInCents - platformFeeInCents, // Vendor recebe líquido
      //},
      // NOTA: NÃO fazemos transfer_data automático.
      // O dinheiro fica em HOLD na conta da plataforma.
      // Após o buyer confirmar, chamamos transferToVendor().
      metadata: {
        vendor_id: params.vendorId,
        buyer_id: params.buyerId,
        product_id: params.productId,
        platform_fee_cents: platformFeeInCents.toString(),
        affiliate_fee_cents: Math.round(split.affiliateFee * 100).toString(),
        vendor_net_cents: Math.round(split.vendorNet * 100).toString(),
        escrow: 'true', // Flag para identificar que está em custódia
      },
    },
    metadata: {
      product_id: params.productId,
      vendor_id: params.vendorId,
      buyer_id: params.buyerId,
      product_slug: params.productSlug,
      affiliate_code: params.affiliateCode || '',
      coupon_code: params.couponCode || '',
    },
    success_url: `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancelado`,
  })

  return {
    sessionId: session.id,
    url: session.url,
  }
}

// ─── LIBERAR FUNDO (TRANSFER TO VENDOR) ───────────────────────

/**
 * Após o comprador confirmar recebimento, transfere o dinheiro
 * do Escrow para a conta Connect do vendor
 * 
 * Este é o coração do sistema de CUSTÓDIA:
 * - Dinheiro ficou retido na conta da plataforma
 * - Agora transferimos a parte do vendor
 */
export async function transferToVendor(params: {
  paymentIntentId: string
  vendorStripeAccountId: string
  vendorNetAmount: number  // Em reais
  transferGroup: string
}): Promise<Stripe.Transfer | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const transfer = await stripe.transfers.create({
    amount: Math.round(params.vendorNetAmount * 100), // Centavos
    currency: 'brl',
    destination: params.vendorStripeAccountId,
    transfer_group: params.transferGroup,
    metadata: {
      payment_intent_id: params.paymentIntentId,
      type: 'vendor_payout',
      escrow_release: 'true',
    },
  })

  return transfer
}

// ─── REEMBOLSO (SE DISPUTA/PROBLEMA) ──────────────────────────

/**
 * Reembolsa o comprador e reverte o transfer (se já feito)
 * Em caso de Escrow ainda não transferido, apenas refunda
 */
export async function refundAndReverse(params: {
  paymentIntentId: string
  amount: number  // Em reais, null = total
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
}): Promise<Stripe.Refund | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount ? Math.round(params.amount * 100) : undefined,
    reason: params.reason || 'requested_by_customer',
    metadata: {
      platform: 'kiyvo',
      auto_refund: 'true',
    },
  })

  return refund
}

// ─── VERIFICAR STATUS DO ONBOARDING ───────────────────────────

/**
 * Verifica se a conta Connect do vendor está completa
 */
export async function checkOnboardingStatus(accountId: string): Promise<{
  isComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}> {
  const stripe = getStripeServer()
  if (!stripe) {
    return { isComplete: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false }
  }

  const account = await stripe.accounts.retrieve(accountId)

  return {
    isComplete: account.details_submitted && account.charges_enabled,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  }
}

// ─── WEBHOOK VERIFICATION ─────────────────────────────────────

/**
 * Verifica a assinatura do webhook do Stripe
 * CRÍTICO para segurança — nunca processe webhooks sem verificar
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  const stripe = getStripeServer()
  if (!stripe) return null

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return event
  } catch {
    return null
  }
}
