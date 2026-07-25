// ─────────────────────────────────────────────────────────────
// Magic Link Auth API v0.0.1 — Login sem senha
// Gera link mágico, valida token, autentica usuário
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MagicLinkEngine } from '@/domain/magiclink/MagicLinkEngine'

const magicLinkEngine = new MagicLinkEngine()

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, action, token } = body

    if (action === 'send') {
      // Rate limit check
      const rateCheck = magicLinkEngine.checkRateLimit(email)
      if (!rateCheck.allowed) {
        return NextResponse.json({ error: rateCheck.reason }, { status: 429 })
      }

      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      const userAgent = request.headers.get('user-agent') || ''

      // Criar magic link
      const magicLink = magicLinkEngine.create({ email, ip, userAgent })
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const loginLink = magicLinkEngine.generateLoginLink(baseUrl, magicLink.token, email)

      // Salvar no Supabase
      const supabase = getSupabase()
      if (supabase) {
        await supabase.from('magic_links').insert({
          token: magicLinkEngine.hashToken(magicLink.token),
          email: magicLink.email,
          expires_at: magicLink.expiresAt,
          ip,
          user_agent: userAgent,
        })
      }

      // Enviar email via Resend
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'KIYVO <noreply@kiyvo.com.br>',
              to: email,
              subject: 'Seu link mágico KIYVO',
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h1 style="font-size: 24px; color: #0f172a;">Acesse sua conta KIYVO</h1>
                  <p style="color: #475569;">Clique no botão abaixo para entrar. Este link expira em 15 minutos.</p>
                  <a href="${loginLink}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">
                    Entrar no KIYVO
                  </a>
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Se você não solicitou este email, ignore-o.</p>
                </div>
              `,
            }),
          })
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: 'Link mágico enviado para seu email',
        // Em produção: NÃO retornar o link
        debug_link: process.env.NODE_ENV === 'development' ? loginLink : undefined,
      })
    }

    if (action === 'verify') {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      const validation = magicLinkEngine.validateToken(token, email, ip)

      if (!validation.valid) {
        return NextResponse.json({ error: validation.reason || 'Token inválido' }, { status: 400 })
      }

      // Verificar no Supabase
      const supabase = getSupabase()
      if (supabase) {
        const hashedToken = magicLinkEngine.hashToken(token)
        const { data: link } = await supabase
          .from('magic_links')
          .select('*')
          .eq('token', hashedToken)
          .eq('email', email.toLowerCase().trim())
          .eq('used', false)
          .single()

        if (!link) {
          return NextResponse.json({ error: 'Link inválido ou já utilizado' }, { status: 400 })
        }

        if (new Date(link.expires_at) < new Date()) {
          return NextResponse.json({ error: 'Link expirado' }, { status: 410 })
        }

        // Marcar como usado
        await supabase.from('magic_links').update({ used: true, used_at: new Date().toISOString() }).eq('id', link.id)

        // Fazer login do usuário
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
          email: email.toLowerCase().trim(),
          options: { shouldCreateUser: true },
        })

        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, session: authData.session })
      }

      return NextResponse.json({ success: true, message: 'Login verificado' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Magic link error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
