// v0.0.1 — Geração de licença aleatória; o hash deve ser armazenado, não o segredo bruto.
import { randomBytes, createHash } from 'crypto'
export type LicenseTier = 'personal' | 'commercial' | 'enterprise'
export interface GeneratedLicense { key: string; keyHash: string; tier: LicenseTier }
export function generateLicense(tier: LicenseTier): GeneratedLicense { const raw = randomBytes(18).toString('base64url').toUpperCase(); const key = `KYV-${tier.slice(0, 3).toUpperCase()}-${raw.match(/.{1,6}/g)?.join('-') ?? raw}`; return { key, keyHash: createHash('sha256').update(key).digest('hex'), tier } }
export function verifyLicense(key: string, storedHash: string): boolean { return createHash('sha256').update(key).digest('hex') === storedHash }
