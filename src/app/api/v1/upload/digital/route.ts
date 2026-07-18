// ─────────────────────────────────────────────────────────────
// API v1 Upload Digital — Upload de arquivo digital (produto)
// Acesso restrito a vendedores autenticados
// Bucket: digital-files (private, signed URL only)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireVendor } from '@/lib/auth/server'
import { uploadDigitalFile } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireVendor()
    if (error || !user) {
      return NextResponse.json({ error: 'Acesso restrito a vendedores' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('product_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 })
    }

    const result = await uploadDigitalFile(file, productId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      path: result.path,
      message: 'Arquivo digital enviado com sucesso. Acesso apenas via signed URL após compra.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
