export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────
// POST /api/checkout/local
// Checkout LOCAL (sem Stripe) para demonstração imediata.
// Funciona com LocalDB: cria ordem, entrega automaticamente,
// debita KD Points se houver, credita cashback de KD e comissões.
//
// Body: { product_id, sku, use_kd_points?: boolean }
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getDb, findSession, findUserById, simpleId, persist } from '@/lib/localdb'
import { isSupabaseConfigured } from '@/lib/backend/detect'
import { getBuyerBadgeDiscount } from '@/lib/badges'
import { AFFILIATE } from '@/lib/affiliates/constants'

const KD_POINTS_TO_BRL = 100 // 100 KD = R$1
const MAX_KD_DISCOUNT_PCT = 0.5 // 50% máximo
const CASHBACK_PCT = 0.15 // 15% de cashback em KD Points para plano grátis

export async function POST(request: NextRequest) {
  // Apenas modo local
  if (isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Use Stripe checkout em produção' }, { status: 400 })
  }

  try {
    const token = request.cookies.get('kiyvo_session')?.value
    if (!token) return NextResponse.json({ error: 'Login obrigatório' }, { status: 401 })

    const { findSession: findSessionFn } = await import('@/lib/localdb')
    const session = findSessionFn(token)
    if (!session) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

    const buyer = findUserById(session.user_id)
    if (!buyer) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    if (buyer.is_banned) return NextResponse.json({ error: 'Conta suspensa' }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const productId = typeof body.product_id === 'string' ? body.product_id : null
    const sku = typeof body.sku === 'string' ? body.sku : null
    const useKdPoints = body.use_kd_points !== false
    const couponCode = typeof body.coupon_code === 'string' ? body.coupon_code.toUpperCase() : null

    const db = getDb()

    // Encontrar produto
    let product = null
    if (productId) product = db.products.find((p) => p.id === productId)
    if (!product && sku) product = db.products.find((p) => p.asset_data?.includes(sku.toUpperCase()))
    if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    if (product.stock <= 0 && !product.is_official) return NextResponse.json({ error: 'Produto sem estoque' }, { status: 400 })

    // ── Cálculo de preço ──────────────────────────────
    let subtotal = product.price
    let couponDiscountPct = 0
    let couponDiscountAmt = 0
    let badgeDiscountPct = getBuyerBadgeDiscount(buyer.badges)
    let kdUsed = 0
    let kdDiscountAmt = 0

    // Cupom (apenas primeira compra e cupons gerais)
    if (couponCode) {
      const coupon = db.coupons.find((c) => c.code === couponCode && c.is_active)
      if (coupon) {
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
        const isMaxed = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses
        const isMinOk = !coupon.min_order_value || subtotal >= coupon.min_order_value
        if (!isExpired && !isMaxed && isMinOk) {
          if (coupon.discount_type === 'percentage') couponDiscountPct = coupon.discount_value
          else couponDiscountAmt = coupon.discount_value
          coupon.used_count += 1
        }
      }
      // Cupom de indicação (se o usuário foi indicado, aplica 5% na primeira compra)
      if (buyer.referred_by && buyer.total_purchases === 0 && couponCode === buyer.referred_by) {
        couponDiscountPct = Math.max(couponDiscountPct, AFFILIATE.refereeFirstBuyDiscountPct)
      }
    } else if (buyer.referred_by && buyer.total_purchases === 0) {
      // Aplica automaticamente o desconto de indicação na primeira compra
      couponDiscountPct = AFFILIATE.refereeFirstBuyDiscountPct
    }

    // Desconto máximo combinado = 50%
    let totalDiscountPct = Math.min(couponDiscountPct + badgeDiscountPct, MAX_KD_DISCOUNT_PCT * 100)
    let priceAfterPct = subtotal * (1 - totalDiscountPct / 100) - couponDiscountAmt

    // KD Points (máx 50%)
    if (useKdPoints && buyer.kd_points > 0) {
      const maxKdDiscount = priceAfterPct * MAX_KD_DISCOUNT_PCT
      const kdAvailableBRL = buyer.kd_points / KD_POINTS_TO_BRL
      kdDiscountAmt = Math.min(kdAvailableBRL, maxKdDiscount)
      kdUsed = Math.round(kdDiscountAmt * KD_POINTS_TO_BRL)
    }

    const total = Math.max(0, priceAfterPct - kdDiscountAmt)
    const platformFee = Math.round(total * 0.1 * 100) / 100 // 10% taxa plataforma
    const vendorNet = product.is_official ? total : Math.round((total - platformFee) * 100) / 100

    // ── Criar ordem ───────────────────────────────────
    const orderNumber = `KIY-${Date.now().toString(36).toUpperCase()}`
    const orderId = simpleId()
    const now = new Date().toISOString()

    const delivered = product.delivery_type === 'auto' && !!product.asset_data

    const order = {
      id: orderId,
      order_number: orderNumber,
      buyer_id: buyer.id,
      seller_id: product.is_official ? null : product.seller_id,
      product_id: product.id,
      sku: product.asset_data?.slice(0, 12) || null,
      title: product.title,
      price: product.price,
      subtotal,
      discount_pct: totalDiscountPct,
      discount_amount: Math.round((subtotal - total) * 100) / 100,
      badge_discount_pct: badgeDiscountPct,
      platform_fee: platformFee,
      affiliate_code: buyer.referred_by,
      status: delivered ? 'delivered' as const : 'paid' as const,
      payment_method: 'pix' as const,
      payment_id: 'local-' + simpleId().slice(0, 8),
      asset: delivered ? { type: 'key', data: product.asset_data! } : null,
      paid_at: now,
      delivered_at: delivered ? now : null,
      created_at: now,
    }
    db.orders.push(order)

    // ── Atualizar stats do comprador ─────────────────
    buyer.total_purchases += 1
    buyer.total_spent = Math.round((buyer.total_spent + total) * 100) / 100
    buyer.kd_points -= kdUsed
    // Cashback em KD Points (15%)
    const cashbackKD = Math.round(total * (CASHBACK_PCT * KD_POINTS_TO_BRL))
    buyer.kd_points += cashbackKD

    // Bônus de indicação: creditar 8% ao afiliador e R$5 (500KD) na primeira compra
    if (buyer.referred_by) {
      const referrer = db.users.find((u) => u.referral_code === buyer.referred_by)
      if (referrer) {
        const aff = db.affiliates.find((a) => a.user_id === referrer.id)
        if (aff) {
          const commission = Math.round(total * (AFFILIATE.referrerCommissionPct / 100) * 100) / 100
          aff.pending_earnings = Math.round((aff.pending_earnings + commission) * 100) / 100
          aff.total_conversions += 1
          // Primeira compra do indicado ≥ R$20 → bônus R$5
          if (buyer.total_purchases === 1 && total >= AFFILIATE.minFirstBuyBRL) {
            referrer.kd_points += AFFILIATE.referrerFirstBuyBonusKD
          }
          // Comissão em KD Points para o afiliador
          referrer.kd_points += Math.round(commission * KD_POINTS_TO_BRL)
          db.affiliateConversions.push({
            id: simpleId(),
            affiliate_id: aff.id,
            referred_user_id: buyer.id,
            order_id: orderId,
            type: 'first_purchase',
            status: 'approved',
            commission_amount: commission,
            commission_pct: AFFILIATE.referrerCommissionPct,
            order_amount: total,
            created_at: now,
          })
        }
      }
    }

    // Atualizar produto
    if (!product.is_official) product.stock = Math.max(0, product.stock - 1)
    product.sales += 1
    if (!product.is_official) {
      const seller = db.users.find((u) => u.id === product.seller_id)
      if (seller) seller.total_sales += 1
    }

    // Auto-conceder badges por atividade
    const { computeBadges } = await import('@/lib/badges/teamAssignment')
    const newBadges = computeBadges({
      email: buyer.email,
      totalPurchases: buyer.total_purchases,
      totalSpent: buyer.total_spent,
      kycApproved: buyer.verification_status === 'verified',
      phoneVerified: buyer.phone_verified,
      emailVerified: true,
      referralCount: db.affiliateConversions.filter((c) => c.affiliate_id && db.affiliates.find(a => a.id === c.affiliate_id)?.user_id === buyer.id).length,
      createdAt: buyer.created_at,
      sellerPlan: buyer.seller_plan,
    }, buyer.badges)
    buyer.badges = newBadges

    persist()

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      order_number: orderNumber,
      total,
      kd_used: kdUsed,
      kd_earned: cashbackKD,
      delivered,
      asset: order.asset,
      payment_method: 'demo',
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro no checkout' }, { status: 500 })
  }
}
