// GET /api/v1/categories — categorias públicas com contagem de produtos
import { NextResponse } from 'next/server'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'

const ALL_DEMO_FOR_COUNT = [...DEMO_PRODUCTS, ...GG_PRODUCTS, ...MEGA_PRODUCTS]

const ALL_CATEGORIES_META: Record<string, { nome: string; icone: string; ordem: number }> = {
  marketing: { nome: 'Marketing Digital', icone: '📣', ordem: 1 },
  curso: { nome: 'Cursos', icone: '🎓', ordem: 2 },
  copywriting: { nome: 'Copywriting', icone: '✍️', ordem: 3 },
  templates: { nome: 'Templates', icone: '🎨', ordem: 4 },
  ebook: { nome: 'E-books', icone: '📖', ordem: 5 },
  ebooks: { nome: 'E-books', icone: '📖', ordem: 5 },
  software: { nome: 'Software & Licenças', icone: '🪟', ordem: 6 },
  planilhas: { nome: 'Planilhas', icone: '📊', ordem: 7 },
  design: { nome: 'Design Assets', icone: '🖼️', ordem: 8 },
  streaming: { nome: 'Streaming', icone: '📺', ordem: 9 },
  giftcards: { nome: 'Gift Cards', icone: '🎁', ordem: 10 },
  games: { nome: 'Jogos & Keys', icone: '🎮', ordem: 11 },
  jogos: { nome: 'Jogos & Keys', icone: '🎮', ordem: 11 },
  social: { nome: 'Redes Sociais', icone: '📱', ordem: 12 },
  saude: { nome: 'Saúde & Fitness', icone: '💪', ordem: 13 },
  financas: { nome: 'Finanças', icone: '💹', ordem: 14 },
  beleza: { nome: 'Beleza', icone: '💄', ordem: 15 },
  gastronomia: { nome: 'Gastronomia', icone: '🍳', ordem: 16 },
  juridico: { nome: 'Jurídico', icone: '⚖️', ordem: 17 },
  afiliados: { nome: 'Afiliados', icone: '🤝', ordem: 18 },
  produtividade: { nome: 'Produtividade', icone: '⏰', ordem: 19 },
  prompts: { nome: 'Prompts IA', icone: '💬', ordem: 20 },
  tecnologia: { nome: 'Tecnologia & IA', icone: '💻', ordem: 21 },
  video: { nome: 'Vídeo & Edição', icone: '🎥', ordem: 22 },
  pack: { nome: 'Packs & Bundles', icone: '📦', ordem: 23 },
  script: { nome: 'Scripts', icone: '📝', ordem: 24 },
  dev: { nome: 'Desenvolvimento', icone: '⌨️', ordem: 25 },
  foto: { nome: 'Fotografia & Presets', icone: '📸', ordem: 26 },
  musica: { nome: 'Música & Beats', icone: '🎵', ordem: 27 },
  educacao: { nome: 'Educação & Vestibular', icone: '📚', ordem: 28 },
  idiomas: { nome: 'Idiomas', icone: '🌍', ordem: 29 },
  carreira: { nome: 'Carreira & CV', icone: '💼', ordem: 30 },
  bemestar: { nome: 'Bem-estar & Meditação', icone: '🧘', ordem: 31 },
  agencia: { nome: 'Agências', icone: '🚀', ordem: 32 },
  criador: { nome: 'Criadores de Conteúdo', icone: '▶️', ordem: 33 },
  pets: { nome: 'Pets', icone: '🐾', ordem: 34 },
  viagem: { nome: 'Viagem', icone: '✈️', ordem: 35 },
  casa: { nome: 'Casa & Decoração', icone: '🏠', ordem: 36 },
  wallpaper: { nome: 'Wallpapers 4K', icone: '🖼️', ordem: 37 },
  eventos: { nome: 'Eventos & Festas', icone: '🎉', ordem: 38 },
  mindset: { nome: 'Mindset', icone: '🧠', ordem: 39 },
  escritor: { nome: 'Escrita & KDP', icone: '✍️', ordem: 40 },
  servico: { nome: 'Serviços', icone: '🛎️', ordem: 50 },
  mentoria: { nome: 'Mentorias', icone: '🎯', ordem: 51 },
  licenca: { nome: 'Licenças', icone: '🔑', ordem: 52 },
  assinatura: { nome: 'Assinaturas', icone: '🔄', ordem: 53 },
  game: { nome: 'Jogos & Keys', icone: '🎮', ordem: 11 },
  giftcard: { nome: 'Gift Cards', icone: '🎁', ordem: 10 },
  negocio: { nome: 'Negócios', icone: '💼', ordem: 54 },
  planilha: { nome: 'Planilhas', icone: '📊', ordem: 7 },
  cursos: { nome: 'Cursos', icone: '🎓', ordem: 2 },
  oficial: { nome: 'KIYVO Oficial', icone: '⚡', ordem: 0 },
  categorias_outros: { nome: 'Outros', icone: '✨', ordem: 99 },
}

function getCategories() {
  const contagem: Record<string, number> = {}
  for (const p of ALL_DEMO_FOR_COUNT) {
    const cat = (p.categoria || 'outros').toString()
    contagem[cat] = (contagem[cat] || 0) + 1
  }
  const cats = Object.entries(contagem).map(([slug, count]) => {
    const meta = ALL_CATEGORIES_META[slug] || ALL_CATEGORIES_META['categorias_outros']
    return {
      id: slug,
      nome: meta.nome,
      slug,
      icone: meta.icone,
      produtoCount: count,
      ordem: meta.ordem,
    }
  })
  // Deduplica categorias similares (ex: curso/cursos = mescla)
  const map = new Map<string, any>()
  for (const c of cats) {
    const chave = c.slug.replace(/s$/, '') // remove plural
    if (map.has(chave)) {
      map.get(chave).produtoCount += c.produtoCount
    } else {
      map.set(chave, { ...c })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem)
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const { data, error } = await supabase
        .from('products')
        .select('categoria', { count: 'exact', head: false })
        .eq('status', 'active')
      if (!error && data && data.length > 5) {
        const contagem: Record<string, number> = {}
        for (const p of data) {
          const cat = (p.categoria || 'outros').toString()
          contagem[cat] = (contagem[cat] || 0) + 1
        }
        const cats = Object.entries(contagem).map(([slug, n]) => ({
          id: slug,
          nome: ALL_CATEGORIES_META[slug]?.nome || slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          icone: ALL_CATEGORIES_META[slug]?.icone || '✨',
          produtoCount: n,
        }))
        return NextResponse.json({ ok: true, data: cats })
      }
    }
  } catch { /* usar fallback */ }

  return NextResponse.json({ ok: true, data: getCategories() })
}
