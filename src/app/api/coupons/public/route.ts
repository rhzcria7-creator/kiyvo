export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// GET /api/coupons/public -> lista cupons ativos para visitantes
// (sem autenticacao) — ordenado por maior desconto percentual.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('coupons')
      .select('code,description,discount_type,discount_value,min_order_value,min_purchase,expires_at,valid_until,used_count,max_uses,first_purchase_only')
      .eq('is_active', true)
      .limit(50)

    if (error) {
      // Fallback seguro para nao quebrar pagina
      return NextResponse.json({ coupons: [] })
    }

    const filtered = (data || []).filter(c => {
      const exp = c.expires_at || c.valid_until
      if (exp && new Date(String(exp)) < new Date(now)) return false
      if (c.max_uses && Number(c.used_count||0) >= Number(c.max_uses)) return false
      return true
    })

    // Ordena: percentuais maiores primeiro, depois fixed maiores
    filtered.sort((a, b) => {
      const aVal = a.discount_type === 'percentage' ? Number(a.discount_value) : Number(a.discount_value)/10
      const bVal = b.discount_type === 'percentage' ? Number(b.discount_value) : Number(b.discount_value)/10
      return bVal - aVal
    })

    return NextResponse.json({ coupons: filtered })
  } catch {
    return NextResponse.json({ coupons: [] })
  }
}
