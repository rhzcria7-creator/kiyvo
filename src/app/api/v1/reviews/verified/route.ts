// v0.0.1 — Avaliações com compra e download verificados.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, getSafeAdminClient } from '@/lib/auth/server'
import { getReviewEligibility } from '@/lib/reviews/ReviewEligibilityService'

const createSchema = z.object({ productId: z.string().uuid(), rating: z.number().int().min(1).max(5), comment: z.string().trim().min(3).max(1500), photoPaths: z.array(z.string().regex(/^[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/i)).max(4).default([]) })
const replySchema = z.object({ reviewId: z.string().uuid(), reply: z.string().trim().min(3).max(1200) })

export async function GET(request: NextRequest) {
  const productId = new URL(request.url).searchParams.get('productId')
  if (!productId || !z.string().uuid().safeParse(productId).success) return NextResponse.json({ error: 'Produto inválido.' }, { status: 400 })
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ data: [] })
    const { data, error } = await admin.from('verified_reviews_v001').select('id,rating,comment,photo_paths,seller_reply,seller_replied_at,created_at').eq('product_id', productId).eq('status', 'published').order('created_at', { ascending: false }).limit(50)
    if (error) return NextResponse.json({ error: 'Não foi possível carregar avaliações.' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch { return NextResponse.json({ error: 'Não foi possível carregar avaliações.' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para avaliar.' }, { status: 401 })
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados da avaliação inválidos.' }, { status: 400 })
    const eligibility = await getReviewEligibility(user.id, parsed.data.productId)
    if (!eligibility.eligible || !eligibility.purchaseId) return NextResponse.json({ error: eligibility.reason }, { status: 403 })
    const admin = getSafeAdminClient(adminClient)
    const { data: review, error: insertError } = await admin.from('verified_reviews_v001').upsert({ product_id: parsed.data.productId, buyer_id: user.id, purchase_id: eligibility.purchaseId, rating: parsed.data.rating, comment: parsed.data.comment, photo_paths: parsed.data.photoPaths, status: 'published' }, { onConflict: 'product_id,buyer_id' }).select('id,rating,comment,photo_paths,created_at').single()
    if (insertError || !review) return NextResponse.json({ error: 'Não foi possível publicar sua avaliação.' }, { status: 500 })
    await admin.from('audit_logs_v001').insert({ actor_id: user.id, action: 'verified_review_created', target_type: 'review', target_id: review.id, metadata: { productId: parsed.data.productId, hasPhotos: parsed.data.photoPaths.length > 0 } })
    return NextResponse.json({ data: review }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Não foi possível publicar sua avaliação.' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para responder.' }, { status: 401 })
  try {
    const parsed = replySchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Resposta inválida.' }, { status: 400 })
    const admin = getSafeAdminClient(adminClient)
    const { data: review, error: reviewError } = await admin.from('verified_reviews_v001').select('product_id').eq('id', parsed.data.reviewId).maybeSingle()
    if (reviewError || !review) return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 })
    const { data: product } = await admin.from('products').select('vendor_id').eq('id', review.product_id).maybeSingle()
    const { data: vendor } = await admin.from('vendors').select('id').eq('id', product?.vendor_id ?? '').eq('user_id', user.id).maybeSingle()
    if (!vendor) return NextResponse.json({ error: 'Somente o vendedor pode responder.' }, { status: 403 })
    const { error: updateError } = await admin.from('verified_reviews_v001').update({ seller_reply: parsed.data.reply, seller_replied_at: new Date().toISOString() }).eq('id', parsed.data.reviewId)
    if (updateError) return NextResponse.json({ error: 'Não foi possível responder.' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Não foi possível responder.' }, { status: 500 }) }
}
