export const runtime = 'nodejs'
// PATCH /api/seller/profile — atualiza foto, banner, bio e tags da loja do vendedor.
import { NextRequest, NextResponse } from 'next/server'
import { findSession, findUserById, updateSellerProfile } from '@/lib/localdb'

const COOKIE_NAME = 'kiyvo_session'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
    const session = findSession(token)
    if (!session) return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 })
    const user = findUserById(session.user_id)
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const patch: { avatar_url?: string | null; banner_url?: string | null; bio?: string | null; tags?: string[] } = {}

    if (typeof body.avatar_url === 'string') patch.avatar_url = body.avatar_url.slice(0, 5000)
    if (typeof body.banner_url === 'string') patch.banner_url = body.banner_url.slice(0, 5000)
    if (typeof body.bio === 'string') patch.bio = body.bio.slice(0, 500)
    if (Array.isArray(body.tags)) {
      patch.tags = body.tags
        .map((t: unknown) => String(t).trim())
        .filter(Boolean)
        .slice(0, 12)
    }

    const updated = updateSellerProfile(user.id, patch)
    if (!updated) return NextResponse.json({ error: 'Não foi possível atualizar.' }, { status: 500 })

    return NextResponse.json({
      ok: true,
      user: {
        avatar_url: updated.avatar_url,
        banner_url: updated.banner_url,
        bio: updated.bio,
        tags: updated.tags,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno ao salvar o perfil.' }, { status: 500 })
  }
}
