import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/products — Lista produtos reais do Supabase
// Suporta: category, vendor_slug, search, sort, page, limit, status, role, slug
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const vendorSlug = searchParams.get('vendor_slug');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'featured';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'published';
    const role = searchParams.get('role');
    const slug = searchParams.get('slug');
    const productId = searchParams.get('id');

    const supabase = createClient();
    const admin = getAdmin();

    // Se buscando por slug específico — retorna produto único
    if (slug) {
      const { data: product, error } = await admin
        .from('products')
        .select('*, vendors(*, vendor_metrics(*)), product_images(*), product_variants(*)')
        .eq('slug', slug)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }

      // Buscar reviews
      const { data: reviews } = await admin
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ product, reviews: reviews || [] });
    }

    // Se buscando por ID específico
    if (productId) {
      const { data: product, error } = await admin
        .from('products')
        .select('*, vendors(*, vendor_metrics(*)), product_images(*), product_variants(*)')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Query base
    let query = admin
      .from('products')
      .select('*, vendors!inner(id, store_name, slug, rating_avg, total_sales, vendor_metrics(level)), product_images!product_images_product_id_fkey(*)', { count: 'exact' });

    // Filtros de visibilidade por role
    if (role === 'vendor') {
      // Vendedor vê os próprios produtos (incluindo rascunhos)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('vendors.user_id', user.id);
      }
    } else {
      // Público vê apenas publicados
      if (status === 'published') {
        query = query.eq('status', 'published');
      }
    }

    // Filtro por categoria
    if (category) {
      query = query.eq('category_id', category);
    }

    // Filtro por vendor slug
    if (vendorSlug) {
      query = query.eq('vendors.slug', vendorSlug);
    }

    // Filtro por status específico
    if (status && status !== 'published' && role === 'vendor') {
      query = query.eq('status', status);
    }

    // Ordenação
    switch (sort) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('base_price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'sales':
        query = query.order('sales_count', { ascending: false });
        break;
      case 'featured':
      default:
        query = query.order('is_featured', { ascending: false })
                     .order('sales_count', { ascending: false });
        break;
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar produtos', details: error.message }, { status: 500 });
    }

    // Se tem busca textual, refinar com tsvector
    let finalProducts = products || [];
    if (search && finalProducts.length > 0) {
      const { data: searchResults } = await admin
        .from('products')
        .select('id')
        .textSearch('search_vector', search, {
          type: 'websearch',
          config: 'portuguese',
        });
      if (searchResults && searchResults.length > 0) {
        const searchIds = searchResults.map((r: { id: string }) => r.id);
        finalProducts = finalProducts.filter((p: { id: string }) => searchIds.includes(p.id));
      }
    }

    return NextResponse.json({
      products: finalProducts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/products — Criar novo produto (vendor autenticado)
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
    const { title, description_html, base_price, original_price, category_id, delivery_type, product_type, tags } = body;

    if (!title || !base_price) {
      return NextResponse.json({ error: 'Título e preço são obrigatórios' }, { status: 400 });
    }

    if (typeof base_price !== 'number' || base_price <= 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    // Buscar vendor do utilizador
    const { data: vendor, error: vendorError } = await admin
      .from('vendors')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Perfil de vendedor não encontrado. Complete o onboarding.' }, { status: 403 });
    }

    // Verificar KYC
    const { data: profile } = await admin
      .from('profiles')
      .select('kyc_status, role')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status !== 'approved' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'KYC não aprovado — complete a verificação para criar anúncios' }, { status: 403 });
    }

    // Gerar slug único
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await admin
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Criar produto
    const { data: product, error: insertError } = await admin
      .from('products')
      .insert({
        vendor_id: vendor.id,
        category_id: category_id || null,
        title: title.trim(),
        slug,
        description_html: description_html || '',
        base_price: Math.round(base_price * 100) / 100,
        original_price: original_price ? Math.round(original_price * 100) / 100 : null,
        delivery_type: delivery_type || 'auto',
        product_type: product_type || 'digital_download',
        tags: tags || [],
        status: 'draft',
        stock_quantity: 0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: `Erro ao criar produto: ${insertError.message}` }, { status: 500 });
    }

    // Log de auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'product_created',
      resource: 'products',
      severity: 'info',
      metadata: { productId: product.id, title, slug },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
