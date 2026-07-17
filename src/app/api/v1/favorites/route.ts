import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/favorites — Lista favoritos do utilizador
// POST /api/v1/favorites — Adicionar favorito
// DELETE /api/v1/favorites — Remover favorito
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: favorites, error } = await admin
      .from('favorites')
      .select('*, products(id, title, slug, base_price, rating, product_images(image_url, is_primary))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
    }

    return NextResponse.json({ favorites: favorites || [] });
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }

    const { error } = await admin
      .from('favorites')
      .insert({ user_id: user.id, product_id: productId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Já está nos favoritos' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Erro ao favoritar' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }

    await admin
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
