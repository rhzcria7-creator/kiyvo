// ─────────────────────────────────────────────────────────────
// KIYVO — LocalDB
//
// Banco de dados LOCAL em memória com persistência em JSON
// (usado automaticamente quando SUPABASE_URL não está configurado).
//
// Isso garante que login/cadastro/pedidos/badges/afiliados/boosts
// funcionem 100% MESMO SEM Supabase configurado.
//
// Quando você adicionar NEXT_PUBLIC_SUPABASE_URL e as chaves no .env.local,
// o código automaticamente usa o Supabase real.
//
// Em ambientes Edge/serveless sem filesystem (Vercel Edge Functions),
// o banco roda em memória (reinicia a cada cold-start, mas login funciona).
// Em Node (API routes com runtime: 'nodejs') usa persistência em arquivo.
// ─────────────────────────────────────────────────────────────

interface UserRecord {
  id: string
  email: string
  password_hash: string // sha256(senha + salt)
  salt: string
  full_name: string
  username: string
  role: 'buyer' | 'vendor' | 'admin' | 'ceo' | 'cto' | 'coo' | 'founder' | 'moderator' | 'support'
  is_admin: boolean
  is_banned: boolean
  seller_plan: 'free' | 'basico' | 'pro' | 'plus'
  badges: string[]
  kd_points: number
  referral_code: string
  referred_by: string | null
  phone: string | null
  phone_verified: boolean
  cpf: string | null
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  created_at: string
  avatar_url: string | null
  total_purchases: number
  total_spent: number
  total_sales: number
  rating: number
}

interface SessionRecord {
  token: string
  user_id: string
  created_at: string
  expires_at: string
}

interface OrderRecord {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string | null
  product_id: string | null
  sku: string | null
  title: string
  price: number
  subtotal: number
  discount_pct: number
  discount_amount: number
  badge_discount_pct: number
  platform_fee: number
  affiliate_code: string | null
  status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'in_dispute'
  payment_method: 'pix' | 'credit_card' | 'boleto' | 'kd_points'
  payment_id: string | null
  asset: { type: string; data: string } | null
  paid_at: string | null
  delivered_at: string | null
  created_at: string
}

interface ProductRecord {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  original_price?: number
  image: string
  category: string
  category_slug: string
  delivery_type: 'auto' | 'manual'
  asset_data: string | null // chave/licença para entrega automática
  stock: number
  sales: number
  rating: number
  reviews: number
  featured: boolean
  is_official: boolean
  is_boosted: boolean
  boost_ends_at: string | null
  ai_suspected: boolean
  created_at: string
}

interface CategoryRecord {
  id: string
  name: string
  slug: string
  emoji: string
  hue: string
  description: string
  created_by: string | null
  product_count: number
  is_active: boolean
  created_at: string
}

interface AffiliateRecord {
  id: string
  user_id: string
  referral_code: string
  total_clicks: number
  total_signups: number
  total_conversions: number
  total_earnings_kd: number
  available_earnings: number
  pending_earnings: number
  total_paid: number
  created_at: string
}

interface AffiliateConversion {
  id: string
  affiliate_id: string
  referred_user_id: string
  order_id: string | null
  type: 'click' | 'signup' | 'first_purchase' | 'purchase'
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  commission_amount: number
  commission_pct: number
  order_amount: number
  created_at: string
}

interface CouponRecord {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_active: boolean
  max_uses: number | null
  used_count: number
  min_order_value: number | null
  expires_at: string | null
  affiliate_code: string | null  // se é um cupom de indicação
  first_purchase_only: boolean
}

interface BoostRecord {
  id: string
  seller_id: string
  product_id: string | null
  placement: 'category' | 'home' | 'search' | 'banner'
  amount_paid: number
  days: number
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  starts_at: string
  ends_at: string
  stripe_session_id: string | null
  created_at: string
}

interface DB {
  users: UserRecord[]
  sessions: SessionRecord[]
  products: ProductRecord[]
  categories: CategoryRecord[]
  orders: OrderRecord[]
  affiliates: AffiliateRecord[]
  affiliateConversions: AffiliateConversion[]
  coupons: CouponRecord[]
  boosts: BoostRecord[]
}

// Singleton global
let dbCache: DB | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

function getDbPath(): string {
  try {
    if (typeof process === 'undefined') return ''
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const dir = path.join(process.cwd(), '.kiyvo-cache')
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      // Testa escrita
      const testFile = path.join(dir, '.wt')
      fs.writeFileSync(testFile, '1')
      fs.unlinkSync(testFile)
    } catch {
      return ''
    }
    return path.join(dir, 'db.json')
  } catch {
    return ''
  }
}

function simpleId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function hashPassword(password: string, salt: string): string {
  const s = password + ':' + salt
  // Implementação síncrona sem dependências de módulo Node:
  // usa uma combinação de FNV-1a + rotação para gerar hash determinístico.
  // Não é production-grade para senhas mas suficiente para LocalDB de demo.
  // Quando o usuário configurar Supabase, o hash é do próprio Supabase.
  let h1 = 0x811c9dc5
  let h2 = 0xdeadbeef
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0
    h2 = Math.imul(h2 ^ ((c << 5) + (c >> 2) + i * 31), 2246822519) >>> 0
  }
  // 64 hex chars = similar aparência a SHA-256
  const hex = (n: number) => n.toString(16).padStart(8, '0')
  return 'l' + hex(h1) + hex(h2) + hex(h1 ^ h2) + hex((h1 + h2) >>> 0) + '0'.repeat(32)
}

function randomSalt(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function seedDatabase(): DB {
  const now = new Date().toISOString()
  const adminSalt = randomSalt()
  const ceoSalt = randomSalt()
  const ctoSalt = randomSalt()

  // Senha padrão para contas de teste: Kiyvo@2025
  const defaultPwd = 'Kiyvo@2025'

  const admin: UserRecord = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@kiyvo.com.br',
    password_hash: hashPassword(defaultPwd, adminSalt),
    salt: adminSalt,
    full_name: 'Administrador KIYVO',
    username: 'admin',
    role: 'admin',
    is_admin: true,
    is_banned: false,
    seller_plan: 'plus',
    badges: ['admin', 'founder', 'verified', 'plan_plus', 'plan_pro', 'early_supporter'],
    kd_points: 99999,
    referral_code: 'ADMIN001',
    referred_by: null,
    phone: null,
    phone_verified: true,
    cpf: null,
    verification_status: 'verified',
    created_at: now,
    avatar_url: null,
    total_purchases: 0,
    total_spent: 0,
    total_sales: 0,
    rating: 5.0,
  }
  const ceo: UserRecord = {
    ...admin,
    id: '00000000-0000-4000-8000-000000000002',
    email: 'ceo@kiyvo.com.br',
    password_hash: hashPassword(defaultPwd, ceoSalt),
    salt: ceoSalt,
    full_name: 'CEO KIYVO',
    username: 'ceo',
    role: 'ceo',
    badges: ['ceo', 'founder', 'verified', 'plan_plus', 'early_supporter'],
    referral_code: 'CEO00001',
  }
  const cto: UserRecord = {
    ...admin,
    id: '00000000-0000-4000-8000-000000000003',
    email: 'cto@kiyvo.com.br',
    password_hash: hashPassword(defaultPwd, ctoSalt),
    salt: ctoSalt,
    full_name: 'CTO KIYVO',
    username: 'cto',
    role: 'cto',
    badges: ['cto', 'founder', 'verified', 'plan_plus', 'early_supporter'],
    referral_code: 'CTO00001',
  }

  // Usuário demo — para teste rápido na homepage (comprador)
  const demoSalt = randomSalt()
  const demo: UserRecord = {
    id: '00000000-0000-4000-8000-000000000999',
    email: 'demo@kiyvo.com.br',
    password_hash: hashPassword('demo123', demoSalt),
    salt: demoSalt,
    full_name: 'Usuário Demo',
    username: 'demo',
    role: 'buyer',
    is_admin: false,
    is_banned: false,
    seller_plan: 'free',
    badges: ['early_supporter', 'verified'],
    kd_points: 500,
    referral_code: 'DEMO123',
    referred_by: null,
    phone: null,
    phone_verified: false,
    cpf: null,
    verification_status: 'verified',
    created_at: now,
    avatar_url: null,
    total_purchases: 3,
    total_spent: 149.7,
    total_sales: 0,
    rating: 5.0,
  }

  // Categorias padrão (12)
  const categories: CategoryRecord[] = [
    { id: simpleId(), name: 'Jogos', slug: 'jogos', emoji: '🎮', hue: 'violet', description: 'Contas, keys, gift cards e jogos digitais para todas as plataformas.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Software', slug: 'software', emoji: '💻', hue: 'blue', description: 'Licenças, assinaturas e chaves de software.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Streaming', slug: 'streaming', emoji: '📺', hue: 'rose', description: 'Contas premium de Netflix, Spotify, Disney+, Prime e mais.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Música', slug: 'musica', emoji: '🎵', hue: 'pink', description: 'Álbuns, samples, beats e licenças musicais.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Gift Cards', slug: 'giftcards', emoji: '🎁', hue: 'emerald', description: 'Cartões pré-pagos e créditos em lojas digitais.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Cursos', slug: 'cursos', emoji: '📚', hue: 'amber', description: 'Cursos online, ebooks e materiais educacionais.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Templates', slug: 'templates', emoji: '🎨', hue: 'fuchsia', description: 'Templates para sites, design, apresentações e documentos.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'APIs & Dev', slug: 'apis', emoji: '⚡', hue: 'cyan', description: 'APIs, SaaS keys e ferramentas para desenvolvedores.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Filmes & Séries', slug: 'filmes', emoji: '🎬', hue: 'red', description: 'Filmes, séries e conteúdo audiovisual digital.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Plugins & Presets', slug: 'plugins', emoji: '🔌', hue: 'indigo', description: 'Plugins, VSTs, presets e add-ons.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Assinaturas', slug: 'assinaturas', emoji: '⭐', hue: 'yellow', description: 'Assinaturas premium para serviços digitais.', created_by: null, product_count: 0, is_active: true, created_at: now },
    { id: simpleId(), name: 'Segurança & VPN', slug: 'seguranca', emoji: '🛡', hue: 'teal', description: 'VPNs, antivírus e ferramentas de segurança digital.', created_by: null, product_count: 0, is_active: true, created_at: now },
  ]

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  // Produtos oficiais (LOJA OFICIAL)
  type OfficialSeed = { title: string; price: number; original_price?: number; category: string; emoji: string }
  const OFFICIAL_SEED: OfficialSeed[] = [
    { title: 'Netflix Premium 1 Mês', price: 19.9, original_price: 24.9, category: 'streaming', emoji: '📺' },
    { title: 'Spotify Premium 3 Meses', price: 29.9, original_price: 59.7, category: 'musica', emoji: '🎵' },
    { title: 'Steam Gift Card R$ 50', price: 44.9, category: 'jogos', emoji: '🎮' },
    { title: 'ChatGPT Plus 1 Mês', price: 79.9, category: 'software', emoji: '🤖' },
    { title: 'Disney+ 1 Mês', price: 14.9, category: 'streaming', emoji: '🏰' },
    { title: 'YouTube Premium 1 Mês', price: 17.9, category: 'streaming', emoji: '▶' },
    { title: 'Microsoft 365 Família 1 ano', price: 149.9, original_price: 299, category: 'software', emoji: '📊' },
    { title: 'Canva Pro 1 Ano', price: 39.9, original_price: 239, category: 'templates', emoji: '🎨' },
    { title: 'Xbox Game Pass Ultimate 1 Mês', price: 29.9, category: 'jogos', emoji: '🎮' },
    { title: 'PlayStation Plus Essential 1 Mês', price: 34.9, category: 'jogos', emoji: '🎮' },
    { title: 'iFood R$ 30', price: 26.9, category: 'giftcards', emoji: '🍔' },
    { title: 'Uber R$ 25', price: 22.9, category: 'giftcards', emoji: '🚗' },
    { title: 'VPN NordVPN 1 Ano', price: 49.9, original_price: 299, category: 'seguranca', emoji: '🛡' },
    { title: 'Prime Video 1 Mês', price: 9.9, category: 'streaming', emoji: '📺' },
  ]

  const products: ProductRecord[] = OFFICIAL_SEED.map((p, i) => ({
    id: '00000000-0000-4000-8000-' + String(100 + i).padStart(12, '0'),
    seller_id: '00000000-0000-4000-8000-000000000001',
    title: p.title,
    description: `Produto oficial da loja KIYVO: ${p.title}. Entrega automática após confirmação do pagamento.`,
    price: p.price,
    original_price: p.original_price,
    image: '',
    category: p.category,
    category_slug: p.category,
    delivery_type: 'auto',
    asset_data: p.emoji + '-' + p.category.toUpperCase().slice(0, 4) + '-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    stock: 999,
    sales: Math.floor(Math.random() * 2000) + 50,
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 500) + 20,
    featured: i < 4,
    is_official: true,
    is_boosted: false,
    boost_ends_at: null,
    ai_suspected: false,
    created_at: now,
  }))

  // Cupons padrão
  const coupons: CouponRecord[] = [
    { id: simpleId(), code: 'BOASVINDAS', discount_type: 'percentage', discount_value: 5, is_active: true, max_uses: null, used_count: 0, min_order_value: null, expires_at: null, affiliate_code: null, first_purchase_only: true },
    { id: simpleId(), code: 'KIYVO10', discount_type: 'percentage', discount_value: 10, is_active: true, max_uses: null, used_count: 0, min_order_value: 50, expires_at: null, affiliate_code: null, first_purchase_only: false },
  ]

  const db: DB = {
    users: [admin, ceo, cto, demo],
    sessions: [],
    products,
    categories,
    orders: [],
    affiliates: [
      { id: simpleId(), user_id: admin.id, referral_code: admin.referral_code, total_clicks: 0, total_signups: 0, total_conversions: 0, total_earnings_kd: 0, available_earnings: 0, pending_earnings: 0, total_paid: 0, created_at: now },
      { id: simpleId(), user_id: ceo.id, referral_code: ceo.referral_code, total_clicks: 0, total_signups: 0, total_conversions: 0, total_earnings_kd: 0, available_earnings: 0, pending_earnings: 0, total_paid: 0, created_at: now },
      { id: simpleId(), user_id: cto.id, referral_code: cto.referral_code, total_clicks: 0, total_signups: 0, total_conversions: 0, total_earnings_kd: 0, available_earnings: 0, pending_earnings: 0, total_paid: 0, created_at: now },
    ],
    affiliateConversions: [],
    coupons,
    boosts: [],
  }

  return db
}

function loadDb(): DB {
  if (dbCache) return dbCache
  try {
    const p = getDbPath()
    const fs = require('fs') as typeof import('fs')
    if (p && fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8')
      dbCache = JSON.parse(raw) as DB
      return dbCache!
    }
  } catch {
    // ignore
  }
  dbCache = seedDatabase()
  saveDb()
  return dbCache
}

function saveDb() {
  if (!dbCache) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      const p = getDbPath()
      if (!p) return
      const fs = require('fs') as typeof import('fs')
      fs.writeFileSync(p, JSON.stringify(dbCache, null, 2))
    } catch {
      // Ambiente read-only: mantém em memória
    }
  }, 300)
}

export function getDb(): DB {
  return loadDb()
}

export function persist() {
  saveDb()
}

// ── HELPERS ────────────────────────────────────────────────

export function findUserByEmail(email: string): UserRecord | null {
  const db = getDb()
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function findUserById(id: string): UserRecord | null {
  const db = getDb()
  return db.users.find((u) => u.id === id) ?? null
}

export function findUserByReferralCode(code: string): UserRecord | null {
  const db = getDb()
  const upper = code.toUpperCase()
  return db.users.find((u) => u.referral_code === upper) ?? null
}

export function createUser(data: {
  email: string
  password: string
  full_name: string
  username: string
  phone?: string | null
  cpf?: string | null
  avatar_url?: string | null
  referred_by?: string | null
}): UserRecord {
  const db = getDb()
  const id = simpleId()
  const salt = randomSalt()

  // Gerar código de afiliado único
  const base = (data.username || data.email.split('@')[0]).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'KIYVO'
  let code = base
  let i = 0
  while (db.users.some((u) => u.referral_code === code)) {
    code = base + Math.random().toString(36).slice(2, 5).toUpperCase()
    i++
    if (i > 20) break
  }

  // Verificar e-mail de equipe
  const { getTeamMember } = require('../badges') as typeof import('../badges')
  const team = getTeamMember(data.email)
  const role = team?.role ?? 'buyer'
  const isAdmin = !!team

  const badges: string[] = []
  if (team) badges.push(team.role)
  if (team) badges.push('verified')

  const user: UserRecord = {
    id,
    email: data.email.toLowerCase(),
    password_hash: hashPassword(data.password, salt),
    salt,
    full_name: data.full_name,
    username: data.username,
    role,
    is_admin: isAdmin,
    is_banned: false,
    seller_plan: 'free',
    badges,
    kd_points: data.referred_by ? 100 : 0, // bônus indicação
    referral_code: code,
    referred_by: data.referred_by ?? null,
    phone: data.phone ?? null,
    phone_verified: false,
    cpf: data.cpf ?? null,
    verification_status: isAdmin ? 'verified' : 'unverified',
    created_at: new Date().toISOString(),
    avatar_url: data.avatar_url ?? null,
    total_purchases: 0,
    total_spent: 0,
    total_sales: 0,
    rating: 5.0,
  }
  db.users.push(user)

  // Criar afiliado
  db.affiliates.push({
    id: simpleId(),
    user_id: id,
    referral_code: code,
    total_clicks: 0,
    total_signups: 0,
    total_conversions: 0,
    total_earnings_kd: 0,
    available_earnings: 0,
    pending_earnings: 0,
    total_paid: 0,
    created_at: user.created_at,
  })

  // Se foi indicado, registrar conversão de signup
  if (data.referred_by) {
    const referrer = findUserByReferralCode(data.referred_by)
    if (referrer) {
      const aff = db.affiliates.find((a) => a.user_id === referrer.id)
      if (aff) {
        aff.total_signups += 1
        db.affiliateConversions.push({
          id: simpleId(),
          affiliate_id: aff.id,
          referred_user_id: id,
          order_id: null,
          type: 'signup',
          status: 'approved',
          commission_amount: 0,
          commission_pct: 8,
          order_amount: 0,
          created_at: user.created_at,
        })
      }
    }
  }

  persist()
  return user
}

export function verifyPassword(user: UserRecord, password: string): boolean {
  return user.password_hash === hashPassword(password, user.salt)
}

export function createSession(userId: string, daysValid = 30): SessionRecord {
  const db = getDb()
  const token = simpleId() + '.' + simpleId() + '.' + Date.now().toString(36)
  const now = new Date()
  const session: SessionRecord = {
    token,
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000).toISOString(),
  }
  db.sessions.push(session)
  persist()
  return session
}

export function findSession(token: string): SessionRecord | null {
  const db = getDb()
  const s = db.sessions.find((x) => x.token === token)
  if (!s) return null
  if (new Date(s.expires_at) < new Date()) return null
  return s
}

export function deleteSession(token: string) {
  const db = getDb()
  db.sessions = db.sessions.filter((s) => s.token !== token)
  persist()
}

export { simpleId, hashPassword, randomSalt }

// Inicializar na primeira carga
loadDb()
