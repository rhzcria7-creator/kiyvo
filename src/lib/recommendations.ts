// Sistema de recomendação de produtos — baseado em categoria, tags, histórico
// Heurístico e 100% client/server-side (não precisa de ML carregado)
export interface Produto {
  id: string
  title: string
  category?: string
  tags?: string[]
  price: number
  salesCount?: number
  views?: number
  rating?: number
}

export function recomendarProdutos(produto: Produto, todos: Produto[], limite = 6): Produto[] {
  const scored = todos
    .filter(p => p.id !== produto.id)
    .map(p => {
      let score = 0
      // Mesma categoria = muito relevante
      if (p.category && produto.category && p.category === produto.category) score += 50
      // Tags em comum
      const tagsComum = (p.tags || []).filter(t => (produto.tags || []).includes(t)).length
      score += tagsComum * 15
      // Produtos com vendas mais altas pontuam mais
      score += Math.min(p.salesCount || 0, 1000) / 20
      score += Math.min(p.views || 0, 5000) / 100
      // Faixa de preço similar (+/- 40%)
      const razao = Math.max(p.price, produto.price) / Math.max(1, Math.min(p.price, produto.price))
      if (razao < 1.4) score += 10
      // Rating
      score += (p.rating || 0) * 3
      // Pequena aleatoriedade para variedade
      score += Math.random() * 8
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map(x => x.p)
  return scored
}

export function produtosMaisVendidos(todos: Produto[], limite = 8): Produto[] {
  return [...todos].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, limite)
}

export function produtosMaisVisualizados(todos: Produto[], limite = 8): Produto[] {
  return [...todos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limite)
}

export function produtosFaixaPreco(todos: Produto[], min: number, max: number, limite = 12): Produto[] {
  return todos.filter(p => p.price >= min && p.price <= max).slice(0, limite)
}

export interface StreakDay {
  data: string
  visitou: boolean
  comprou?: boolean
}

export function calcularStreak(dias: StreakDay[]): { atual: number; melhor: number; kdBonus: number; mensagem: string } {
  // Ordenar por data
  const ordenado = [...dias].sort((a, b) => a.data.localeCompare(b.data))
  let atual = 0
  let melhor = 0
  for (const d of ordenado) {
    if (d.visitou) { atual++; melhor = Math.max(melhor, atual) } else atual = 0
  }
  // Bônus KD: 10 KD por dia consecutivo, máximo 70/semana
  const kdBonus = Math.min(atual, 7) * 10
  const msgs = [
    'Volte amanhã para manter seu streak 🔥',
    'Continuando firme! 🚀',
    'Você tá pegando o ritmo! 💪',
    'Streak de campeão! 🏆',
    'Lendário! 👑 +bônus desbloqueado',
  ]
  const idx = Math.min(Math.floor(atual / 2), msgs.length - 1)
  return { atual, melhor, kdBonus, mensagem: msgs[idx] }
}
