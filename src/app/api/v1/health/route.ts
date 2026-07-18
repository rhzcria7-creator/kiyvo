// ─────────────────────────────────────────────────────────────
// API v1 Health — Health check do sistema
// Usado por monitoramento, load balancers e CI/CD
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logApiRequest } from '@/lib/observability'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  name: string
  status: 'up' | 'down' | 'degraded'
  latency_ms: number
  details?: string
}

/**
 * GET /api/v1/health
 * Retorna status de saúde do sistema
 * Não requer autenticação — endpoint público para monitoramento
 */
export async function GET() {
  const start = performance.now()
  const checks: HealthCheck[] = []

  // ─── Check: Supabase Database ───
  const dbStart = performance.now()
  try {
    const supabase = createClient()
    const { error } = await supabase.from('categories').select('id').limit(1)
    const latency = Math.round(performance.now() - dbStart)
    checks.push({
      name: 'supabase_db',
      status: error ? 'down' : 'up',
      latency_ms: latency,
      details: error?.message,
    })
  } catch (err) {
    checks.push({
      name: 'supabase_db',
      status: 'down',
      latency_ms: Math.round(performance.now() - dbStart),
      details: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }

  // ─── Check: Supabase Storage ───
  const storageStart = performance.now()
  try {
    const admin = createAdminClient()
    if (admin) {
      const { error } = await admin.storage.listBuckets()
      checks.push({
        name: 'supabase_storage',
        status: error ? 'down' : 'up',
        latency_ms: Math.round(performance.now() - storageStart),
        details: error?.message,
      })
    } else {
      checks.push({
        name: 'supabase_storage',
        status: 'degraded',
        latency_ms: Math.round(performance.now() - storageStart),
        details: 'Admin client não configurado',
      })
    }
  } catch (err) {
    checks.push({
      name: 'supabase_storage',
      status: 'down',
      latency_ms: Math.round(performance.now() - storageStart),
      details: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }

  // ─── Check: Stripe ───
  const stripeStart = performance.now()
  try {
    const { getStripeServer } = await import('@/lib/stripe/server')
    const stripe = getStripeServer()
    if (stripe) {
      // Faz uma chamada leve para verificar conectividade
      await stripe.balance.retrieve()
      checks.push({
        name: 'stripe',
        status: 'up',
        latency_ms: Math.round(performance.now() - stripeStart),
      })
    } else {
      checks.push({
        name: 'stripe',
        status: 'degraded',
        latency_ms: Math.round(performance.now() - stripeStart),
        details: 'Stripe não configurado',
      })
    }
  } catch (err) {
    checks.push({
      name: 'stripe',
      status: 'down',
      latency_ms: Math.round(performance.now() - stripeStart),
      details: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }

  // ─── Check: Memory ───
  const mem = process.memoryUsage()
  const memoryPercentage = Math.round((mem.heapUsed / mem.heapTotal) * 100)
  checks.push({
    name: 'memory',
    status: memoryPercentage > 90 ? 'down' : memoryPercentage > 70 ? 'degraded' : 'up',
    latency_ms: 0,
    details: `Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB (${memoryPercentage}%)`,
  })

  // ─── Status geral ───
  const downCount = checks.filter((c) => c.status === 'down').length
  const degradedCount = checks.filter((c) => c.status === 'degraded').length
  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
    downCount > 0 ? 'unhealthy' : degradedCount > 0 ? 'degraded' : 'healthy'

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  const totalLatency = Math.round(performance.now() - start)

  // Log da requisição
  logApiRequest({
    method: 'GET',
    path: '/api/v1/health',
    statusCode,
    duration: totalLatency,
  })

  return NextResponse.json(
    {
      status: overallStatus,
      version: '6.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.round(process.uptime()),
      total_latency_ms: totalLatency,
      checks,
    },
    { status: statusCode }
  )
}
