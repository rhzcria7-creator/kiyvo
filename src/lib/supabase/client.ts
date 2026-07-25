// ─────────────────────────────────────────────────────────────
// Supabase Client v0.0.1 — Client browser-safe
// NUNCA crasha se Supabase não configurado
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && !SUPABASE_URL.includes('placeholder') && SUPABASE_KEY)
}

function mockChain() {
  const chain: any = {}
  chain.select = () => chain
  chain.limit = () => chain
  chain.single = () => chain
  chain.maybeSingle = () => chain
  chain.eq = () => chain
  chain.order = () => chain
  chain.range = () => chain
  chain.gte = () => chain
  chain.lte = () => chain
  chain.or = () => chain
  chain.in = () => chain
  chain.insert = () => chain
  chain.update = () => chain
  chain.delete = () => chain
  chain.then = (resolve: any) => resolve({ data: null, error: new Error('Supabase não configurado'), count: 0 })
  return chain
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    if (typeof window === 'undefined') {
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase não configurado') }),
          signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase não configurado') }),
        },
        from: () => mockChain(),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            createSignedUrl: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
          }),
        },
      }
    }
  }

  try {
    const { createBrowserClient } = require('@supabase/ssr')
    return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  } catch {
    return null
  }
}
