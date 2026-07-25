// v0.0.1 — Importação de parceiros autorizados, sem scraping e com revisão humana.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, getSafeAdminClient } from '@/lib/auth/server'
import { askAgent } from '@/lib/agents/brain'

const itemSchema = z.object({
  externalId: z.string().max(160).optional(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(6000).optional(),
  price: z.number().finite().nonnegative().max(50000).optional(),
  currency: z.literal('BRL').default('BRL'),
  externalUrl: z.string().url().max(2000),
})
const importSchema = z.object({
  partnerName: z.string().trim().min(2).max(100),
  authorizationReference: z.string().trim().min(5).max(300),
  items: z.array(itemSchema).min(1).max(250),
})
const actionSchema = z.object({ importId: z.string().uuid(), action: z.enum(['submit_review', 'approve', 'reject']) })

function parseRewrite(response: string, fallback: string): string {
  const cleaned = response.replace(/^\s*["'`]|["'`]\s*$/g, '').trim()
  return cleaned.length >= 3 && cleaned.length <= 180 ? cleaned : fallback
}

export async function GET() {
  const { user, adminClient, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: error || 'Acesso restrito.' }, { status: 403 })
  try {
    const admin = getSafeAdminClient(adminClient)
    const { data, error: queryError } = await admin
      .from('partner_catalog_imports')
      .select('id,partner_name,authorization_reference,status,created_at,partner_catalog_items(count)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (queryError) return NextResponse.json({ error: 'Não foi possível carregar as importações.' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar as importações.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: error || 'Acesso restrito.' }, { status: 403 })
  try {
    const parsed = importSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados de importação inválidos.', details: parsed.error.flatten() }, { status: 400 })
    const admin = getSafeAdminClient(adminClient)
    const { data: importRow, error: insertError } = await admin
      .from('partner_catalog_imports')
      .insert({ partner_name: parsed.data.partnerName, authorization_reference: parsed.data.authorizationReference, imported_by: user.id, status: 'draft' })
      .select('id')
      .single()
    if (insertError || !importRow) return NextResponse.json({ error: 'Não foi possível criar o lote.' }, { status: 500 })

    const prepared = await Promise.all(parsed.data.items.map(async (item) => {
      const prompt = `Crie um título original em PT-BR, com no máximo 180 caracteres, para uma listagem de parceiro autorizado. Não alegue autoria, não mencione marca concorrente e não invente benefícios. Produto: ${item.title}`
      let displayTitle = item.title
      try { displayTitle = parseRewrite(askAgent('copywriter', prompt).texto, item.title) } catch { displayTitle = item.title }
      return { import_id: importRow.id, external_id: item.externalId ?? null, original_title: item.title, display_title: displayTitle, external_url: item.externalUrl, price: item.price ?? null, currency: item.currency, status: 'draft' }
    }))
    const { error: itemsError } = await admin.from('partner_catalog_items').insert(prepared)
    if (itemsError) return NextResponse.json({ error: 'Lote criado, mas itens não foram salvos.' }, { status: 500 })
    await admin.from('audit_logs_v001').insert({ actor_id: user.id, action: 'partner_import_created', target_type: 'partner_catalog_import', target_id: importRow.id, metadata: { count: prepared.length, partner: parsed.data.partnerName } })
    return NextResponse.json({ id: importRow.id, status: 'draft', itemCount: prepared.length }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Não foi possível processar a importação.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { user, adminClient, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: error || 'Acesso restrito.' }, { status: 403 })
  try {
    const parsed = actionSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
    const status = parsed.data.action === 'submit_review' ? 'review' : parsed.data.action === 'approve' ? 'approved' : 'rejected'
    const admin = getSafeAdminClient(adminClient)
    const { error: updateError } = await admin.from('partner_catalog_imports').update({ status }).eq('id', parsed.data.importId)
    if (updateError) return NextResponse.json({ error: 'Não foi possível atualizar o lote.' }, { status: 500 })
    await admin.from('audit_logs_v001').insert({ actor_id: user.id, action: `partner_import_${status}`, target_type: 'partner_catalog_import', target_id: parsed.data.importId })
    return NextResponse.json({ status })
  } catch {
    return NextResponse.json({ error: 'Não foi possível atualizar o lote.' }, { status: 500 })
  }
}
