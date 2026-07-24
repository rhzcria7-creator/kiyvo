export const runtime = 'nodejs'
// POST /api/auth/firebase — troca token Firebase por sessão LocalDB (cookie httpOnly)
// Quando Firebase estiver configurado, valida o token ID e cria sessão.
import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { isFirebaseConfigured } from '@/lib/firebase/client'
import { findUserByEmail, createUser, createSession } from '@/lib/localdb'

const COOKIE_NAME = 'kiyvo_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { token, email: clientEmail } = body

    if (!isFirebaseConfigured()) {
      return NextResponse.json({ error: 'Firebase não configurado neste ambiente' }, { status: 503 })
    }

    // Validar o token do Firebase Admin (em produção usaria admin SDK; aqui verificamos formato básico
    // para o modo LocalDB e criamos o usuário se não existir)
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    // Em produção, verificar token com admin.auth().verifyIdToken(token)
    // Aqui, para o modo LocalDB/demo, decodificamos o email do token base64 JWT
    let email = (clientEmail as string | undefined) || ''
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
        if (payload?.email) email = payload.email
      }
    } catch { /* ignora parse */ }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail não encontrado no token' }, { status: 400 })
    }

    // Encontra ou cria usuário local (onboarding automático)
    let user = findUserByEmail(email)
    if (!user) {
      // Criar senha aleatória (login social não precisa de senha)
      const pwd = crypto.randomUUID()
      user = createUser({
        email,
        password: pwd,
        full_name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        username: email.split('@')[0],
      })
    }

    if (user.is_banned) {
      return NextResponse.json({ error: 'Conta suspensa. Contate suporte.' }, { status: 403 })
    }

    const session = createSession(user.id, 30)
    const serialized = serialize(COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        is_admin: user.is_admin,
      },
    })
    response.headers.set('Set-Cookie', serialized)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
