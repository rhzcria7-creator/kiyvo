// ─────────────────────────────────────────────────────────────
// API v1 Security Device — Fingerprint e device trust
// Rastreamento de dispositivos para anti-multi-conta e segurança
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * POST /api/v1/security/device
 * Registra e verifica fingerprint de dispositivo
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimit(ip, 10, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 })
    }

    const body = await request.json()
    const { fingerprint, user_agent, screen_resolution, timezone, language, platform } = body

    if (!fingerprint) {
      return NextResponse.json({ error: 'fingerprint é obrigatório' }, { status: 400 })
    }

    // Verificar se este fingerprint já foi usado por outro usuário
    const { data: existingDevices } = await admin
      .from('security_events')
      .select('user_id, created_at')
      .eq('event_type', 'device_register')
      .contains('metadata', { fingerprint })
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const isSharedDevice = (existingDevices || []).length > 0
    const sharedWithUsers = (existingDevices || []).map(d => d.user_id)

    // Registrar este dispositivo
    await admin.from('security_events').insert({
      user_id: user.id,
      event_type: 'device_register',
      severity: isSharedDevice ? 'warning' : 'info',
      metadata: {
        fingerprint,
        user_agent,
        screen_resolution,
        timezone,
        language,
        platform,
        ip,
        is_shared: isSharedDevice,
        shared_with: sharedWithUsers,
      },
    })

    // Verificar quantos dispositivos este usuário já usou
    const { data: userDevices } = await admin
      .from('security_events')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('event_type', 'device_register')
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

    const uniqueDevices = new Set(
      (userDevices || []).map(d => (d.metadata as Record<string, unknown>)?.fingerprint as string).filter(Boolean)
    )

    const trustLevel = isSharedDevice ? 'low' : uniqueDevices.size > 5 ? 'medium' : 'high'

    return NextResponse.json({
      trusted: trustLevel === 'high',
      trust_level: trustLevel,
      is_shared_device: isSharedDevice,
      devices_count: uniqueDevices.size,
      recommendation: isSharedDevice ? 'Verificar se é o mesmo usuário em múltiplas contas' : 'Dispositivo confiável',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar dispositivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
