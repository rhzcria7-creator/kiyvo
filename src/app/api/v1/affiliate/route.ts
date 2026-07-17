import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/affiliate — Dados do afiliado
// POST /api/v1/affiliate — Criar conta de afiliado
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: affiliate, error } = await admin
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !affiliate) {
      return NextResponse.json({ affiliate: null, needsSetup: true });
    }

    // Buscar comissões pendentes
    const { data: pendingConversions } = await admin
      .from('affiliate_conversions')
      .select('commission_amount')
      .eq('affiliate_id', affiliate.id)
      .eq('status', 'pending');

    const pendingCommissions = (pendingConversions || []).reduce(
      (sum: number, c: { commission_amount?: number }) => sum + (Number(c.commission_amount) || 0), 0
    );

    return NextResponse.json({ affiliate, pendingCommissions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se já é afiliado
    const { data: existing } = await admin
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Já é afiliado' }, { status: 409 });
    }

    // Gerar código de referência único
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();

    const baseName = (profile?.username || profile?.full_name || 'USER')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);

    const referralCode = `${baseName}${Date.now().toString(36).toUpperCase()}`;

    const { data: affiliate, error } = await admin
      .from('affiliates')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        commission_percentage: 5.00,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar conta de afiliado' }, { status: 500 });
    }

    return NextResponse.json({ affiliate }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
