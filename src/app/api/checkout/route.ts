import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { getOfficialProduct } from '@/lib/catalog/official'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

// ═══════════════════════════════════════════════════════════════
// POST /api/checkout
// Cria Stripe Checkout Session com ESCROW.
// Aceita:
//   - product_id (marketplace)
//   - sku (catálogo oficial KIYVO)
//   - payment_method: 'card' | 'boleto'
//   - coupon_code, use_kd_points, installments
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const { allowed } = rateLimit(ip, 8, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 })
    }

    // Honeypot anti-bot
    const body = await request.json().catch(() => ({}))
    if (body.website) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    if (body.hp_timestamp) {
      const ts = Number(body.hp_timestamp)
      if (!Number.isFinite(ts) || Date.now() - ts < 1500) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
    }

    const { product_id, sku, coupon_code, use_kd_points, payment_method, success_url, cancel_url } = body

    let price = 0
    let title = ''
    let vendorId: string | null = null
    let vendorStripeAccount: string | null = null
    let isOfficial = false
    let finalProductId: string | null = product_id || null
    let commissionRate = 10

    // ── Produto oficial ──
    if (sku) {
      const p = getOfficialProduct(String(sku))
      if (!p) return NextResponse.json({ error: 'Produto oficial não encontrado' }, { status: 404 })
      price = p.priceBrl
      title = `KIYVO Oficial — ${p.title}`
      isOfficial = true
      vendorId = null
      finalProductId = null
      commissionRate = 0 // 100% para plataforma
    } else if (product_id) {
      // ── Produto marketplace ──
      const productResult = await admin
        .from('products')
        .select('*, vendors!inner(id, user_id, store_name, stripe_account_id, commission_rate)')
        .eq('id', product_id)
        .eq('status', 'published')
        .single()

      if (productResult.error || !productResult.data) {
        return NextResponse.json({ error: 'Produto não encontrado ou indisponível' }, { status: 404 })
      }

      const product = productResult.data as Record<string, unknown>
      const vendorData = (product.vendors || {}) as Record<string, unknown>
      title = sanitizeInput(String(product.title))
      price = Number(product.base_price || product.price)
      vendorId = String(vendorData.id)
      vendorStripeAccount = vendorData.stripe_account_id as string | null
      commissionRate = Number(vendorData.commission_rate) || 10

      // Verificar estoque
      const { count: stock } = await admin
        .from('digital_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product_id)
        .eq('status', 'available')

      if (!stock || stock === 0) {
        return NextResponse.json({ error: 'Produto esgotado no momento' }, { status: 409 })
      }
    } else {
      return NextResponse.json({ error: 'Produto ou SKU obrigatório' }, { status: 400 })
    }

    if (price <= 0 || price > 50000) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })

    // ── KD Points discount (100 KD = R$1, máx 50%) ──
    let kdPointsUsed = 0
    if (use_kd_points) {
      const { data: profile } = await admin.from('profiles').select('kd_points').eq('id', user.id).single()
      const available = Number(profile?.kd_points) || 0
      const maxDiscount = price * 0.5
      const maxPoints = Math.floor(maxDiscount * 100)
      kdPointsUsed = Math.min(available, maxPoints)
      const discount = kdPointsUsed / 100
      price = Math.max(0.01, Math.round((price - discount) * 100) / 100)
    }

    // ── Cupom ──
    if (coupon_code) {
      const { data: couponRaw } = await admin
        .from('coupons')
        .select('*')
        .eq('code', String(coupon_code).toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle()
      const coupon = couponRaw as Record<string, unknown> | null
      if (coupon) {
        const starts = coupon.starts_at ?? coupon.valid_from
        const expires = coupon.expires_at ?? coupon.valid_until
        const minOrder = Number(coupon.min_order_value ?? 0)
        const maxUses = Number(coupon.max_uses ?? 0)
        const usedCount = Number(coupon.used_count ?? 0)
        const okStarts = !starts || new Date(String(starts)) <= new Date()
        const okExpires = !expires || new Date(String(expires)) >= new Date()
        const okUses = !maxUses || usedCount < maxUses
        const okMin = price >= minOrder
        if (okStarts && okExpires && okUses && okMin) {
          if (coupon.discount_type === 'percentage') price *= (1 - Number(coupon.discount_value) / 100)
          else price -= Number(coupon.discount_value)
          price = Math.max(0.01, Math.round(price * 100) / 100)
          await admin.from('coupons').update({ used_count: usedCount + 1 }).eq('id', String(coupon.id))
        }
      }
    }

    const stripe = getStripeServer()
    if (!stripe) return NextResponse.json({ error: 'Pagamentos indisponíveis no momento' }, { status: 503 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Métodos de pagamento
    const methods: Array<'card' | 'pix' | 'boleto'> = ['card']
    if (payment_method === 'boleto' && price >= 5) methods.push('boleto')

    // Boleto no Stripe BR é feito via payment_method_types: ['boleto'] mas requer configuração.
    // Como simplificação, usamos customer balance para boleto, mas aqui ficamos com card + opções.
    // PIX é tratado em /api/checkout/pix (in-page).

    const platformFee = Math.round(price * (commissionRate / 100) * 100) / 100
    const vendorNet = vendorId ? Math.round((price - platformFee) * 100) / 100 : 0

    const session = await stripe.checkout.sessions.create({
      payment_method_types: payment_method === 'boleto' ? ['boleto', 'card'] : methods,
      mode: 'payment',
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: title,
              description: 'Produto digital KIYVO — entrega protegida',
              metadata: { product_id: finalProductId || '', sku: sku || '' },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_id: finalProductId || '',
        sku: sku || '',
        buyer_id: user.id,
        vendor_id: vendorId || 'oficial',
        product_type: isOfficial ? 'official' : 'marketplace',
        platform_fee: String(platformFee),
        vendor_net: String(vendorNet),
        kd_points_used: String(kdPointsUsed),
        product_title: title,
        escrow: 'true',
      },
      payment_intent_data: {
        metadata: {
          product_id: finalProductId || '',
          sku: sku || '',
          buyer_id: user.id,
          vendor_id: vendorId || 'oficial',
          product_type: isOfficial ? 'official' : 'marketplace',
          kd_points_used: String(kdPointsUsed),
          title,
        },
      },
      success_url: success_url || `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${siteUrl}/checkout/cancelado`,
    })

    // Criar pedido pendente
    const orderNumber = `KIY-${Date.now().toString(36).toUpperCase()}`
    await admin.from('orders').insert({
      order_number: orderNumber,
      buyer_id: user.id,
      seller_id: vendorId,
      vendor_id: vendorId,
      product_id: finalProductId,
      stripe_checkout_session_id: session.id,
      title: title.slice(0, 200),
      price,
      subtotal: price,
      platform_fee: platformFee,
      vendor_net: vendorNet,
      status: 'pending_payment',
      payment_method: payment_method === 'boleto' ? 'boleto' : 'credit_card',
      metadata: { sku: sku || null, product_type: isOfficial ? 'official' : 'marketplace', kd_points_used: kdPointsUsed },
    })

    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'checkout_created',
      resource: 'checkout',
      severity: 'info',
      metadata: { sessionId: session.id, is_official: isOfficial, price },
    })

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      escrow: true,
      order_number: orderNumber,
      breakdown: { subtotal: price, platformFee, vendorNet },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
