// v0.0.1 — Skill reutilizável de preço líquido do vendedor.
import { z } from 'zod'
import { calculateFee, type KiyvoSellerPlan } from '@/domain/fees/FeeEngine'
import type { Skill } from './contracts'

const plans = ['free', 'plus', 'pro', 'vendor_pro'] as const
const inputSchema = z.object({ plan: z.enum(plans), amount: z.number().finite().nonnegative(), salesCount: z.number().int().nonnegative() })
type Input = z.infer<typeof inputSchema>

export const feeEngineSkill: Skill<Input, ReturnType<typeof calculateFee>> = {
  name: 'fee-engine', description: 'Calcula comissão oficial sem teto e isenção por volume.', inputSchema,
  run: ({ plan, amount, salesCount }) => calculateFee(plan as KiyvoSellerPlan, amount, salesCount),
}
