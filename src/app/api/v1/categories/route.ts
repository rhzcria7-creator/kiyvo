// GET /api/v1/categories — categorias públicas com contagem de produtos
import { NextResponse } from 'next/server'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'

const ALL_DEMO_FOR_COUNT = [...DEMO_PRODUCTS, ...GG_PRODUCTS]

const ALL_CATEGORIES_META: Record<string, { nome: string; icone: string; ordem: number }> = {
  marketing: { nome: 'Marketing Digital', icone: '📣', ordem: 1 },
  curso: { nome: 'Cursos', icone: '🎓', ordem: 2 },
  copywriting: { nome: 'Copywriting', icone: '✍️', ordem: 3 },
  templates: { nome: 'Templates', icone: '🎨', ordem: 4 },
  ebooks: { nome: 'E-books', icone: '📖', ordem: 5 },
  software: { nome: 'Software & Licenças', icone: '🪟', ordem: 6 },
  planilhas: { nome: 'Planilhas', icone: '📊', ordem: 7 },
  design: { nome: 'Design Assets', icone: '🖼️', ordem: 8 },
  streaming: { nome: 'Streaming', icone: '📺', ordem: 9 },
  giftcards: { nome: 'Gift Cards', icone: '🎁', ordem: 10 },
  jogos: { nome: 'Jogos', icone: '🎮', ordem: 11 },
  ferramentas: { nome: 'Ferramentas & IA', icone: '🤖', ordem: 12 },
  social: { nome: 'Redes Sociais', icone: '📱', ordem: 13 },
  saude: { nome: 'Saúde', icone: '💪', ordem: 14 },
  financas: { nome: 'Finanças', icone: '💹', ordem: 15 },
  beleza: { nome: 'Beleza', icone: '💄', ordem: 16 },
  gastronomia: { nome: 'Gastronomia', icone: '🍳', ordem: 17 },
  juridico: { nome: 'Jurídico', icone: '⚖️', ordem: 18 },
  afiliados: { nome: 'Afiliados', icone: '🤝', ordem: 19 },
  produtividade: { nome: 'Produtividade', icone: '⏰', ordem: 20 },
  prompts: { nome: 'Prompts IA', icone: '💬', ordem: 21 },
  servico: { nome: 'Serviços', icone: '🛎️', ordem: 22 },
  mentoria: { nome: 'Mentorias', icone: '🎯', ordem: 23 },
  tecnologia: { nome: 'Tecnologia', icone: '💻', ordem: 24 },
  video: { nome: 'Vídeo', icone: '🎥', ordem: 25 },
  pack: { nome: 'Packs', icone: '📦', ordem: 26 },
  script: { nome: 'Scripts', icone: '📝', ordem: 27 },
  licenca: { nome: 'Licenças', icone: '🔑', ordem: 28 },
  assinatura: { nome: 'Assinaturas', icone: '🔄', ordem: 29 },
  game: { nome: 'Games', icone: '🎮', ordem: 30 },
  giftcard: { nome: 'Gift Cards', icone: '🎁', ordem: 31 },
  negocio: { nome: 'Negócios', icone: '💼', ordem: 32 },
  planilha: { nome: 'Planilhas', icone: '📊', ordem: 33 },
  cursos: { nome: 'Cursos', icone: '🎓', ordem: 34 },
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
