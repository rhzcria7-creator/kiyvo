// ─────────────────────────────────────────────────────────────
// API v1 Security Fraud — Detecção de fraude em tempo real
// Analisa padrões de compra, velocity, valor e comportamento
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

interface FraudSignals {
  velocityScore: number // 0-100 (0=safe, 100=danger)
  amountScore: number
  behaviorScore: number
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  recommendation: 'allow' | 'review' | 'block'
}

/**
 * POST /api/v1/security/fraud
 * Analisa uma transação ou comportamento para detectar fraude
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, product_id, vendor_id, payment_method, ip, user_agent } = body

    const signals: FraudSignals = {
      velocityScore: 0,
      amountScore: 0,
      behaviorScore: 0,
      overallRisk: 'low',
      flags: [],
      recommendation: 'allow',
    }

    // 1. Velocity check — quantas compras nas últimas 24h?
    const { data: recentOrders } = await admin
      .from('orders')
      .select('id, created_at, subtotal')
      .eq('buyer_id', user.id)
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())

    const orderCount = (recentOrders || []).length
    if (orderCount >= 10) {
      signals.velocityScore = 80
      signals.flags.push('ALTA_VELOCIDADE_COMPRA')
    } else if (orderCount >= 5) {
      signals.velocityScore = 40
      signals.flags.push('VELOCIDADE_MODERADA')
    }

    // 2. Amount check — valor incomum?
    if (amount > 1000) {
      signals.amountScore = 50
      signals.flags.push('ALTO_VALOR')
    } else if (amount > 500) {
      signals.amountScore = 20
      signals.flags.push('VALOR_ACIMA_MEDIA')
    }

    // 3. Total gasto nas últimas 24h
    const totalSpent = (recentOrders || []).reduce((sum: number, o: Record<string, unknown>) => sum + (Number(o.subtotal) || 0), 0)
    if (totalSpent + (amount || 0) > 2000) {
      signals.amountScore = Math.min(signals.amountScore + 30, 100)
      signals.flags.push('LIMITE_24H_EXCEDIDO')
    }

    // 4. Conta nova — criada há menos de 24h?
    const { data: profile } = await admin
      .from('profiles')
      .select('created_at, kyc_status, total_purchases')
      .eq('id', user.id)
      .single()

    if (profile) {
      const accountAge = Date.now() - new Date(profile.created_at).getTime()
      if (accountAge < 86400000) { // < 24h
        signals.behaviorScore += 30
        signals.flags.push('CONTA_NOVA')
      }

      // 5. Sem KYC e comprando valor alto
      if (profile.kyc_status !== 'approved' && amount > 200) {
        signals.behaviorScore += 20
        signals.flags.push('SEM_KYC_VALOR_ALTO')
      }

      // 6. Primeira compra com valor muito alto
      if ((profile.total_purchases || 0) === 0 && amount > 300) {
        signals.behaviorScore += 15
        signals.flags.push('PRIMEIRA_COMPRA_ALTA')
      }
    }

    // 7. Disputas anteriores
    const { data: disputes } = await admin
      .from('orders')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('status', 'in_dispute')

    if ((disputes || []).length >= 2) {
      signals.behaviorScore += 25
      signals.flags.push('MULTIPAS_DISPUTAS')
    }

    // 8. Mesmo vendedor — múltiplas compras seguidas?
    if (vendor_id) {
      const sameVendor = (recentOrders || []).filter(
        (o: Record<string, unknown>) => o.vendor_id === vendor_id
      )
      if (sameVendor.length >= 3) {
        signals.behaviorScore += 15
        signals.flags.push('COMPRAS_REPETIDAS_MESMO_VENDEDOR')
      }
    }

    // Calcular risk geral
    const totalScore = (signals.velocityScore + signals.amountScore + signals.behaviorScore) / 3

    if (totalScore >= 70) {
      signals.overallRisk = 'critical'
      signals.recommendation = 'block'
    } else if (totalScore >= 50) {
      signals.overallRisk = 'high'
      signals.recommendation = 'review'
    } else if (totalScore >= 25) {
      signals.overallRisk = 'medium'
      signals.recommendation = 'review'
    } else {
      signals.overallRisk = 'low'
      signals.recommendation = 'allow'
    }

    // Registrar análise
    await admin.from('security_events').insert({
      user_id: user.id,
      event_type: 'fraud_check',
      severity: signals.overallRisk,
      metadata: {
        amount,
        product_id,
        payment_method,
        ip,
        signals: signals.flags,
        score: totalScore,
        recommendation: signals.recommendation,
      },
    })

    return NextResponse.json({
      risk: signals.overallRisk,
      score: Math.round(totalScore),
      flags: signals.flags,
      recommendation: signals.recommendation,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro na análise de fraude'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
