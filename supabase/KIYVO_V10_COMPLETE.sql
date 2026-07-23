-- ===========================================================================
-- KIYVO v10.1 — SCRIPT ÚNICO DE INSTALAÇÃO (consolidado)
-- Execute ESTE ARQUIVO no Supabase SQL Editor (Run ALL).
-- Idempotente. PT-BR.
-- ===========================================================================
--
-- ⚠️  COMO RODAR SEM ERRO "read-only transaction":
--  1. Abra o Supabase Dashboard → SQL Editor → New Query
--  2. Cole TODO este arquivo e clique em "Run"
--  3. Se aparecer "cannot execute CREATE TABLE in a read-only transaction",
--     conecte-se DIRETO (não via PgBouncer):
--     Settings → Database → Connection string → use a connection URI
--     "DIRECT connection" (porta 5432) e rode via psql, OU
--     simplesmente execute de novo pelo SQL Editor (às vezes a primeira
--     conexão cai no pooler read-only).
--  4. Rode o arquivo INTEIRO de uma vez.
--
-- Este arquivo CORRIGE QUALQUER estado da base (antigo, v5/v6/v7/v8/v9/v10).
-- Ele NÃO apaga dados de usuários, produtos, pedidos ou wallets.
-- Tudo é idempotente: pode rodar quantas vezes quiser sem erro.
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------------------------------------------------------------
-- 1. Helper de updated_at
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- 2. Helpers de adicionar coluna (idempotentes, sem exceptions)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._add_col_text(tbl text, col text, def text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    IF def IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TEXT', tbl, col);
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TEXT DEFAULT %L', tbl, col, def);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_int(tbl text, col text, def int DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    IF def IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I INT', tbl, col);
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I INT DEFAULT %L', tbl, col, def);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_bool(tbl text, col text, def boolean DEFAULT FALSE)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I BOOLEAN DEFAULT %L', tbl, col, def);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_num(tbl text, col text, typ text, def numeric DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    IF def IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', tbl, col, typ);
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s DEFAULT %L', tbl, col, typ, def);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_ts(tbl text, col text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TIMESTAMPTZ', tbl, col);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_textarr(tbl text, col text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I TEXT[] DEFAULT ''{}''', tbl, col);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_jsonb(tbl text, col text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I JSONB DEFAULT ''{}''::jsonb', tbl, col);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public._add_col_uuid_fk(tbl text, col text, fk text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I UUID REFERENCES %s ON DELETE SET NULL', tbl, col, fk);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper GENÉRICO para adicionar coluna com tipo arbitrário (ex.: NUMERIC(10,2), BOOLEAN, TEXT, UUID, JSONB, INTEGER, TIMESTAMPTZ).
-- Parâmetros: tbl=tabela, col=coluna, typ=tipo SQL completo, def=valor DEFAULT opcional (já como literal SQL, ex.: '30.00', 'true', '''[]''::jsonb')
CREATE OR REPLACE FUNCTION public._add_col(tbl text, col text, typ text, def text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
    IF def IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', tbl, col, typ);
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s DEFAULT %s', tbl, col, typ, def);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- 3. PROFILES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('profiles','avatar_url');
SELECT public._add_col_text('profiles','bio');
SELECT public._add_col_text('profiles','cpf');
SELECT public._add_col_text('profiles','telefone');
SELECT public._add_col_text('profiles','full_name');
SELECT public._add_col_bool('profiles','is_admin',FALSE);
SELECT public._add_col_bool('profiles','is_verified',FALSE);
SELECT public._add_col_text('profiles','role','buyer');
SELECT public._add_col_text('profiles','plano','free');
SELECT public._add_col_int('profiles','kd_points',0);
SELECT public._add_col_int('profiles','total_purchases',0);
SELECT public._add_col_num('profiles','total_spent','NUMERIC(12,2)',0);
SELECT public._add_col_textarr('profiles','badges');
SELECT public._add_col_text('profiles','referred_by');
SELECT public._add_col_text('profiles','referral_code');
SELECT public._add_col_bool('profiles','phone_verified',FALSE);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-------------------------------------------------------------------------------
-- 4. Trigger handle_new_user() - OBRIGATORIO para login funcionar
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'user_' || substr(NEW.id::text, 1, 8))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-------------------------------------------------------------------------------
-- 5. CATEGORIES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  is_active BOOLEAN DEFAULT TRUE,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='categories_slug_key') THEN
    ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
  END IF;
END $$;

SELECT public._add_col_int('categories','sort_order',0);

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-------------------------------------------------------------------------------
-- 6. VENDORS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  stripe_account_id TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_num('vendors','commission_rate','NUMERIC(5,2)',10);

DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;
CREATE TRIGGER set_vendors_updated_at BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-------------------------------------------------------------------------------
-- 7. PRODUCTS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'outro',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('products','short_description');
SELECT public._add_col_num('products','price','NUMERIC(12,2)');
SELECT public._add_col_num('products','compare_at_price','NUMERIC(12,2)');
SELECT public._add_col_textarr('products','images');
SELECT public._add_col_text('products','image_url');
SELECT public._add_col_int('products','stock',-1);
SELECT public._add_col_bool('products','is_official',FALSE);
SELECT public._add_col_bool('products','is_featured',FALSE);
SELECT public._add_col_bool('products','is_digital',TRUE);
SELECT public._add_col_bool('products','instant_delivery',FALSE);
SELECT public._add_col_text('products','delivery_content');
SELECT public._add_col_int('products','views',0);
SELECT public._add_col_int('products','sales_count',0);
SELECT public._add_col_textarr('products','tags');
SELECT public._add_col_jsonb('products','metadata');

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);

-------------------------------------------------------------------------------
-- 8. WALLETS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_available NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_num('wallets','balance_pending','NUMERIC(12,2)',0);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='wallets_user_id_key') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_wallets_updated_at ON public.wallets;
CREATE TRIGGER set_wallets_updated_at BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE FUNCTION public.ensure_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_wallet ON public.profiles;
CREATE TRIGGER trg_ensure_wallet AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION ensure_wallet();

INSERT INTO public.wallets (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-------------------------------------------------------------------------------
-- 9. ORDERS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_uuid_fk('orders','vendor_id','auth.users(id)');
SELECT public._add_col_uuid_fk('orders','product_id','public.products(id)');
SELECT public._add_col_text('orders','order_number');
SELECT public._add_col_text('orders','sku');
SELECT public._add_col_num('orders','price','NUMERIC(12,2)',0);
SELECT public._add_col_num('orders','fee','NUMERIC(12,2)',0);
SELECT public._add_col_num('orders','platform_fee','NUMERIC(12,2)',0);
SELECT public._add_col_num('orders','seller_receives','NUMERIC(12,2)',0);
SELECT public._add_col_num('orders','vendor_net','NUMERIC(12,2)',0);
SELECT public._add_col_text('orders','payment_method');
SELECT public._add_col_text('orders','payment_id');
SELECT public._add_col_text('orders','stripe_checkout_session_id');
SELECT public._add_col_text('orders','stripe_payment_intent_id');
SELECT public._add_col_text('orders','payment_status','pending');
SELECT public._add_col_int('orders','kd_points_used',0);
SELECT public._add_col_text('orders','coupon_code');
SELECT public._add_col_text('orders','affiliate_code');
SELECT public._add_col_num('orders','affiliate_commission','NUMERIC(12,2)',0);
SELECT public._add_col_text('orders','pix_code');
SELECT public._add_col_text('orders','pix_qrcode_url');
SELECT public._add_col_ts('orders','pix_expires_at');
SELECT public._add_col_ts('orders','paid_at');
SELECT public._add_col_ts('orders','delivered_at');
SELECT public._add_col_ts('orders','confirmed_at');
SELECT public._add_col_ts('orders','refunded_at');
SELECT public._add_col_ts('orders','disputed_at');
SELECT public._add_col_jsonb('orders','metadata');

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orders_order_number_key') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-------------------------------------------------------------------------------
-- 10. COUPONS (RECRIADO DO ZERO - cupons nao sao dados de usuarios)
-------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.coupons CASCADE;

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage'
    CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  min_purchase NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT '2027-12-31 23:59:59+00',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT '2027-12-31 23:59:59+00',
  is_active BOOLEAN DEFAULT TRUE,
  affiliate_code TEXT,
  first_purchase_only BOOLEAN DEFAULT FALSE,
  max_discount NUMERIC(10,2) DEFAULT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_coupons_updated_at ON public.coupons;
CREATE TRIGGER set_coupons_updated_at BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

INSERT INTO public.coupons
  (code, description, discount_type, discount_value, min_order_value, min_purchase,
   max_uses, is_active, first_purchase_only, starts_at, expires_at, valid_from, valid_until)
VALUES
  ('BOASVINDAS','Boas-vindas (10% OFF primeira compra)','percentage',10,0,0,
   5000,TRUE,TRUE,NOW(),'2027-12-31 23:59:59+00',NOW(),'2027-12-31 23:59:59+00'),
  ('KIYVO10','Cupom 10% OFF em qualquer compra','percentage',10,20,20,
   10000,TRUE,FALSE,NOW(),'2027-12-31 23:59:59+00',NOW(),'2027-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;

-------------------------------------------------------------------------------
-- 11. KD TRANSACTIONS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kd_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('kd_transactions','reference_id');

CREATE INDEX IF NOT EXISTS idx_kd_user ON public.kd_transactions(user_id, created_at DESC);

-------------------------------------------------------------------------------
-- 12. DIGITAL INVENTORY
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('digital_inventory','status','available');
SELECT public._add_col_uuid_fk('digital_inventory','order_id','public.orders(id)');

CREATE INDEX IF NOT EXISTS idx_inv_product_status ON public.digital_inventory(product_id, status);

-------------------------------------------------------------------------------
-- 13. AFFILIATES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_int('affiliates','total_clicks',0);
SELECT public._add_col_int('affiliates','total_signups',0);
SELECT public._add_col_int('affiliates','total_conversions',0);
SELECT public._add_col_num('affiliates','available_earnings','NUMERIC(12,2)',0);
SELECT public._add_col_num('affiliates','pending_earnings','NUMERIC(12,2)',0);
SELECT public._add_col_bool('affiliates','is_active',TRUE);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='affiliates_referral_code_key') THEN
    ALTER TABLE public.affiliates ADD CONSTRAINT affiliates_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_affiliates_updated_at ON public.affiliates;
CREATE TRIGGER set_affiliates_updated_at BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-------------------------------------------------------------------------------
-- 14. REVIEWS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_uuid_fk('reviews','order_id','public.orders(id)');
SELECT public._add_col_text('reviews','comment');
SELECT public._add_col_bool('reviews','is_approved',TRUE);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-------------------------------------------------------------------------------
-- 15. FREELANCE JOBS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.freelance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_num('freelance_jobs','budget_min','NUMERIC(12,2)',0);
SELECT public._add_col_num('freelance_jobs','budget_max','NUMERIC(12,2)',0);
SELECT public._add_col_int('freelance_jobs','deadline_days',7);
SELECT public._add_col_textarr('freelance_jobs','skills');
SELECT public._add_col_text('freelance_jobs','status','open');

DROP TRIGGER IF EXISTS set_freelance_updated_at ON public.freelance_jobs;
CREATE TRIGGER set_freelance_updated_at BEFORE UPDATE ON public.freelance_jobs
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_fj_status ON public.freelance_jobs(status);

-------------------------------------------------------------------------------
-- 16. FREELANCE BIDS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.freelance_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.freelance_jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  days INT NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('freelance_bids','message');
SELECT public._add_col_text('freelance_bids','status','pending');

CREATE INDEX IF NOT EXISTS idx_fb_job ON public.freelance_bids(job_id);

-------------------------------------------------------------------------------
-- 17. CHAT (Kiya + mensagens comprador/vendedor)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_chatconv_updated_at ON public.chat_conversations;
CREATE TRIGGER set_chatconv_updated_at BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas para Kiya/suporte
SELECT public._add_col_text('chat_messages','user_id');
SELECT public._add_col_text('chat_messages','thread_id');
SELECT public._add_col_text('chat_messages','role');
SELECT public._add_col_text('chat_messages','content');

-- Colunas para chat comprador/vendedor
SELECT public._add_col_text('chat_messages','conversation_id');
SELECT public._add_col_text('chat_messages','sender_id');
SELECT public._add_col_text('chat_messages','message_type');
SELECT public._add_col_bool('chat_messages','is_read',FALSE);

CREATE INDEX IF NOT EXISTS idx_chat_thread ON public.chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conv ON public.chat_messages(conversation_id, created_at);

-------------------------------------------------------------------------------
-- 18. NOTIFICATIONS, AUDIT_LOG, DISPUTES, ESCROW_TIMELINE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('notifications','link');
SELECT public._add_col_bool('notifications','is_read',FALSE);

CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_uuid_fk('audit_log','user_id','auth.users(id)');
SELECT public._add_col_text('audit_log','resource');
SELECT public._add_col_text('audit_log','severity','info');
SELECT public._add_col_text('audit_log','ip');
SELECT public._add_col_jsonb('audit_log','metadata');

CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action, created_at DESC);

CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  opened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_text('disputes','reason');
SELECT public._add_col_text('disputes','status','open');
SELECT public._add_col_text('disputes','resolution');

DROP TRIGGER IF EXISTS set_disputes_updated_at ON public.disputes;
CREATE TRIGGER set_disputes_updated_at BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.escrow_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT public._add_col_uuid_fk('escrow_timeline','actor_id','auth.users(id)');
SELECT public._add_col_text('escrow_timeline','note');
SELECT public._add_col_jsonb('escrow_timeline','metadata');

CREATE INDEX IF NOT EXISTS idx_escrow_order ON public.escrow_timeline(order_id, created_at);

-------------------------------------------------------------------------------
-- 19. BLOG POSTS (setup/route referencia)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blog_posts_slug_key') THEN
    ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_blog_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-------------------------------------------------------------------------------
-- 20. SEED categorias oficiais
-------------------------------------------------------------------------------
INSERT INTO public.categories (slug, name, description, icon, is_official, is_active, sort_order) VALUES
  ('jogos','Jogos','Jogos digitais e contas','🎮',TRUE,TRUE,1),
  ('software','Software','Licencas de software','💻',TRUE,TRUE,2),
  ('streaming','Streaming','Assinaturas de streaming','🎬',TRUE,TRUE,3),
  ('giftcards','Gift Cards','Cartoes presente','🎁',TRUE,TRUE,4),
  ('cursos','Cursos','Cursos online','📚',TRUE,TRUE,5),
  ('templates','Templates','Templates e designs','🎨',TRUE,TRUE,6),
  ('musica','Musica','Servicos de musica','🎵',TRUE,TRUE,7),
  ('seguranca','Seguranca','VPN e antivirus','🛡️',TRUE,TRUE,8),
  ('ebooks','eBooks','Livros digitais','📖',TRUE,TRUE,9),
  ('apis','APIs','APIs e integracoes','🔌',TRUE,TRUE,10),
  ('plugins','Plugins','Plugins e extensoes','🧩',TRUE,TRUE,11),
  ('ia','Inteligencia Artificial','Agentes e ferramentas de IA','🤖',TRUE,TRUE,12)
ON CONFLICT (slug) DO NOTHING;

-------------------------------------------------------------------------------
-- 21. Bucket de documentos
-------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents','documents',FALSE, 10485760)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 22. RLS - permissivo para login e CRUDs funcionarem IMEDIATAMENTE
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kd_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "products_all" ON public.products;
CREATE POLICY "products_all" ON public.products FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "vendors_all" ON public.vendors;
CREATE POLICY "vendors_all" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "wallets_all" ON public.wallets;
CREATE POLICY "wallets_all" ON public.wallets FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "orders_all" ON public.orders;
CREATE POLICY "orders_all" ON public.orders FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "di_all" ON public.digital_inventory;
CREATE POLICY "di_all" ON public.digital_inventory FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "categories_all" ON public.categories;
CREATE POLICY "categories_all" ON public.categories FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "coupons_all" ON public.coupons;
CREATE POLICY "coupons_all" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "kd_all" ON public.kd_transactions;
CREATE POLICY "kd_all" ON public.kd_transactions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "aff_all" ON public.affiliates;
CREATE POLICY "aff_all" ON public.affiliates FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
CREATE POLICY "reviews_all" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fj_all" ON public.freelance_jobs;
CREATE POLICY "fj_all" ON public.freelance_jobs FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fb_all" ON public.freelance_bids;
CREATE POLICY "fb_all" ON public.freelance_bids FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "chat_all" ON public.chat_messages;
CREATE POLICY "chat_all" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "chatconv_all" ON public.chat_conversations;
CREATE POLICY "chatconv_all" ON public.chat_conversations FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "notif_all" ON public.notifications;
CREATE POLICY "notif_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "audit_all" ON public.audit_log;
CREATE POLICY "audit_all" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "disputes_all" ON public.disputes;
CREATE POLICY "disputes_all" ON public.disputes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "escrow_all" ON public.escrow_timeline;
CREATE POLICY "escrow_all" ON public.escrow_timeline FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "blog_all" ON public.blog_posts;
CREATE POLICY "blog_all" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- FIM DO SQL v8.6. Resultado esperado: "Success. No rows returned".

-- >>> CARREGANDO 01_GAMIFICACAO (XP/badges/streaks)

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

-- >>> CARREGANDO 02_NEO_EVOLUTION (19 tabelas)

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
  -- Helper genérico
  IF to_regproc('public._add_col') IS NULL THEN
    CREATE OR REPLACE FUNCTION public._add_col(tbl text, col text, typ text, def text DEFAULT NULL)
    RETURNS void AS $f$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tbl AND column_name=col) THEN
        IF def IS NULL THEN
          EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', tbl, col, typ);
        ELSE
          EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s DEFAULT %s', tbl, col, typ, def);
        END IF;
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

-- >>> CARREGANDO 03_JUSTO_LUCRATIVO (taxas/boost/saques)

-- ===========================================================================
-- KIYVO v9.0 "JUSTO & LUCRATIVO" — Monetização ética, transparente e justa
-- SEM taxas abusivas (contra GGMax/GameMarket/Microsoft).
-- Totalmente IDEMPOTENTE. Pode rodar várias vezes sem erro.
-- PT-BR, comentários em PT-BR, nomes de coluna em EN.
-- ===========================================================================

-- Extensões necessárias (safe IF NOT EXISTS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================================================
-- 0. HELPER IDEMPOTENTE para adicionar colunas (evita typos)
-- ===========================================================================
CREATE OR REPLACE FUNCTION _add_col(p_tbl TEXT, p_col TEXT, p_type TEXT, p_default TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = p_tbl AND column_name = p_col
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', p_tbl, p_col, p_type);
    IF p_default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT %s', p_tbl, p_col, p_default);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- 1. CONFIGURAÇÃO DE TAXAS TRANSPARENTES (nunca mais que 8% — Justo!)
-- Tabela editável pelo admin, SEM taxas surpresa.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.fee_config (
  id SERIAL PRIMARY KEY,
  plan_tier TEXT NOT NULL UNIQUE DEFAULT 'free',
  product_sale_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  product_sale_fixed_brl NUMERIC(10,2) NOT NULL DEFAULT 0.50,
  freelance_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  affiliate_default_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  max_fee_cap_brl NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  free_threshold_brl NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed das taxas JUSTAS (nunca passa de 8% em produtos digitais)
INSERT INTO public.fee_config (plan_tier, product_sale_fee_percent, product_sale_fixed_brl, freelance_fee_percent, affiliate_default_percent, max_fee_cap_brl, free_threshold_brl, description) VALUES
  ('free', 8.00, 0.50, 5.00, 10.00, 50.00, 0.00, 'Grátis: taxa justa de 8% + R$0,50 (nunca mais de R$50 por transação)'),
  ('plus', 6.50, 0.40, 4.00, 12.00, 40.00, 0.00, 'Plus: 6,5% + R$0,40 (1,5% de desconto vs grátis)'),
  ('pro', 5.00, 0.30, 3.00, 15.00, 30.00, 0.00, 'Pro: 5% + R$0,30 (taxa reduzida)'),
  ('vendor_pro', 3.00, 0.20, 2.00, 18.00, 20.00, 5000.00, 'Vendor Pro: 3% + R$0,20, ZER0 taxa nos primeiros R$5k'),
  ('staff', 0.00, 0.00, 0.00, 20.00, 0.00, 0.00, 'Equipe interna: sem taxas')
ON CONFLICT (plan_tier) DO UPDATE SET
  product_sale_fee_percent = EXCLUDED.product_sale_fee_percent,
  product_sale_fixed_brl = EXCLUDED.product_sale_fixed_brl,
  freelance_fee_percent = EXCLUDED.freelance_fee_percent,
  affiliate_default_percent = EXCLUDED.affiliate_default_percent,
  max_fee_cap_brl = EXCLUDED.max_fee_cap_brl,
  free_threshold_brl = EXCLUDED.free_threshold_brl,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ===========================================================================
-- 2. SISTEMA DE BOOST / DESTAQUES PAGOS (produto aparece no topo)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.boost_packages (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_hours INTEGER NOT NULL DEFAULT 24,
  price_brl NUMERIC(10,2) NOT NULL,
  kd_points_cost INTEGER NOT NULL DEFAULT 0,
  position_multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.00,
  label_color TEXT NOT NULL DEFAULT '#F59E0B',
  badge_text TEXT NOT NULL DEFAULT 'EM DESTAQUE',
  is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.boost_packages (code, name, description, duration_hours, price_brl, kd_points_cost, position_multiplier, label_color, badge_text) VALUES
  ('boost_6h', 'Boost Relâmpago', '6h na primeira página + selo', 6, 4.90, 400, 2.00, '#EF4444', '🔥 RELÂMPAGO'),
  ('boost_24h', 'Boost Diário', '24h em destaque + selo dourado', 24, 14.90, 1200, 3.00, '#F59E0B', '⭐ DESTAQUE'),
  ('boost_7d', 'Boost Semanal', '7 dias no topo + badge "Escolha da Semana"', 168, 69.90, 6000, 4.00, '#8B5CF6', '👑 SEMANA'),
  ('boost_30d', 'Boost Premium', '30 dias de visibilidade máxima', 720, 199.90, 18000, 5.00, '#10B981', '💎 PREMIUM')
ON CONFLICT (code) DO NOTHING;

-- Boosts comprados por vendedores
CREATE TABLE IF NOT EXISTS public.product_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_code TEXT NOT NULL REFERENCES public.boost_packages(code),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  price_paid_brl NUMERIC(10,2) NOT NULL,
  kd_points_used INTEGER NOT NULL DEFAULT 0,
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  sales_during INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_boosts_active ON public.product_boosts(expires_at) WHERE expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_boosts_product ON public.product_boosts(product_id, expires_at DESC);

-- ===========================================================================
-- 3. ASSINATURAS & PAGAMENTOS DE PLANOS (Stripe subscriptions)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subs_user ON public.subscriptions(user_id);

-- ===========================================================================
-- 4. SAQUES / WITHDRAWALS (saques transparentes da carteira)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_brl NUMERIC(10,2) NOT NULL,
  fee_brl NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  net_amount_brl NUMERIC(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL DEFAULT 'cpf',
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  rejected_reason TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wd_user ON public.withdrawals(user_id, created_at DESC);

-- Saque mínimo R$30, taxa fixa de R$0,99 — SEM surpresas
SELECT public._add_col('withdrawals', 'min_withdrawal_brl', 'NUMERIC(10,2)', '30.00');

-- ===========================================================================
-- 5. CASHBACK EM KD POINTS (configurável por plano)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.kd_cashback_rules (
  id SERIAL PRIMARY KEY,
  trigger_event TEXT NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  kd_points INTEGER NOT NULL DEFAULT 0,
  percent_back NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(trigger_event, plan_tier)
);

INSERT INTO public.kd_cashback_rules (trigger_event, plan_tier, kd_points, percent_back, description) VALUES
  ('purchase', 'free', 0, 1.00, '1% do valor em KD Points no Free'),
  ('purchase', 'plus', 0, 2.00, '2% de volta no Plus'),
  ('purchase', 'pro', 0, 3.00, '3% de volta no Pro'),
  ('purchase', 'vendor_pro', 0, 5.00, '5% de volta no Vendor Pro'),
  ('review_written', 'free', 50, 0, '50 KD Points por review'),
  ('first_sale', 'free', 500, 0, 'Primeira venda: bônus 500 KD'),
  ('referral_purchase', 'free', 200, 0, '200 KD quando indicado compra')
ON CONFLICT (trigger_event, plan_tier) DO NOTHING;

-- ===========================================================================
-- 6. BIDS DE FREELANCE (com aceite/rejeição e milestone)
-- ===========================================================================
-- Colunas de freelance_bids (idempotente — adiciona só se faltar)
SELECT public._add_col('freelance_bids', 'status', 'TEXT', 'pending');
SELECT public._add_col('freelance_bids', 'accepted_at', 'TIMESTAMPTZ');
SELECT public._add_col('freelance_bids', 'rejected_at', 'TIMESTAMPTZ');
SELECT public._add_col('freelance_bids', 'completed_at', 'TIMESTAMPTZ');
SELECT public._add_col('freelance_bids', 'delivered_at', 'TIMESTAMPTZ');
SELECT public._add_col('freelance_bids', 'delivery_message', 'TEXT');
SELECT public._add_col('freelance_bids', 'delivery_files', 'JSONB', '''[]''::jsonb');
SELECT public._add_col('freelance_bids', 'client_rating', 'INTEGER');
SELECT public._add_col('freelance_bids', 'client_review', 'TEXT');

-- Cria tabela freelance_bids se não existir (pode não ter sido criada ainda)
CREATE TABLE IF NOT EXISTS public.freelance_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.freelance_jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  price_brl NUMERIC(10,2) NOT NULL,
  delivery_days INTEGER NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivery_message TEXT,
  delivery_files JSONB DEFAULT '[]'::jsonb,
  client_rating INTEGER,
  client_review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bids_job ON public.freelance_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_freelancer ON public.freelance_bids(freelancer_id, created_at DESC);

-- Milestones de freelance (pagamento por etapa)
CREATE TABLE IF NOT EXISTS public.freelance_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID NOT NULL REFERENCES public.freelance_bids(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount_brl NUMERIC(10,2) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- 7. AFILIADOS — CLIQUES, CONVERSÕES E COMISSÕES (rastreio real)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  earnings_brl NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(affiliate_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  converted BOOLEAN NOT NULL DEFAULT false,
  order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affclicks_link ON public.affiliate_clicks(link_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  amount_brl NUMERIC(10,2) NOT NULL,
  commission_percent NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_affc_aff ON public.affiliate_commissions(affiliate_id, created_at DESC);

-- ===========================================================================
-- 8. CUPONS CRIADOS POR VENDEDORES (vendedor distribui seu próprio desconto)
-- ===========================================================================
-- Colunas de cupons de vendedores
SELECT public._add_col('coupons', 'seller_id', 'UUID');
SELECT public._add_col('coupons', 'max_uses_per_user', 'INTEGER', '1');
SELECT public._add_col('coupons', 'applicable_products', 'JSONB', '''[]''::jsonb');
SELECT public._add_col('coupons', 'min_cart_total', 'NUMERIC(10,2)', '0.00');
SELECT public._add_col('coupons', 'stackable', 'BOOLEAN', 'false');

-- ===========================================================================
-- 9. GIFTCARDS / VALE-KIYVO (pode vender como produto ou presentear)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.giftcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  value_brl NUMERIC(10,2) NOT NULL,
  bonus_brl NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- 10. LOYALTY / NÍVEIS DE CLIENTE (com benefícios progressivos)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_xp INTEGER NOT NULL DEFAULT 0,
  fee_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  kd_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  badge_color TEXT NOT NULL DEFAULT '#64748B',
  badge_emoji TEXT NOT NULL DEFAULT '',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.loyalty_tiers (code, name, min_xp, fee_discount_percent, kd_multiplier, badge_color, badge_emoji, benefits) VALUES
  ('bronze', 'Bronze', 0, 0, 1.00, '#CD7F32', '🥉', '["Acesso básico"]'::jsonb),
  ('prata', 'Prata', 1000, 5, 1.25, '#C0C0C0', '🥈', '["5% OFF em taxas","Cashback 1.25x","Badge Prata"]'::jsonb),
  ('ouro', 'Ouro', 5000, 10, 1.50, '#F59E0B', '🥇', '["10% OFF em taxas","Cashback 1.5x","Suporte prioritário"]'::jsonb),
  ('diamante', 'Diamante', 20000, 20, 2.00, '#06B6D4', '💎', '["20% OFF em taxas","Cashback 2x","Gerente dedicado","Boost semanal grátis"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ===========================================================================
-- 11. RELATÓRIOS FINANCEIROS (auditoria completa)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_fees NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_refunds NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  net_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_kd_earned INTEGER NOT NULL DEFAULT 0,
  is_final BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

-- ===========================================================================
-- 12. PROMOÇÕES RELÂMPAGO (time-based, admin cria rapidamente)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.flash_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percent NUMERIC(5,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flash_sale_products (
  flash_sale_id UUID REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  extra_discount NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (flash_sale_id, product_id)
);

-- ===========================================================================
-- 13. BUNDLES / KITS (combos com desconto progressivo)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  price_brl NUMERIC(10,2) NOT NULL,
  compare_at_brl NUMERIC(10,2),
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  kd_points_bonus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bundle_items (
  bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bundle_id, product_id)
);

-- ===========================================================================
-- 14. WAITLIST / LANÇAMENTO (produto em pré-venda)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.waitlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  notified BOOLEAN NOT NULL DEFAULT false,
  notified_at TIMESTAMPTZ,
  price_at_join NUMERIC(10,2),
  early_bird_discount NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===========================================================================
-- 15. COMPARAÇÃO DE PREÇOS (garante preço justo SEMPRE)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.price_alerts_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC(10,2) NOT NULL,
  new_price NUMERIC(10,2) NOT NULL,
  reason TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- 16. COLUNAS NOVAS EM PROFILES PARA O SISTEMA NOVO
-- ===========================================================================
SELECT public._add_col('profiles', 'loyalty_tier', 'TEXT', 'bronze');
SELECT public._add_col('profiles', 'xp_pending', 'INTEGER', '0');
SELECT public._add_col('profiles', 'compras_total_brl', 'NUMERIC(12,2)', '0.00');
SELECT public._add_col('profiles', 'afiliado_ativo', 'BOOLEAN', 'false');
SELECT public._add_col('profiles', 'afiliado_aprovado', 'BOOLEAN', 'false');
SELECT public._add_col('profiles', 'churn_risk_score', 'NUMERIC(5,2)', '0.00');
SELECT public._add_col('profiles', 'lifetime_value_brl', 'NUMERIC(12,2)', '0.00');
SELECT public._add_col('profiles', 'total_withdrawn_brl', 'NUMERIC(12,2)', '0.00');
SELECT public._add_col('profiles', 'tax_id_verified', 'BOOLEAN', 'false');
SELECT public._add_col('profiles', 'kyc_status', 'TEXT', 'pending');

-- ===========================================================================
-- 17. CONFIGURAÇÃO DA PLATAFORMA (constantes editáveis pelo admin)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'string',
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.platform_config (key, value, type, description) VALUES
  ('min_withdrawal_brl', '30.00', 'number', 'Saque mínimo em BRL'),
  ('withdrawal_fee_brl', '0.99', 'number', 'Taxa fixa por saque (custo operacional)'),
  ('kd_points_per_brl', '100', 'number', 'Quantos KD Points valem R$1'),
  ('kd_max_discount_percent', '50', 'number', 'Máx de desconto que KD Points pode dar'),
  ('affiliate_min_payout_brl', '50.00', 'number', 'Mínimo para saque de afiliado'),
  ('max_fee_percent_cap', '8', 'number', 'TAXA MÁXIMA cobrada pela plataforma (nunca ultrapassar!)'),
  ('boost_min_price_brl', '4.90', 'number', 'Boost mais barato'),
  ('free_trial_days', '7', 'number', 'Dias de trial grátis do Pro'),
  ('referral_bonus_kd', '500', 'number', 'KD Points por indicar amigo'),
  ('first_purchase_bonus_kd', '300', 'number', 'KD Points bônus na primeira compra')
ON CONFLICT (key) DO NOTHING;

-- ===========================================================================
-- 18. TRIGGER PARA ATUALIZAR updated_at
-- ===========================================================================
CREATE OR REPLACE FUNCTION public._touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas que tem updated_at
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema='public' AND column_name='updated_at'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_touch_%I ON public.%I;
       CREATE TRIGGER trg_touch_%I BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public._touch_updated_at();',
      r.table_name, r.table_name, r.table_name, r.table_name
    );
  END LOOP;
END $$;

-- ===========================================================================
-- 19. RLS — HABILITAR EM TODAS TABELAS NOVAS (policies permissivas por enquanto)
-- ===========================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    -- Garante que exista policy permissiva (evita bloqueios)
    EXECUTE format(
      'DROP POLICY IF EXISTS "%s_all_permissive" ON public.%I;
       CREATE POLICY "%s_all_permissive" ON public.%I FOR ALL USING (true) WITH CHECK (true);',
      r.tablename, r.tablename, r.tablename, r.tablename
    );
  END LOOP;
END $$;

-- ===========================================================================
-- 20. FUNÇÃO: Calcular taxa e valor líquido do vendedor (TRANSPARENTE)
--     Exemplo: SELECT public.calculate_seller_net(100.00, 'free'::text) → retorna
--     {fee_percent, fixed_brl, total_fee, net, max_capped}
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.calculate_seller_net(
  p_gross_brl NUMERIC,
  p_plan TEXT DEFAULT 'free'
)
RETURNS TABLE(
  fee_percent NUMERIC,
  fixed_brl NUMERIC,
  total_fee NUMERIC,
  seller_net NUMERIC,
  kd_cashback INTEGER,
  was_capped BOOLEAN
) AS $$
DECLARE
  v_percent NUMERIC;
  v_fixed NUMERIC;
  v_cap NUMERIC;
  v_threshold NUMERIC;
  v_kd_percent NUMERIC;
  v_fee NUMERIC;
BEGIN
  SELECT product_sale_fee_percent, product_sale_fixed_brl, max_fee_cap_brl, free_threshold_brl
    INTO v_percent, v_fixed, v_cap, v_threshold
  FROM public.fee_config WHERE plan_tier = p_plan AND is_active = true
  LIMIT 1;

  IF v_percent IS NULL THEN
    v_percent := 8.00; v_fixed := 0.50; v_cap := 50.00; v_threshold := 0;
  END IF;

  -- Se dentro do threshold (ex: primeiros R$5k do VendorPro), taxa ZERO
  IF p_gross_brl <= v_threshold THEN
    v_percent := 0; v_fixed := 0; v_cap := 0;
  END IF;

  v_fee := (p_gross_brl * v_percent / 100.0) + v_fixed;
  was_capped := false;
  IF v_cap > 0 AND v_fee > v_cap THEN
    v_fee := v_cap;
    was_capped := true;
  END IF;

  SELECT percent_back INTO v_kd_percent
  FROM public.kd_cashback_rules WHERE trigger_event='purchase' AND plan_tier=p_plan
  LIMIT 1;
  IF v_kd_percent IS NULL THEN v_kd_percent := 1.00; END IF;

  fee_percent := v_percent;
  fixed_brl := v_fixed;
  total_fee := ROUND(v_fee, 2);
  seller_net := ROUND(p_gross_brl - v_fee, 2);
  kd_cashback := FLOOR(p_gross_brl * v_kd_percent);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ===========================================================================
-- 21. FUNÇÃO: Calcular comissão de afiliado
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission(
  p_product_price NUMERIC,
  p_affiliate_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_percent NUMERIC;
  v_plan TEXT;
BEGIN
  SELECT plano INTO v_plan FROM public.profiles WHERE id = p_affiliate_id LIMIT 1;
  SELECT affiliate_default_percent INTO v_percent
  FROM public.fee_config WHERE plan_tier = COALESCE(v_plan, 'free') AND is_active = true
  LIMIT 1;
  IF v_percent IS NULL THEN v_percent := 10.00; END IF;
  RETURN ROUND(p_product_price * v_percent / 100.0, 2);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- FIM DO v9.0 JUSTO & LUCRATIVO — SEM TAXAS ABUSIVAS

-- ===========================================================================
-- KIYVO v10: SCRIPT COMPLETO FINALIZADO.
-- ===========================================================================

-- ===========================================================================
-- KIYVO v10 MONSTER — Adições e garantias
-- Executado DEPOIS do v9 já existente.
-- ===========================================================================

-- Garantir coluna 'slug' em products se não existir (algumas versões antigas podem não ter)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE public.products ADD COLUMN slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured') THEN
    ALTER TABLE public.products ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'status') THEN
    -- Criar coluna status compatível com 'published' (caso a tabela antiga use coluna diferente)
    ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'published';
  END IF;
END $$;

-- Garantir unicidade de slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug) WHERE slug IS NOT NULL;

-- Função gerar slug amigável a partir do título
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      TRANSLATE(TRIM(input), 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC-'),
      '[^a-z0-9-]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: gerar slug automaticamente no INSERT se vazio
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.slugify(COALESCE(NEW.titulo, NEW.title, 'produto'));
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug AND id <> NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_slug ON public.products;
CREATE TRIGGER products_set_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_product_slug();

-- Incrementar visualizações
CREATE OR REPLACE FUNCTION public.increment_product_views(product_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = product_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir colunas de reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON public.reviews(reviewer_id);

-- Tabela de categorias se não existir
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS em categorias e reviews (público para leitura, só dono/admin para escrever)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews public read" ON public.reviews;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Reviews insert own" ON public.reviews;
CREATE POLICY "Reviews insert own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Reviews update own" ON public.reviews;
CREATE POLICY "Reviews update own" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Categories public read" ON public.categories;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (is_active = true);

-- Seed de categorias iniciais
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Marketing Digital', 'marketing', '📈', 1),
  ('Cursos', 'curso', '🎓', 2),
  ('Templates', 'templates', '🎨', 3),
  ('E-books', 'ebooks', '📚', 4),
  ('Software / Plugins', 'software', '⚙️', 5),
  ('Mentorias', 'mentoria', '🧠', 6),
  ('Planilhas', 'planilhas', '📊', 7),
  ('Design', 'design', '🖼️', 8),
  ('Áudio e Música', 'audio', '🎵', 9),
  ('Vídeo', 'video', '🎬', 10),
  ('Negócios', 'negocios', '💼', 11)
ON CONFLICT (slug) DO NOTHING;

-- Inserir alguns produtos DEMO como seed inicial para o site não ficar vazio
-- (os produtos demo também existem como fallback na API)
INSERT INTO public.products (id, titulo, preco, preco_de, descricao_curta, categoria, status, is_digital, total_vendas, rating, total_reviews, is_featured) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Curso Completo de Tráfego Pago 2026', 197, 497, 'Do zero ao ROAS 4x em Meta Ads e Google Ads, com cases brasileiros.', 'marketing', 'published', true, 2487, 4.9, 324, true),
  ('00000000-0000-0000-0000-000000000002', 'Pack 500 Criativos de Reels Prontos', 47, 147, '500 vídeos editáveis para Reels/TikTok/Shorts.', 'templates', 'published', true, 1203, 4.7, 89, true),
  ('00000000-0000-0000-0000-000000000003', 'Planilha Calculadora ROI de Anúncios', 27, 97, 'Calcule ROI, ROAS, CPA e lucro real automaticamente.', 'planilhas', 'published', true, 3201, 4.8, 156, false),
  ('00000000-0000-0000-0000-000000000004', 'Mentoria Grupo VIP Marketing Digital', 997, 2497, 'Acompanhamento semanal por 3 meses.', 'mentoria', 'published', true, 342, 5.0, 78, true),
  ('00000000-0000-0000-0000-000000000005', 'Plugin SEO WordPress Premium', 97, 197, 'Plugin SEO completo com IA.', 'software', 'published', true, 890, 4.6, 203, false),
  ('00000000-0000-0000-0000-000000000006', 'Ebook 7 Passos para Vender Online', 19, 47, 'Guia prático para as primeiras 100 vendas em 30 dias.', 'ebooks', 'published', true, 8421, 4.8, 421, false)
ON CONFLICT (id) DO NOTHING;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_touch_updated_at ON public.reviews;
CREATE TRIGGER reviews_touch_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===========================================================================
-- FIM DO SCRIPT KIYVO V10 COMPLETO — rode tudo no Supabase SQL Editor
-- ===========================================================================
