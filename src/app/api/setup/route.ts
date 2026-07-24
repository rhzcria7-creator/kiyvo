// ─────────────────────────────────────────────────────────────
// API Setup — Verificação e seed inicial do banco
// PROTEGIDO: POST requer autenticação de admin
// GET é público (apenas verifica status das tabelas)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/server'
import { sanitizeInput } from '@/lib/security'

// GET /api/setup/status — Verifica o que já está configurado (público)
export async function GET(request: NextRequest) {
  const supabase = createAdminClient()

  // Check which tables exist
  const tablesStatus: Record<string, boolean> = {}
  if (supabase) {
    const requiredTables = [
      'profiles', 'categories', 'products', 'product_images', 'orders',
      'order_messages', 'reviews', 'favorites', 'verifications', 'withdrawals',
      'coupons', 'notifications', 'kd_transactions', 'blog_posts',
      'subscriptions', 'interventions', 'community_posts', 'community_comments',
      'community_likes', 'chat_conversations', 'chat_messages',
      'affiliate_referrals', 'search_history', 'stripe_payments', 'disputes',
      'dispute_messages', 'security_audit_log', 'rate_limits',
    ]

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      tablesStatus[table] = !error
    }
  }

  // Check categories count
  let categoriesCount = 0
  if (supabase) {
    const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
    categoriesCount = count || 0
  }

  const supabaseConfigured = !!supabase
  const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY)

  return NextResponse.json({
    supabase: supabaseConfigured,
    stripe: stripeConfigured,
    tables: tablesStatus,
    tablesCount: Object.values(tablesStatus).filter(Boolean).length,
    tablesTotal: Object.keys(tablesStatus).length,
    categoriesSeeded: categoriesCount >= 20,
    ready: supabaseConfigured && stripeConfigured && Object.values(tablesStatus).every(Boolean),
  })
}

// POST /api/setup/seed — Auto-seed categories and coupons (ADMIN ONLY)
export async function POST(request: NextRequest) {
  // Verificar se é admin
  const { user, error: authError } = await requireAdmin()

  if (authError || !user) {
    return NextResponse.json({ error: authError || 'Acesso restrito a administradores' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const action = sanitizeInput(String(body.action || ''))

    if (action === 'seed_categories') {
      const categories = [
        { name: 'Jogos & Contas', slug: 'jogos-contas', icon: '🎮', sort_order: 1, is_active: true },
        { name: 'Software & Licenças', slug: 'software-licencas', icon: '💿', sort_order: 2, is_active: true },
        { name: 'Cursos Online', slug: 'cursos-online', icon: '🎓', sort_order: 3, is_active: true },
        { name: 'E-books & PDFs', slug: 'ebooks-pdfs', icon: '📚', sort_order: 4, is_active: true },
        { name: 'Design & Templates', slug: 'design-templates', icon: '🎨', sort_order: 5, is_active: true },
        { name: 'Streaming & Mídia', slug: 'streaming-midia', icon: '🎬', sort_order: 6, is_active: true },
        { name: 'Gift Cards', slug: 'gift-cards', icon: '🎁', sort_order: 7, is_active: true },
        { name: 'Domínios & Sites', slug: 'dominios-sites', icon: '🌐', sort_order: 8, is_active: true },
        { name: 'APIs & Cloud', slug: 'apis-cloud', icon: '⚡', sort_order: 9, is_active: true },
        { name: 'Plugins & Extensões', slug: 'plugins-extensoes', icon: '🧩', sort_order: 10, is_active: true },
        { name: 'Música & Áudio', slug: 'musica-audio', icon: '🎵', sort_order: 11, is_active: true },
        { name: 'Fotos & Vídeos', slug: 'fotos-videos', icon: '📸', sort_order: 12, is_active: true },
        { name: 'Cripto & NFT', slug: 'cripto-nft', icon: '🪙', sort_order: 13, is_active: true },
        { name: 'Steam Keys', slug: 'steam-keys', icon: '🔑', sort_order: 14, is_active: true },
        { name: 'Moedas & Gold', slug: 'moedas-gold', icon: '💰', sort_order: 15, is_active: true },
        { name: 'Serviços Freelance', slug: 'servicos-freelance', icon: '💼', sort_order: 16, is_active: true },
        { name: 'Ferramentas & Apps', slug: 'ferramentas-apps', icon: '🛠️', sort_order: 17, is_active: true },
        { name: '3D & Modelos', slug: '3d-modelos', icon: '🧊', sort_order: 18, is_active: true },
        { name: 'Assinaturas', slug: 'assinaturas', icon: '🔄', sort_order: 19, is_active: true },
        { name: 'Itens & Skins', slug: 'itens-skins', icon: '⚔️', sort_order: 20, is_active: true },
      ]

      const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: `${categories.length} categorias criadas`, categories: categories.length })
    }

    if (action === 'seed_coupons') {
      const coupons = [
        { code: 'WELCOME10', description: '10% de desconto para novos usuários', discount_type: 'percentage', discount_value: 10, min_order_value: 20, max_uses: 1000, is_active: true },
        { code: 'DIGITAL20', description: '20% em produtos digitais', discount_type: 'percentage', discount_value: 20, min_order_value: 50, max_uses: 500, is_active: true },
        { code: 'KIYVO15', description: '15% em toda a loja', discount_type: 'percentage', discount_value: 15, min_order_value: 30, max_uses: 800, is_active: true },
        { code: 'SOFTWARE25', description: '25% em software e licenças', discount_type: 'percentage', discount_value: 25, min_order_value: 100, max_uses: 300, is_active: true },
        { code: 'FLAT5', description: 'R$ 5 de desconto fixo', discount_type: 'fixed', discount_value: 5, min_order_value: 25, max_uses: 2000, is_active: true },
        { code: 'FIRSTBUY', description: 'R$ 10 de desconto na primeira compra', discount_type: 'fixed', discount_value: 10, min_order_value: 30, max_uses: 5000, is_active: true },
      ]

      const { error } = await supabase.from('coupons').upsert(coupons, { onConflict: 'code' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: `${coupons.length} cupons criados`, coupons: coupons.length })
    }

    return NextResponse.json({ error: 'Ação inválida. Use: seed_categories, seed_coupons' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Setup falhou' }, { status: 500 })
  }
}
