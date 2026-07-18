// ─────────────────────────────────────────────────────────────
// KIYVO — Helpers de Autenticação e Autorização
// Centraliza verificação de sessão, roles e permissões
// Nenhuma API deve acessar dados sem verificar identidade
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

interface AuthUser {
  id: string
  email: string
  role: string
  is_admin: boolean
  is_banned: boolean
  seller_plan: string
}

interface AuthResult {
  user: AuthUser | null
  supabase: ReturnType<typeof createClient>
  adminClient: ReturnType<typeof createAdminClient>
  error: string | null
}

/**
 * Verifica se o usuário está autenticado e retorna seus dados.
 * Retorna o client com contexto de cookies (respeita RLS).
 * Se o usuário não estiver autenticado, retorna erro.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      supabase,
      adminClient: null,
      error: 'Autenticação necessária',
    }
  }

  // Buscar perfil com role e status
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_admin, is_banned, seller_plan')
    .eq('id', user.id)
    .single()

  // Verificar se está banido
  if (profile?.is_banned) {
    return {
      user: null,
      supabase,
      adminClient: null,
      error: 'Conta suspensa por violação dos termos de uso',
    }
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email || '',
    role: profile?.role || 'buyer',
    is_admin: profile?.is_admin || false,
    is_banned: profile?.is_banned || false,
    seller_plan: profile?.seller_plan || 'silver',
  }

  return {
    user: authUser,
    supabase,
    adminClient: createAdminClient(),
    error: null,
  }
}

/**
 * Verifica se o usuário é admin. Se não for, retorna erro.
 * Use para proteger rotas /api/v1/admin/*
 */
export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth()

  if (result.error) return result

  if (!result.user?.is_admin) {
    return {
      ...result,
      user: null,
      error: 'Acesso restrito a administradores',
    }
  }

  return result
}

/**
 * Verifica se o usuário é vendedor (vendor) ou admin.
 * Use para proteger rotas de criação de produto, anúncios, etc.
 */
export async function requireVendor(): Promise<AuthResult> {
  const result = await requireAuth()

  if (result.error) return result

  if (result.user?.role !== 'vendor' && !result.user?.is_admin) {
    return {
      ...result,
      user: null,
      error: 'Acesso restrito a vendedores',
    }
  }

  return result
}

/**
 * Verifica se o usuário é o dono do recurso ou admin.
 * Use para proteger rotas que modificam recursos específicos.
 */
export async function requireOwnerOrAdmin(resourceUserId: string): Promise<AuthResult> {
  const result = await requireAuth()

  if (result.error) return result

  if (result.user?.id !== resourceUserId && !result.user?.is_admin) {
    return {
      ...result,
      user: null,
      error: 'Você não tem permissão para acessar este recurso',
    }
  }

  return result
}

/**
 * Helper para obter o admin client de forma segura.
 * Apenas para APIs que PRECISAM bypassar RLS (ex: busca global).
 * SEMPRE deve ser usado junto com requireAuth() ou requireAdmin().
 */
export function getSafeAdminClient(client: ReturnType<typeof createAdminClient>) {
  if (!client) throw new Error('Admin client não configurado — verifique SUPABASE_SERVICE_ROLE_KEY')
  return client
}
