export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// GET/POST /api/admin/pix-settings
// Configura a chave PIX REAL do operador para receber dinheiro
// de verdade no modo demo/local (pagamento manual via PIX).
// Protegido por sessão de administrador (modo local).
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getSetting, setSetting, isLocalAdminByToken, listOrdersByStatus } from '@/lib/localdb'

function getToken(req: NextRequest): string | undefined {
  return req.cookies.get('kiyvo_session')?.value
}

export async function GET(req: NextRequest) {
  if (!isLocalAdminByToken(getToken(req))) {
    return NextResponse.json({ error: 'Acesso restrito ao administrador' }, { status: 401 })
  }

  try {
    const pending = listOrdersByStatus('pending_payment').map((o) => ({
      order_id: o.id,
      order_number: o.order_number,
      title: o.title,
      amount: Math.round((o.subtotal - o.discount_amount) * 100) / 100,
      created_at: o.created_at,
    }))

    return NextResponse.json({
      ok: true,
      pix_key: getSetting('pix_key'),
      pix_holder: getSetting('pix_holder'),
      pix_manual_enabled: Boolean(getSetting('pix_key') || process.env.KIYVO_PIX_KEY),
      pending_orders: pending,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao carregar' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isLocalAdminByToken(getToken(req))) {
    return NextResponse.json({ error: 'Acesso restrito ao administrador' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const pixKey = typeof body.pix_key === 'string' ? body.pix_key.trim() : ''
    const pixHolder = typeof body.pix_holder === 'string' ? body.pix_holder.trim() : ''

    // Validação leve: chave PIX não pode ser vazia se quiser ativar o PIX real.
    if (pixKey && !/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\+?\d{10,20}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^[A-Za-z0-9.\-]+$/.test(pixKey)) {
      return NextResponse.json({ error: 'Chave PIX inválida (use e-mail, CPF, telefone, EVP ou CNPJ)' }, { status: 400 })
    }

    setSetting('pix_key', pixKey)
    setSetting('pix_holder', pixHolder)

    return NextResponse.json({
      ok: true,
      pix_key: pixKey,
      pix_holder: pixHolder,
      pix_manual_enabled: Boolean(pixKey || process.env.KIYVO_PIX_KEY),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao salvar' }, { status: 500 })
  }
}
