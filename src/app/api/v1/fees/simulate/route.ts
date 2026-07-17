// ─────────────────────────────────────────────────────────────
// API v1 — Fee Simulation Endpoint
// POST /api/v1/fees/simulate — Simula taxas para um preço
// GET  /api/v1/fees/simulate?price=29.90 — Versão GET
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { FeeEngine, type SellerPlan, type PaymentMethod } from '@/domain/fees/FeeEngine'
import { sanitizeInput } from '@/lib/security'

const feeEngine = new FeeEngine()

const validPaymentMethods: PaymentMethod[] = ['pix', 'credit_card', 'debit_card', 'boleto']
const validSellerPlans: SellerPlan[] = ['free', 'starter', 'pro', 'business', 'enterprise']

// GET /api/v1/fees/simulate
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const price = parseFloat(searchParams.get('price') || '0')
  const sellerPlan = (searchParams.get('seller_plan') || 'free') as SellerPlan
  const paymentMethod = (searchParams.get('payment_method') || 'pix') as PaymentMethod
  const hasAffiliate = searchParams.get('has_affiliate') === 'true'

  // Validações
  if (!price || price <= 0 || price > 100000) {
    return NextResponse.json({ error: 'Preço inválido. Use valor entre R$0.01 e R$100.000' }, { status: 400 })
  }

  if (!validSellerPlans.includes(sellerPlan)) {
    return NextResponse.json({ error: 'Plano inválido. Opções: free, starter, pro, business, enterprise' }, { status: 400 })
  }

  if (!validPaymentMethods.includes(paymentMethod)) {
    return NextResponse.json({ error: 'Método de pagamento inválido. Opções: pix, credit_card, debit_card, boleto' }, { status: 400 })
  }

  // Calcular taxas
  const calculation = feeEngine.calculate({
    price,
    sellerPlan,
    paymentMethod,
    hasAffiliate,
  })

  // Calcular para todos os métodos de pagamento
  const allMethods: Record<string, unknown> = {}
  for (const method of validPaymentMethods) {
    allMethods[method] = feeEngine.calculate({
      price,
      sellerPlan,
      paymentMethod: method,
      hasAffiliate,
    })
  }

  // Calcular preço reverso (quanto cobrar para receber X)
  const reverseCalc = feeEngine.reverseCalculate(price, sellerPlan, paymentMethod, hasAffiliate)

  return NextResponse.json({
    price,
    sellerPlan,
    paymentMethod,
    hasAffiliate,
    calculation,
    allMethods,
    reverseCalculate: {
      desiredNetAmount: price,
      suggestedPrice: reverseCalc.suggestedPrice,
    },
  })
}

// POST /api/v1/fees/simulate
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { price, seller_plan, payment_method, has_affiliate } = body

    if (!price || typeof price !== 'number' || price <= 0 || price > 100000) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    }

    const sellerPlan = (seller_plan || 'free') as SellerPlan
    const paymentMethod = (payment_method || 'pix') as PaymentMethod

    if (!validSellerPlans.includes(sellerPlan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 })
    }

    const calculation = feeEngine.calculate({
      price,
      sellerPlan,
      paymentMethod,
      hasAffiliate: !!has_affiliate,
    })

    return NextResponse.json({ calculation })
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}
