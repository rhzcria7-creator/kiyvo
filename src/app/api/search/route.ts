import { NextResponse } from 'next/server'

// GET /api/search — Global search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() || ''
  const type = searchParams.get('type') || 'all' // all, products, categories, sellers

  if (q.length < 2) {
    return NextResponse.json({ data: { products: [], categories: [], sellers: [] } })
  }

  const products = [
    { id: '1', title: 'Windows 11 Pro — Licença Vitalícia', price: 49.90, category: 'Software', type: 'product' },
    { id: '2', title: 'Conta Valorant Diamante', price: 89.90, category: 'Jogos', type: 'product' },
    { id: '3', title: 'Curso Full Stack 120h', price: 34.90, category: 'Cursos', type: 'product' },
    { id: '4', title: 'Pack Templates Canva', price: 19.90, category: 'Design', type: 'product' },
    { id: '5', title: 'Netflix Premium 1 Ano', price: 79.90, category: 'Streaming', type: 'product' },
    { id: '6', title: 'Office 365 Family', price: 59.90, category: 'Software', type: 'product' },
  ].filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))

  const categories = [
    { id: '1', name: 'Jogos & Contas', slug: 'jogos-contas', icon: '🎮', count: 2341 },
    { id: '2', name: 'Software & Licenças', slug: 'software-licencas', icon: '💿', count: 1876 },
    { id: '3', name: 'Cursos Online', slug: 'cursos-online', icon: '🎓', count: 1456 },
    { id: '4', name: 'E-books & PDFs', slug: 'ebooks-pdfs', icon: '📚', count: 987 },
    { id: '5', name: 'Design & Templates', slug: 'design-templates', icon: '🎨', count: 2345 },
  ].filter(c => c.name.toLowerCase().includes(q))

  const sellers = [
    { id: 's1', name: 'PixelKing', rating: 4.9, sales: 2341, verified: true },
    { id: 's2', name: 'SoftVault', rating: 4.8, sales: 1876, verified: true },
    { id: 's3', name: 'EduPro', rating: 4.7, sales: 954, verified: true },
  ].filter(s => s.name.toLowerCase().includes(q))

  const data = {
    products: type === 'all' || type === 'products' ? products : [],
    categories: type === 'all' || type === 'categories' ? categories : [],
    sellers: type === 'all' || type === 'sellers' ? sellers : [],
  }

  return NextResponse.json({ data })
}
