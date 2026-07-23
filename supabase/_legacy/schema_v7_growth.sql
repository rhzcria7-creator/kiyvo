-- ─────────────────────────────────────────────────────────────
-- KIYVO v7.4 — Migration de crescimento e monetização
-- Adiciona:
--   • Coluna 'badges' em profiles (emblemas do usuário)
--   • Tabela de afiliados expandida (com códigos, saques)
--   • Tabela de conversões de indicação (cadastro + compra)
--   • Tabela de saques de afiliado
--   • Função is_admin()
--   • Bônus de referral no cadastro
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- 0. Garante que a função is_admin existe (usada em RLS)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND (is_admin = TRUE OR role IN ('admin', 'ceo', 'cto', 'coo', 'founder', 'moderator', 'support'))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- 1. Badges e atributos de perfil
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS referred_by TEXT,             -- código de afiliado que indicou
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,    -- código de afiliado do usuário
  ADD COLUMN IF NOT EXISTS total_purchases INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_scan_flagged BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Garante colunas is_admin e role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'buyer';
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- ══════════════════════════════════════════════════════════════
-- 2. Programa de Afiliados expandido
-- ══════════════════════════════════════════════════════════════

-- Tabela de afiliados (1 por usuário)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_clicks INT DEFAULT 0,
  total_signups INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  total_earnings_kd INT DEFAULT 0,
  available_earnings NUMERIC(12,2) DEFAULT 0,
  pending_earnings NUMERIC(12,2) DEFAULT 0,
  total_paid NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(referral_code);

-- Tabela de conversões (cliques, cadastros, compras)
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID,
  type TEXT NOT NULL CHECK (type IN ('click', 'signup', 'first_purchase', 'purchase')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'signed_up')),
  commission_amount NUMERIC(12,2) DEFAULT 0,
  commission_pct NUMERIC(5,2) DEFAULT 8,
  order_amount NUMERIC(12,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conv_affiliate ON public.affiliate_conversions(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_referred ON public.affiliate_conversions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_conv_status ON public.affiliate_conversions(status);

-- Saques de afiliados
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'pix' CHECK (method IN ('pix', 'kd_points')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  pix_key TEXT,
  kd_bonus_pct NUMERIC(5,2) DEFAULT 0, -- bônus de +10% se sacar como KD Points
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Afiliados veem apenas os seus
CREATE POLICY "Afiliado ve seus proprios dados"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Afiliado ve suas conversoes"
  ON public.affiliate_conversions FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Afiliado ve seus saques"
  ON public.affiliate_withdrawals FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Afiliado cria saques"
  ON public.affiliate_withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

-- ══════════════════════════════════════════════════════════════
-- 3. Trigger: gerar referral_code automaticamente ao criar perfil
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  base TEXT;
  suffix TEXT;
  candidate TEXT;
  i INT := 0;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    base := UPPER(REGEXP_REPLACE(COALESCE(NEW.username, SPLIT_PART(NEW.email, '@', 1)), '[^A-Z0-9]', '', 'gi'));
    base := SUBSTRING(base FROM 1 FOR 6);
    IF LENGTH(base) < 3 THEN base := 'KIYVO'; END IF;
    LOOP
      suffix := UPPER(SUBSTRING(MD5(NEW.id::TEXT || i::TEXT) FROM 1 FOR 3));
      candidate := base || suffix;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.affiliates WHERE referral_code = candidate)
                   AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate);
      i := i + 1;
      IF i > 10 THEN candidate := candidate || i::TEXT; EXIT; END IF;
    END LOOP;
    NEW.referral_code := candidate;
  END IF;

  -- Criar registro de afiliado automaticamente
  INSERT INTO public.affiliates (user_id, referral_code)
  VALUES (NEW.id, NEW.referral_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_affiliates_updated_at ON public.affiliates;
CREATE TRIGGER set_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 4. Auto-concessão de badges por atividade (view helper)
-- ══════════════════════════════════════════════════════════════
-- Pode ser chamada periodicamente ou no login para atualizar badges.
-- (lógica principal está em src/lib/badges/teamAssignment.ts, essa é uma versão SQL para queries rápidas)

COMMIT;
