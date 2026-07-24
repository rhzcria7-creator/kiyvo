// ProductHunter Agent — Descobre produtos digitais de alto potencial
// Baseado em catálogo curado de produtos com margem + viabilidade.
// Com flag autoPublicar: gera ficha completa (copy + banner) para aprovação.
import type { HunterSuggestion } from './types'
import { generateCopy } from './copywriter'
import { generateBannerSvg } from './bannerforge'

interface CuratedProduct {
  nome: string
  categoria: string
  precoVenda: number
  precoFornecedor: number
  tags: string[]
  fonte: string
  razao: string
  risco: 'baixo' | 'medio' | 'alto'
  score: number
}

// Catálogo curado de produtos digitais com alta margem + demanda no Brasil
const CURATED: CuratedProduct[] = [
  // ─── Streaming (alto volume, baixa margem, muito tráfego) ───
  { nome: 'Netflix Premium 4K (30 dias)', categoria: 'streaming', precoVenda: 19.9, precoFornecedor: 7.5, tags: ['netflix', '4k', 'tela extra'], fonte: 'Catálogo Parceiros KIYVO', razao: 'Produto top #1 de busca — alta recorrência, cliente volta todo mês', risco: 'medio', score: 96 },
  { nome: 'Spotify Premium Individual (30 dias)', categoria: 'musica', precoVenda: 14.9, precoFornecedor: 5.2, tags: ['spotify', 'musica', 'sem anuncio'], fonte: 'Catálogo Parceiros KIYVO', razao: 'Baixo risco de banimento, alta rotatividade', risco: 'baixo', score: 92 },
  { nome: 'Disney+ Premium (30 dias)', categoria: 'streaming', precoVenda: 17.9, precoFornecedor: 6.8, tags: ['disney', 'marvel', 'star wars'], fonte: 'Parceiros BR', razao: 'Catálogo forte com Marvel/Star Wars, baixa concorrência', risco: 'medio', score: 88 },
  { nome: 'YouTube Premium Família (30 dias)', categoria: 'streaming', precoVenda: 12.9, precoFornecedor: 3.5, tags: ['youtube', 'sem ads', 'youtube music'], fonte: 'Fornecedor IN', razao: 'Youtube Music incluso, alto valor percebido', risco: 'medio', score: 84 },
  { nome: 'ChatGPT Plus (1 mês)', categoria: 'software', precoVenda: 119.9, precoFornecedor: 72, tags: ['gpt', 'openai', 'ia', 'chatgpt'], fonte: 'Catálogo Oficial', razao: 'Produto hype, margem enorme, procura explodindo', risco: 'baixo', score: 98 },
  { nome: 'Canva Pro (30 dias)', categoria: 'marketing', precoVenda: 12.9, precoFornecedor: 3.2, tags: ['canva', 'design', 'midia social'], fonte: 'Parceiros', razao: 'Vende para todo criador, custo baixíssimo', risco: 'baixo', score: 94 },
  { nome: 'Microsoft 365 Família (1 ano)', categoria: 'software', precoVenda: 199.9, precoFornecedor: 45, tags: ['office', 'word', 'excel', 'm365'], fonte: 'Distribuidor Oficial', razao: 'Ticket alto, chave perpétua/semestral, margem gigante', risco: 'baixo', score: 91 },
  { nome: 'Grammarly Premium (1 mês)', categoria: 'software', precoVenda: 29.9, precoFornecedor: 7, tags: ['grammarly', 'ingles', 'redacao'], fonte: 'Fornecedor US', razao: 'Demanda crescente com estudo/trabalho', risco: 'baixo', score: 78 },
  { nome: 'CapCut Pro (30 dias)', categoria: 'marketing', precoVenda: 19.9, precoFornecedor: 4.5, tags: ['capcut', 'video', 'editor'], fonte: 'Fornecedor BR', razao: 'App #1 em edição, alto viral', risco: 'baixo', score: 89 },
  { nome: 'Prime Video (30 dias)', categoria: 'streaming', precoVenda: 14.9, precoFornecedor: 5.8, tags: ['prime', 'amazon', 'video'], fonte: 'Parceiros', razao: 'Complemento de catálogo, vende em bundle com outros', risco: 'medio', score: 72 },
  { nome: 'HBO Max (30 dias)', categoria: 'streaming', precoVenda: 17.9, precoFornecedor: 6.9, tags: ['hbo', 'max', 'serie'], fonte: 'Parceiros', razao: 'Novos conteúdos constantemente', risco: 'medio', score: 70 },

  // ─── Gift cards (confiáveis, baixo risco, volume) ───
  { nome: 'Gift Card Steam R$ 50', categoria: 'giftcards', precoVenda: 54.9, precoFornecedor: 47.5, tags: ['steam', 'gift card', 'jogos'], fonte: 'Fornecedor Nacional', razao: 'Gift card é rei — zero risco de chargeback, 100% confiável', risco: 'baixo', score: 97 },
  { nome: 'Gift Card Steam R$ 100', categoria: 'giftcards', precoVenda: 107.9, precoFornecedor: 94, tags: ['steam', '100 reais'], fonte: 'Fornecedor Nacional', razao: 'Ticket maior, fideliza o jogador', risco: 'baixo', score: 93 },
  { nome: 'Gift Card PlayStation R$ 100', categoria: 'giftcards', precoVenda: 109.9, precoFornecedor: 96, tags: ['psn', 'playstation', 'gift card'], fonte: 'GGMax', razao: 'Comunidade PS fiel e pagante', risco: 'baixo', score: 90 },
  { nome: 'Gift Card Xbox R$ 100', categoria: 'giftcards', precoVenda: 108.9, precoFornecedor: 94.5, tags: ['xbox', 'microsoft', 'gift'], fonte: 'GGMax', razao: 'Game Pass impulsiona gift cards', risco: 'baixo', score: 87 },
  { nome: 'iFood R$ 30', categoria: 'giftcards', precoVenda: 32.9, precoFornecedor: 28.5, tags: ['ifood', 'comida', 'delivery'], fonte: 'Fornecedor BR', razao: 'Presenteia todo mundo, utilidade garantida', risco: 'baixo', score: 85 },
  { nome: 'Uber R$ 25', categoria: 'giftcards', precoVenda: 27.5, precoFornecedor: 23.8, tags: ['uber', 'corrida', 'transporte'], fonte: 'Fornecedor BR', razao: 'Mesma pegada do iFood, alta conversão', risco: 'baixo', score: 82 },
  { nome: 'Google Play R$ 50', categoria: 'giftcards', precoVenda: 53.9, precoFornecedor: 46.5, tags: ['google play', 'android', 'app'], fonte: 'Fornecedor BR', razao: 'Grande demanda mobile (Free Fire, Genshin)', risco: 'baixo', score: 83 },

  // ─── Jogos (catálogo GGMax-style) ───
  { nome: 'EA FC 25 — FIFA (Steam Key Global)', categoria: 'jogos', precoVenda: 179.9, precoFornecedor: 118, tags: ['fifa', 'ea fc', 'futebol', 'steam'], fonte: 'Kinguin/GGMax', razao: 'Jogo anual, fenômeno no Brasil — pré-vendas explosivas', risco: 'baixo', score: 93 },
  { nome: 'Counter-Strike 2 Prime Status', categoria: 'jogos', precoVenda: 69.9, precoFornecedor: 52, tags: ['cs2', 'csgo', 'prime', 'fps'], fonte: 'Steam Oficial', razao: 'Jogo mais jogado da Steam, demanda constante', risco: 'baixo', score: 86 },
  { nome: 'Game Pass Ultimate (1 mês)', categoria: 'jogos', precoVenda: 29.9, precoFornecedor: 9.5, tags: ['game pass', 'xbox', 'nuvem'], fonte: 'Fornecedor BR', razao: 'Biblioteca enorme, percepção de valor gigante', risco: 'medio', score: 95 },
  { nome: 'Roblox Gift Card 800 Robux', categoria: 'jogos', precoVenda: 49.9, precoFornecedor: 39, tags: ['roblox', 'robux', 'crianca'], fonte: 'Fornecedor Global', razao: 'Crianças imploram aos pais — converte muito', risco: 'baixo', score: 88 },
  { nome: 'Minecraft Java + Bedrock', categoria: 'jogos', precoVenda: 99.9, precoFornecedor: 67, tags: ['minecraft', 'key'], fonte: 'Microsoft Key', razao: 'Jogo mais vendido da história, long tail eterna', risco: 'baixo', score: 89 },
  { nome: 'Valorant Points 1000 VP', categoria: 'jogos', precoVenda: 49.9, precoFornecedor: 36, tags: ['valorant', 'vp', 'riot'], fonte: 'Códigos Riot BR', razao: 'FPS mais popular do Brasil, skins vendem todo dia', risco: 'baixo', score: 91 },

  // ─── VPN/Segurança ───
  { nome: 'NordVPN (1 ano — 6 dispositivos)', categoria: 'seguranca', precoVenda: 89.9, precoFornecedor: 22, tags: ['vpn', 'nordvpn', 'privacidade'], fonte: 'NordVPN Affiliate/Wholesale', razao: 'Margem gigante (+75%), afiliação forte, renova mensal', risco: 'baixo', score: 86 },

  // ─── Marketing/Criativo (altíssima margem) ───
  { nome: 'Figma Professional (1 mês)', categoria: 'marketing', precoVenda: 24.9, precoFornecedor: 5.5, tags: ['figma', 'ux', 'design'], fonte: 'Educaional/Equipes', razao: 'Designers e devs usam todo dia', risco: 'medio', score: 76 },
  { nome: 'Notion Plus (1 ano)', categoria: 'produtividade', precoVenda: 59.9, precoFornecedor: 14, tags: ['notion', 'produtividade', 'organizacao'], fonte: 'Fornecedor EU', razao: 'Ferramenta de produtividade mais comentada do momento', risco: 'medio', score: 80 },
  { nome: 'MidJourney Básico (1 mês)', categoria: 'software', precoVenda: 49.9, precoFornecedor: 18, tags: ['midjourney', 'ia', 'imagens'], fonte: 'Fornecedor US', razao: 'IA de imagem #1, criadores pagam fácil', risco: 'medio', score: 87 },

  // ─── Cursos ───
  { nome: 'Curso Completo de Marketing Digital (100h)', categoria: 'cursos', precoVenda: 97.0, precoFornecedor: 0, tags: ['marketing digital', 'ead', 'curso'], fonte: 'KIYVO Cursos (PLR)', razao: 'Custo zero (PLR), margem 100% — venda eterna', risco: 'baixo', score: 85 },
  { nome: 'Pacote 5.000 Templates Canva (Premium)', categoria: 'templates', precoVenda: 29.9, precoFornecedor: 0, tags: ['templates', 'canva', 'pack'], fonte: 'KIYVO Cursos (PLR)', razao: 'Produto digital replicável infinitamente — custo ZERO', risco: 'baixo', score: 88 },
  { nome: 'Pack de Presets Lightroom (2.000+)', categoria: 'templates', precoVenda: 19.9, precoFornecedor: 0, tags: ['lightroom', 'preset', 'fotografia'], fonte: 'KIYVO Cursos (PLR)', razao: 'Influenciadores compram, custo zero', risco: 'baixo', score: 74 },
]

export function huntProducts(categoria?: string, max = 12): HunterSuggestion[] {
  let pool = CURATED
  if (categoria && categoria !== 'todas') {
    pool = pool.filter((p) => p.categoria === categoria.toLowerCase())
  }
  const ordenados = [...pool].sort((a, b) => b.score - a.score)
  return ordenados.slice(0, max).map((p, i) => ({
    id: `hunt_${Date.now()}_${i}`,
    titulo: p.nome,
    categoria: p.categoria,
    scoreViral: p.score,
    precoSugerido: p.precoVenda,
    margemEstimada: Number((((p.precoVenda - p.precoFornecedor) / p.precoVenda) * 100).toFixed(1)),
    fonte: p.fonte,
    razao: p.razao,
    tags: p.tags,
    risco: p.risco,
  }))
}

// Gera ficha COMPLETA do produto (título, descrição, banner SVG) pronta pra cadastrar
export function gerarFichaOficial(suggestion: HunterSuggestion, varianteBanner = 0) {
  const copy = generateCopy(
    {
      produto: suggestion.titulo,
      categoria: suggestion.categoria,
      publico: ['streaming', 'musica', 'jogos'].includes(suggestion.categoria) ? 'gamer' : suggestion.categoria === 'cursos' ? 'criador' : 'profissional',
      tom: suggestion.scoreViral >= 90 ? 'urgente' : 'confiavel',
      preco: suggestion.precoSugerido,
      beneficios: suggestion.tags,
    },
    varianteBanner,
  )
  const banner = generateBannerSvg(
    {
      titulo: suggestion.titulo,
      subtitulo: copy.descricaoCurta.slice(0, 80),
      categoria: suggestion.categoria,
      estilo: 'hero',
    },
    varianteBanner,
  )
  return {
    ...suggestion,
    copy,
    bannerSvg: banner.svg,
    paleta: banner.paleta,
    slug: suggestion.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60),
  }
}
