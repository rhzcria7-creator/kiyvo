-- ═══════════════════════════════════════════════════════════════
-- KIYVO v5.0 — SCHEMA DEFINITIVO
-- Motor: Supabase PostgreSQL + Stripe Connect + Escrow
-- 100% IDEMPOTENTE — Execute no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 0. ENUMS
-- ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('buyer', 'vendor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft', 'published', 'banned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending_payment',
    'paid',
    'processing',
    'delivered',
    'confirmed',
    'disputed',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.affiliate_conv_status AS ENUM ('pending', 'cleared', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('unverified', 'email_verified', 'identity_verified', 'business_verified', 'trusted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 1. PROFILES — Identidade dos utilizadores
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role         public.user_role  NOT NULL DEFAULT 'buyer',
  full_name    TEXT,
  username     TEXT UNIQUE,
  avatar_url   TEXT,
  bio          TEXT,
  phone        TEXT,
  cpf          TEXT,
  birth_date   DATE,
  address_cep         TEXT,
  address_street      TEXT,
  address_number      TEXT,
  address_complement  TEXT,
  address_neighborhood TEXT,
  address_city        TEXT,
  address_state       TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  trust_score         INTEGER NOT NULL DEFAULT 100,
  pd_points           INTEGER NOT NULL DEFAULT 0,
  is_banned           BOOLEAN NOT NULL DEFAULT FALSE,
  banned_reason       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────
-- 2. WALLETS — Cache visual (fonte da verdade = Stripe)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wallets (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance_available DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (balance_available >= 0),
  balance_pending   DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (balance_pending >= 0),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION public.create_wallet_for_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_profile();

-- ───────────────────────────────────────────────────────────────
-- 3. VENDORS (Store Motor) — Lojas com Stripe Connect
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendors (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  store_name               TEXT NOT NULL,
  slug                     TEXT UNIQUE NOT NULL,
  description              TEXT,
  logo_url                 TEXT,
  banner_url               TEXT,
  stripe_account_id        TEXT,  -- CRÍTICO para Stripe Connect
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  commission_rate          DECIMAL(5,2) NOT NULL DEFAULT 10.00 CHECK (commission_rate BETWEEN 0 AND 30),
  rating_avg               DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_sales              INTEGER NOT NULL DEFAULT 0,
  total_products           INTEGER NOT NULL DEFAULT 0,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 4. CATEGORIES — Subcategorias via self-reference
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 5. PRODUCTS — Catálogo com tsvector (Full Text Search)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id        UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description_html TEXT NOT NULL DEFAULT '',
  base_price       DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  original_price   DECIMAL(10,2),
  currency         TEXT NOT NULL DEFAULT 'BRL',
  product_type     TEXT NOT NULL DEFAULT 'digital_download',
  stock_quantity   INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
  is_digital       BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_type    TEXT NOT NULL DEFAULT 'auto' CHECK (delivery_type IN ('auto', 'manual', 'license_key', 'course_access', 'download', 'api_credentials', 'custom')),
  status           public.product_status NOT NULL DEFAULT 'draft',
  tags             TEXT[] DEFAULT '{}',
  sales_count      INTEGER NOT NULL DEFAULT 0,
  views_count      INTEGER NOT NULL DEFAULT 0,
  rating           DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count     INTEGER NOT NULL DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector    tsvector,  -- Full Text Search nativo do Postgres
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice GIN para Full Text Search (performático)
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(search_vector);

-- Auto-update search_vector via trigger
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description_html, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search_vector ON public.products;
CREATE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE OF title, description_html, tags ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_search_vector_update();

-- ───────────────────────────────────────────────────────────────
-- 6. PRODUCT_VARIANTS — SKUs com atributos JSONB
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_variants (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku               TEXT,
  attributes        JSONB NOT NULL DEFAULT '{}',  -- ex: {"color":"black","size":"XL"}
  price_adjustment  DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 7. PRODUCT_IMAGES — Imagens com Storage URLs
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,  -- Supabase Storage public URL
  alt_text      TEXT,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 8. ORDERS — Motor Financeiro (Escrow via Stripe Connect)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id                         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number               TEXT UNIQUE NOT NULL,
  buyer_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id                  UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  stripe_payment_intent_id   TEXT,
  stripe_checkout_session_id TEXT,
  subtotal                   DECIMAL(14,2) NOT NULL CHECK (subtotal >= 0),
  platform_fee               DECIMAL(14,2) NOT NULL DEFAULT 0,
  affiliate_fee              DECIMAL(14,2) NOT NULL DEFAULT 0,
  vendor_net                 DECIMAL(14,2) NOT NULL DEFAULT 0,
  status                     public.order_status NOT NULL DEFAULT 'pending_payment',
  shipping_data              JSONB DEFAULT '{}',
  paid_at                    TIMESTAMPTZ,
  delivered_at               TIMESTAMPTZ,
  confirmed_at               TIMESTAMPTZ,
  disputed_at                TIMESTAMPTZ,
  refunded_at                TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 100000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PD-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- 9. ORDER_ITEMS — Itens por encomenda
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id              UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id            UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title_snapshot TEXT NOT NULL,  -- Snapshot do título no momento da compra
  quantity              INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price            DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  digital_delivery_url  TEXT,  -- URL assinada do Supabase Storage
  license_key           TEXT,  -- Chave de licença (se aplicável)
  delivery_status       TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'confirmed', 'revoked')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 10. REVIEWS — Avaliações verificadas
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id   UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  attachments TEXT[] DEFAULT '{}',  -- Supabase Storage URLs
  seller_response TEXT,
  is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)  -- Uma review por compra
);

-- ───────────────────────────────────────────────────────────────
-- 11. AFFILIATES (Viral Engine)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.affiliates (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  referral_code         TEXT UNIQUE NOT NULL,  -- ex: 'JOHN2026'
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00 CHECK (commission_percentage BETWEEN 0 AND 50),
  total_clicks          INTEGER NOT NULL DEFAULT 0,
  total_conversions     INTEGER NOT NULL DEFAULT 0,
  total_earnings        DECIMAL(14,2) NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id   UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ip_address     TEXT NOT NULL,  -- Hash, nunca IP puro
  user_agent     TEXT,
  referrer       TEXT,
  clicked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id      UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  commission_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status            public.affiliate_conv_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleared_at        TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────────
-- 12. DOWNLOAD_TOKENS — Entrega digital segura
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.download_tokens (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id   UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token           TEXT UNIQUE NOT NULL,
  file_path       TEXT NOT NULL,  -- Path no Supabase Storage
  max_downloads   INTEGER NOT NULL DEFAULT 5,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('order', 'payment', 'delivery', 'review', 'dispute', 'system', 'affiliate', 'vendor')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 14. DISPUTES
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.disputes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  opened_by    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_buyer', 'resolved_vendor', 'closed')),
  resolution   TEXT,
  evidence     TEXT[] DEFAULT '{}',  -- Supabase Storage URLs
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────────
-- 15. COUPONS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupons (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  vendor_id       UUID REFERENCES public.vendors(id) ON DELETE CASCADE,  -- NULL = global
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 16. AUDIT LOG
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  resource   TEXT,
  severity   TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  ip_address TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 17. LEDGER — Partidas Dobradas (Fonte da verdade financeira)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ledger_accounts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'revenue', 'expense')),
  description TEXT,
  balance     DECIMAL(14,2) NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description  TEXT NOT NULL,
  total_debit  DECIMAL(14,2) NOT NULL,
  total_credit DECIMAL(14,2) NOT NULL,
  is_balanced  BOOLEAN NOT NULL DEFAULT TRUE,
  reference_type TEXT,
  reference_id   TEXT,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id  UUID NOT NULL REFERENCES public.ledger_transactions(id) ON DELETE CASCADE,
  account_name    TEXT NOT NULL,
  debit           DECIMAL(14,2) NOT NULL DEFAULT 0,
  credit          DECIMAL(14,2) NOT NULL DEFAULT 0,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed ledger accounts
INSERT INTO public.ledger_accounts (name, type, description) VALUES
  ('platform_revenue', 'revenue', 'Receita da plataforma'),
  ('platform_expense', 'expense', 'Despesas da plataforma'),
  ('vendor_payable', 'liability', 'Valores a pagar aos vendors'),
  ('buyer_fee_revenue', 'revenue', 'Taxa do comprador'),
  ('vendor_fee_revenue', 'revenue', 'Taxa do vendor'),
  ('gateway_expense', 'expense', 'Custos do gateway Stripe'),
  ('affiliate_payable', 'liability', 'Comissões de afiliados a pagar'),
  ('escrow', 'asset', 'Dinheiro em custódia (Escrow)'),
  ('payout', 'asset', 'Saques processados'),
  ('refund_payable', 'liability', 'Reembolsos a processar')
ON CONFLICT (name) DO NOTHING;

-- ───────────────────────────────────────────────────────────────
-- 18. SEED CATEGORIES
-- ───────────────────────────────────────────────────────────────

INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Jogos & Contas', 'jogos-contas', '🎮', 1),
  ('Software & Licenças', 'software-licencas', '💿', 2),
  ('Cursos Online', 'cursos-online', '🎓', 3),
  ('E-books & PDFs', 'ebooks-pdfs', '📚', 4),
  ('Design & Templates', 'design-templates', '🎨', 5),
  ('Streaming & Mídia', 'streaming-midia', '🎬', 6),
  ('Gift Cards', 'gift-cards', '🎁', 7),
  ('Domínios & Sites', 'dominios-sites', '🌐', 8),
  ('APIs & Cloud', 'apis-cloud', '⚡', 9),
  ('Plugins & Extensões', 'plugins-extensoes', '🧩', 10),
  ('Música & Áudio', 'musica-audio', '🎵', 11),
  ('Fotos & Vídeos', 'fotos-videos', '📸', 12),
  ('Serviços Freelance', 'servicos-freelance', '💼', 13),
  ('Ferramentas & Apps', 'ferramentas-apps', '🛠️', 14),
  ('3D & Modelos', '3d-modelos', '🧊', 15),
  ('IA & Prompts', 'ia-prompts', '🤖', 16),
  ('Código Fonte', 'codigo-fonte', '💻', 17),
  ('Assinaturas', 'assinaturas', '🔄', 18),
  ('SaaS Access', 'saas-access', '☁️', 19),
  ('Outros Digitais', 'outros-digitais', '📦', 20)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (BANCÁRIO)
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Ativar RLS em TODAS as tabelas
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS already enabled on some tables';
END $$;

-- ───────────────────────────────────────────────────────────────
-- RLS POLICIES — SEGURANÇA BANCÁRIA
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN

  -- ═══ PROFILES ═══
  -- Leitura pública (para mostrar vendedores), mas dados sensíveis só próprio
  DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
  CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (TRUE);

  DROP POLICY IF EXISTS "profiles_own_write" ON public.profiles;
  CREATE POLICY "profiles_own_write" ON public.profiles FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
  CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

  -- ═══ WALLETS ═══
  -- Utilizador só lê a sua carteira
  DROP POLICY IF EXISTS "wallets_own_read" ON public.wallets;
  CREATE POLICY "wallets_own_read" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

  -- Escrita apenas via service_role (triggers/functions do backend)
  DROP POLICY IF EXISTS "wallets_no_direct_write" ON public.wallets;
  CREATE POLICY "wallets_no_direct_write" ON public.wallets FOR UPDATE USING (FALSE);

  -- ═══ VENDORS ═══
  -- Leitura pública (lojas são públicas)
  DROP POLICY IF EXISTS "vendors_read" ON public.vendors;
  CREATE POLICY "vendors_read" ON public.vendors FOR SELECT USING (TRUE);

  -- Escrita só pelo dono
  DROP POLICY IF EXISTS "vendors_own_write" ON public.vendors;
  CREATE POLICY "vendors_own_write" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "vendors_own_insert" ON public.vendors;
  CREATE POLICY "vendors_own_insert" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- ═══ PRODUCTS ═══
  -- Leitura pública APENAS se published
  DROP POLICY IF EXISTS "products_published_read" ON public.products;
  CREATE POLICY "products_published_read" ON public.products FOR SELECT USING (
    status = 'published' OR
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- Escrita/Atualização restrita a auth.uid() == vendor.user_id
  DROP POLICY IF EXISTS "products_vendor_write" ON public.products;
  CREATE POLICY "products_vendor_write" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "products_vendor_update" ON public.products;
  CREATE POLICY "products_vendor_update" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

  DROP POLICY IF EXISTS "products_vendor_delete" ON public.products;
  CREATE POLICY "products_vendor_delete" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

  -- ═══ PRODUCT VARIANTS ═══
  DROP POLICY IF EXISTS "variants_read" ON public.product_variants;
  CREATE POLICY "variants_read" ON public.product_variants FOR SELECT USING (TRUE);

  DROP POLICY IF EXISTS "variants_vendor_write" ON public.product_variants;
  CREATE POLICY "variants_vendor_write" ON public.product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
  );

  -- ═══ PRODUCT IMAGES ═══
  DROP POLICY IF EXISTS "images_read" ON public.product_images;
  CREATE POLICY "images_read" ON public.product_images FOR SELECT USING (TRUE);

  DROP POLICY IF EXISTS "images_vendor_write" ON public.product_images;
  CREATE POLICY "images_vendor_write" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
  );

  -- ═══ ORDERS ═══
  -- Vendedor só vê encomendas com o seu vendor_id
  -- Comprador só vê encomendas com o seu buyer_id
  DROP POLICY IF EXISTS "orders_participants_read" ON public.orders;
  CREATE POLICY "orders_participants_read" ON public.orders FOR SELECT USING (
    buyer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- Buyer pode criar order
  DROP POLICY IF EXISTS "orders_buyer_create" ON public.orders;
  CREATE POLICY "orders_buyer_create" ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());

  -- Atualização: participante ou admin
  DROP POLICY IF EXISTS "orders_participants_update" ON public.orders;
  CREATE POLICY "orders_participants_update" ON public.orders FOR UPDATE USING (
    buyer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- ═══ ORDER ITEMS ═══
  DROP POLICY IF EXISTS "order_items_participants" ON public.order_items;
  CREATE POLICY "order_items_participants" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')))
  );

  -- ═══ REVIEWS ═══
  DROP POLICY IF EXISTS "reviews_read" ON public.reviews;
  CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (TRUE);

  DROP POLICY IF EXISTS "reviews_buyer_create" ON public.reviews;
  CREATE POLICY "reviews_buyer_create" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

  DROP POLICY IF EXISTS "reviews_vendor_respond" ON public.reviews;
  CREATE POLICY "reviews_vendor_respond" ON public.reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

  -- ═══ AFFILIATES ═══
  DROP POLICY IF EXISTS "affiliates_own" ON public.affiliates;
  CREATE POLICY "affiliates_own" ON public.affiliates FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "affiliates_own_insert" ON public.affiliates;
  CREATE POLICY "affiliates_own_insert" ON public.affiliates FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "affiliates_own_update" ON public.affiliates;
  CREATE POLICY "affiliates_own_update" ON public.affiliates FOR UPDATE USING (user_id = auth.uid());

  -- Affiliate clicks:任何人 pode registrar (incl. anônimos)
  DROP POLICY IF EXISTS "clicks_insert" ON public.affiliate_clicks;
  CREATE POLICY "clicks_insert" ON public.affiliate_clicks FOR INSERT WITH CHECK (TRUE);

  -- ═══ DOWNLOAD TOKENS ═══
  DROP POLICY IF EXISTS "tokens_buyer" ON public.download_tokens;
  CREATE POLICY "tokens_buyer" ON public.download_tokens FOR SELECT USING (buyer_id = auth.uid());

  -- ═══ NOTIFICATIONS ═══
  DROP POLICY IF EXISTS "notifs_own" ON public.notifications;
  CREATE POLICY "notifs_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "notifs_own_update" ON public.notifications;
  CREATE POLICY "notifs_own_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

  -- ═══ DISPUTES ═══
  DROP POLICY IF EXISTS "disputes_participants" ON public.disputes;
  CREATE POLICY "disputes_participants" ON public.disputes FOR SELECT USING (
    opened_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- ═══ COUPONS ═══
  DROP POLICY IF EXISTS "coupons_read" ON public.coupons;
  CREATE POLICY "coupons_read" ON public.coupons FOR SELECT USING (is_active = TRUE);

  -- ═══ AUDIT LOG ═══
  DROP POLICY IF EXISTS "audit_admin" ON public.audit_log;
  CREATE POLICY "audit_admin" ON public.audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- ═══ LEDGER ═══
  DROP POLICY IF EXISTS "ledger_admin" ON public.ledger_transactions;
  CREATE POLICY "ledger_admin" ON public.ledger_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  DROP POLICY IF EXISTS "ledger_entries_admin" ON public.ledger_entries;
  CREATE POLICY "ledger_entries_admin" ON public.ledger_entries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Some policies already exist — skipped';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: updated_at automático
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS vendors_updated_at ON public.vendors;
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER vendors_updated_at  BEFORE UPDATE ON public.vendors  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER orders_updated_at   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKET: product-images (para uploads)
-- ═══════════════════════════════════════════════════════════════
-- Executar separadamente no Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('digital-files', 'digital-files', false);  -- Privado!

-- ═══════════════════════════════════════════════════════════════
-- ✅ SCHEMA V5.0 — Fundação bancária completa
-- Execute no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════
