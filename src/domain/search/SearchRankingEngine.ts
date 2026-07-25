// v0.0.1 — Ranking de busca explicável: relevância, qualidade, venda e boost identificado.
export interface SearchRankSignal { textRank: number; rating: number; reviewCount: number; sales: number; boost: boolean }
export function rankSearchResult(signal: SearchRankSignal): number { const quality = Math.max(0, Math.min(5, signal.rating)) / 5 * Math.log1p(Math.max(0, signal.reviewCount)); const sales = Math.log1p(Math.max(0, signal.sales)); return Math.round((Math.max(0, signal.textRank) * 50 + quality * 10 + sales * 6 + (signal.boost ? 3 : 0)) * 100) / 100 }
