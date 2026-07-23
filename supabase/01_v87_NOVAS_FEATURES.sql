-- KIYVO v8.7 — PATCH DE ATUALIZAÇÃO
-- RODE ESTE ARQUIVO DEPOIS do 00_RUN_THIS_FIRST_COMPLETE.sql
-- Adiciona: badges de conquistas, streaks, gamificação, XP, calendário de conteúdo,
-- salvamento de preferências de agentes e melhorias de tracking

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. Novas colunas em PROFILES (XP, nível, streaks, bio social)
-------------------------------------------------------------------------------
SELECT public._add_col_int('profiles','xp_total',0);
SELECT public._add_col_int('profiles','nivel',1);
SELECT public._add_col_int('profiles','streak_dias',0);
SELECT public._add_col_ts('profiles','streak_ultimo_dia');
SELECT public._add_col_text('profiles','instagram');
SELECT public._add_col_text('profiles','tiktok');
SELECT public._add_col_text('profiles','youtube');
SELECT public._add_col_text('profiles','website');
SELECT public._add_col_text('profiles','titulo_perfil');
SELECT public._add_col_int('profiles','total_avaliacoes',0);
SELECT public._add_col_int('profiles','total_indicados',0);
SELECT public._add_col_int('profiles','compras_pix',0);
SELECT public._add_col_int('profiles','produtos_visitados',0);
SELECT public._add_col_jsonb('profiles','conquistas'); -- {badges: [], favoritos: [], config: {}}

-------------------------------------------------------------------------------
-- 2. Tabela USER_BADGES (conquistas ganhas)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  ganha_em TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ub_user ON public.user_badges(user_id);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ub_all" ON public.user_badges;
CREATE POLICY "ub_all" ON public.user_badges FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 3. Tabela USER_STREAKS (visitas diárias para bônus KD)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_atual INT DEFAULT 0,
  melhor_streak INT DEFAULT 0,
  ultimo_dia DATE DEFAULT CURRENT_DATE,
  kd_acumulado INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "streaks_all" ON public.user_streaks;
CREATE POLICY "streaks_all" ON public.user_streaks FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.upsert_streak(uid UUID)
RETURNS INT AS $$
DECLARE
  hoje DATE := CURRENT_DATE;
  atual INT;
BEGIN
  INSERT INTO public.user_streaks(user_id, streak_atual, melhor_streak, ultimo_dia, kd_acumulado)
  VALUES (uid, 1, 1, hoje, 10)
  ON CONFLICT (user_id) DO UPDATE SET
    streak_atual = CASE
      WHEN public.user_streaks.ultimo_dia = hoje THEN public.user_streaks.streak_atual
      WHEN public.user_streaks.ultimo_dia = hoje - INTERVAL '1 day' THEN public.user_streaks.streak_atual + 1
      ELSE 1
    END,
    melhor_streak = GREATEST(public.user_streaks.melhor_streak,
      CASE WHEN public.user_streaks.ultimo_dia = hoje - INTERVAL '1 day' THEN public.user_streaks.streak_atual + 1
           WHEN public.user_streaks.ultimo_dia = hoje THEN public.user_streaks.streak_atual
           ELSE 1 END),
    ultimo_dia = hoje,
    kd_acumulado = public.user_streaks.kd_acumulado +
      CASE WHEN public.user_streaks.ultimo_dia < hoje - INTERVAL '1 day' THEN 10 ELSE 0 END,
    updated_at = NOW();
  SELECT streak_atual INTO atual FROM public.user_streaks WHERE user_id = uid;
  RETURN atual;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-------------------------------------------------------------------------------
-- 4. Tabela CONTENT_PLAN (calendário de conteúdo gerado por IA)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nicho TEXT NOT NULL,
  rede TEXT DEFAULT 'instagram',
  dias JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cp_user ON public.content_plans(user_id, created_at DESC);
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cp_all" ON public.content_plans;
CREATE POLICY "cp_all" ON public.content_plans FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 5. Tabela AI_USAGE_LOG (log de uso de agentes — tracking detalhado)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id TEXT NOT NULL,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aul_user ON public.ai_usage_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aul_agent ON public.ai_usage_log(agent_id, created_at DESC);
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "aul_all" ON public.ai_usage_log;
CREATE POLICY "aul_all" ON public.ai_usage_log FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 6. Tabela USER_FAVORITES (favoritos de produtos)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fav_all" ON public.user_favorites;
CREATE POLICY "fav_all" ON public.user_favorites FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 7. Tabela USER_VIEWS (produtos visitados — para recomendações)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uv_user ON public.user_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_uv_product ON public.user_views(product_id);
ALTER TABLE public.user_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "uv_all" ON public.user_views;
CREATE POLICY "uv_all" ON public.user_views FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 8. Tabela REFERRAL_CLICKS (rastreia cliques em links de indicação)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rc_code ON public.referral_clicks(code, created_at DESC);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rc_all" ON public.referral_clicks;
CREATE POLICY "rc_all" ON public.referral_clicks FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 9. Tabela WISHLIST_SHARES (lista de desejos compartilhada)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  title TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.wishlist_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ws_all" ON public.wishlist_shares;
CREATE POLICY "ws_all" ON public.wishlist_shares FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- 10. Colunas extras em PRODUCTS (para SEO e IA)
-------------------------------------------------------------------------------
SELECT public._add_col_text('products','faq_jsonld');
SELECT public._add_col_text('products','meta_title');
SELECT public._add_col_text('products','meta_description');
SELECT public._add_col_num('products','rating_avg','NUMERIC(3,2)',0);
SELECT public._add_col_int('products','rating_count',0);
SELECT public._add_col_textarr('products','beneficios');
SELECT public._add_col_textarr('products','objection_responses');
SELECT public._add_col_jsonb('products','seo');

-------------------------------------------------------------------------------
-- 11. Auto-criar referral_code para usuários novos
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := LOWER(SUBSTR(MD5(NEW.id::text || NOW()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_referral ON public.profiles;
CREATE TRIGGER trg_ensure_referral BEFORE INSERT OR UPDATE OF referral_code ON public.profiles
FOR EACH ROW EXECUTE FUNCTION ensure_referral_code();

-- Garante referral_code para todos os perfis existentes
UPDATE public.profiles SET referral_code = LOWER(SUBSTR(MD5(id::text || NOW()::text), 1, 8))
WHERE referral_code IS NULL OR referral_code = '';

-------------------------------------------------------------------------------
-- 12. Função de rastreio de visualização de produto
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_product_view(p_id UUID, u_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products SET views = views + 1 WHERE id = p_id;
  IF u_id IS NOT NULL THEN
    INSERT INTO public.user_views(user_id, product_id) VALUES (u_id, p_id);
    UPDATE public.profiles SET produtos_visitados = COALESCE(produtos_visitados, 0) + 1 WHERE id = u_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIM DO SQL v8.7
-- Resultado esperado: "Success. No rows returned".
