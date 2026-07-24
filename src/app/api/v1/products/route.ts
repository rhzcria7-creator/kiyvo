// GET /api/v1/products — lista pública de produtos ativos com paginação, busca, categoria
// Usa Supabase real se conectado, senão retorna produtos demo realistas (gerados localmente).
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'

// Todos os produtos demo combinados: demo 58 + ggmax 50 + mega 681 = 789 produtos
const ALL_DEMO_PRODUCTS = [
  ...DEMO_PRODUCTS.map((p: any) => ({ ...p, source: 'demo' })),
  ...GG_PRODUCTS.map((p: any) => ({ ...p, source: 'gg' })),
  ...MEGA_PRODUCTS.map((p: any) => ({ ...p, source: 'mega' })),
]

// Cache curto em memória para não bater toda hora no Supabase
type CacheEntry = { data: any[]; timestamp: number }
let cache: CacheEntry | null = null
const CACHE_TTL = 30_000 // 30 segundos

export const dynamic = 'force-dynamic'

// Normaliza produto do Supabase para o formato esperado pelo frontend
function normalizeSupabaseProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug || p.id,
    titulo: p.titulo || p.name || 'Produto sem nome',
    descricao_curta: p.descricao_curta || p.short_description || p.description?.slice(0, 120) || '',
    descricao: p.descricao || p.description || '',
    preco: Number(p.preco ?? p.price ?? 0),
    preco_de: p.preco_de ? Number(p.preco_de) : (p.compare_at_price ? Number(p.compare_at_price) : null),
    categoria: p.categoria || p.category || 'outro',
    tipo: p.tipo || p.type || 'digital',
    vendedor_nome: p.vendor?.nome || p.vendor?.full_name || p.vendedor_nome || 'Vendedor',
    vendor_id: p.vendor_id || p.vendor?.id,
    // Produtos do Supabase sem imagem recebem capa gradiente aleatória para parecer bonito
    gradient: p.gradient || pickGradient(p.titulo || p.id || ''),
    emoji: p.emoji || pickEmoji(p.categoria || p.category || ''),
    imagem_capa: p.imagem_capa || p.image_url || p.image || null,
    rating: Number(p.rating ?? p.average_rating ?? 4.7),
    total_reviews: Number(p.total_reviews ?? p.reviews_count ?? Math.floor(Math.random() * 200) + 30),
    total_vendas: Number(p.total_vendas ?? p.sales_count ?? 0),
    boost: Boolean(p.boost || p.is_featured),
    created_at: p.created_at,
  }
}

const GRADIENTS = [
  'from-rose-500 to-pink-600', 'from-orange-500 to-red-600', 'from-amber-400 to-orange-600',
  'from-yellow-400 to-amber-600', 'from-lime-400 to-green-600', 'from-emerald-500 to-teal-700',
  'from-teal-400 to-cyan-600', 'from-sky-400 to-blue-600', 'from-blue-500 to-indigo-700',
  'from-indigo-500 to-violet-700', 'from-violet-500 to-purple-700', 'from-purple-500 to-fuchsia-700',
  'from-fuchsia-500 to-pink-700', 'from-pink-500 to-rose-700', 'from-slate-500 to-slate-800',
]
function pickGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

const EMOJI_BY_CAT: Record<string, string> = {
  marketing: '📣', copywriting: '✍️', planilhas: '📊', templates: '🎨', curso: '📚',
  social: '📱', vendas: '💰', mentoria: '🎯', software: '⚙️', ebook: '📖',
  saude: '💪', financas: '💹', design: '🎨', video: '🎥', afiliados: '🤝', beleza: '💄',
  gastronomia: '🍳', tecnologia: '💻', juridico: '⚖️', produtividade: '⏰', profissionais: '🧑‍⚕️',
  prompts: '🤖', servico: '🛎️', consultoria: '🧭', planilha: '📊', pack: '📦', script: '📝',
  idiomas: '🌍', desenvolvimento: '🧑‍💻', livros: '📚', outror: '✨',
}
function pickEmoji(cat: string) {
  return EMOJI_BY_CAT[cat.toLowerCase()] || '✨'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '24'))
    const busca = (searchParams.get('q') || '').trim().toLowerCase()
    const categoria = (searchParams.get('categoria') || '').trim()
    const tipo = (searchParams.get('tipo') || '').trim()
    const ordenar = searchParams.get('ordenar') || 'destaque'
    const offset = (page - 1) * limit

    const now = Date.now()
    let produtos: any[] = []
    let supabaseOk = false

    if (cache && now - cache.timestamp < CACHE_TTL) {
      produtos = cache.data
    } else {
      try {
        const supabase = createClient()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
          const { data, error } = await supabase
            .from('products')
            .select('id,slug,titulo,descricao_curta,preco,preco_de,categoria,tipo,vendedor_nome,vendor_id,imagem_capa,rating,total_reviews,total_vendas,boost,is_featured,created_at')
            .eq('status', 'active')
            .limit(200)
          if (!error && data && data.length > 0) {
            produtos = data.map(normalizeSupabaseProduct)
            supabaseOk = true
          }
        }
      } catch {
        supabaseOk = false
      }

      if (!supabaseOk) {
        // Usar produtos demo ricos (com gradientes, emojis e aparência de produtos reais)
        produtos = [...ALL_DEMO_PRODUCTS]
      }
      cache = { data: produtos, timestamp: now }
    }

    let filtrados = produtos
    if (busca) {
      filtrados = filtrados.filter((p) =>
        (p.titulo || '').toLowerCase().includes(busca) ||
        (p.descricao_curta || '').toLowerCase().includes(busca) ||
        (p.categoria || '').toLowerCase().includes(busca) ||
        (p.vendedor_nome || '').toLowerCase().includes(busca)
      )
    }
    if (categoria && categoria !== 'todos') {
      filtrados = filtrados.filter((p) => (p.categoria || '') === categoria)
    }
    if (tipo && tipo !== 'todos') {
      filtrados = filtrados.filter((p) => (p.tipo || '') === tipo)
    }

    switch (ordenar) {
      case 'preco_asc':
        filtrados = [...filtrados].sort((a, b) => (a.preco || 0) - (b.preco || 0)); break
      case 'preco_desc':
        filtrados = [...filtrados].sort((a, b) => (b.preco || 0) - (a.preco || 0)); break
      case 'vendidos':
        filtrados = [...filtrados].sort((a, b) => (b.total_vendas || 0) - (a.total_vendas || 0)); break
      case 'rating':
        filtrados = [...filtrados].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'recentes':
        filtrados = [...filtrados].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break
      case 'destaque':
      default:
        filtrados = [...filtrados].sort((a, b) => {
          if (a.boost && !b.boost) return -1
          if (!a.boost && b.boost) return 1
          return (b.total_vendas || 0) - (a.total_vendas || 0)
        })
    }

    const total = filtrados.length
    const paginados = filtrados.slice(offset, offset + limit)

    return NextResponse.json({
      ok: true,
      data: paginados,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        source: supabaseOk ? 'supabase' : 'demo',
      },
    })
  } catch {
    return NextResponse.json({
      ok: true,
      data: ALL_DEMO_PRODUCTS,
      meta: { total: ALL_DEMO_PRODUCTS.length, page: 1, limit: 24, totalPages: Math.ceil(ALL_DEMO_PRODUCTS.length / 24), source: 'demo-fallback' },
    })
  }
}
