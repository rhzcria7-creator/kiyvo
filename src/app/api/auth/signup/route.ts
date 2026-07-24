export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup — Cadastro (funciona com LocalDB ou Supabase)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { isEmailAllowed, isPhoneValid, isCPFValid } from '@/lib/security/antiFraud'
import { validateEmail, validatePassword, validateFullName, validationError } from '@/lib/validation'
import { isSupabaseConfigured } from '@/lib/backend/detect'
import { createAdminClient } from '@/lib/supabase/server'
import { createUser as createUserLocal, createSession, findUserByEmail } from '@/lib/localdb'
import { getTeamMember } from '@/lib/badges'
import { AFFILIATE } from '@/lib/affiliates/constants'

const COOKIE_NAME = 'kiyvo_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const username = typeof body.username === 'string' ? body.username.trim() : (email.split('@')[0] || '')
    const referralCode = typeof body.referral_code === 'string' ? body.referral_code.trim().toUpperCase() : null
    const phone = typeof body.phone === 'string' ? body.phone : null
    const cpf = typeof body.cpf === 'string' ? body.cpf : null

    // Validações
    const errors: Record<string, string> = {}
    const e = validateEmail(email)
    if (!e.valid) Object.assign(errors, e.errors)
    const p = validatePassword(password)
    if (!p.valid) Object.assign(errors, p.errors)
    const n = validateFullName(full_name)
    if (!n.valid) Object.assign(errors, n.errors)

    // Anti-temp-mail
    if (e.valid) {
      const emailCheck = isEmailAllowed(email)
      if (!emailCheck.allowed) errors.email = emailCheck.reason || 'E-mail não permitido'
    }

    // Validação opcional de telefone/CPF se fornecidos
    if (phone) {
      const pc = isPhoneValid(phone)
      if (!pc.valid) errors.phone = pc.reason || 'Telefone inválido'
    }
    if (cpf) {
      const cc = isCPFValid(cpf)
      if (!cc.valid) errors.cpf = cc.reason || 'CPF inválido'
    }

    // Referral code formato
    if (referralCode && (referralCode.length < 3 || referralCode.length > 32 || !/^[A-Z0-9_-]+$/.test(referralCode))) {
      return NextResponse.json({ error: 'Código de indicação inválido' }, { status: 400 })
    }

    if (Object.keys(errors).length > 0) return validationError({ valid: false, errors })

    if (isSupabaseConfigured()) {
      // ── MODO SUPABASE ─────────────────────────────────
      const admin = createAdminClient()
      if (!admin) return NextResponse.json({ error: 'Backend indisponível' }, { status: 503 })

      // Verificar existência
      const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
      if (existing) return NextResponse.json({ error: 'Já existe uma conta com este e-mail' }, { status: 409 })

      const team = getTeamMember(email)
      const { data: authUser, error: createErr } = await admin.auth.admin.createUser({
        email, password,
        email_confirm: false,
        user_metadata: { full_name, username, role: team?.role ?? 'buyer', is_admin: !!team },
      })
      if (createErr || !authUser.user) {
        return NextResponse.json({ error: createErr?.message || 'Erro ao criar conta' }, { status: 400 })
      }

      const initialBadges: string[] = []
      if (team) initialBadges.push(team.role, 'verified')
      await admin.from('profiles').insert({
        id: authUser.user.id,
        email, full_name, username,
        role: team?.role ?? 'buyer',
        is_admin: !!team,
        badges: initialBadges,
        kd_points: referralCode ? 100 : 0,
        referred_by: referralCode,
        verification_status: team ? 'verified' : 'unverified',
      })

      // Criar sessão via sign-in
      const { createClient } = await import('@/lib/supabase/server')
      // Em vez de manipular supabase diretamente, retorna sucesso e deixa o cliente fazer login
      return NextResponse.json({
        ok: true,
        user: { id: authUser.user.id, email, full_name, role: team?.role ?? 'buyer' },
        referral_bonus: referralCode ? { discount_pct: AFFILIATE.refereeFirstBuyDiscountPct, code: referralCode } : null,
      })
    }

    // ── MODO LOCALDB ─────────────────────────────────────
    if (findUserByEmail(email)) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail' }, { status: 409 })
    }

    const user = createUserLocal({
      email,
      password,
      full_name,
      username,
      phone: phone || null,
      cpf: cpf || null,
      avatar_url: null,
      referred_by: referralCode,
    })

    const session = createSession(user.id, 30)

    const response = NextResponse.json({
      ok: true,
      user: sanitizeUser(user),
      referral_bonus: referralCode ? { discount_pct: AFFILIATE.refereeFirstBuyDiscountPct, code: referralCode } : null,
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

function sanitizeUser(u: { id: string; email: string; full_name: string; username: string; role: string; is_admin: boolean; avatar_url: string | null; badges: string[]; kd_points: number; referral_code: string; kd_points_pending?: number }) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    username: u.username,
    role: u.role,
    is_admin: u.is_admin,
    avatar_url: u.avatar_url,
    badges: u.badges,
    kd_points: u.kd_points,
    referral_code: u.referral_code,
  }
}
