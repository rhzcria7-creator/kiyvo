import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/withdraw — Solicitar saque (vendor)
// Cria transferência via Stripe Connect ou registra para processamento
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body as { amount: number };

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    // Mínimo de saque: R$ 10
    if (amount < 10) {
      return NextResponse.json({ error: 'Saque mínimo: R$ 10,00' }, { status: 400 });
    }

    // Buscar vendor
    const { data: vendor, error: vendorError } = await admin
      .from('vendors')
      .select('id, stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Perfil de vendedor não encontrado' }, { status: 403 });
    }

    // Verificar KYC aprovado
    const { data: profile } = await admin
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status !== 'approved') {
      return NextResponse.json({ error: 'KYC não aprovado — complete a verificação para sacar' }, { status: 403 });
    }

    // Verificar saldo disponível
    const { data: wallet } = await admin
      .from('wallets')
      .select('balance_available')
      .eq('user_id', user.id)
      .single();

    const availableBalance = Number(wallet?.balance_available) || 0;

    if (amount > availableBalance) {
      return NextResponse.json({
        error: `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}`,
        availableBalance,
      }, { status: 400 });
    }

    // Verificar Stripe Connect onboarding
    if (!vendor.stripe_account_id || !vendor.stripe_onboarding_complete) {
      return NextResponse.json({
        error: 'Stripe Connect não configurado. Complete o onboarding em /vendor/onboarding',
      }, { status: 400 });
    }

    // Criar transferência via Stripe Connect
    try {
      const { getStripeServer } = await import('@/lib/stripe/server');
      const stripe = getStripeServer();

      if (stripe) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100),  // Stripe usa centavos
          currency: 'brl',
          destination: vendor.stripe_account_id,
          metadata: {
            vendor_id: vendor.id,
            user_id: user.id,
            type: 'vendor_withdrawal',
          },
        });

        // Atualizar wallet (deduzir saldo)
        await admin
          .from('wallets')
          .update({
            balance_available: Math.round((availableBalance - amount) * 100) / 100,
          })
          .eq('user_id', user.id);

        // Log de auditoria
        await admin.from('audit_log').insert({
          user_id: user.id,
          action: 'withdrawal_processed',
          resource: 'wallets',
          severity: 'info',
          metadata: { amount, stripeTransferId: transfer.id },
        });

        return NextResponse.json({
          success: true,
          transferId: transfer.id,
          amount,
        });
      }
    } catch (stripeErr) {
      const stripeMessage = stripeErr instanceof Error ? stripeErr.message : 'Erro no Stripe';
      return NextResponse.json({ error: `Erro na transferência: ${stripeMessage}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Serviço de pagamento indisponível' }, { status: 503 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
