// ─────────────────────────────────────────────────────────────
// Search Analytics Engine v0.0.1 — Análise de buscas
// Termos mais buscados, sem resultados, tendências
// ─────────────────────────────────────────────────────────────

export interface SearchLog { id: string; query: string; userId?: string; results: number; clickedProductId?: string; sessionId: string; timestamp: string }

export class SearchAnalyticsEngine {
  private logs: SearchLog[] = []
  
  logSearch(params: { query: string; userId?: string; results: number; sessionId: string; clickedProductId?: string }): SearchLog {
    const entry: SearchLog = { id: `sl_${Date.now()}`, ...params, timestamp: new Date().toISOString() }
    this.logs.push(entry)
    if (this.logs.length > 1000) this.logs = this.logs.slice(-500)
    return entry
  }

  getTopQueries(limit = 20): Array<{ query: string; count: number }> {
    const counts = new Map<string, number>()
    this.logs.forEach(l => counts.set(l.query, (counts.get(l.query) || 0) + 1))
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([query, count]) => ({ query, count }))
  }

  getZeroResultQueries(): Array<{ query: string; count: number }> {
    const zero = this.logs.filter(l => l.results === 0)
    const counts = new Map<string, number>()
    zero.forEach(l => counts.set(l.query, (counts.get(l.query) || 0) + 1))
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([query, count]) => ({ query, count }))
  }

  getClickThroughRate(): number {
    const withClicks = this.logs.filter(l => l.clickedProductId).length
    return this.logs.length > 0 ? Math.round((withClicks / this.logs.length) * 100) : 0
  }
}
export const searchAnalyticsEngine = new SearchAnalyticsEngine()
