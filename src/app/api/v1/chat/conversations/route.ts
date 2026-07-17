import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/chat/conversations — Lista conversas do utilizador
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar conversas onde o utilizador é buyer ou vendor
    const { data: conversations, error } = await admin
      .from('chat_conversations')
      .select('*, buyer:profiles!chat_conversations_buyer_id_fkey(full_name), vendor:profiles!chat_conversations_vendor_id_fkey(full_name), product:products(title)')
      .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
