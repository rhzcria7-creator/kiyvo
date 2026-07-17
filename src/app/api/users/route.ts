import { NextResponse } from 'next/server'

// GET /api/users/[id] — Get user profile
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  // In production: query Supabase
  const profile = {
    id,
    username: 'PixelKing',
    full_name: 'João Silva',
    avatar_url: 'https://picsum.photos/seed/sk1/80/80',
    bio: 'Vendedor premium de produtos digitais',
    verification_status: 'verified',
    seller_plan: 'diamond',
    total_sales: 2341,
    rating: 4.9,
    pd_points: 5670,
    member_since: '2022',
    products_count: 15,
  }

  return NextResponse.json({ data: profile })
}
