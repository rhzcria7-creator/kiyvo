export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────
// POST /api/v1/security/ai-scan
//
// Recebe uma imagem via FormData (campo "file") e roda o heurístico
// de detecção de IA. Se for suspeita, adiciona uma flag
// `ai_suspected: true` ao produto em vez de remover — o moderador
// revisa em /admin/verificacoes.
//
// Retorna: { score, suspicious, veryLikely, reasons, contentWarning }
//
// Em produção isso seria conectado a um modelo ML real, mas o heurístico
// já filtra os casos mais óbvios (EXIF Stable Diffusion / Midjourney,
// dimensões padrão, etc.).
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { detectAIGeneratedContent, moderateDescriptionText } from '@/lib/security/antiFraud'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const description = typeof formData.get('description') === 'string'
      ? String(formData.get('description'))
      : ''

    const result: {
      aiImage?: { score: number; suspicious: boolean; veryLikely: boolean; reasons: string[] }
      textModeration?: ReturnType<typeof moderateDescriptionText>
    } = {}

    if (file instanceof File) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx 8MB)' }, { status: 413 })
      }
      const buffer = await file.arrayBuffer()
      result.aiImage = await detectAIGeneratedContent(buffer, file.name)
    }

    if (description) {
      result.textModeration = moderateDescriptionText(description)
    }

    // Conteúdo que menciona contato externo é bloqueado de cara
    if (result.textModeration?.blocked) {
      return NextResponse.json({
        allowed: false,
        ...result,
        contentWarning: 'A descrição do produto não pode conter contatos externos (WhatsApp, telefone, etc). Tudo deve ser resolvido dentro da KIYVO.',
      }, { status: 422 })
    }

    // Imagem muito provável de IA → sinaliza mas não bloqueia (apenas marca)
    const contentWarning = result.aiImage?.veryLikely
      ? 'A imagem parece ter sido gerada por IA. O produto será sinalizado para revisão manual antes da publicação.'
      : result.aiImage?.suspicious
        ? 'A imagem foi marcada para revisão (suspeita de geração por IA).'
        : null

    return NextResponse.json({
      allowed: true,
      ...result,
      contentWarning,
      // Quando veryLikely, o produto é listado mas com badge "Em análise"
      requiresReview: result.aiImage?.veryLikely ?? false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao analisar arquivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
