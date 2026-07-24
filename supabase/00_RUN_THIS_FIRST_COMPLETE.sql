-- KIYVO v8.6 - REPARO TOTAL DO BANCO (A PROVA DE FALHA)
-- COLOQUE TODO O CONTEUDO DESTE ARQUIVO NO SUPABASE SQL EDITOR E CLIQUE EM "Run"
-- Este arquivo CORRIGE QUALQUER estado da base (antigo, v5/v6/v7/v8.4/v8.5, quebrado).
-- Ele NAO apaga dados de usuarios, produtos, pedidos ou wallets.
-- Tudo e idempotente: pode rodar quantas vezes quiser sem erro.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
