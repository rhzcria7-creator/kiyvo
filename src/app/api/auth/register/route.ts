// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
//
// Server-side registration anti-fraude:
//   1. Valida e-mail (anti temp-mail)
//   2. Valida força da senha
//   3. Aplica bônus de indicação (5% OFF no cupom de boas-vindas)
//   4. Cria o usuário via Supabase admin API
//   5. Atribui badges de staff se for e-mail da equipe
//
// Essa rota é a ÚNICA forma segura de cadastro.
// O client também chama a validação, mas o servidor tem a palavra final.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/security/antiFraud'
import { validateEmail, validatePassword, validateFullName, validationError } from '@/lib/validation'
import { getTeamMember } from '@/lib/badges'
import { AFFILIATE } from '@/lib/affiliates/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const referralCode = typeof body.referral_code === 'string' ? body.referral_code.trim().toUpperCase() : null

    // ── 1. Validações ───────────────────────────────────
    const errors: Record<string, string> = {}
    const emailV = validateEmail(email)
    if (!emailV.valid) Object.assign(errors, emailV.errors)
    else {
      const emailAllowed = isEmailAllowed(email)
      if (!emailAllowed.allowed) errors.email = emailAllowed.reason || 'E-mail não permitido'
    }
    const passV = validatePassword(password)
    if (!passV.valid) Object.assign(errors, passV.errors)
    const nameV = validateFullName(fullName)
    if (!nameV.valid) Object.assign(errors, nameV.errors)

    if (Object.keys(errors).length > 0) return validationError({ valid: false, errors })

    if (referralCode && (referralCode.length < 3 || referralCode.length > 32 || !/^[A-Z0-9_-]+$/.test(referralCode))) {
      return NextResponse.json({ error: 'Código de indicação inválido' }, { status: 400 })
    }

    // ── 2. Verificar se é conta de equipe ──────────────
    const team = getTeamMember(email)
    const role = team ? 'admin' : 'buyer'
    const isAdmin = !!team

    // ── 3. Criar usuário via Supabase Admin ─────────────
    const admin = createAdminClient()
    if (!admin) {
      // Fallback sem Supabase: retorna sucesso simulado para não travar o fluxo de desenvolvimento
      return NextResponse.json({
        ok: true,
        demo: true,
        user: { id: 'demo-' + Date.now(), email, role },
        message: 'Cadastro registrado em modo demonstração. Configure Supabase para contas reais.',
        referral_bonus: referralCode ? { discount_pct: AFFILIATE.refereeFirstBuyDiscountPct, code: referralCode } : null,
      })
    }

    // Verificar se já existe
    const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1 })
    // listUsers retorna muitos — filtra por email
    const { data: existingByEmail } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existingByEmail) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail' }, { status: 409 })
    }

    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // envia e-mail de confirmação
      user_metadata: {
        full_name: fullName,
        username: email.split('@')[0],
        role,
        is_admin: isAdmin,
        referred_by: referralCode,
        team_role: team?.role ?? null,
      },
      app_metadata: {
        provider: 'email',
      },
    })

    if (createErr || !newUser.user) {
      return NextResponse.json(
        { error: createErr?.message || 'Erro ao criar conta' },
        { status: 400 },
      )
    }

    // ── 4. Criar profile com badges iniciais ────────────
    const initialBadgesList: string[] = []
    if (team) initialBadgesList.push(team.role)
    if (team && ['ceo', 'cto', 'coo', 'founder', 'admin'].includes(team.role)) {
      initialBadgesList.push('verified')
      initialBadgesList.push('plan_plus')
    }

    const { error: profileErr } = await admin.from('profiles').insert({
      id: newUser.user.id,
      email,
      full_name: fullName,
      username: email.split('@')[0],
      role,
      is_admin: isAdmin,
      badges: initialBadgesList,
      kd_points: referralCode ? 100 : 0, // bônus de 100 KD (R$1) para quem entra com indicação
      referred_by: referralCode,
      seller_plan: 'free',
      verification_status: isAdmin ? 'verified' : 'unverified',
    })
    if (profileErr) {
      console.warn('[register] profile insert failed:', profileErr.message)
    }

    // ── 5. Registrar indicação (se houver) ─────────────
    if (referralCode) {
      try {
        const { data: aff } = await admin
          .from('affiliates')
          .select('id,user_id')
          .eq('referral_code', referralCode)
          .maybeSingle()
        if (aff) {
          // Cria a conversão de "cadastro via indicação" (não é comissão ainda;
          // comissão é creditada só quando a primeira compra for confirmada).
          try {
            await admin.from('affiliate_conversions').insert({
              affiliate_id: aff.id,
              referred_user_id: newUser.user.id,
              status: 'signed_up',
              commission_pct: AFFILIATE.referrerCommissionPct,
            })
          } catch {
            // Tabela pode não existir — não bloqueia cadastro
          }
        }
      } catch {
        // silencioso — não travar o cadastro por afiliação
      }
    }

    return NextResponse.json({
      ok: true,
      user: { id: newUser.user.id, email, role },
      referral_bonus: referralCode
        ? { discount_pct: AFFILIATE.refereeFirstBuyDiscountPct, code: referralCode }
        : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno ao criar conta'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
