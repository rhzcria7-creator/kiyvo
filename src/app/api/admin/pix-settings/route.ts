// ─────────────────────────────────────────────────────────────
// Admin PIX Settings API v0.0.1 — Configurações PIX admin
// Chave PIX, taxa, QR code, etc
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET() {
  const supabase = getSupabaseClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('pix_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data || { pix_key: '', pix_type: 'cpf', fee_percent: 0.0099 })
  }

  return NextResponse.json({ pix_key: 'demo@kiyvo.com.br', pix_type: 'email', fee_percent: 0.0099 })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { pix_key, pix_type, fee_percent, min_amount, max_amount } = body

  if (supabase) {
    const { data, error } = await supabase
      .from('pix_settings')
      .insert({
        pix_key,
        pix_type: pix_type || 'cpf',
        fee_percent: fee_percent || 0.0099,
        min_amount: min_amount || 0.99,
        max_amount: max_amount || 50000,
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  return NextResponse.json({ success: true, data: { pix_key, pix_type } })
}
