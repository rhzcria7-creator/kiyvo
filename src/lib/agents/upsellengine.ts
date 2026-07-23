// Agente UpsellEngine — IA de upsell/cross-sell pós-compra
// Recomenda produtos com base no que o usuário acabou de comprar
export interface UpsellInput { produtoComprado: { id: string; title: string; preco: number; category?: string; tags?: string[] }; catalogoProdutos: Array<{ id: string; title: string; preco: number; category?: string; tags?: string[]; tipo?: string }>; valorCarrinho: number }
export interface UpsellOferta { produtoId: string; produtoTitulo: string; preco: number; desconto: number; tipo: 'order_bump'|'upsell_1click'|'downsell'|'cross_sell'; razao: string; scoreConversao: number }
export interface UpsellOutput { ofertas: UpsellOferta[]; melhorOferta: UpsellOferta; ticketMedioGanho: number; scriptCheckout: string; ordemExibicao: string[] }
export function gerarUpsell(input: UpsellInput): UpsellOutput {
  const { produtoComprado: produto, catalogoProdutos, valorCarrinho } = input
  const candidatos = catalogoProdutos.filter(p => p.id !== produto.id)
  // Order bump: produto barato (20-40% do valor)
  const bumpCandidatos = candidatos.filter(p => p.preco >= produto.preco*0.15 && p.preco <= produto.preco*0.4)
  // Upsell 1-click: produto 30-60% mais caro, mesma categoria (versão premium)
  const upsellCandidatos = candidatos.filter(p => p.preco >= produto.preco*1.3 && p.preco <= produto.preco*2.0 && p.category === produto.category)
  // Downsell: produto mais barato como segunda opção
  const downCandidatos = candidatos.filter(p => p.preco <= produto.preco*0.7 && p.preco >= produto.preco*0.3)
  // Cross-sell: complementar (tags em comum ou relacionado)
  const crossCandidatos = candidatos.filter(p => (p.tags||[]).some(t => (produto.tags||[]).includes(t)) || p.id !== produto.id)
  const ofertas: UpsellOferta[] = []
  const pick = <T>(arr: T[]): T|undefined => arr[Math.floor(Math.random()*arr.length)]
  const bump = bumpCandidatos.length ? pick(bumpCandidatos) : null
  if (bump) ofertas.push({ produtoId: bump.id, produtoTitulo: bump.title, preco: bump.preco*0.9, desconto: 10, tipo: 'order_bump', razao: 'Complemento perfeito por um pequeno valor adicional', scoreConversao: 35 })
  const up = upsellCandidatos.length ? pick(upsellCandidatos) : null
  if (up) ofertas.push({ produtoId: up.id, produtoTitulo: up.title, preco: up.preco*0.85, desconto: 15, tipo: 'upsell_1click', razao: 'Versão premium/completa com mais recursos, oferta exclusiva do checkout', scoreConversao: 18 })
  const cross = crossCandidatos[0]
  if (cross && cross.id !== bump?.id && cross.id !== up?.id) ofertas.push({ produtoId: cross.id, produtoTitulo: cross.title, preco: cross.preco*0.92, desconto: 8, tipo: 'cross_sell', razao: 'Clientes que compraram isso também levaram', scoreConversao: 12 })
  const down = downCandidatos.length ? pick(downCandidatos.filter(p => !ofertas.some(o => o.produtoId === p.id))) : null
  if (down) ofertas.push({ produtoId: down.id, produtoTitulo: down.title, preco: down.preco*0.88, desconto: 12, tipo: 'downsell', razao: 'Se o premium não coube no orçamento, essa versão cabe', scoreConversao: 22 })
  const melhorOferta = ofertas[0]
  const ticketMedioGanho = ofertas.reduce((s, o) => s + o.preco * (o.scoreConversao/100), 0)
  const scriptCheckout = `🚨 OFERTA EXCLUSIVA DE CHECKOUT 🚨\n\nAdicione ${melhorOferta?.produtoTitulo || 'um produto complementar'} por apenas R$ ${(melhorOferta?.preco||0).toFixed(2).replace('.',',')} (${melhorOferta?.desconto||0}% OFF exclusivo de checkout)\n\nEssa oferta desaparece após essa página. Não aparece mais em outro lugar.`
  const ordemExibicao = ofertas.map(o => o.tipo)
  return { ofertas, melhorOferta: melhorOferta || ofertas[0], ticketMedioGanho, scriptCheckout, ordemExibicao }
}
