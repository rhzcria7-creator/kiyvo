'use client'

/**
 * AuthContext unificado — funciona com LocalDB (padrão, sem configuração)
 * ou Supabase (quando configurado no .env.local).
 *
 * Modo LocalDB: usa /api/auth/login, /api/auth/signup, /api/auth/me, /api/auth/logout
 *               com cookie httpOnly.
 * Modo Supabase: usa @supabase/ssr como antes.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { isSupabaseConfigured } from '@/lib/backend/detect'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio?: string | null
  phone: string | null
  cpf: string | null
  birth_date?: string | null
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  role: 'buyer' | 'vendor' | 'admin' | 'ceo' | 'cto' | 'coo' | 'founder' | 'moderator' | 'support'
  kyc_status?: string
  seller_plan: 'silver' | 'gold' | 'diamond' | 'free' | 'basico' | 'pro' | 'plus'
  kd_points: number
  total_sales: number
  total_purchases: number
  rating: number
  is_admin: boolean
  is_banned: boolean
  two_factor_enabled?: boolean
  created_at: string
  badges: string[]
  referral_code: string
  email: string
}

interface AuthContextType {
  user: { id: string; email: string } | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, extra?: Record<string, unknown>) => Promise<{ error: string | { message: string } | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  backend: 'localdb' | 'supabase'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const backend = isSupabaseConfigured() ? 'supabase' : 'localdb'

  const fetchMe = useCallback(async () => {
    if (backend === 'supabase') {
      // Supabase: usa client nativo
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user: su } } = await supabase.auth.getUser()
      if (su) {
        setUser({ id: su.id, email: su.email || '' })
        const { data: p } = await supabase.from('profiles').select('*').eq('id', su.id).maybeSingle()
        if (p) setProfile(normalizeProfile(p, su.email || ''))
        else setProfile(null)
      } else {
        setUser(null); setProfile(null)
      }
      return
    }

    // LocalDB: usa /api/auth/me
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email })
          setProfile(normalizeProfile(data.user, data.user.email))
          return
        }
      }
      setUser(null); setProfile(null)
    } catch {
      setUser(null); setProfile(null)
    }
  }, [backend])

  const refreshProfile = useCallback(fetchMe, [fetchMe])

  useEffect(() => {
    let mounted = true
    async function init() {
      await fetchMe()
      if (mounted) setLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [fetchMe])

  // Supabase listener (apenas quando configurado)
  useEffect(() => {
    if (backend !== 'supabase') return
    let sub: { unsubscribe: () => void } | null = null
    ;(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' })
          const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
          if (p) setProfile(normalizeProfile(p, session.user.email || ''))
        } else {
          setUser(null); setProfile(null)
        }
      })
      sub = data.subscription
    })()
    return () => { sub?.unsubscribe() }
  }, [backend])

  const signIn = async (email: string, password: string) => {
    if (backend === 'supabase') {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) await fetchMe()
      return { error: error?.message ?? null }
    }
    // LocalDB
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* ignore */ }
      if (!res.ok) {
        return { error: (data.error as string) || `Erro ${res.status} ao entrar` }
      }
      await fetchMe()
      return { error: null }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Erro de conexão com o servidor' }
    }
  }

  const signUp = async (email: string, password: string, extra?: Record<string, unknown>) => {
    const full_name = (extra?.full_name as string) || (extra?.fullName as string) || ''
    const username = (extra?.username as string) || email.split('@')[0]
    const referral_code = (extra?.referral_code as string) || null

    // Captura referral code do localStorage se não fornecido
    let refCode = referral_code
    if (!refCode && typeof window !== 'undefined') {
      refCode = localStorage.getItem('kiyvo_ref_code')
      if (refCode && refCode.length > 32) refCode = refCode.slice(0, 32)
    }

    if (backend === 'supabase') {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, full_name, referred_by: refCode } },
      })
      return { error: error?.message ?? null }
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, full_name, username, referral_code: refCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.details && typeof data.details === 'object') {
          const firstErr = Object.values(data.details)[0] as string
          return { error: firstErr || data.error || 'Erro ao criar conta' }
        }
        return { error: data.error || 'Erro ao criar conta' }
      }
      await fetchMe()
      return { error: null }
    } catch {
      return { error: 'Erro de conexão' }
    }
  }

  const signOut = async () => {
    if (backend === 'supabase') {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null); setProfile(null)
      return
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    setUser(null); setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, backend }}>
      {children}
    </AuthContext.Provider>
  )
}

function normalizeProfile(raw: Record<string, unknown>, email: string): Profile {
  return {
    id: String(raw.id || ''),
    email: String(raw.email || email || ''),
    username: String(raw.username || email.split('@')[0] || 'usuario'),
    full_name: raw.full_name ? String(raw.full_name) : null,
    avatar_url: raw.avatar_url ? String(raw.avatar_url) : null,
    bio: raw.bio ? String(raw.bio) : null,
    phone: raw.phone ? String(raw.phone) : null,
    cpf: raw.cpf ? String(raw.cpf) : null,
    birth_date: raw.birth_date ? String(raw.birth_date) : null,
    verification_status: (raw.verification_status as Profile['verification_status']) || 'unverified',
    role: (raw.role as Profile['role']) || 'buyer',
    kyc_status: raw.kyc_status ? String(raw.kyc_status) : undefined,
    seller_plan: (raw.seller_plan as Profile['seller_plan']) || 'free',
    kd_points: Number(raw.kd_points) || 0,
    total_sales: Number(raw.total_sales) || 0,
    total_purchases: Number(raw.total_purchases) || 0,
    rating: Number(raw.rating) || 5,
    is_admin: !!raw.is_admin,
    is_banned: !!raw.is_banned,
    two_factor_enabled: !!raw.two_factor_enabled,
    created_at: String(raw.created_at || new Date().toISOString()),
    badges: Array.isArray(raw.badges) ? (raw.badges as string[]) : [],
    referral_code: String(raw.referral_code || ''),
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
