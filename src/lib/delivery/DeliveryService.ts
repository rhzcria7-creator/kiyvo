// v13.0 — backend real
// Serviço de entrega com tokens de uso único lógico e Supabase Storage privado.

import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

const TOKEN_BYTES = 32
const DEFAULT_EXPIRY_DAYS = 7
const DEFAULT_MAX_DOWNLOADS = 5

export interface DeliveryTokenInput {
  purchaseId: string
  assetId?: string
  expiresInDays?: number
  maxDownloads?: number
  ipAddress?: string
}

export interface DeliveryTokenRecord {
  id: string
  purchaseId: string
  assetId: string | null
  token: string
  expiresAt: string
  maxDownloads: number
  downloadCount: number
  ipAddress: string | null
  revokedAt: string | null
}

export type DeliveryValidation =
  | { valid: true; record: DeliveryTokenRecord; storagePath: string; fileName: string; contentType: string }
  | { valid: false; reason: 'not_found' | 'expired' | 'revoked' | 'limit_reached' | 'ip_mismatch' | 'asset_missing' }

function configuredAdmin() {
  return createAdminClient()
}

function mapRecord(row: Record<string, unknown>): DeliveryTokenRecord {
  return {
    id: String(row.id),
    purchaseId: String(row.purchase_id),
    assetId: row.delivery_asset_id ? String(row.delivery_asset_id) : null,
    token: String(row.token),
    expiresAt: String(row.expires_at),
    maxDownloads: Number(row.max_downloads),
    downloadCount: Number(row.download_count),
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
  }
}

export class DeliveryService {
  async generateToken(input: DeliveryTokenInput): Promise<DeliveryTokenRecord | null> {
    const supabase = configuredAdmin()
    if (!supabase) return null

    const expiresAt = new Date(Date.now() + (input.expiresInDays ?? DEFAULT_EXPIRY_DAYS) * 86_400_000).toISOString()
    const token = randomBytes(TOKEN_BYTES).toString('base64url')
    const { data, error } = await supabase
      .from('download_tokens')
      .insert({
        purchase_id: input.purchaseId,
        delivery_asset_id: input.assetId ?? null,
        token,
        expires_at: expiresAt,
        max_downloads: input.maxDownloads ?? DEFAULT_MAX_DOWNLOADS,
        ip_address: input.ipAddress ?? null,
      })
      .select('id,purchase_id,delivery_asset_id,token,expires_at,max_downloads,download_count,ip_address,revoked_at')
      .single()

    if (error || !data) return null
    return mapRecord(data as Record<string, unknown>)
  }

  async validateToken(token: string, ipAddress?: string): Promise<DeliveryValidation> {
    const supabase = configuredAdmin()
    if (!supabase) return { valid: false, reason: 'not_found' }

    const { data, error } = await supabase
      .from('download_tokens')
      .select('id,purchase_id,delivery_asset_id,token,expires_at,max_downloads,download_count,ip_address,revoked_at')
      .eq('token', token)
      .maybeSingle()
    if (error || !data) return { valid: false, reason: 'not_found' }

    const record = mapRecord(data as Record<string, unknown>)
    if (record.revokedAt) return { valid: false, reason: 'revoked' }
    if (new Date(record.expiresAt).getTime() <= Date.now()) return { valid: false, reason: 'expired' }
    if (record.downloadCount >= record.maxDownloads) return { valid: false, reason: 'limit_reached' }
    if (record.ipAddress && ipAddress && record.ipAddress !== ipAddress) return { valid: false, reason: 'ip_mismatch' }

    const { data: asset, error: assetError } = await supabase
      .from('delivery_assets')
      .select('storage_path,file_name,content_type')
      .eq('id', record.assetId)
      .maybeSingle()
    if (assetError || !asset) return { valid: false, reason: 'asset_missing' }

    return {
      valid: true,
      record,
      storagePath: String(asset.storage_path),
      fileName: String(asset.file_name || 'download'),
      contentType: String(asset.content_type || 'application/octet-stream'),
    }
  }

  async consumeToken(id: string): Promise<boolean> {
    const supabase = configuredAdmin()
    if (!supabase) return false
    const { error } = await supabase.rpc('consume_download_token', { p_token_id: id })
    return !error
  }

  async revokePurchaseTokens(purchaseId: string): Promise<boolean> {
    const supabase = configuredAdmin()
    if (!supabase) return false
    const { error } = await supabase
      .from('download_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('purchase_id', purchaseId)
      .is('revoked_at', null)
    return !error
  }
}

export const deliveryService = new DeliveryService()
