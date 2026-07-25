// ─────────────────────────────────────────────────────────────
// Boost Engine v0.0.1 — 4 pacotes: 6h, 24h, 7d, 30d
// Produto fica destacado em "Trending Now" + badge "BOOST"
// Preço baseado em vendas do produto
// ─────────────────────────────────────────────────────────────

export type BoostPackage = '6h' | '24h' | '7d' | '30d'

export interface BoostConfig {
  package: BoostPackage
  durationHours: number
  multiplier: number // Preço base * multiplier
  label: string
  description: string
}

export const BOOST_PACKAGES: Record<BoostPackage, BoostConfig> = {
  '6h': { package: '6h', durationHours: 6, multiplier: 0.5, label: '6 horas', description: 'Impulso rápido para novos produtos' },
  '24h': { package: '24h', durationHours: 24, multiplier: 1, label: '24 horas', description: 'Impulso de 1 dia' },
  '7d': { package: '7d', durationHours: 168, multiplier: 3, label: '7 dias', description: 'Impulso semanal recomendado' },
  '30d': { package: '30d', durationHours: 720, multiplier: 8, label: '30 dias', description: 'Impulso mensal máximo' },
}

const BASE_BOOST_PRICE = 9.90

export class BoostEngine {
  /**
   * Calcula preço do boost baseado no pacote
   */
  calculatePrice(pkg: BoostPackage): number {
    const config = BOOST_PACKAGES[pkg]
    return Math.round(BASE_BOOST_PRICE * config.multiplier * 100) / 100
  }

  /**
   * Calcula data de expiração do boost
   */
  calculateExpiry(pkg: BoostPackage): Date {
    const config = BOOST_PACKAGES[pkg]
    return new Date(Date.now() + config.durationHours * 60 * 60 * 1000)
  }

  /**
   * Verifica se boost ainda está ativo
   */
  isBoostActive(expiresAt: string): boolean {
    return new Date(expiresAt) > new Date()
  }

  /**
   * Tempo restante de boost em horas
   */
  remainingHours(expiresAt: string): number {
    const remaining = new Date(expiresAt).getTime() - Date.now()
    return Math.max(0, Math.round(remaining / (1000 * 60 * 60) * 10) / 10)
  }
}

export const boostEngine = new BoostEngine()
