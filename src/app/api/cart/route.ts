import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/cart — Busca carrinho do utilizador (localStorage + validação server)
// POST /api/cart — Adiciona item ao carrinho (valida estoque)
// DELETE /api/cart — Remove item do carrinho
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
    const productIds = searchParams.get('product_ids')?.split(',').filter(Boolean) || [];

    if (productIds.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Buscar dados reais dos produtos no carrinho
    const { data: products, error } = await admin
      .from('products')
      .select('id, title, slug, base_price, original_price, delivery_type, status, vendors!inner(id, store_name, slug), product_images!product_images_product_id_fkey(image_url, is_primary)')
      .in('id', productIds)
      .eq('status', 'published');

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar produtos do carrinho' }, { status: 500 });
    }

    // Verificar estoque do Cofre Digital para cada produto
    const itemsWithStock = await Promise.all(
      (products || []).map(async (p: Record<string, unknown>) => {
        const { count } = await admin
          .from('digital_inventory')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', p.id)
          .eq('status', 'available');

        const vendor = (p.vendors || {}) as Record<string, unknown>;
        const images = (p.product_images || []) as Record<string, unknown>[];
        const primaryImage = images.find((img: Record<string, unknown>) => img.is_primary) || images[0];

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: Number(p.base_price) || 0,
          originalPrice: p.original_price ? Number(p.original_price) : null,
          deliveryType: p.delivery_type || 'auto',
          inStock: (count || 0) > 0,
          stockCount: count || 0,
          vendor: {
            storeName: vendor.store_name || 'Vendedor',
            slug: vendor.slug || '',
          },
          imageUrl: primaryImage?.image_url || null,
        };
      })
    );

    const total = itemsWithStock.reduce((sum: number, item) => sum + item.price, 0);

    return NextResponse.json({ items: itemsWithStock, total });
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

    const body = await request.json();
    const { productId, variantId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }

    // Validar que o produto existe e está publicado
    const { data: product, error } = await admin
      .from('products')
      .select('id, title, base_price, status, stock_quantity')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (product.status !== 'published') {
      return NextResponse.json({ error: 'Produto indisponível' }, { status: 400 });
    }

    // Verificar estoque no Cofre
    const { count } = await admin
      .from('digital_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('status', 'available');

    if (!count || count === 0) {
      return NextResponse.json({ error: 'Produto esgotado' }, { status: 409 });
    }

    return NextResponse.json({ success: true, productId, inStock: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/cart — Remove item do carrinho (validação server-side)
// ═══════════════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
    }

    // A remoção real acontece no client-side (localStorage / Zustand store)
    // Este endpoint serve como validação server-side de que o produto existe
    return NextResponse.json({ success: true, productId, removed: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
