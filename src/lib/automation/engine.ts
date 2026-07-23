// ─────────────────────────────────────────────────────────────
// KIYVO Automation Engine
// Motor que TENTA automatizar TUDO: entrega, notificações,
// KD Points, afiliados, liberação de escrow, reembolso auto,
// moderação. Apenas casos profundos (disputas complexas, KYC,
// chargebacks, denúncias graves) sobem para humano.
// Inspirado em: Mercado Livre (auto-complete), Shopee (auto-release),
// Amazon (auto-delivery), GGMax (vault delivery).
// ─────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/server'

type Logger = (msg: string, meta?: Record<string, unknown>) => void
const noop: Logger = () => {}

export interface AutomationResult {
  ok: boolean
  actions: string[]
  errors: string[]
}

function admin() {
  const c = createAdminClient()
  if (!c) throw new Error('Admin client indisponível')
  return c
}

// ─── 1. ENTREGA AUTOMÁTICA INSTANTÂNEA ──────────────────────
// Chamada pelo webhook do Stripe após payment_intent.succeeded.
// 1) Reserva 1 asset do Cofre
// 2) Marca como vendido
// 3) Cria download_token
// 4) Marca order_item como delivered
// 5) Notifica comprador
// 6) Credita KD Points
export async function autoDeliverOrder(
  orderId: string,
  log: Logger = noop
): Promise<AutomationResult> {
  const sb = admin()
  const actions: string[] = []
  const errors: string[] = []

  try {
    // Buscar pedido com itens
    const { data: order, error: orderErr } = await sb
      .from('orders')
      .select('id, buyer_id, vendor_id, subtotal, status, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      errors.push(`Pedido não encontrado: ${orderErr?.message}`)
      return { ok: false, actions, errors }
    }

    const items = (order.order_items || []) as Array<Record<string, unknown>>

    for (const item of items) {
      const productId = item.product_id as string
      const orderItemId = item.id as string
      const deliveryType = (item.delivery_type as string) || 'auto'

      if (deliveryType !== 'auto') {
        log('Entrega manual — pulando item', { orderItemId })
        actions.push(`skipped_manual:${orderItemId}`)
        continue
      }

      // 1) Reservar próximo asset disponível
      const { data: asset, error: assetErr } = await sb
        .from('digital_inventory')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'available')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (assetErr || !asset) {
        // Sem estoque — notificar vendor + admin
        errors.push(`Sem estoque para produto ${productId}`)
        await sb.from('notifications').insert([
          {
            user_id: order.vendor_id,
            type: 'system',
            title: '⚠️ Produto sem estoque após venda',
            message: `Um pedido foi pago mas não há chaves no Cofre para o produto. Adicione estoque IMEDIATAMENTE.`,
            link: `/vender/inventario`,
          },
          {
            user_id: order.buyer_id,
            type: 'order',
            title: 'Produto em preparação',
            message: 'Seu produto está sendo preparado e será entregue em breve.',
            link: `/conta/compras/${orderId}`,
          },
        ])
        continue
      }

      // 2) Marcar como vendido (atômico via UPDATE com WHERE status='available')
      const { error: sellErr } = await sb
        .from('digital_inventory')
        .update({
          status: 'sold',
          sold_to_order_id: orderId,
          sold_to_order_item_id: orderItemId,
          sold_at: new Date().toISOString(),
        })
        .eq('id', asset.id)
        .eq('status', 'available')

      if (sellErr) {
        errors.push(`Falha ao vender asset ${asset.id}: ${sellErr.message}`)
        continue
      }

      // 3) Marcar order_item como delivered
      const { data: deliveredToken, error: tokenErr } = await sb
        .rpc('mark_order_item_delivered', {
          p_order_item_id: orderItemId,
          p_asset_type: asset.asset_type,
          p_delivery_url: null,
        })

      if (tokenErr) {
        errors.push(`Falha no token: ${tokenErr.message}`)
      } else {
        actions.push(`token_created:${deliveredToken}`)
      }

      // 4) Atualizar order para delivered se todos os itens entregues
      const { count: pending } = await sb
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId)
        .neq('delivery_status', 'delivered')

      if (!pending || pending === 0) {
        await sb
          .from('orders')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            auto_confirm_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', orderId)
        actions.push('order_delivered')
      }

      actions.push(`asset_sold:${asset.id}`)
      log('Asset entregue automaticamente', { assetId: asset.id, orderItemId })
    }

    // 6) Creditar KD Points (2 pontos por R$1)
    const kdPoints = Math.floor((Number(order.subtotal) || 0) * 2)
    if (kdPoints > 0) {
      await sb.from('kd_transactions').insert({
        user_id: order.buyer_id,
        amount: kdPoints,
        type: 'earned',
        description: `Compra #${orderId}`,
        reference_id: orderId,
      })
      // Campo legado kd_points → migrar para kd_points com fallback
      const { data: currProf } = await sb.from('profiles').select('kd_points').eq('id', order.buyer_id).single();
      const currPts = Number(currProf?.kd_points) || 0;
      await sb.from('profiles').update({ kd_points: currPts + kdPoints }).eq('id', order.buyer_id)
      actions.push(`kd_points:+${kdPoints}`)
    }

    // 7) Notificar comprador da entrega
    await sb.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'order',
      title: '✅ Produto entregue!',
      message: 'Seu produto está disponível na Biblioteca. Clique para ver.',
      link: `/buyer/library`,
    })

    return { ok: errors.length === 0, actions, errors }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'Erro desconhecido na automação')
    return { ok: false, actions, errors }
  }
}

// ─── 2. AUTO-CONFIRMAÇÃO DE PEDIDOS (7 DIAS) ────────────────
// Roda periodicamente (cron). Libera escrow para o vendor.
export async function autoConfirmExpiredOrders(
  log: Logger = noop
): Promise<AutomationResult> {
  const sb = admin()
  const actions: string[] = []
  const errors: string[] = []

  try {
    const { data: toConfirm, error } = await sb
      .rpc('auto_confirm_expired_orders')

    if (error) {
      errors.push(error.message)
    } else {
      actions.push(`auto_confirmed:${toConfirm ?? '?'} pedidos`)
    }

    // Pedidos confirmados → liberar escrow
    const { data: released } = await sb
      .from('orders')
      .select('id')
      .eq('status', 'confirmed')
      .is('escrow_released_at', null)
      .limit(50)

    for (const o of released || []) {
      const { error: rErr } = await sb.rpc('release_escrow_to_vendor', { p_order_id: o.id })
      if (rErr) errors.push(`escrow ${o.id}: ${rErr.message}`)
      else actions.push(`escrow_released:${o.id}`)
    }

    return { ok: errors.length === 0, actions, errors }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'Erro')
    return { ok: false, actions, errors }
  }
}

// ─── 3. AUTO-RESPOSTA SUPORTE (FAQ bot) ─────────────────────
const FAQ_PATTERNS: Array<{ keywords: RegExp; answer: string }> = [
  { keywords: /(pix|qr code|pagamento|pagar)/i, answer: 'O PIX é processado instantaneamente. Se o pedido ainda consta como pendente, aguarde até 2 minutos e atualize a página.' },
  { keywords: /(chave|key|código|entreg|produto|recebi)/i, answer: 'Produtos com entrega automática ficam disponíveis na Biblioteca (/buyer/library) logo após a confirmação do pagamento.' },
  { keywords: /(reembolso|devolu|cancelar)/i, answer: 'Você pode abrir uma disputa em até 7 dias após a entrega pelo menu Meus Pedidos.' },
  { keywords: /(senha|login|entrar|conta)/i, answer: 'Use "Esqueci minha senha" na página de login para redefinir sua senha com um link seguro enviado ao e-mail.' },
  { keywords: /(kd points?|pontos)/i, answer: 'A cada R$1,00 em compras você ganha 2 KD Points. 100 KD Points = R$1,00 de desconto em futuras compras (máx 50%).' },
]

export function autoReplySupport(message: string): string | null {
  const m = message.trim()
  if (m.length < 6) return null
  for (const p of FAQ_PATTERNS) {
    if (p.keywords.test(m)) return p.answer
  }
  return null
}

// ─── 4. AUTO-MODERAÇÃO DE AVALIAÇÕES ────────────────────────
const BANNED_PATTERNS = [
  /(https?:\/\/)/i,     // links
  /\b(vadia|puta|caralho|porra|filha da puta|fdp|cu)\b/i,
  /\b(nigger|faggot|retard)\b/i,
]

export function autoModerate(text: string): { approved: boolean; reason?: string } {
  if (!text) return { approved: false, reason: 'vazio' }
  for (const p of BANNED_PATTERNS) {
    if (p.test(text)) return { approved: false, reason: 'contém conteúdo proibido' }
  }
  if (text.length > 2000) return { approved: false, reason: 'muito longo' }
  return { approved: true }
}

// ─── 5. PONTOS DE FRAUDE (risk score) ───────────────────────
export interface FraudSignals {
  ipCountry?: string
  ipMismatch?: boolean        // IP ≠ país do billing
  velocity?: number           // pedidos / hora
  cardBinCountry?: string
  newAccount?: boolean
  emailAgeHours?: number
  amount: number
  hasChargebackHistory?: boolean
}

export function fraudScore(s: FraudSignals): { score: number; action: 'approve' | 'review' | 'block'; reason: string[] } {
  let score = 0
  const reason: string[] = []
  if (s.ipMismatch) { score += 30; reason.push('IP diferente do país do cartão') }
  if (s.velocity && s.velocity > 5) { score += 25; reason.push('alta velocidade de pedidos') }
  if (s.newAccount) { score += 15; reason.push('conta nova') }
  if (s.emailAgeHours !== undefined && s.emailAgeHours < 24) { score += 15; reason.push('e-mail novo') }
  if (s.hasChargebackHistory) { score += 50; reason.push('histórico de chargeback') }
  if (s.amount > 2000) { score += 10; reason.push('valor alto') }

  if (score >= 70) return { score, action: 'block', reason }
  if (score >= 35) return { score, action: 'review', reason }
  return { score, action: 'approve', reason }
}
