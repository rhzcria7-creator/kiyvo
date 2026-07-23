export const runtime = "nodejs";
// POST /api/auth/logout — Remove o cookie de sessão
import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { deleteSession } from '@/lib/localdb'

const COOKIE_NAME = 'kiyvo_session'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (token) deleteSession(token)
  const response = NextResponse.json({ ok: true })
  response.headers.set('Set-Cookie', serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }))
  return response
}
