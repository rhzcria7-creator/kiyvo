// v13.0 — backend real
// Download seguro: o token é validado e consumido de forma atômica antes do stream.

import { NextRequest, NextResponse } from 'next/server'
import { deliveryService } from '@/lib/delivery/DeliveryService'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ERROR_MESSAGES = {
  not_found: 'Link de download não encontrado.',
  expired: 'Este link de download expirou. Solicite um novo acesso ao vendedor.',
  revoked: 'Este acesso foi revogado.',
  limit_reached: 'O limite de downloads deste link foi atingido.',
  ip_mismatch: 'Este link está vinculado a outro dispositivo.',
  asset_missing: 'O arquivo não está disponível no momento.',
} as const

function safeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'download'
}

export async function GET(request: NextRequest, context: { params: { token: string } }) {
  try {
    const token = context.params.token
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) {
      return NextResponse.json({ error: 'Link de download inválido.' }, { status: 400 })
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const validation = await deliveryService.validateToken(token, ipAddress)
    if (!validation.valid) {
      return NextResponse.json({ error: ERROR_MESSAGES[validation.reason] }, { status: 403 })
    }

    // Consome antes de expor bytes, evitando concorrência em múltiplas abas.
    const consumed = await deliveryService.consumeToken(validation.record.id)
    if (!consumed) {
      return NextResponse.json({ error: 'Este download acabou de ser usado. Atualize a Biblioteca.' }, { status: 409 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Entrega temporariamente indisponível.' }, { status: 503 })
    }
    const { data, error } = await supabase.storage.from('delivery').download(validation.storagePath)
    if (error || !data) {
      return NextResponse.json({ error: 'Não foi possível preparar o arquivo agora.' }, { status: 502 })
    }

    return new NextResponse(data.stream(), {
      headers: {
        'Content-Type': validation.contentType,
        'Content-Disposition': `attachment; filename="${safeFileName(validation.fileName)}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Não foi possível liberar seu download. Tente novamente.' }, { status: 500 })
  }
}
