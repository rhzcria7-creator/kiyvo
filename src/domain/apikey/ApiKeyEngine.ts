// ─────────────────────────────────────────────────────────────
// API Key Engine v0.0.1 — Gerenciamento de chaves de API
// Geração, rotação, permissões, rate limiting por chave
// ─────────────────────────────────────────────────────────────
import { randomBytes, createHash } from 'crypto'

export type ApiKeyPermission = 'read:products' | 'write:products' | 'read:orders' | 'write:orders' | 'read:wallet' | 'write:withdraw' | 'admin'
export interface ApiKey { id: string; userId: string; name: string; keyPrefix: string; keyHash: string; permissions: ApiKeyPermission[]; lastUsedAt: string | null; expiresAt: string | null; isActive: boolean; createdAt: string }

export class ApiKeyEngine {
  generateKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
    const rawKey = `kyvo_${randomBytes(24).toString('hex')}`
    const keyPrefix = rawKey.slice(0, 10)
    return { rawKey, keyPrefix, keyHash: createHash('sha256').update(rawKey).digest('hex') }
  }
  create(params: { userId: string; name: string; permissions: ApiKeyPermission[]; expiresInDays?: number }): { apiKey: ApiKey; rawKey: string } {
    const { rawKey, keyPrefix, keyHash } = this.generateKey()
    return {
      apiKey: { id: `ak_${Date.now()}`, userId: params.userId, name: params.name, keyPrefix, keyHash, permissions: params.permissions, lastUsedAt: null, expiresAt: params.expiresInDays ? new Date(Date.now() + params.expiresInDays * 86400000).toISOString() : null, isActive: true, createdAt: new Date().toISOString() },
      rawKey,
    }
  }
  validateKey(rawKey: string, storedKeys: ApiKey[]): { valid: boolean; key?: ApiKey; reason?: string } {
    const hash = createHash('sha256').update(rawKey).digest('hex')
    const found = storedKeys.find(k => k.keyHash === hash && k.isActive)
    if (!found) return { valid: false, reason: 'Chave inválida ou inativa' }
    if (found.expiresAt && new Date(found.expiresAt) < new Date()) return { valid: false, reason: 'Chave expirada' }
    return { valid: true, key: found }
  }
  hasPermission(key: ApiKey, permission: ApiKeyPermission): boolean {
    return key.permissions.includes(permission) || key.permissions.includes('admin')
  }
}
export const apiKeyEngine = new ApiKeyEngine()
