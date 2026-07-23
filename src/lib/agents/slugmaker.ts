// Agente SlugMaker — gera slugs otimizados para SEO e URLs
export interface SlugInput {
  titulo: string
  categoria?: string
  id?: string
  locale?: 'pt-BR' | 'en' | 'es'
  maxLength?: number
}
export interface SlugResult {
  slug: string
  slugComId: string
  url: string
  alternativos: string[]
  metaSlug: string
}

export function gerarSlug(input: SlugInput): SlugResult {
  const { titulo, categoria, id, locale = 'pt-BR', maxLength = 80 } = input
  let s = titulo.toLowerCase().trim()
  if (locale === 'pt-BR') {
    const accented: Record<string,string> = { á:'a', à:'a', ã:'a', â:'a', é:'e', ê:'e', í:'i', ó:'o', ô:'o', õ:'o', ú:'u', ç:'c' }
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const [k,v] of Object.entries(accented)) { void k; void v; }
  } else {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
  s = s.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (s.length > maxLength) s = s.slice(0, maxLength).replace(/-[^-]*$/, '')
  let slug = s || 'produto'
  const catSlug = categoria ? '/' + categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,20) : ''
  const idCurto = id ? id.slice(0, 8) : Math.random().toString(36).slice(2, 8)
  const slugComId = slug + '-' + idCurto
  const url = `/p${catSlug}/${slugComId}`
  const alternativos = [
    slug + '-2026',
    'como-' + slug,
    slug + '-comprar',
    slug + '-preco',
    'melhor-' + slug,
  ].slice(0, 4)
  return {
    slug,
    slugComId,
    url,
    alternativos,
    metaSlug: slug.slice(0, 60),
  }
}
