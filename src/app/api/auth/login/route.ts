export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────
// POST /api/auth/login — Login (funciona com LocalDB ou Supabase)
// Retorna cookie httpOnly de sessão
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { isSupabaseConfigured } from '@/lib/backend/detect'
import { findUserByEmail, verifyPassword, createSession, findUserById } from '@/lib/localdb'

const COOKIE_NAME = 'kiyvo_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      // Para modo Supabase, deixamos o cliente auth.signInWithPassword funcionar
      // (não interceptamos, apenas mantemos endpoint)
      return NextResponse.json({ error: 'Use o cliente Supabase' }, { status: 302 })
    }

    // ── MODO LOCALDB ─────────────────────────────────────
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }
    if (user.is_banned) {
      return NextResponse.json({ error: 'Conta suspensa. Contate o suporte.' }, { status: 403 })
    }
    if (!verifyPassword(user, password)) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const session = createSession(user.id, 30)
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        is_admin: user.is_admin,
        avatar_url: user.avatar_url,
        badges: user.badges,
        kd_points: user.kd_points,
        referral_code: user.referral_code,
        verification_status: user.verification_status,
        phone_verified: user.phone_verified,
        total_purchases: user.total_purchases,
        total_spent: user.total_spent,
        seller_plan: user.seller_plan,
        created_at: user.created_at,
      },
    })
    response.headers.set('Set-Cookie', serialize(COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    }))
    return response
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro interno' }, { status: 500 })
  }
}
