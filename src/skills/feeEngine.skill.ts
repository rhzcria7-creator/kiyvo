// ─────────────────────────────────────────────────────────────
// FeeEngine Skill v0.0.1 — AG-KIT skill para motor de taxas
// Input: zod schema preco, nivel, metodo pagamento
// Output: json calculo completo
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'
import { FeeEngineV2, type SellerLevel } from '@/domain/fees/FeeEngineV2'

const feeInputSchema = z.object({
  price: z.number().positive('Preço deve ser positivo').max(999999, 'Preço máximo R$ 999.999'),
  sellerLevel: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'legend']).default('bronze'),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'boleto', 'crypto', 'kd_points', 'balance']).default('pix'),
  isFirstSale: z.boolean().default(false),
  hasAffiliate: z.boolean().default(false),
  affiliateRate: z.number().min(0).max(1).default(0.05),
})

const feeOutputSchema = z.object({
  grossAmount: z.number(),
  sellerFeePercent: z.number(),
  sellerFeeAmount: z.number(),
  paymentFeeAmount: z.number(),
  netAmount: z.number(),
  totalBuyerPays: z.number(),
  level: z.string(),
  breakdown: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    percent: z.number(),
    type: z.string(),
  })),
  nextLevel: z.string().nullable(),
  progressToNextLevel: z.number(),
})

export type FeeSkillInput = z.infer<typeof feeInputSchema>
export type FeeSkillOutput = z.infer<typeof feeOutputSchema>

const feeEngine = new FeeEngineV2()

export async function calculateFee(input: FeeSkillInput): Promise<FeeSkillOutput> {
  const validated = feeInputSchema.parse(input)
  const result = feeEngine.calculate(validated)
  return feeOutputSchema.parse({
    ...result,
    level: result.level,
    nextLevel: result.nextLevel,
  })
}

export async function simulateFees(price: number, sellerLevel: SellerLevel = 'bronze'): Promise<Record<string, FeeSkillOutput>> {
  const results = feeEngine.simulate(price, sellerLevel)
  const output: Record<string, FeeSkillOutput> = {}
  for (const [method, result] of Object.entries(results)) {
    output[method] = feeOutputSchema.parse({
      ...result,
      level: result.level,
      nextLevel: result.nextLevel,
    })
  }
  return output
}
