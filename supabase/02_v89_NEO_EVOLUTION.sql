-- ===========================================================================
-- KIYVO v8.9 — NEO EVOLUTION (rode DEPOIS de 00 e 01)
-- 70+ novidades: notificações, reviews de produto, favoritos, afiliados real,
-- carrinho persistente, denúncias, comentários, listas de desejos,
-- cupons reais no perfil, tracking de indicação, gamificação 2.0,
-- newsletter, webhooks internos, logs de auditoria e mais.
-- SCRIPT 100% idempotente (roda quantas vezes quiser sem erro).
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garantir que helpers do 00 existem (recria de forma segura)
DO $$ BEGIN
  IF to_regproc('public._add_col_text') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_text(tbl text, col text, def text DEFAULT NULL)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TEXT DEFAULT %L', tbl, col, def);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_int') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_int(tbl text, col text, def int DEFAULT 0)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I INT DEFAULT %L', tbl, col, def);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_bool') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_bool(tbl text, col text, def boolean DEFAULT false)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I BOOLEAN DEFAULT %L', tbl, col, def);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_num') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_num(tbl text, col text, def numeric DEFAULT 0)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I NUMERIC(12,2) DEFAULT %L', tbl, col, def);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_ts') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_ts(tbl text, col text)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TIMESTAMPTZ', tbl, col);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_jsonb') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_jsonb(tbl text, col text)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I JSONB DEFAULT ''{}''::jsonb', tbl, col);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
  IF to_regproc('public._add_col_textarr') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col_textarr(tbl text, col text)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TEXT[] DEFAULT ''{}''::text[]', tbl, col);
      END IF;
    END $f$ LANGUAGE plpgsql;
  END IF;
END $$;

-- ===========================================================================
-- 1. NOVAS COLUNAS EM PROFILES (v8.9)
-- ===========================================================================
SELECT public._add_col_text('profiles','cidade');
SELECT public._add_col_text('profiles','estado');
SELECT public._add_col_text('profiles','pais','BR');
SELECT public._add_col_text('profiles','cep');
SELECT public._add_col_text('profiles','endereco');
SELECT public._add_col_text('profiles','data_nascimento');
SELECT public._add_col_text('profiles','genero');
SELECT public._add_col_text('profiles','pix_key');
SELECT public._add_col_text('profiles','pix_key_type');
SELECT public._add_col_bool('profiles','pix_verified',false);
SELECT public._add_col_bool('profiles','two_factor_enabled',false);
SELECT public._add_col_text('profiles','two_factor_secret');
SELECT public._add_col_int('profiles','notificacoes_email',1);
SELECT public._add_col_int('profiles','notificacoes_push',1);
SELECT public._add_col_int('profiles','notificacoes_sms',0);
SELECT public._add_col_bool('profiles','newsletter',true);
SELECT public._add_col_text('profiles','lingua','pt-BR');
SELECT public._add_col_text('profiles','moeda','BRL');
SELECT public._add_col_int('profiles','total_referral_signups',0);
SELECT public._add_col_int('profiles','total_referral_purchases',0);
SELECT public._add_col_num('profiles','total_referral_earnings',0);
SELECT public._add_col_num('profiles','wallet_balance',0);
SELECT public._add_col_num('profiles','wallet_pending',0);
SELECT public._add_col_num('profiles','wallet_locked',0);
SELECT public._add_col_text('profiles','cover_url');
SELECT public._add_col_int('profiles','seguidores',0);
SELECT public._add_col_int('profiles','seguindo',0);
SELECT public._add_col_num('profiles','avaliacao_media',0);
SELECT public._add_col_bool('profiles','destaque_semana',false);
SELECT public._add_col_bool('profiles','parceiro_oficial',false);
SELECT public._add_col_int('profiles','produtos_publicados',0);
SELECT public._add_col_int('profiles','total_vendas',0);
SELECT public._add_col_num('profiles','receita_total',0);
SELECT public._add_col_ts('profiles','ultima_atividade');
SELECT public._add_col_jsonb('profiles','preferencias');
SELECT public._add_col_jsonb('profiles','metricas');

-- ===========================================================================
-- 2. TABELA NOTIFICATIONS (notificações em tempo real)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error, order, message, promo
  titulo TEXT NOT NULL,
  corpo TEXT,
  link TEXT,
  icone TEXT DEFAULT 'bell',
  lida BOOLEAN DEFAULT false,
  clicada BOOLEAN DEFAULT false,
  origem TEXT DEFAULT 'sistema',
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON public.notifications(user_id) WHERE lida = false;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_all" ON public.notifications;
CREATE POLICY "notif_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 3. TABELA PRODUCT_REVIEWS (reviews de produtos com nota e fotos)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID,
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  titulo TEXT,
  comentario TEXT,
  pros TEXT[] DEFAULT '{}'::text[],
  contras TEXT[] DEFAULT '{}'::text[],
  fotos TEXT[] DEFAULT '{}'::text[],
  resposta TEXT,
  resposta_at TIMESTAMPTZ,
  aprovado BOOLEAN DEFAULT true,
  util_count INT DEFAULT 0,
  denuncias INT DEFAULT 0,
  compra_confirmada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rev_prod ON public.product_reviews(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rev_buyer ON public.product_reviews(buyer_id);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rev_all" ON public.product_reviews;
CREATE POLICY "rev_all" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 4. TABELA COMMENTS (comentários em posts/blog/produtos)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- product, post, blog, freelancer
  target_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  corpo TEXT NOT NULL,
  likes INT DEFAULT 0,
  denuncias INT DEFAULT 0,
  aprovado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_com_target ON public.comments(target_type, target_id, created_at DESC);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_all" ON public.comments;
CREATE POLICY "comments_all" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 5. TABELA FOLLOWS (seguir vendedores/criadores)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);
CREATE INDEX IF NOT EXISTS idx_fol_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_fol_followed ON public.follows(followed_id);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "foll_all" ON public.follows;
CREATE POLICY "foll_all" ON public.follows FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 6. TABELA CART_ITEMS (carrinho persistente)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantidade INT DEFAULT 1,
  preco_unitario NUMERIC(12,2) DEFAULT 0,
  desconto_aplicado NUMERIC(12,2) DEFAULT 0,
  kd_points_usados INT DEFAULT 0,
  cupom_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  added_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id, added_at DESC);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cart_all" ON public.cart_items;
CREATE POLICY "cart_all" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 7. TABELA WISHLIST (lista de desejos = favoritos)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  lista_nome TEXT DEFAULT 'favoritos',
  notificar_preco BOOLEAN DEFAULT false,
  preco_alvo NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wl_user ON public.wishlist(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wl_unique ON public.wishlist(user_id, product_id, lista_nome);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wl_all" ON public.wishlist;
CREATE POLICY "wl_all" ON public.wishlist FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 8. TABELA REFERRALS (indicações rastreadas)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  ip TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  primeira_compra_em TIMESTAMPTZ,
  comissao_gerada NUMERIC(12,2) DEFAULT 0,
  bonus_kd_pago INT DEFAULT 0,
  status TEXT DEFAULT 'pendente', -- pendente, ativo, comprador, pago
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ref_codigo ON public.referrals(codigo);
CREATE INDEX IF NOT EXISTS idx_ref_referrer ON public.referrals(referrer_id);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ref_all" ON public.referrals;
CREATE POLICY "ref_all" ON public.referrals FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 9. TABELA AFFILIATES (afiliados cadastrados por produto)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  affiliate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comissao_pct NUMERIC(5,2) DEFAULT 30.00,
  comissao_fixa NUMERIC(12,2) DEFAULT 0,
  codigo TEXT NOT NULL,
  link TEXT,
  total_cliques INT DEFAULT 0,
  total_vendas INT DEFAULT 0,
  total_ganho NUMERIC(12,2) DEFAULT 0,
  total_pago NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'aprovado', -- pendente, aprovado, bloqueado
  cookie_dias INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, affiliate_id)
);
CREATE INDEX IF NOT EXISTS idx_aff_codigo ON public.affiliates(codigo);
CREATE INDEX IF NOT EXISTS idx_aff_user ON public.affiliates(affiliate_id);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "aff_all" ON public.affiliates;
CREATE POLICY "aff_all" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 10. TABELA WALLET_TRANSACTIONS (extrato da carteira/KD points)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- credit, debit, bonus, withdrawal, referral, cashback, refund, fee
  valor NUMERIC(12,2) DEFAULT 0,
  kd_points INT DEFAULT 0,
  descricao TEXT,
  referencia_tipo TEXT,
  referencia_id UUID,
  status TEXT DEFAULT 'ok', -- ok, pendente, cancelado
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wt_user ON public.wallet_transactions(user_id, created_at DESC);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wt_all" ON public.wallet_transactions;
CREATE POLICY "wt_all" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 11. TABELA REPORTS (denúncias)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL, -- product, review, comment, user, message, freelancer
  target_id UUID NOT NULL,
  motivo TEXT NOT NULL,
  detalhe TEXT,
  status TEXT DEFAULT 'aberto', -- aberto, analise, resolvido, rejeitado
  resolucao TEXT,
  resolvido_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolvido_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rep_status ON public.reports(status, created_at DESC);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rpt_all" ON public.reports;
CREATE POLICY "rpt_all" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 12. TABELA COUPON_USAGE (uso de cupons)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID,
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID,
  desconto NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cu_code ON public.coupon_usage(code);
CREATE INDEX IF NOT EXISTS idx_cu_user ON public.coupon_usage(user_id, created_at DESC);
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cu_all" ON public.coupon_usage;
CREATE POLICY "cu_all" ON public.coupon_usage FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 13. TABELA PRICE_ALERTS (alertas de preço)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  preco_alvo NUMERIC(12,2),
  notificado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pa_user ON public.price_alerts(user_id);
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pa_all" ON public.price_alerts;
CREATE POLICY "pa_all" ON public.price_alerts FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 14. TABELA PRICE_HISTORY (histórico de preço dos produtos)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  preco_anterior NUMERIC(12,2),
  preco_novo NUMERIC(12,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ph_prod ON public.price_history(product_id, created_at DESC);
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ph_all" ON public.price_history;
CREATE POLICY "ph_all" ON public.price_history FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 15. TABELA AB_TESTS (testes A/B em produtos/copy)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'copy', -- copy, preco, banner, titulo, thumbnail
  variante_a JSONB NOT NULL,
  variante_b JSONB NOT NULL,
  impressoes_a INT DEFAULT 0,
  impressoes_b INT DEFAULT 0,
  conversoes_a INT DEFAULT 0,
  conversoes_b INT DEFAULT 0,
  vencedor TEXT,
  status TEXT DEFAULT 'rodando', -- rodando, pausado, finalizado
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ab_all" ON public.ab_tests;
CREATE POLICY "ab_all" ON public.ab_tests FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 16. TABELA NEWSLETTER_SUBS (newsletter)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  fonte TEXT DEFAULT 'site',
  ativo BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nl_all" ON public.newsletter_subs;
CREATE POLICY "nl_all" ON public.newsletter_subs FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 17. TABELA AUDIT_LOG (auditoria — ações sensíveis)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON public.audit_log(acao, created_at DESC);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "aud_all" ON public.audit_log;
CREATE POLICY "aud_all" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 18. TABELA SAVED_PROMPTS (prompts salvos dos agentes)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agente TEXT NOT NULL,
  titulo TEXT NOT NULL,
  input_json JSONB NOT NULL,
  output_json JSONB DEFAULT '{}'::jsonb,
  favorito BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sp_user ON public.saved_prompts(user_id, created_at DESC);
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sp_all" ON public.saved_prompts;
CREATE POLICY "sp_all" ON public.saved_prompts FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 19. TABELA SHOP_SECTIONS (seções personalizadas da loja do vendedor)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.shop_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ordem INT DEFAULT 0,
  product_ids UUID[] DEFAULT '{}'::uuid[],
  tipo TEXT DEFAULT 'grid', -- grid, carousel, destaque
  cor_fundo TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.shop_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ss_all" ON public.shop_sections;
CREATE POLICY "ss_all" ON public.shop_sections FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 20. TABELA CLICKS_EVENTS (rastreamento de cliques para analytics)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.clicks_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sessao_id TEXT,
  evento TEXT NOT NULL, -- click_product, view, add_cart, buy, share, copy_coupon
  target_type TEXT,
  target_id TEXT,
  fonte TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  valor NUMERIC(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ce_evento ON public.clicks_events(evento, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ce_user ON public.clicks_events(user_id, created_at DESC);
ALTER TABLE public.clicks_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ce_all" ON public.clicks_events;
CREATE POLICY "ce_all" ON public.clicks_events FOR ALL USING (true) WITH CHECK (true);

-- ===========================================================================
-- 21. GATILHOS ÚTEIS
-- ===========================================================================

-- Atualiza avaliacao_media do produto após insert/update de review
CREATE OR REPLACE FUNCTION public.recalc_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET rating_avg = (SELECT ROUND(AVG(nota)::numeric, 2) FROM public.product_reviews WHERE product_id = NEW.product_id AND aprovado = true),
      rating_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = NEW.product_id AND aprovado = true)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS trg_recalc_rating ON public.product_reviews;
CREATE TRIGGER trg_recalc_rating AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.recalc_product_rating();

-- Atualiza seguidores/seguindo contadores
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET seguidores = COALESCE(seguidores,0) + 1 WHERE id = NEW.followed_id;
    UPDATE public.profiles SET seguindo = COALESCE(seguindo,0) + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET seguidores = GREATEST(0, COALESCE(seguidores,0) - 1) WHERE id = OLD.followed_id;
    UPDATE public.profiles SET seguindo = GREATEST(0, COALESCE(seguindo,0) - 1) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS trg_follow_counts ON public.follows;
CREATE TRIGGER trg_follow_counts AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Gera notificação automática de novo review
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_seller UUID;
  v_title TEXT;
BEGIN
  SELECT seller_id, title INTO v_seller, v_title FROM public.products WHERE id = NEW.product_id;
  INSERT INTO public.notifications(user_id, tipo, titulo, corpo, link, origem)
  VALUES (v_seller, 'info', 'Nova avaliação recebida',
          'Seu produto "' || COALESCE(v_title,'produto') || '" recebeu uma nota ' || NEW.nota || '/5',
          '/produto/' || NEW.product_id, 'reviews');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS trg_notify_review ON public.product_reviews;
CREATE TRIGGER trg_notify_review AFTER INSERT ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.notify_on_review();

-- Garante referral_code único para novos perfis
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    code := UPPER(SUBSTR(MD5(NEW.id::TEXT || RANDOM()::TEXT), 1, 8));
    UPDATE public.profiles SET referral_code = code WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS trg_refcode ON public.profiles;
CREATE TRIGGER trg_refcode AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_referral_code();

-- Registra atividade do usuário (último acesso)
CREATE OR REPLACE FUNCTION public.ping_atividade(uid UUID)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  UPDATE public.profiles SET ultima_atividade = NOW() WHERE id = uid;
  RETURN NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===========================================================================
-- 22. FIX NA CONSTRAINT DE CUPONS (garante que 'percent' e 'fixed' funcionem)
-- ===========================================================================
DO $$ BEGIN
  -- Tenta dropar se existir
  BEGIN
    ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
-- Recria com valores corretos (compatível com o que o sistema usa)
ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage','percent','fixed'));

-- Fim do v8.9 — OK
