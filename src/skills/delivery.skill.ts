// ─────────────────────────────────────────────────────────────
// Delivery Skill v0.0.1 — AG-KIT skill para entregas digitais
// Geração tokens, validação, licenças, download
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'
import { DeliveryService } from '@/lib/delivery/DeliveryService'

const createTokenSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  buyerId: z.string().min(1),
  ip: z.string().optional(),
  maxDownloads: z.number().int().min(1).max(5).default(5),
  expiryDays: z.number().int().min(1).max(30).default(7),
})

const validateTokenSchema = z.object({
  token: z.string().min(1),
  buyerId: z.string().min(1),
  ip: z.string().optional(),
})

const generateLicenseSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1),
  buyerId: z.string().min(1),
  hwid: z.string().optional(),
  ip: z.string().optional(),
})

export type CreateTokenInput = z.infer<typeof createTokenSchema>
export type ValidateTokenInput = z.infer<typeof validateTokenSchema>
export type GenerateLicenseInput = z.infer<typeof generateLicenseSchema>

const deliveryService = new DeliveryService()

export async function createDownloadToken(input: CreateTokenInput) {
  const validated = createTokenSchema.parse(input)
  return deliveryService.createDownloadToken(validated)
}

export async function validateDownload(input: ValidateTokenInput) {
  const validated = validateTokenSchema.parse(input)
  return deliveryService.validateDownload(validated.token, validated.buyerId, validated.ip)
}

export async function generateLicense(input: GenerateLicenseInput) {
  const validated = generateLicenseSchema.parse(input)
  return deliveryService.generateLicenseKey(validated)
}
