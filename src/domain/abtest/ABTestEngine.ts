// ─────────────────────────────────────────────────────────────
// A/B Test Engine v0.0.1 — Feature flags com experimentos
// Variantes A/B, métricas, winner automático
// ─────────────────────────────────────────────────────────────

export interface ABTest {
  id: string
  name: string
  description: string
  key: string // Feature flag key
  variants: ABVariant[]
  status: 'draft' | 'running' | 'paused' | 'completed'
  trafficPercent: number // 0-100
  winnerVariantId: string | null
  startedAt: string
  endedAt: string | null
  minSampleSize: number
  confidence: number // 0-1
}

export interface ABVariant {
  id: string
  name: string
  trafficSplit: number // 0-100, sum across variants = 100
  config: Record<string, unknown>
  impressions: number
  conversions: number
  conversionRate: number
  revenue: number
}

export interface FeatureFlag {
  key: string
  enabled: boolean
  rules: FlagRule[]
  defaultValue: boolean
}

export type FlagRule = {
  type: 'percentage' | 'user_id' | 'country' | 'plan' | 'custom'
  value: string | number
}

export class ABTestEngine {
  /**
   * Atribui variante para um usuário
   */
  assignVariant(test: ABTest, userId: string): ABVariant {
    const hash = this.hashUserId(userId, test.id)
    const normalized = hash % 100

    let cumulative = 0
    for (const variant of test.variants) {
      cumulative += variant.trafficSplit
      if (normalized < cumulative) return variant
    }

    return test.variants[test.variants.length - 1]
  }

  /**
   * Calcula conversão de variante
   */
  calculateConversion(variant: ABVariant): number {
    if (variant.impressions === 0) return 0
    return Math.round((variant.conversions / variant.impressions) * 10000) / 100
  }

  /**
   * Verifica se teste tem significância estatística
   */
  hasSignificance(test: ABTest): { significant: boolean; winner?: ABVariant } {
    const control = test.variants[0]
    const treatments = test.variants.slice(1)

    for (const treatment of treatments) {
      if (treatment.impressions < test.minSampleSize) continue

      const controlRate = this.calculateConversion(control)
      const treatmentRate = this.calculateConversion(treatment)

      if (treatmentRate > controlRate && treatment.impressions >= test.minSampleSize) {
        return { significant: true, winner: treatment }
      }
    }

    return { significant: false }
  }

  /**
   * Hash simples para distribuição consistente
   */
  private hashUserId(userId: string, testId: string): number {
    const str = `${userId}:${testId}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  /**
   * Verifica feature flag para um usuário
   */
  checkFeatureFlag(flag: FeatureFlag, userId?: string, country?: string, plan?: string): boolean {
    if (!flag.enabled) return flag.defaultValue

    for (const rule of flag.rules) {
      switch (rule.type) {
        case 'percentage':
          if (userId) {
            const hash = this.hashUserId(userId, flag.key)
            if (hash > Number(rule.value)) return false
          }
          break
        case 'user_id':
          if (userId && rule.value.toString().split(',').includes(userId)) return true
          break
        case 'plan':
          if (plan && rule.value.toString().split(',').includes(plan)) return true
          break
        case 'country':
          if (country && rule.value.toString().split(',').includes(country)) return true
          break
      }
    }

    return flag.defaultValue
  }

  /**
   * Declara vencedor do teste
   */
  declareWinner(test: ABTest, variantId: string): ABTest {
    return {
      ...test,
      status: 'completed',
      winnerVariantId: variantId,
      endedAt: new Date().toISOString(),
    }
  }
}

export const abTestEngine = new ABTestEngine()
