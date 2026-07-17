import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/vault?productId=xxx
// Lista assets do cofre de um produto (vendor só vê os seus)
// Dados encriptados NÃO são retornados — apenas metadados
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
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }

    // Verificar que o user é dono do produto (via vendor)
    const { data: product, error: productError } = await admin
      .from('products')
      .select('id, title, vendor_id, vendors!inner(user_id)')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const vendorData = product.vendors as unknown as { user_id: string };
    if (vendorData.user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar assets do cofre (SEM dados encriptados — segurança!)
    const { data: items, error: itemsError } = await admin
      .from('digital_inventory')
      .select('id, asset_type, asset_description, status, created_at, sold_at, expires_at, sold_to_order_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (itemsError) {
      return NextResponse.json({ error: 'Erro ao buscar inventário' }, { status: 500 });
    }

    // Estatísticas
    const stats = {
      total: items?.length || 0,
      available: items?.filter((i: { status: string }) => i.status === 'available').length || 0,
      reserved: items?.filter((i: { status: string }) => i.status === 'reserved').length || 0,
      sold: items?.filter((i: { status: string }) => i.status === 'sold').length || 0,
      revoked: items?.filter((i: { status: string }) => i.status === 'revoked').length || 0,
    };

    return NextResponse.json({
      productTitle: product.title,
      items: items || [],
      stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
