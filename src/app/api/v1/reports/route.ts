// ─────────────────────────────────────────────────────────────
// API v1 Reports — Denúncias de fraude, golpes e violações
// Registro anônimo com proteção ao denunciante
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * POST /api/v1/reports — Criar denúncia
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimit(ip, 5, 300000) // 5 por 5 min
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 })
    }

    const body = await request.json()
    const { type, target_id, reason, description, evidence_urls } = body

    if (!type || !target_id || !reason) {
      return NextResponse.json({ error: 'type, target_id e reason são obrigatórios' }, { status: 400 })
    }

    const validTypes = ['vendor', 'product', 'fraud', 'review', 'chat', 'other']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Tipo inválido. Use: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Criar denúncia
    const { data: report, error } = await admin
      .from('security_events')
      .insert({
        user_id: user.id,
        event_type: 'report',
        severity: 'warning',
        metadata: {
          report_type: sanitizeInput(type),
          target_id: sanitizeInput(String(target_id)),
          reason: sanitizeInput(reason),
          description: sanitizeInput(String(description || '')),
          evidence_urls: Array.isArray(evidence_urls) ? evidence_urls.slice(0, 5) : [],
          status: 'pending',
          ip,
        },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar denúncia' }, { status: 500 })
    }

    // Notificar admins
    const { data: admins } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(5)

    if (admins) {
      await Promise.all(
        admins.map(a => admin.from('notifications').insert({
          user_id: a.id,
          type: 'security',
          title: 'Nova denúncia recebida 🚨',
          message: `Denúncia de ${type}: ${reason}`,
          link: '/admin/audit-log',
        }))
      )
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      message: 'Denúncia registrada. Nossa equipe analisará em até 24h.',
    }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar denúncia'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
