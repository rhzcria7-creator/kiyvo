import { NextResponse } from 'next/server'

// POST /api/orders — Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, buyer_id, payment_method } = body

    if (!product_id || !buyer_id) {
      return NextResponse.json({ error: 'product_id and buyer_id required' }, { status: 400 })
    }

    // In production: validate with Supabase, create order, process payment
    const order = {
      id: `PD-${Date.now()}`,
      product_id,
      buyer_id,
      seller_id: 'seller_1',
      status: 'pending',
      payment_method: payment_method || 'pix',
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ data: order, message: 'Pedido criado com sucesso' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// GET /api/orders — List orders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const status = searchParams.get('status')

  const mockOrders = [
    { id: 'PD-2607-089', title: 'Windows 11 Pro', buyer: 'user1', seller: 'SoftVault', price: 49.90, status: 'delivered', date: '15/07/26' },
    { id: 'PD-2607-088', title: 'Curso Full Stack', buyer: 'user2', seller: 'EduPro', price: 34.90, status: 'pending', date: '15/07/26' },
    { id: 'PD-2607-087', title: 'Pack Templates Canva', buyer: 'user1', seller: 'DesignLab', price: 19.90, status: 'confirmed', date: '14/07/26' },
  ]

  let results = [...mockOrders]
  if (status) results = results.filter(o => o.status === status)

  return NextResponse.json({ data: results, total: results.length })
}
