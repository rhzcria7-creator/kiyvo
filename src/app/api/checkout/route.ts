import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { rateLimit, sanitizeInput } from '@/lib/security';
import { validateCheckout, validationError } from '@/lib/validation';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error('Admin client não configurado');
  return client;
}

// ═══════════════════════════════════════════════════════════════
// POST /api/checkout — Create Stripe Checkout Session com ESCROW
// Dinheiro vai para a CONTA DA PLATAFORMA primeiro
// Transferência ao vendor APENAS após confirmação do comprador
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = rateLimit(ip, 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit excedido. Tente novamente em 1 minuto.' }, { status: 429 });
    }

    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, variant_id, affiliate_code, success_url, cancel_url } = body;

    // Validação server-side rigorosa (OWASP)
    const inputValidation = validateCheckout({ product_id, variant_id, affiliate_code });
    if (!inputValidation.valid) {
      return NextResponse.json({ error: 'Dados inválidos', details: inputValidation.errors }, { status: 422 });
    }

    // Buscar produto REAL com vendor
    const productResult = await admin
      .from('products')
      .select('*, vendors!inner(id, user_id, store_name, stripe_account_id, commission_rate)')
      .eq('id', product_id)
      .eq('status', 'published')
      .single();

    if (productResult.error || !productResult.data) {
      return NextResponse.json({ error: 'Produto não encontrado ou indisponível' }, { status: 404 });
    }

    const product = productResult.data as Record<string, unknown>;

    const vendorData = (product.vendors || {}) as Record<string, unknown>;

    // Verificar estoque no Cofre Digital
    const { count: availableStock } = await admin
      .from('digital_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product_id)
      .eq('status', 'available');

    if (!availableStock || availableStock === 0) {
      return NextResponse.json({ error: 'Produto esgotado — sem estoque no Cofre Digital' }, { status: 409 });
    }

    const sanitizedTitle = sanitizeInput(String(product.title));
    const price = Number(product.base_price);

    if (price <= 0 || price > 50000) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    // Calcular split financeiro
    const commissionRate = Number(vendorData.commission_rate) || 10;
    const platformFee = Math.round(price * (commissionRate / 100) * 100) / 100;
    const affiliateFeeRate = affiliate_code ? 5 : 0;
    const affiliateFee = Math.round(price * (affiliateFeeRate / 100) * 100) / 100;
    const vendorNet = Math.round((price - platformFee - affiliateFee) * 100) / 100;

    // Verificar afiliado
    let affiliateId: string | null = null;
    if (affiliate_code) {
      const { data: affiliate } = await admin
        .from('affiliates')
        .select('id')
        .eq('referral_code', affiliate_code)
        .single();
      affiliateId = affiliate?.id || null;
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json({ error: 'Serviço de pagamento indisponível' }, { status: 503 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Payment methods — suporta card + PIX
    const paymentMethodTypes: ('card' | 'pix' | 'boleto')[] = ['card'];
    if (price >= 5) paymentMethodTypes.push('pix');
    if (price >= 10) paymentMethodTypes.push('boleto');

    // Criar Stripe Checkout Session
    // ESCROW: Dinheiro vai para a conta da plataforma PRIMEIRO
    // NÃO usamos transfer_data automático — controlamos manualmente
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      mode: 'payment',
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: sanitizedTitle,
              description: `Produto digital Kiyvo — Entrega instantânea após confirmação`,
              metadata: { product_id },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_id,
        variant_id: variant_id || '',
        buyer_id: user.id,
        vendor_id: String(vendorData.id),
        affiliate_code: affiliate_code || '',
        affiliate_id: affiliateId || '',
        platform_fee: String(platformFee),
        affiliate_fee: String(affiliateFee),
        vendor_net: String(vendorNet),
        escrow: 'true',
      },
      success_url: success_url || `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${siteUrl}/checkout/cancelado`,
      payment_method_options: paymentMethodTypes.includes('pix') ? {
        pix: {
          expires_after_seconds: 3600,
        },
      } : undefined,
    });

    // Criar pedido pendente no banco
    const { data: orderNumberData } = await admin.rpc('generate_order_number');

    await admin.from('orders').insert({
      order_number: orderNumberData || `PD-${Date.now()}`,
      buyer_id: user.id,
      vendor_id: String(vendorData.id),
      stripe_checkout_session_id: session.id,
      subtotal: price,
      platform_fee: platformFee,
      affiliate_fee: affiliateFee,
      vendor_net: vendorNet,
      status: 'pending_payment',
      payment_method: paymentMethodTypes.includes('pix') ? 'pix' : 'credit_card',
    });

    // Log de auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'checkout_created',
      resource: 'checkout',
      severity: 'info',
      metadata: { sessionId: session.id, productId: product_id, price, escrow: true },
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      escrow: true,
      breakdown: {
        subtotal: price,
        platformFee,
        affiliateFee,
        vendorNet,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
