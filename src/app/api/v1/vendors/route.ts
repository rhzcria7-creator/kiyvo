import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/vendors?slug=xxx
// Busca perfil público de um vendedor com métricas
// POST /api/v1/vendors — Cria vendor + Stripe Connect account
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin client não configurado" }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');

    if (!slug && !userId) {
      return NextResponse.json({ error: 'slug ou userId é obrigatório' }, { status: 400 });
    }

    let query = admin
      .from('vendors')
      .select('*, vendor_metrics(*)')
      .eq('is_active', true);

    if (slug) {
      query = query.eq('slug', slug);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: vendor, error } = await query.single();

    if (error || !vendor) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 });
    }

    // Não expor stripe_account_id publicamente
    const { stripe_account_id, ...safeVendor } = vendor;

    return NextResponse.json({
      vendor: {
        ...safeVendor,
        hasStripeAccount: !!stripe_account_id,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin client não configurado" }, { status: 500 });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { storeName, description } = body as {
      storeName: string;
      description?: string;
    };

    if (!storeName || storeName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nome da loja é obrigatório (mínimo 3 caracteres)' },
        { status: 400 }
      );
    }

    // Verificar se já é vendor
    const { data: existingVendor } = await admin
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingVendor) {
      return NextResponse.json({ error: 'Já é um vendedor' }, { status: 409 });
    }

    // Gerar slug único
    const baseSlug = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: slugCheck } = await admin
        .from('vendors')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!slugCheck) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Criar Stripe Connect Express account
    let stripeAccountId: string | null = null;
    try {
      const { createConnectAccount } = await import('@/lib/stripe/connect');
      const accountResult = await createConnectAccount({ email: user.email || '' });
      if (accountResult) {
        stripeAccountId = accountResult.id;
      }
    } catch {
      // Stripe Connect pode falhar — vendor criado sem conta Stripe
      // Onboarding feito depois
    }

    // Criar vendor no banco
    const { data: vendor, error: vendorError } = await admin
      .from('vendors')
      .insert({
        user_id: user.id,
        store_name: storeName.trim(),
        slug,
        description: description?.trim() || null,
        stripe_account_id: stripeAccountId,
        stripe_onboarding_complete: false,
        commission_rate: 10.00,
      })
      .select()
      .single();

    if (vendorError) {
      return NextResponse.json({ error: `Erro ao criar loja: ${vendorError.message}` }, { status: 500 });
    }

    // Atualizar role do profile para vendor
    await admin
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', user.id);

    // Log de auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'vendor_created',
      resource: 'vendors',
      severity: 'info',
      metadata: { storeName, slug, hasStripeAccount: !!stripeAccountId },
    });

    return NextResponse.json({
      vendor,
      stripeAccountId,
      nextStep: stripeAccountId
        ? '/vendor/onboarding?step=stripe'
        : '/vendor/onboarding?step=kyc',
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
