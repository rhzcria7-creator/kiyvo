import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/orders — Lista pedidos reais do Supabase
// Suporta: role (buyer/vendor/admin), status, id, finance, limit
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
    const role = searchParams.get('role') || 'buyer';
    const statusFilter = searchParams.get('status');
    const orderId = searchParams.get('id');
    const sessionId = searchParams.get('session_id');
    const finance = searchParams.get('finance') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '20');

    // Buscar pedido pelo Stripe Checkout Session ID (usado na página de sucesso)
    if (sessionId) {
      const { data: order, error } = await admin
        .from('orders')
        .select('*, order_items(*), vendors(id, store_name, slug, user_id)')
        .eq('stripe_checkout_session_id', sessionId)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Pedido não encontrado para esta sessão' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Buscar pedido específico por ID
    if (orderId) {
      const { data: order, error } = await admin
        .from('orders')
        .select('*, order_items(*), vendors(id, store_name, slug)')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Verificar perfil do utilizador
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // Construir query base
    let query = admin
      .from('orders')
      .select('*, order_items(*), vendors(id, store_name, slug, user_id)', { count: 'exact' });

    // Filtro por role
    if (role === 'vendor' && !isAdmin) {
      // Vendedor vê pedidos dos seus produtos
      const { data: vendorData } = await admin
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!vendorData) {
        return NextResponse.json({ orders: [], total: 0 });
      }
      query = query.eq('vendor_id', vendorData.id);
    } else if (role === 'buyer' && !isAdmin) {
      // Comprador vê os próprios pedidos
      query = query.eq('buyer_id', user.id);
    }
    // Admin vê todos

    // Filtro por status (pode ser múltiplo separado por vírgula)
    if (statusFilter) {
      const statuses = statusFilter.split(',');
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0]);
      } else {
        query = query.in('status', statuses);
      }
    }

    // Ordenar por mais recente
    query = query.order('created_at', { ascending: false }).limit(limitParam);

    const { data: orders, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar pedidos', details: error.message }, { status: 500 });
    }

    // Se modo financeiro (vendor dashboard)
    if (finance && role === 'vendor') {
      const { data: vendorData } = await admin
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (vendorData) {
        // Calcular totais financeiros
        const { data: allOrders } = await admin
          .from('orders')
          .select('subtotal, platform_fee, vendor_net, status')
          .eq('vendor_id', vendorData.id);

        const totalRevenue = (allOrders || []).reduce((sum: number, o: { subtotal?: number }) => sum + (Number(o.subtotal) || 0), 0);
        const totalFees = (allOrders || []).reduce((sum: number, o: { platform_fee?: number }) => sum + (Number(o.platform_fee) || 0), 0);
        const netProfit = (allOrders || []).reduce((sum: number, o: { vendor_net?: number }) => sum + (Number(o.vendor_net) || 0), 0);

        const confirmedOrders = (allOrders || []).filter((o: { status?: string }) => o.status === 'confirmed' || o.status === 'delivered');
        const availableBalance = confirmedOrders.reduce((sum: number, o: { vendor_net?: number }) => sum + (Number(o.vendor_net) || 0), 0);

        const escrowOrders = (allOrders || []).filter((o: { status?: string }) => o.status === 'paid' || o.status === 'processing');
        const pendingBalance = escrowOrders.reduce((sum: number, o: { vendor_net?: number }) => sum + (Number(o.vendor_net) || 0), 0);

        const totalSales = (allOrders || []).length;

        const { data: vendorInfo } = await admin
          .from('vendors')
          .select('rating_avg')
          .eq('id', vendorData.id)
          .single();

        const { data: metrics } = await admin
          .from('vendor_metrics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        return NextResponse.json({
          orders: orders || [],
          total: count || 0,
          totalRevenue,
          platformFees: totalFees,
          netProfit,
          availableBalance,
          pendingBalance,
          totalSales,
          ratingAvg: vendorInfo?.rating_avg || 0,
          level: metrics?.level || 'bronze',
          commissionRate: metrics?.current_commission_rate || 10,
          nextLevelThreshold: metrics?.next_level_threshold || 10,
          experiencePoints: metrics?.experience_points || 0,
          disputeRate: metrics?.dispute_rate_percent || 0,
        });
      }
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/orders — Criar pedido real (Escrow)
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
    const { product_id, variant_id, payment_method } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
    }

    // Buscar produto com vendor
    const { data: product, error: productError } = await admin
      .from('products')
      .select('*, vendors!inner(id, user_id, stripe_account_id, commission_rate)')
      .eq('id', product_id)
      .eq('status', 'published')
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado ou indisponível' }, { status: 404 });
    }

    const vendorData = product.vendors as unknown as { id: string; user_id: string; stripe_account_id: string | null; commission_rate: number };

    // Verificar estoque no Cofre Digital
    const { count: availableStock } = await admin
      .from('digital_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product_id)
      .eq('status', 'available');

    if (!availableStock || availableStock === 0) {
      return NextResponse.json({ error: 'Produto esgotado — sem estoque no Cofre Digital' }, { status: 409 });
    }

    // Calcular split financeiro
    const subtotal = product.base_price;
    const commissionRate = vendorData.commission_rate || 10;
    const platformFee = Math.round(subtotal * (commissionRate / 100) * 100) / 100;
    const vendorNet = Math.round((subtotal - platformFee) * 100) / 100;

    // Gerar número do pedido
    const { data: orderNumber } = await admin.rpc('generate_order_number');

    // Criar pedido
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber || `PD-${Date.now()}`,
        buyer_id: user.id,
        vendor_id: vendorData.id,
        subtotal,
        platform_fee: platformFee,
        vendor_net: vendorNet,
        status: 'pending_payment',
        payment_method: payment_method || 'pix',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: `Erro ao criar pedido: ${orderError.message}` }, { status: 500 });
    }

    // Criar order_item
    const { data: orderItem, error: itemError } = await admin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        variant_id: variant_id || null,
        product_title_snapshot: product.title,
        quantity: 1,
        unit_price: product.base_price,
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: `Erro ao criar item: ${itemError.message}` }, { status: 500 });
    }

    // Reservar asset no Cofre
    const { data: reservedAsset } = await admin.rpc('reserve_inventory_asset', {
      p_product_id: product_id,
      p_variant_id: variant_id || null,
      p_order_id: order.id,
      p_order_item_id: orderItem.id,
    });

    if (!reservedAsset) {
      // Sem estoque — cancelar pedido
      await admin.from('orders').update({ status: 'refunded' }).eq('id', order.id);
      return NextResponse.json({ error: 'Sem estoque disponível' }, { status: 409 });
    }

    // Registrar na timeline de Escrow
    await admin.from('escrow_timeline').insert({
      order_id: order.id,
      event_type: 'payment_received',
      actor_id: user.id,
      amount: subtotal,
    });

    // Log de auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'order_created',
      resource: 'orders',
      severity: 'info',
      metadata: { orderId: order.id, productId: product_id, subtotal, platformFee, vendorNet },
    });

    return NextResponse.json({
      order,
      orderItem,
      payment: {
        subtotal,
        platformFee,
        vendorNet,
        vendorStripeAccount: vendorData.stripe_account_id,
      },
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/orders — Atualizar status do pedido
// ═══════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status, dispute_reason } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id e status são obrigatórios' }, { status: 400 });
    }

    // Buscar pedido
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, buyer_id, vendor_id, status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar permissão
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isBuyer = order.buyer_id === user.id;
    const isVendor = await (async () => {
      const { data: v } = await admin
        .from('vendors')
        .select('id')
        .eq('id', order.vendor_id)
        .eq('user_id', user.id)
        .single();
      return !!v;
    })();
    const isAdmin = profile?.role === 'admin';

    if (!isBuyer && !isVendor && !isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Validações de transição
    const validTransitions: Record<string, string[]> = {
      pending_payment: ['paid', 'refunded'],
      paid: ['processing', 'delivered', 'refunded'],
      processing: ['delivered', 'refunded'],
      delivered: ['confirmed', 'disputed'],
      confirmed: ['refunded'],
      disputed: ['refunded', 'confirmed'],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status) && !isAdmin) {
      return NextResponse.json({ error: `Transição inválida: ${order.status} → ${status}` }, { status: 400 });
    }

    // Campos de timestamp
    const updates: Record<string, unknown> = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
      updates.escrow_release_scheduled_at = new Date().toISOString();
    }
    if (status === 'disputed') {
      updates.disputed_at = new Date().toISOString();
    }
    if (status === 'refunded') {
      updates.refunded_at = new Date().toISOString();
    }

    // Atualizar pedido
    const { error: updateError } = await admin
      .from('orders')
      .update(updates)
      .eq('id', order_id);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
    }

    // Se confirmado, criar notificação para o vendedor
    if (status === 'confirmed') {
      const { data: vendorData } = await admin
        .from('vendors')
        .select('user_id')
        .eq('id', order.vendor_id)
        .single();

      if (vendorData) {
        await admin.from('notifications').insert({
          user_id: vendorData.user_id,
          type: 'order',
          title: 'Pedido confirmado! 💰',
          message: `O comprador confirmou o recebimento. O valor será liberado para saque.`,
          link: '/vendor/finance',
        });
      }
    }

    // Registrar na timeline
    const eventMap: Record<string, string> = {
      paid: 'payment_received',
      delivered: 'asset_delivered',
      confirmed: 'buyer_confirmed',
      disputed: 'dispute_opened',
      refunded: 'refund_initiated',
    };

    await admin.from('escrow_timeline').insert({
      order_id,
      event_type: eventMap[status] || status,
      actor_id: user.id,
      metadata: { previous_status: order.status, dispute_reason },
    });

    return NextResponse.json({ success: true, order_id, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
