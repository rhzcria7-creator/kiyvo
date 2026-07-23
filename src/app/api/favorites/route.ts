export const runtime = 'nodejs'
// Favorites (KD Points safe - lista de desejos em localStorage nao precisa de DB,
// mas sincroniza com Supabase se logado)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Usamos a coluna metadata de profiles pra armazenar favoritos (evita migration nova)
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ favorites: [] })
    const { data } = await supabase.from('profiles').select('metadata').eq('id', user.id).single()
    const md = (data?.metadata as Record<string, unknown> | null) || {}
    const favs = Array.isArray(md.favorites) ? md.favorites : []
    return NextResponse.json({ favorites: favs })
  } catch {
    return NextResponse.json({ favorites: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login necessário' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const productId = typeof body.product_id === 'string' ? body.product_id : null
    const action = body.action === 'remove' ? 'remove' : 'add'
    if (!productId) return NextResponse.json({ error: 'product_id obrigatório' }, { status: 400 })

    const { data } = await supabase.from('profiles').select('metadata').eq('id', user.id).single()
    const md: Record<string, unknown> = (data?.metadata as Record<string, unknown>) || {}
    const favs: string[] = Array.isArray(md.favorites) ? (md.favorites as string[]) : []

    let updated: string[]
    if (action === 'add') updated = favs.includes(productId) ? favs : [...favs, productId]
    else updated = favs.filter(id => id !== productId)

    await supabase.from('profiles').update({ metadata: { ...md, favorites: updated } }).eq('id', user.id)
    return NextResponse.json({ favorites: updated })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
