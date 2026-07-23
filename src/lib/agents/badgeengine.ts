// Motor de Badges e Conquistas KIYVO — gamificação para compradores e vendedores
// Sistema de progressão com XP, níveis e recompensas em KD Points

export type BadgeId =
  | 'primeira_compra'
  | 'primeira_venda'
  | 'comprador_vip'
  | 'vendedor_ouro'
  | 'vendedor_diamante'
  | 'resenheiro'
  | 'afiliado_top'
  | 'veloz'
  | 'explorador'
  | 'colecionador'
  | 'barganhador'
  | 'influenciador'
  | 'suporte_heroi'
  | 'madrugador'
  | 'boleto_pago'
  | 'pix_rei'
  | 'review_5estrelas'
  | 'super_afiliado'
  | 'empreendedor'
  | 'magnata'

export interface Badge {
  id: BadgeId
  nome: string
  descricao: string
  icone: string
  cor: string
  xp: number
  kdRecompensa: number
  raro: 'comum' | 'raro' | 'epico' | 'lendario'
  condicao: string
}

export const BADGES: Badge[] = [
  { id: 'primeira_compra', nome: 'Primeira Compra', descricao: 'Fez sua primeira compra na KIYVO', icone: '🛒', cor: '#2563EB', xp: 50, kdRecompensa: 100, raro: 'comum', condicao: '1 compra' },
  { id: 'primeira_venda', nome: 'Primeira Venda', descricao: 'Vendeu seu primeiro produto', icone: '💰', cor: '#10B981', xp: 100, kdRecompensa: 200, raro: 'comum', condicao: '1 venda' },
  { id: 'comprador_vip', nome: 'Comprador VIP', descricao: 'Acumulou R$ 500 em compras', icone: '👑', cor: '#F59E0B', xp: 500, kdRecompensa: 1000, raro: 'raro', condicao: 'R$ 500 em compras' },
  { id: 'vendedor_ouro', nome: 'Vendedor Ouro', descricao: 'R$ 5.000 em vendas', icone: '🥇', cor: '#F59E0B', xp: 1000, kdRecompensa: 2000, raro: 'raro', condicao: 'R$ 5k vendidos' },
  { id: 'vendedor_diamante', nome: 'Vendedor Diamante', descricao: 'R$ 50.000 em vendas', icone: '💎', cor: '#06B6D4', xp: 5000, kdRecompensa: 10000, raro: 'lendario', condicao: 'R$ 50k vendidos' },
  { id: 'resenheiro', nome: 'Resenheiro', descricao: 'Escreveu 10 avaliações', icone: '⭐', cor: '#F97316', xp: 150, kdRecompensa: 300, raro: 'comum', condicao: '10 avaliações' },
  { id: 'afiliado_top', nome: 'Afiliado Top', descricao: 'Gerou 10 vendas como afiliado', icone: '🤝', cor: '#8B5CF6', xp: 800, kdRecompensa: 1500, raro: 'raro', condicao: '10 vendas afiliadas' },
  { id: 'veloz', nome: 'Veloz e Furioso', descricao: 'Comprou em menos de 60s na página', icone: '⚡', cor: '#EF4444', xp: 50, kdRecompensa: 50, raro: 'comum', condicao: 'Checkout <60s' },
  { id: 'explorador', nome: 'Explorador', descricao: 'Visitou 20 produtos diferentes', icone: '🧭', cor: '#14B8A6', xp: 100, kdRecompensa: 100, raro: 'comum', condicao: '20 produtos visitados' },
  { id: 'colecionador', nome: 'Colecionador', descricao: 'Comprou em 5 categorias diferentes', icone: '🎴', cor: '#A855F7', xp: 300, kdRecompensa: 500, raro: 'raro', condicao: '5 categorias' },
  { id: 'barganhador', nome: 'Barganhador', descricao: 'Usou 5 cupons diferentes', icone: '🏷️', cor: '#EC4899', xp: 150, kdRecompensa: 200, raro: 'comum', condicao: '5 cupons usados' },
  { id: 'influenciador', nome: 'Influenciador KIYVO', descricao: '3 pessoas se cadastraram pelo seu link', icone: '📣', cor: '#0EA5E9', xp: 400, kdRecompensa: 800, raro: 'raro', condicao: '3 indicados' },
  { id: 'suporte_heroi', nome: 'Herói do Suporte', descricao: 'Resolveu 50 chamados no chat', icone: '🦸', cor: '#6366F1', xp: 800, kdRecompensa: 1000, raro: 'epico', condicao: '50 tickets resolvidos' },
  { id: 'madrugador', nome: 'Madrugador', descricao: 'Comprou entre 00h e 5h', icone: '🦉', cor: '#8B5CF6', xp: 50, kdRecompensa: 50, raro: 'comum', condicao: 'Compra de madrugada' },
  { id: 'boleto_pago', nome: 'Boleto na Veia', descricao: 'Pagou 3 boletos sem atraso', icone: '🧾', cor: '#84CC16', xp: 100, kdRecompensa: 100, raro: 'comum', condicao: '3 boletos pagos' },
  { id: 'pix_rei', nome: 'Rei do Pix', descricao: 'Pagou 10 compras com Pix', icone: '💠', cor: '#22C55E', xp: 200, kdRecompensa: 300, raro: 'raro', condicao: '10 compras Pix' },
  { id: 'review_5estrelas', nome: '5 Estrelas', descricao: 'Recebeu 10 avaliações 5 estrelas como vendedor', icone: '🌟', cor: '#FBBF24', xp: 600, kdRecompensa: 1200, raro: 'epico', condicao: '10 avaliações 5⭐' },
  { id: 'super_afiliado', nome: 'Super Afiliado', descricao: 'R$ 10.000 em comissões', icone: '🚀', cor: '#EC4899', xp: 3000, kdRecompensa: 5000, raro: 'epico', condicao: 'R$ 10k comissões' },
  { id: 'empreendedor', nome: 'Empreendedor', descricao: 'Cadastrou 5 produtos', icone: '🏗️', cor: '#F97316', xp: 200, kdRecompensa: 400, raro: 'comum', condicao: '5 produtos' },
  { id: 'magnata', nome: 'Magnata KIYVO', descricao: 'R$ 100.000 em vendas', icone: '🏛️', cor: '#F59E0B', xp: 15000, kdRecompensa: 50000, raro: 'lendario', condicao: 'R$ 100k vendidos' },
]

export interface UserStats {
  totalCompras: number
  totalGasto: number
  totalVendas: number
  totalReceita: number
  totalAvaliacoes: number
  avaliacoes5Estrelas: number
  vendasAfiliado: number
  comissaoAfiliado: number
  categoriasCompradas: number
  cuponsUsados: number
  indicadosCadastrados: number
  produtosCadastrados: number
  comprasPix: number
  boletosValidos: number
  visitasProdutos: number
  ticketsResolvidos: number
  checkoutRapido?: boolean
  compraMadrugada?: boolean
}

export function calcularNivel(xp: number): { nivel: number; xpAtual: number; xpProximo: number; titulo: string } {
  // curva: proximoNivel = 100 * nivel^1.4
  let n = 1
  let acum = 0
  while (true) {
    const prox = Math.floor(100 * Math.pow(n, 1.4))
    if (xp < acum + prox) {
      return {
        nivel: n,
        xpAtual: xp - acum,
        xpProximo: prox,
        titulo: n < 3 ? 'Iniciante' : n < 7 ? 'Aprendiz' : n < 15 ? 'Veterano' : n < 30 ? 'Expert' : n < 50 ? 'Mestre' : 'Lendário',
      }
    }
    acum += prox
    n++
    if (n > 999) break
  }
  return { nivel: 999, xpAtual: 0, xpProximo: 1, titulo: 'Lendário' }
}

export function avaliarBadges(stats: UserStats, badgesAdquiridas: BadgeId[] = []): { novas: Badge[]; todasAdquiridas: BadgeId[]; xpGanho: number; kdGanho: number } {
  const adquiridas = new Set<BadgeId>(badgesAdquiridas)
  const novas: Badge[] = []
  let xpGanho = 0
  let kdGanho = 0

  const check = (id: BadgeId, cond: boolean) => {
    if (cond && !adquiridas.has(id)) {
      const b = BADGES.find((x) => x.id === id)
      if (b) {
        novas.push(b)
        adquiridas.add(id)
        xpGanho += b.xp
        kdGanho += b.kdRecompensa
      }
    }
  }

  check('primeira_compra', stats.totalCompras >= 1)
  check('primeira_venda', stats.totalVendas >= 1)
  check('comprador_vip', stats.totalGasto >= 500)
  check('vendedor_ouro', stats.totalReceita >= 5000)
  check('vendedor_diamante', stats.totalReceita >= 50000)
  check('magnata', stats.totalReceita >= 100000)
  check('resenheiro', stats.totalAvaliacoes >= 10)
  check('afiliado_top', stats.vendasAfiliado >= 10)
  check('super_afiliado', stats.comissaoAfiliado >= 10000)
  check('veloz', !!stats.checkoutRapido)
  check('explorador', stats.visitasProdutos >= 20)
  check('colecionador', stats.categoriasCompradas >= 5)
  check('barganhador', stats.cuponsUsados >= 5)
  check('influenciador', stats.indicadosCadastrados >= 3)
  check('suporte_heroi', stats.ticketsResolvidos >= 50)
  check('madrugador', !!stats.compraMadrugada)
  check('boleto_pago', stats.boletosValidos >= 3)
  check('pix_rei', stats.comprasPix >= 10)
  check('review_5estrelas', stats.avaliacoes5Estrelas >= 10)
  check('empreendedor', stats.produtosCadastrados >= 5)

  return { novas, todasAdquiridas: Array.from(adquiridas), xpGanho, kdGanho }
}
