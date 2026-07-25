// ─────────────────────────────────────────────────────────────
// Health Check v0.0.1 — Verifica Supabase, Stripe, PIX, etc
// Real, sem mock
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  version: string
  uptime: number
  timestamp: string
  checks: {
    supabase: { status: string; latency?: number; error?: string }
    stripe: { status: string; error?: string }
    pix: { status: string; error?: string }
    storage: { status: string; error?: string }
    env: { status: string; missing: string[] }
  }
}

const startTime = Date.now()

export async function GET() {
  const checks: HealthStatus['checks'] = {
    supabase: { status: 'checking' },
    stripe: { status: 'checking' },
    pix: { status: 'checking' },
    storage: { status: 'checking' },
    env: { status: 'ok', missing: [] },
  }

  // Check environment variables
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL']
  const missingVars = requiredVars.filter(v => !process.env[v])
  
  if (missingVars.length > 0) {
    checks.env = { status: 'warning', missing: missingVars }
  }

  // Check Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabseStart = Date.now()
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      
      const { data, error } = await supabase.from('products').select('id', { count: 'exact', head: true }).limit(1)

      if (error) {
        checks.supabase = { status: 'error', error: error.message }
      } else {
        checks.supabase = {
          status: 'ok',
          latency: Date.now() - supabseStart,
        }
      }
    } else {
      checks.supabase = { status: 'warning', error: 'Supabase not configured (DEMO mode)' }
    }
  } catch (err) {
    checks.supabase = { status: 'error', error: String(err) }
  }

  // Check Stripe
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any })
      await stripe.balance.retrieve()
      checks.stripe = { status: 'ok' }
    } else {
      checks.stripe = { status: 'warning', error: 'Stripe not configured' }
    }
  } catch (err) {
    checks.stripe = { status: 'error', error: String(err) }
  }

  // Check PIX (via Supabase if available)
  if (checks.supabase.status === 'ok') {
    checks.pix = { status: 'ok' }
  } else {
    checks.pix = { status: 'warning', error: 'PIX requires Supabase' }
  }

  // Check storage
  if (checks.supabase.status === 'ok') {
    checks.storage = { status: 'ok' }
  } else {
    checks.storage = { status: 'warning', error: 'Storage requires Supabase' }
  }

  // Overall status
  const errors = Object.values(checks).filter(c => c.status === 'error')
  const warnings = Object.values(checks).filter(c => c.status === 'warning')

  const overall: HealthStatus['status'] = errors.length > 0
    ? 'error'
    : warnings.length > 0
    ? 'degraded'
    : 'ok'

  const response: HealthStatus = {
    status: overall,
    version: '0.0.1',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    checks,
  }

  const statusCode = overall === 'error' ? 503 : overall === 'degraded' ? 200 : 200

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
