// ─────────────────────────────────────────────────────────────
// Supabase Server Client v0.0.1 — ROBUSTO: nunca crasha sem env
// createServerClient com cookies + helpers + getServiceClient
// ─────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/** Verifica se Supabase está configurado */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && !SUPABASE_URL.includes('placeholder'))
}

/** Cria client server-side com cookies (para Server Components/Route Handlers) */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  }

  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }) } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: '', ...options }) } catch {}
      },
    },
  })
}

/** Cria admin client com service_role para operações internas */
export function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    cookies: { get() { return undefined }, set() {}, remove() {} },
  })
}

/** Cria service client direto (sem cookies, para webhooks/background) */
export function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null
  const { createClient } = require('@supabase/supabase-js')
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
}

/** Obtém sessão atual */
export async function getSession() {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch { return null }
}

/** Obtém usuário atual */
export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}
