export const runtime = 'nodejs'
// Reviews de produtos — GET e POST
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput, rateLimit } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product_id')
    if (!productId) return NextResponse.json({ error: 'product_id obrigatório' }, { status: 400 })
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id,rating,comment,created_at,buyer_id,profiles(nome,avatar_url,badges)')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return NextResponse.json({ reviews: [] })
    return NextResponse.json({ reviews: data || [] })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 5, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas avaliações. Aguarde.' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Entre para avaliar' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const productId = typeof body.product_id === 'string' ? body.product_id : ''
    const rating = Number(body.rating)
    const comment = typeof body.comment === 'string' ? sanitizeInput(body.comment).slice(0, 500) : ''

    if (!productId) return NextResponse.json({ error: 'Produto obrigatório' }, { status: 400 })
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Nota inválida (1-5)' }, { status: 400 })

    // Verifica se comprou (precisa ter order com payment_status='paid')
    const { data: orders } = await supabase.from('orders')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('product_id', productId)
      .in('payment_status', ['paid','succeeded','completed'])
      .limit(1)
    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Você só pode avaliar produtos que comprou' }, { status: 403 })
    }

    // Upsert
    const { data: existing } = await supabase.from('reviews')
      .select('id').eq('buyer_id', user.id).eq('product_id', productId).maybeSingle()
    let review
    if (existing) {
      const { data } = await supabase.from('reviews').update({ rating, comment }).eq('id', existing.id).select().single()
      review = data
    } else {
      const { data } = await supabase.from('reviews').insert({
        product_id: productId, buyer_id: user.id, order_id: orders[0].id, rating, comment, is_approved: true,
      }).select().single()
      review = data
    }
    return NextResponse.json({ ok: true, review })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
