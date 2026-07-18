// ─────────────────────────────────────────────────────────────
// KIYVO — Middleware de Refresh de Sessão
// Garante que Server Components sempre tenham sessão atualizada
// Deve ser chamado no middleware.ts principal
// ─────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Refresh da sessão Supabase no middleware
 * Deve ser chamado ANTES das outras lógicas do middleware
 * Isso garante que Server Components recebam cookies atualizados
 */
export function refreshSession(request: NextRequest): NextResponse | null {
  if (!supabaseUrl || !supabaseAnonKey) return null

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({
          request: { headers: request.headers },
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return response
}
