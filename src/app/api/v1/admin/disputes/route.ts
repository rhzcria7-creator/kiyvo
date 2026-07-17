import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/admin/disputes — Listar disputas (admin only)
// POST /api/v1/admin/disputes — Resolver disputa (admin only)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    const { data: disputes, error } = await admin
      .from('disputes')
      .select('*, orders!inner(id, order_number, subtotal, buyer_id, vendor_id, vendors!inner(store_name))')
      .neq('status', 'closed')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar disputas' }, { status: 500 });
    }

    const formattedDisputes = (disputes || []).map((d: Record<string, unknown>) => {
      const order = (d.orders || {}) as Record<string, unknown>;
      const vendor = (order.vendors || {}) as Record<string, unknown>;
      return {
        id: d.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: Number(order.subtotal) || 0,
        reason: d.reason,
        status: d.status,
        createdAt: d.created_at,
        vendorName: vendor.store_name || 'Vendedor',
        buyerName: 'Comprador',
      };
    });

    return NextResponse.json({ disputes: formattedDisputes });
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

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    const body = await request.json();
    const { disputeId, resolution, favor } = body as { disputeId: string; resolution: string; favor: 'buyer' | 'vendor' };

    if (!disputeId || !resolution || !favor) {
      return NextResponse.json({ error: 'disputeId, resolution e favor são obrigatórios' }, { status: 400 });
    }

    const newStatus = favor === 'buyer' ? 'resolved_buyer' : 'resolved_vendor';

    await admin
      .from('disputes')
      .update({
        status: newStatus,
        resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    // Se favorável ao comprador, reembolsar
    if (favor === 'buyer') {
      const { data: dispute } = await admin
        .from('disputes')
        .select('order_id')
        .eq('id', disputeId)
        .single();

      if (dispute) {
        await admin
          .from('orders')
          .update({ status: 'refunded', refunded_at: new Date().toISOString() })
          .eq('id', dispute.order_id);
      }
    }

    // Notificar ambas as partes
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'dispute_resolved',
      resource: 'disputes',
      severity: 'info',
      metadata: { disputeId, favor, resolution },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
