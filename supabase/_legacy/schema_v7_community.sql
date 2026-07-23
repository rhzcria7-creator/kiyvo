-- KIYVO v7 — Categorias da Comunidade & Tráfego Pago (Boost)
-- Permite que vendedores/usuários criem categorias próprias e impulsionem anúncios.
-- Comentários em PT-BR.

-- ══════════════════════════════════════════════════════════════
-- 1. Categorias criadas pela comunidade
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  hue TEXT DEFAULT 'from-brand-500 to-violet-500',
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_official BOOLEAN DEFAULT FALSE,
  product_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: qualquer pessoa pode ler categorias; só autenticados podem criar;
-- só o criador ou admin podem editar/deletar.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver categorias ativas"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Usuários autenticados podem criar categorias"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Criadores e admins podem editar suas categorias"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Criadores e admins podem deletar suas categorias"
  ON public.categories FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Trigger updated_at
CREATE OR REPLACE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 2. Impulsionamento de anúncios (tráfego pago interno)
-- Vendedores pagam via Stripe para destacar produtos em posições
-- premium (categoria, home, busca).
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ad_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Tipo: 'category' = topo da categoria; 'home' = destaque home;
  -- 'search' = topo das buscas; 'banner' = banner rotativo.
  placement TEXT NOT NULL CHECK (placement IN ('category','home','search','banner')),
  -- Duração em dias (1, 3, 7, 30)
  duration_days INT NOT NULL DEFAULT 1 CHECK (duration_days IN (1,3,7,30)),
  -- Valor pago em BRL (em centavos para precisão)
  amount_cents INT NOT NULL,
  -- Stripe payment_intent
  stripe_payment_intent_id TEXT,
  -- Status: pending, active, expired, cancelled, refunded
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','expired','cancelled','refunded')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  -- Posição do boost (ordem de exibição dentro do placement)
  priority INT DEFAULT 0,
  -- Impressões e cliques para o vendedor ver performance
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ad_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver boosts ativos"
  ON public.ad_boosts FOR SELECT
  USING (status = 'active' AND ends_at > NOW());

CREATE POLICY "Vendedores veem seus próprios boosts"
  ON public.ad_boosts FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin(auth.uid()));

CREATE POLICY "Vendedores autenticados podem criar boost"
  ON public.ad_boosts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Vendedores podem cancelar seus próprios boosts"
  ON public.ad_boosts FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin(auth.uid()));

CREATE OR REPLACE TRIGGER set_ad_boosts_updated_at
  BEFORE UPDATE ON public.ad_boosts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 3. Preços dos boosts (em centavos)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ad_boost_pricing (
  placement TEXT PRIMARY KEY,
  price_1d_cents INT NOT NULL,
  price_3d_cents INT NOT NULL,
  price_7d_cents INT NOT NULL,
  price_30d_cents INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT
);

INSERT INTO public.ad_boost_pricing (placement, price_1d_cents, price_3d_cents, price_7d_cents, price_30d_cents, description)
VALUES
  ('category', 499, 1299, 2499, 7999, 'Topo da página de categoria'),
  ('home', 999, 2499, 4999, 14999, 'Destaque na página inicial'),
  ('search', 799, 1999, 3999, 11999, 'Topo dos resultados de busca'),
  ('banner', 1499, 3999, 7999, 24999, 'Banner rotativo premium')
ON CONFLICT (placement) DO NOTHING;

-- Índices pra performance
CREATE INDEX IF NOT EXISTS idx_ad_boosts_active_placement
  ON public.ad_boosts(placement, priority DESC)
  WHERE status = 'active' AND ends_at > NOW();

CREATE INDEX IF NOT EXISTS idx_categories_active_count
  ON public.categories(is_active, product_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
