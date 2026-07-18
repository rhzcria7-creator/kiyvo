// ─────────────────────────────────────────────────────────────
// API v1 Admin Rate Limits — Gerencia bloqueios e rate limits
// Acesso restrito a administradores
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/server'
import { getBlockedIdentifiers, unblockIdentifier, cleanupExpiredRateLimits } from '@/lib/rate-limit'

/**
 * GET /api/v1/admin/rate-limits — Lista identifiers bloqueados
 */
export async function GET() {
  try {
    const { user, error } = await requireAdmin()
    if (error || !user) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const blocked = await getBlockedIdentifiers()

    return NextResponse.json({
      blocked,
      total: blocked.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/admin/rate-limits — Desbloqueia identifier
 * Body: { identifier: string, action: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin()
    if (error || !user) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const body = await request.json()
    const { identifier, action } = body

    if (!identifier || !action) {
      return NextResponse.json({ error: 'identifier e action são obrigatórios' }, { status: 400 })
    }

    const success = await unblockIdentifier(identifier, action)

    if (!success) {
      return NextResponse.json({ error: 'Erro ao desbloquear' }, { status: 500 })
    }

    // Audit log
    const admin = createAdminClient()
    if (admin) {
      await admin.from('audit_log').insert({
        user_id: user.id,
        action: 'rate_limit_unblock',
        resource: `rate_limit:${identifier}:${action}`,
        severity: 'warning',
        metadata: { identifier, action },
      })
    }

    return NextResponse.json({ success: true, message: 'Identifier desbloqueado' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/v1/admin/rate-limits — Limpa entradas expiradas
 */
export async function POST() {
  try {
    const { user, error } = await requireAdmin()
    if (error || !user) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const deletedCount = await cleanupExpiredRateLimits()

    return NextResponse.json({
      success: true,
      deletedEntries: deletedCount,
      message: `${deletedCount} entradas expiradas removidas`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Helper para obter admin client
import { createAdminClient } from '@/lib/supabase/server'
