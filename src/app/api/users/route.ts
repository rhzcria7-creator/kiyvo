import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/users?id=xxx — Buscar perfil real do Supabase
// PATCH /api/users — Atualizar perfil do utilizador autenticado
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || user.id;

    const { data: profile, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    // Campos permitidos para atualização pelo próprio utilizador
    const allowedFields = [
      'full_name', 'bio', 'phone', 'avatar_url',
      'cpf_cnpj_type', 'kyc_status',
      'address_cep', 'address_street', 'address_number',
      'address_complement', 'address_neighborhood',
      'address_city', 'address_state',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 });
    }

    // Sanitizar texto
    if (updates.full_name) updates.full_name = String(updates.full_name).trim().slice(0, 200);
    if (updates.bio) updates.bio = String(updates.bio).trim().slice(0, 500);

    const { error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: Object.keys(updates) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
