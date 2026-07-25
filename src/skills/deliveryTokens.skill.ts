// v0.0.1 — Skill de emissão de token de entrega.
import { z } from 'zod'
import { deliveryService } from '@/lib/delivery/DeliveryService'
import type { Skill } from './contracts'

const inputSchema = z.object({ purchaseId: z.string().uuid(), assetId: z.string().uuid().optional(), expiresInDays: z.number().int().min(1).max(30).optional(), maxDownloads: z.number().int().min(1).max(50).optional(), ipAddress: z.string().max(64).optional() })
type Input = z.infer<typeof inputSchema>

export const deliveryTokensSkill: Skill<Input, Awaited<ReturnType<typeof deliveryService.generateToken>>> = {
  name: 'delivery-tokens', description: 'Cria token de download com limite, expiração e vínculo opcional de IP.', inputSchema,
  run: (input) => deliveryService.generateToken(input),
}
