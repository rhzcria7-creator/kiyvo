// ─────────────────────────────────────────────────────────────
// POST /api/checkout/pix
// Cria um PaymentIntent PIX com Stripe, retorna QR code + copia-e-cola
// O comprador NÃO sai do site — paga in-page.
// Segurança: rate limit, validação de input, anti-fraude, honeypot.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import QRCode from 'qrcode'

function admin() {
  const c = createAdminClient()
  if (!c) throw new Error('Admin client indisponível')
  return c
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit agressivo no PIX (favorece bot attacks)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, 6, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
    }

    // Honeypot anti-bot: se o campo "website" (hidden) vier preenchido, é bot
    const body = await req.json().catch(() => ({}))
    if (body.website) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    if (body.hp_timestamp) {
      const ts = Number(body.hp_timestamp)
      if (!Number.isFinite(ts) || Date.now() - ts < 2500) {
        // Preencheu o formulário em menos de 2.5s → provável bot
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { product_id, sku, coupon_code, use_kd_points } = body
    if (!product_id && !sku) return NextResponse.json({ error: 'Produto obrigatório' }, { status: 400 })

    const sb = admin()
    let price = 0
    let title = ''
    let vendorId = ''
    let productType: 'marketplace' | 'official' = 'marketplace'

    if (sku) {
      // Produto do catálogo oficial (dropshipping desfaçado)
      const { getOfficialProduct } = await import('@/lib/catalog/official')
      const p = getOfficialProduct(String(sku))
      if (!p) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      price = Math.round(p.priceBrl * 100) / 100
      title = `KIYVO Oficial — ${p.title}`
      productType = 'official'
      // vendor_id = "oficial" (placeholder — será null/flag)
      vendorId = 'oficial'
    } else {
      const { data: product } = await sb
        .from('products')
        .select('*, vendors!inner(id, user_id, store_name)')
        .eq('id', product_id)
        .eq('status', 'published')
        .single()
      if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      price = Number(product.base_price) || Number(product.price) || 0
      title = String(product.title)
      vendorId = String((product.vendors as Record<string, unknown>)?.id || product.seller_id)
    }

    // KD Points discount (máx 50%)
    let kdPointsUsed = 0
    if (use_kd_points) {
      const { data: profile } = await sb.from('profiles').select('kd_points').eq('id', user.id).single()
      const available = Number(profile?.kd_points) || 0
      const maxDiscount = price * 0.5
      const maxPoints = Math.floor(maxDiscount * 100) // 100 KD = R$1
      kdPointsUsed = Math.min(available, maxPoints)
      const discount = kdPointsUsed / 100
      price = Math.max(0.01, Math.round((price - discount) * 100) / 100)
    }

    // Cupom
    if (coupon_code) {
      const c = String(coupon_code).toUpperCase().trim()
      const { data: coupon } = await sb.from('coupons').select('*').eq('code', c).eq('is_active', true).maybeSingle()
      if (coupon) {
        const starts = (coupon as Record<string, unknown>).starts_at ?? (coupon as Record<string, unknown>).valid_from
        const expires = (coupon as Record<string, unknown>).expires_at ?? (coupon as Record<string, unknown>).valid_until
        const minOrder = Number((coupon as Record<string, unknown>).min_order_value ?? 0)
        const maxUses = Number((coupon as Record<string, unknown>).max_uses ?? 0)
        const usedCount = Number((coupon as Record<string, unknown>).used_count ?? 0)
        const okStarts = !starts || new Date(String(starts)) <= new Date()
        const okExpires = !expires || new Date(String(expires)) >= new Date()
        const okUses = !maxUses || usedCount < maxUses
        const okMin = price >= minOrder
        if (okStarts && okExpires && okUses && okMin) {
          if ((coupon as Record<string, unknown>).discount_type === 'percentage') price *= (1 - Number((coupon as Record<string, unknown>).discount_value) / 100)
          else price -= Number((coupon as Record<string, unknown>).discount_value)
          price = Math.max(0.01, Math.round(price * 100) / 100)
        }
      }
    }

    if (price < 1) return NextResponse.json({ error: 'Valor mínimo R$1,00' }, { status: 400 })

    const stripe = getStripeServer()
    if (!stripe) return NextResponse.json({ error: 'Pagamentos indisponíveis' }, { status: 503 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // PaymentIntent PIX
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'brl',
      payment_method_types: ['pix'],
      receipt_email: user.email || undefined,
      metadata: {
        product_id: product_id || '',
        sku: sku || '',
        buyer_id: user.id,
        vendor_id: vendorId,
        product_type: productType,
        kd_points_used: String(kdPointsUsed),
        title: sanitizeInput(title).slice(0, 100),
      },
    })

    // O Stripe retorna pix_qr_code no next_action após confirmar
    // Precisamos confirmar o PI para gerar o Qr Code
    const confirmed = await stripe.paymentIntents.confirm(pi.id, {
      payment_method_data: { type: 'pix' },
      return_url: `${siteUrl}/checkout/sucesso?payment_intent=${pi.id}`,
    })

    const pixInfo = confirmed.next_action?.pix_display_qr_code
    if (!pixInfo) {
      return NextResponse.json({ error: 'Falha ao gerar QR Code PIX' }, { status: 500 })
    }

    // Gerar QR code como dataURL PNG
    const qrDataUrl = await QRCode.toDataURL(pixInfo.data || '', {
      margin: 1,
      width: 280,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min

    // Criar pedido pendente
    const orderNumber = `KIY-${Date.now().toString(36).toUpperCase()}`
    await sb.from('orders').insert({
      order_number: orderNumber,
      buyer_id: user.id,
      seller_id: vendorId === 'oficial' ? null : vendorId,
      vendor_id: vendorId === 'oficial' ? null : vendorId,
      product_id: product_id || null,
      title: sanitizeInput(title).slice(0, 200),
      price: price,
      subtotal: price,
      fee: 0,
      seller_receives: Math.round(price * 0.9 * 100) / 100,
      status: 'pending_payment',
      payment_method: 'pix',
      payment_id: pi.id,
      pix_code: pixInfo.data || '',
      pix_qrcode_url: qrDataUrl,
      pix_expires_at: expiresAt,
      metadata: {
        sku: sku || null,
        product_type: productType,
        kd_points_used: kdPointsUsed,
      },
    })

    return NextResponse.json({
      ok: true,
      payment_intent: pi.id,
      order_number: orderNumber,
      amount: price,
      pix_qr_code: qrDataUrl,
      pix_copia_cola: pixInfo.data || '',
      expires_at: expiresAt,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar PIX'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
