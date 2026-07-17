import { NextResponse } from 'next/server'

// GET /api/products — List products with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'featured'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  // In production, this would query Supabase
  const mockProducts = [
    { id: '1', title: 'Windows 11 Pro — Licença Vitalícia', price: 49.90, category: 'Software & Licenças', type: 'license', rating: 4.8, sales: 5678, featured: true },
    { id: '2', title: 'Conta Valorant Diamante + 40 Skins', price: 89.90, category: 'Jogos & Contas', type: 'account', rating: 4.9, sales: 234, featured: true },
    { id: '3', title: 'Curso Full Stack 120h', price: 34.90, category: 'Cursos Online', type: 'course', rating: 5.0, sales: 1890, featured: true },
    { id: '4', title: 'E-book Marketing Digital 360°', price: 14.90, category: 'E-books & PDFs', type: 'ebook', rating: 4.7, sales: 890, featured: true },
    { id: '5', title: 'Pack 500+ Templates Canva', price: 19.90, category: 'Design & Templates', type: 'template', rating: 4.9, sales: 3456, featured: true },
    { id: '6', title: 'Netflix Premium — 4 Telas 1 Ano', price: 79.90, category: 'Streaming & Mídia', type: 'subscription', rating: 4.8, sales: 123, featured: true },
  ]

  let results = [...mockProducts]

  if (category) results = results.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }

  if (sort === 'price_asc') results.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') results.sort((a, b) => b.price - a.price)
  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating)
  if (sort === 'sales') results.sort((a, b) => b.sales - a.sales)

  const start = (page - 1) * limit
  const paginated = results.slice(start, start + limit)

  return NextResponse.json({
    data: paginated,
    total: results.length,
    page,
    limit,
    totalPages: Math.ceil(results.length / limit),
  })
}
