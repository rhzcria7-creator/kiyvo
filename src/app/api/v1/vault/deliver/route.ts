import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { vaultEngine } from '@/domain/vault/VaultEngine';

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/vault/deliver?orderItemId=xxx
// Entrega o ativo decriptado ao comprador (APÓS pagamento confirmado)
// ROTA CRÍTICA — apenas para compradores autenticados com ordem paga
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin client não configurado" }, { status: 500 });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get('orderItemId');

    if (!orderItemId) {
      return NextResponse.json({ error: 'orderItemId é obrigatório' }, { status: 400 });
    }

    // Verificar que o comprador é dono da ordem
    const { data: orderItem, error: itemError } = await admin
      .from('order_items')
      .select('id, order_id, orders!inner(buyer_id, status)')
      .eq('id', orderItemId)
      .single();

    if (itemError || !orderItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    const orderData = orderItem.orders as unknown as { buyer_id: string; status: string };

    // Segurança: só o comprador pode receber
    if (orderData.buyer_id !== user.id) {
      // Log de tentativa de acesso não autorizado
      await admin.from('security_events').insert({
        user_id: user.id,
        event_type: 'unauthorized_access_attempt',
        severity: 'critical',
        metadata: { resource: 'vault_deliver', orderItemId },
      });

      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar que a ordem está em status de entrega (paid ou superior)
    const validStatuses = ['paid', 'processing', 'delivered', 'confirmed'];
    if (!validStatuses.includes(orderData.status)) {
      return NextResponse.json(
        { error: 'Pedido ainda não foi pago — ativo indisponível' },
        { status: 403 }
      );
    }

    // Entregar o ativo via VaultEngine (decripta e retorna)
    const result = await vaultEngine.deliverAsset(orderItemId, user.id);

    if (!result.success || !result.asset) {
      return NextResponse.json({ error: result.error || 'Ativo não disponível' }, { status: 404 });
    }

    // Log de entrega para auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'vault_asset_delivered',
      resource: 'digital_inventory',
      severity: 'info',
      metadata: {
        orderItemId,
        assetType: result.asset.assetType,
        orderId: orderData.buyer_id,
      },
    });

    // Retornar o ativo decriptado
    return NextResponse.json({
      asset: {
        assetType: result.asset.assetType,
        decryptedData: result.asset.decryptedData,
        description: result.asset.description,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
