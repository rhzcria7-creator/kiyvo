export const runtime = 'nodejs'
// /api/products
// GET: lista produtos (filtros categoria, q, seller_id, oficial)
// POST: cria produto (vendors autenticados)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput, rateLimit } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria')
    const q = searchParams.get('q')
    const seller = searchParams.get('seller_id')
    const oficial = searchParams.get('oficial') === '1'
    const limit = Math.min(50, Number(searchParams.get('limit')) || 20)
    const offset = Math.max(0, Number(searchParams.get('offset')) || 0)

    const supabase = createClient()
    let query = supabase.from('products')
      .select('id,title,slug,short_description,base_price,price,compare_at_price,category,image_url,images,seller_id,is_official,is_featured,sales_count,rating_avg,views,status,created_at,vendors(store_name)', { count: 'exact' })
      .eq('status', 'published')

    if (categoria) query = query.eq('category', categoria)
    if (oficial) query = query.eq('is_official', true)
    if (seller) query = query.eq('seller_id', seller)
    if (q) query = query.ilike('title', `%${q}%`)

    query = query.order('sales_count', { ascending: false }).range(offset, offset + limit - 1)
    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products: data || [], total: count || 0 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 20, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas criações. Aguarde.' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Entre para anunciar' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? sanitizeInput(body.title).slice(0, 120) : ''
    const description = typeof body.description === 'string' ? sanitizeInput(body.description).slice(0, 5000) : ''
    const short_description = typeof body.short_description === 'string' ? sanitizeInput(body.short_description).slice(0, 200) : ''
    const price = Number(body.price)
    const category = typeof body.category === 'string' ? body.category : 'outro'
    const image_url = typeof body.image_url === 'string' ? body.image_url.slice(0, 500) : ''
    const images = Array.isArray(body.images) ? body.images.map(String).slice(0, 10) : []
    const compare_at_price = Number(body.compare_at_price) || null
    const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitizeInput(String(t)).slice(0, 30)).slice(0, 15) : []
    const is_digital = body.is_digital !== false
    const instant_delivery = !!body.instant_delivery

    if (title.length < 8) return NextResponse.json({ error: 'Título precisa de 8+ caracteres' }, { status: 400 })
    if (description.length < 30) return NextResponse.json({ error: 'Descrição precisa de 30+ caracteres' }, { status: 400 })
    if (!Number.isFinite(price) || price < 1) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

    // Garante vendor
    const { data: profile } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
    const storeName = (profile as { nome?: string } | null)?.nome || 'Loja KIYVO'
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).maybeSingle()
    if (!vendor) {
      await supabase.from('vendors').insert({ user_id: user.id, store_name: storeName, status: 'approved' })
    }

    const { data, error } = await supabase.from('products').insert({
      seller_id: user.id,
      title, slug, description, short_description,
      base_price: price, price, compare_at_price,
      category, image_url, images, tags,
      status: 'published', is_digital, instant_delivery,
      is_official: false,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, product: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
