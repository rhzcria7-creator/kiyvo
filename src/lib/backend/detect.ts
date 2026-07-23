// ─────────────────────────────────────────────────────────────
// KIYVO — Detecção de backend disponível
//
// Se SUPABASE_URL estiver configurado E não for placeholder, usa Supabase.
// Caso contrário usa o LocalDB (sem configuração necessária).
// Isso faz o site funcionar 100% em qualquer ambiente.
// ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.includes('.supabase.co')
  )
}

export function isLocalBackend(): boolean {
  return !isSupabaseConfigured()
}
