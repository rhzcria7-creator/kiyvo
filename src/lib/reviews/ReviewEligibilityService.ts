// v0.0.1 — Elegibilidade: avaliação só após compra ativa e entrega comprovada.
import { createAdminClient } from '@/lib/supabase/server'

export interface ReviewEligibility { eligible: boolean; purchaseId?: string; reason?: string }

export async function getReviewEligibility(userId: string, productId: string): Promise<ReviewEligibility> {
  const admin = createAdminClient()
  if (!admin) return { eligible: false, reason: 'Serviço de avaliações indisponível.' }
  const { data: purchase, error } = await admin.from('purchases').select('id,status').eq('buyer_id', userId).eq('product_id', productId).eq('status', 'active').order('purchased_at', { ascending: false }).limit(1).maybeSingle()
  if (error || !purchase) return { eligible: false, reason: 'Você precisa comprar este produto antes de avaliar.' }
  const { data: token, error: tokenError } = await admin.from('download_tokens').select('id').eq('purchase_id', purchase.id).gt('download_count', 0).limit(1).maybeSingle()
  if (tokenError || !token) return { eligible: false, reason: 'Baixe ou acesse o produto antes de avaliá-lo.' }
  return { eligible: true, purchaseId: String(purchase.id) }
}
