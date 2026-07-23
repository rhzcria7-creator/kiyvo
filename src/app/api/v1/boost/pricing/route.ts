// Retorna preços dos impulsionamentos (público)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    placements: [
      {
        id: 'category',
        name: 'Destaque na Categoria',
        description: 'Seu produto no topo da página da categoria dele',
        prices: { '1d': 499, '3d': 1299, '7d': 2499, '30d': 7999 },
      },
      {
        id: 'home',
        name: 'Destaque na Home',
        description: 'Seu produto aparece na seção de destaques da página inicial',
        prices: { '1d': 999, '3d': 2499, '7d': 4999, '30d': 14999 },
      },
      {
        id: 'search',
        name: 'Topo nas Buscas',
        description: 'Seu produto em primeiro nos resultados relacionados',
        prices: { '1d': 799, '3d': 1999, '7d': 3999, '30d': 11999 },
      },
      {
        id: 'banner',
        name: 'Banner Premium',
        description: 'Banner rotativo nas páginas principais',
        prices: { '1d': 1499, '3d': 3999, '7d': 7999, '30d': 24999 },
      },
    ],
  })
}
