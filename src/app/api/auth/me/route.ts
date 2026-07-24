export const runtime = "nodejs";
// GET /api/auth/me — Retorna o usuário autenticado (via cookie httpOnly)
import { NextRequest, NextResponse } from 'next/server'
import { findSession, findUserById } from '@/lib/localdb'

const COOKIE_NAME = 'kiyvo_session'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ user: null })
  const session = findSession(token)
  if (!session) return NextResponse.json({ user: null })
  const user = findUserById(session.user_id)
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      is_admin: user.is_admin,
      avatar_url: user.avatar_url,
      badges: user.badges,
      kd_points: user.kd_points,
      referral_code: user.referral_code,
      verification_status: user.verification_status,
      phone_verified: user.phone_verified,
      total_purchases: user.total_purchases,
      total_spent: user.total_spent,
      total_sales: user.total_sales,
      seller_plan: user.seller_plan,
      created_at: user.created_at,
    },
  })
}
