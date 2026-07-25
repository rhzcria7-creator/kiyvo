// ─────────────────────────────────────────────────────────────
// Supabase API Helper v0.0.1 — Helper universal para APIs
// Padrão: Tenta Supabase primeiro, fallback demo/error
// Todas as rotas /api/* usam este helper
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    totalPages?: number
  }
}

/** Cria resposta de sucesso */
export function successResponse<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  const body: ApiResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

/** Cria resposta de erro */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error } as ApiResponse, { status })
}

/** Cria resposta de erro não autorizado */
export function unauthorizedResponse(msg = 'Não autorizado') {
  return NextResponse.json({ success: false, error: msg } as ApiResponse, { status: 401 })
}

/** Cria resposta de não encontrado */
export function notFoundResponse(msg = 'Recurso não encontrado') {
  return NextResponse.json({ success: false, error: msg } as ApiResponse, { status: 404 })
}

/** Cria resposta de rate limit */
export function rateLimitResponse(retryAfter = 60) {
  return NextResponse.json(
    { success: false, error: 'Muitas requisições. Tente novamente em alguns segundos.' } as ApiResponse,
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

/** Cria resposta de erro interno */
export function internalErrorResponse(error?: string) {
  console.error('Internal server error:', error)
  return NextResponse.json(
    { success: false, error: 'Erro interno do servidor' } as ApiResponse,
    { status: 500 }
  )
}

/** Tenta obter cliente Supabase (pode retornar null se não configurado) */
export async function trySupabase() {
  try {
    const { getServiceClient } = await import('./server')
    return getServiceClient()
  } catch {
    return null
  }
}

/** Wrapper que captura erros e retorna resposta padronizada */
export async function apiHandler<T>(
  handler: () => Promise<NextResponse>,
  options?: { requireAuth?: boolean; requireAdmin?: boolean }
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) throw err
    return internalErrorResponse(err?.message)
  }
}

/** Valida método HTTP */
export function validateMethod(request: Request, allowedMethods: string[]) {
  const method = request.method.toUpperCase()
  if (!allowedMethods.includes(method)) {
    return errorResponse(`Método ${method} não permitido. Use: ${allowedMethods.join(', ')}`, 405)
  }
  return null
}

/** Extrai IP real do request */
export function extractIPFromRequest(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

/** Extrai user-agent */
export function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') || ''
}

/** Valida ID UUID */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}
