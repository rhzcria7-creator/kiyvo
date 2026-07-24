-- ═══════════════════════════════════════════════════════════════
-- KIYVO v6.0 — SCHEMA COLOSSO BRASIL
-- Motor: Supabase PostgreSQL + Stripe Connect + Escrow + Cofre Digital
-- 100% IDEMPOTENTE — Execute no SQL Editor do Supabase
-- EVOLUÇÃO DO v5 — NÃO APAGA NADA, SÓ ADICIONA
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 0. NOVOS ENUMS (adicionar aos existentes do v5)
-- ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.kyc_status AS ENUM ('none', 'pending', 'cpf_verified', 'docs_uploaded', 'selfie_verified', 'address_verified', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.inventory_asset_status AS ENUM ('available', 'reserved', 'sold', 'revoked', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.vendor_level AS ENUM ('bronze', 'silver', 'gold', 'diamond', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'wallet', 'boleto');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.asset_type AS ENUM ('license_key', 'account_credentials', 'download_link', 'script_zip', 'course_access', 'api_credentials', 'gift_card_code', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 1. PROFILES — Adicionar colunas KYC (evolução do v5)
-- ───────────────────────────────────────────────────────────────

-- Adicionar campos de KYC que faltam no v5
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj_hash TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj_type TEXT CHECK (cpf_cnpj_type IN ('cpf', 'cnpj'));
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status public.kyc_status NOT NULL DEFAULT 'none';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;  -- Encriptado no app
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 2. VENDOR_METRICS — Gamificação e taxas dinâmicas
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_metrics (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_sales              INTEGER NOT NULL DEFAULT 0,
  total_revenue            DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_disputes           INTEGER NOT NULL DEFAULT 0,
  dispute_rate_percent     DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  positive_reviews_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  level                    public.vendor_level NOT NULL DEFAULT 'bronze',
  experience_points        INTEGER NOT NULL DEFAULT 0,
  -- Comissões dinâmicas baseadas no nível
  current_commission_rate  DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  next_level_threshold     INTEGER NOT NULL DEFAULT 10,
  avg_response_time_hours  DECIMAL(5,2),  -- Tempo médio de resposta ao comprador
  successful_deliveries    INTEGER NOT NULL DEFAULT 0,
  failed_deliveries        INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create vendor_metrics quando vendor é criado
CREATE OR REPLACE FUNCTION public.create_vendor_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vendor_metrics (user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vendor_created ON public.vendors;
CREATE TRIGGER on_vendor_created
  AFTER INSERT ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.create_vendor_metrics();

-- Trigger para auto-update do level baseado em sales
CREATE OR REPLACE FUNCTION public.update_vendor_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Bronze: 0-9 vendas (10% taxa)
  -- Silver: 10-49 vendas (8% taxa)
  -- Gold: 50-199 vendas (6% taxa)
  -- Diamond: 200-999 vendas (5% taxa)
  -- Platinum: 1000+ vendas (3% taxa)
  IF NEW.total_sales >= 1000 THEN
    NEW.level := 'platinum';
    NEW.current_commission_rate := 3.00;
    NEW.next_level_threshold := 1000;
  ELSIF NEW.total_sales >= 200 THEN
    NEW.level := 'diamond';
    NEW.current_commission_rate := 5.00;
    NEW.next_level_threshold := 1000;
  ELSIF NEW.total_sales >= 50 THEN
    NEW.level := 'gold';
    NEW.current_commission_rate := 6.00;
    NEW.next_level_threshold := 200;
  ELSIF NEW.total_sales >= 10 THEN
    NEW.level := 'silver';
    NEW.current_commission_rate := 8.00;
    NEW.next_level_threshold := 50;
  ELSE
    NEW.level := 'bronze';
    NEW.current_commission_rate := 10.00;
    NEW.next_level_threshold := 10;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vendor_metrics_update ON public.vendor_metrics;
CREATE TRIGGER on_vendor_metrics_update
  BEFORE UPDATE OF total_sales ON public.vendor_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_level();

-- ───────────────────────────────────────────────────────────────
-- 3. DIGITAL_INVENTORY — O COFRE (Asset Vault)
-- ───────────────────────────────────────────────────────────────
-- O comprador NUNCA pode ler esta tabela diretamente.
-- Uma Edge Function ou query muito restrita entrega o dado
-- apenas após confirmação de pagamento.
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.digital_inventory (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id       UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  asset_type       public.asset_type NOT NULL DEFAULT 'license_key',
  -- Os dados sensíveis ficam encriptados no app layer
  -- Aqui guardamos o dado encriptado (AES-256-GCM)
  asset_data_encrypted TEXT NOT NULL,  -- Encriptado via pgcrypto ou app-layer
  asset_data_iv        TEXT,  -- Initialization Vector para decriptação
  asset_data_tag       TEXT,  -- Authentication tag (AES-GCM)
  -- Metadados sem expor o conteúdo
  asset_description    TEXT,  -- Ex: "Steam Key - Region: BR", "Conta PSN + PS Plus"
  status               public.inventory_asset_status NOT NULL DEFAULT 'available',
  -- Rastreio de venda
  sold_to_order_id     UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  sold_to_order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  sold_at              TIMESTAMPTZ,
  reserved_at          TIMESTAMPTZ,  -- Quando foi reservado para checkout
  expires_at           TIMESTAMPTZ,  -- Para assets com validade (ex: gift cards)
  -- Auditabilidade
  created_by           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca rápida de assets disponíveis por produto
CREATE INDEX IF NOT EXISTS idx_digital_inventory_available
  ON public.digital_inventory (product_id, status)
  WHERE status = 'available';

-- Índice para encontrar assets vendidos a uma ordem
CREATE INDEX IF NOT EXISTS idx_digital_inventory_order
  ON public.digital_inventory (sold_to_order_id)
  WHERE sold_to_order_id IS NOT NULL;

-- ───────────────────────────────────────────────────────────────
-- 4. KYC_DOCUMENTS — Documentos submetidos pelo vendedor
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type    TEXT NOT NULL CHECK (document_type IN (
    'cpf_cnpj', 'id_front', 'id_back', 'selfie_with_doc',
    'proof_of_address', 'business_registration'
  )),
  file_path        TEXT NOT NULL,  -- Path no Supabase Storage (bucket privado: vendor-docs)
  file_hash        TEXT,  -- SHA-256 para integridade
  file_size_bytes  INTEGER,
  mime_type        TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  metadata         JSONB DEFAULT '{}',  -- Exif data, OCR results, etc
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 5. ORDERS — Adicionar campos de pagamento e PIX
-- ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method public.payment_method;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_code TEXT;  -- Código PIX "copia e cola"
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_qrcode_url TEXT;  -- URL do QR Code PIX
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_expires_at TIMESTAMPTZ;  -- Validade do PIX
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ;  -- Quando o Escrow foi liberado
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS escrow_release_scheduled_at TIMESTAMPTZ;  -- Data programada para liberação (7 dias)
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS auto_confirm_at TIMESTAMPTZ;  -- Auto-confirmação se comprador não agir
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 6. ORDER_ITEMS — Adicionar campos de entrega digital
-- ───────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS delivered_asset_type public.asset_type;
  ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
  ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
  ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS auto_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 7. ESCROW_TIMELINE — Histórico de retenção/liberação
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.escrow_timeline (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'payment_received', 'asset_delivered', 'buyer_confirmed',
    'auto_confirmed', 'dispute_opened', 'dispute_resolved',
    'escrow_released', 'refund_initiated', 'refund_completed'
  )),
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount      DECIMAL(14,2),  -- Valor envolvido no evento
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 8. CHAT_MESSAGES — Chat encriptado comprador↔vendedor
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  buyer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'blocked')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,  -- Mensagem encriptada no app-layer
  message_type    TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system', 'dispute_opened', 'dispute_resolved')),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscar mensagens de uma conversa
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
  ON public.chat_messages (conversation_id, created_at DESC);

-- ───────────────────────────────────────────────────────────────
-- 9. FAVORITES — Lista de desejos do comprador
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ───────────────────────────────────────────────────────────────
-- 10. SECURITY_EVENTS — Log de eventos de segurança
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.security_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'login_success', 'login_failure', 'signup', 'password_change',
    '2fa_enabled', '2fa_disabled', '2fa_challenge', 'suspicious_activity',
    'rate_limit_hit', 'csrf_violation', 'xss_attempt', 'sql_injection_attempt',
    'multiple_failed_logins', 'account_locked', 'account_unlocked',
    'kyc_submitted', 'kyc_approved', 'kyc_rejected',
    'unauthorized_access_attempt', 'api_key_abuse'
  )),
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  severity    TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para queries de segurança (últimos eventos por user)
CREATE INDEX IF NOT EXISTS idx_security_events_user
  ON public.security_events (user_id, created_at DESC);

-- Índice para detectar ataques por IP
CREATE INDEX IF NOT EXISTS idx_security_events_ip
  ON public.security_events (ip_address, created_at DESC)
  WHERE severity IN ('warning', 'critical');

-- ───────────────────────────────────────────────────────────────
-- 11. RATE_LIMIT_TRACKING — Persistir rate limits (não em memória)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier  TEXT NOT NULL,  -- IP ou user_id
  action      TEXT NOT NULL,  -- 'login', 'signup', 'api_call', etc.
  count       INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);

-- ───────────────────────────────────────────────────────────────
-- 12. COUPON_USAGE — Rastreio de uso de cupons por usuário
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id  UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)  -- Um cupom por usuário
);

-- ═══════════════════════════════════════════════════════════════
-- RLS — SEGURANÇA BANCÁRIA PARA NOVAS TABELAS
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- ═══ DIGITAL INVENTORY — A TABELA MAIS SENSÍVEL ═══
  -- O COMPRADOR NUNCA LÊ DIRETAMENTE. SÓ VIA DELIVERY ENGINE.
  ALTER TABLE public.digital_inventory ENABLE ROW LEVEL SECURITY;

  -- Vendor só vê os seus próprios assets
  DROP POLICY IF EXISTS "vault_vendor_read" ON public.digital_inventory;
  CREATE POLICY "vault_vendor_read" ON public.digital_inventory FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- Vendor insere assets nos seus produtos
  DROP POLICY IF EXISTS "vault_vendor_insert" ON public.digital_inventory;
  CREATE POLICY "vault_vendor_insert" ON public.digital_inventory FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
  );

  -- Vendor atualiza status dos seus assets
  DROP POLICY IF EXISTS "vault_vendor_update" ON public.digital_inventory;
  CREATE POLICY "vault_vendor_update" ON public.digital_inventory FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- NUNCA DELETE — apenas revoke (soft delete via status)
  DROP POLICY IF EXISTS "vault_no_delete" ON public.digital_inventory;
  CREATE POLICY "vault_no_delete" ON public.digital_inventory FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- ═══ VENDOR METRICS ═══
  ALTER TABLE public.vendor_metrics ENABLE ROW LEVEL SECURITY;

  -- Público pode ver métricas (para selos de confiança)
  DROP POLICY IF EXISTS "vendor_metrics_read" ON public.vendor_metrics;
  CREATE POLICY "vendor_metrics_read" ON public.vendor_metrics FOR SELECT USING (TRUE);

  -- Só o próprio vendor pode... na verdade, metrics são atualizadas via triggers/functions
  -- com service_role. Vendor não escreve diretamente.
  DROP POLICY IF EXISTS "vendor_metrics_no_direct_write" ON public.vendor_metrics;
  CREATE POLICY "vendor_metrics_no_direct_write" ON public.vendor_metrics FOR UPDATE USING (FALSE);

  DROP POLICY IF EXISTS "vendor_metrics_no_insert" ON public.vendor_metrics;
  CREATE POLICY "vendor_metrics_no_insert" ON public.vendor_metrics FOR INSERT WITH CHECK (FALSE);

  -- ═══ KYC DOCUMENTS ═══
  ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

  -- Vendor só vê os seus próprios docs
  DROP POLICY IF EXISTS "kyc_docs_own_read" ON public.kyc_documents;
  CREATE POLICY "kyc_docs_own_read" ON public.kyc_documents FOR SELECT USING (user_id = auth.uid());

  -- Vendor insere seus docs
  DROP POLICY IF EXISTS "kyc_docs_own_insert" ON public.kyc_documents;
  CREATE POLICY "kyc_docs_own_insert" ON public.kyc_documents FOR INSERT WITH CHECK (user_id = auth.uid());

  -- Vendor NÃO pode atualizar ou apagar após envio (anti-fraude)
  DROP POLICY IF EXISTS "kyc_docs_no_update" ON public.kyc_documents;
  CREATE POLICY "kyc_docs_no_update" ON public.kyc_documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  DROP POLICY IF EXISTS "kyc_docs_no_delete" ON public.kyc_documents;
  CREATE POLICY "kyc_docs_no_delete" ON public.kyc_documents FOR DELETE USING (FALSE);

  -- ═══ ESCROW TIMELINE ═══
  ALTER TABLE public.escrow_timeline ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "escrow_timeline_participants" ON public.escrow_timeline;
  CREATE POLICY "escrow_timeline_participants" ON public.escrow_timeline FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = o.vendor_id AND v.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')))
  );

  -- ═══ CHAT ═══
  ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "chat_conv_participants" ON public.chat_conversations;
  CREATE POLICY "chat_conv_participants" ON public.chat_conversations FOR SELECT USING (
    buyer_id = auth.uid() OR vendor_id = auth.uid()
  );

  DROP POLICY IF EXISTS "chat_conv_create" ON public.chat_conversations;
  CREATE POLICY "chat_conv_create" ON public.chat_conversations FOR INSERT WITH CHECK (
    buyer_id = auth.uid() OR vendor_id = auth.uid()
  );

  ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "chat_msg_participants" ON public.chat_messages;
  CREATE POLICY "chat_msg_participants" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.vendor_id = auth.uid()))
  );

  DROP POLICY IF EXISTS "chat_msg_send" ON public.chat_messages;
  CREATE POLICY "chat_msg_send" ON public.chat_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.vendor_id = auth.uid()))
  );

  -- ═══ FAVORITES ═══
  ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "favorites_own" ON public.favorites;
  CREATE POLICY "favorites_own" ON public.favorites FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "favorites_own_insert" ON public.favorites;
  CREATE POLICY "favorites_own_insert" ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "favorites_own_delete" ON public.favorites;
  CREATE POLICY "favorites_own_delete" ON public.favorites FOR DELETE USING (user_id = auth.uid());

  -- ═══ SECURITY EVENTS ═══
  ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

  -- Só admin lê eventos de segurança
  DROP POLICY IF EXISTS "security_events_admin" ON public.security_events;
  CREATE POLICY "security_events_admin" ON public.security_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

  -- Inserção permitida via service_role (Edge Functions / API routes)
  DROP POLICY IF EXISTS "security_events_insert" ON public.security_events;
  CREATE POLICY "security_events_insert" ON public.security_events FOR INSERT WITH CHECK (TRUE);

  -- ═══ RATE LIMIT TRACKING ═══
  ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

  -- Ninguém lê diretamente (usado apenas por Edge Functions com service_role)
  DROP POLICY IF EXISTS "rate_limit_no_read" ON public.rate_limit_tracking;
  CREATE POLICY "rate_limit_no_read" ON public.rate_limit_tracking FOR SELECT USING (FALSE);

  DROP POLICY IF EXISTS "rate_limit_service_write" ON public.rate_limit_tracking;
  CREATE POLICY "rate_limit_service_write" ON public.rate_limit_tracking FOR ALL USING (FALSE);

  -- ═══ COUPON USAGE ═══
  ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "coupon_usage_own" ON public.coupon_usage;
  CREATE POLICY "coupon_usage_own" ON public.coupon_usage FOR SELECT USING (user_id = auth.uid());

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Some RLS policies already exist — skipped';
END $$;

-- ───────────────────────────────────────────────────────────────
-- TRIGGER: auto-update vendor_metrics quando order é confirmed
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.on_order_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar total_sales do vendor
  UPDATE public.vendor_metrics
  SET
    total_sales = total_sales + 1,
    total_revenue = total_revenue + NEW.vendor_net,
    successful_deliveries = successful_deliveries + 1,
    updated_at = NOW()
  WHERE user_id = (
    SELECT v.user_id FROM public.vendors v WHERE v.id = NEW.vendor_id
  );

  -- Atualizar total_sales no vendor também
  UPDATE public.vendors
  SET total_sales = total_sales + 1
  WHERE id = NEW.vendor_id;

  -- Incrementar sales_count do produto
  UPDATE public.products
  SET sales_count = sales_count + 1
  WHERE id IN (
    SELECT oi.product_id FROM public.order_items oi WHERE oi.order_id = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_confirmed ON public.orders;
CREATE TRIGGER on_order_status_confirmed
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION public.on_order_confirmed();

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Reservar asset do Cofre para checkout
-- Deve ser chamada via service_role (API route)
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.reserve_inventory_asset(
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL,
  p_order_id UUID,
  p_order_item_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_asset_id UUID;
BEGIN
  -- Selecionar e reservar atomicamente o primeiro asset disponível
  UPDATE public.digital_inventory
  SET
    status = 'reserved',
    sold_to_order_id = p_order_id,
    sold_to_order_item_id = p_order_item_id,
    reserved_at = NOW()
  WHERE id = (
    SELECT di.id FROM public.digital_inventory di
    WHERE di.product_id = p_product_id
      AND (di.variant_id = p_variant_id OR p_variant_id IS NULL)
      AND di.status = 'available'
    ORDER BY di.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED  -- Evita race condition
  )
  RETURNING id INTO v_asset_id;

  RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Marcar asset como vendido (após pagamento confirmado)
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_asset_sold(
  p_order_item_id UUID
)
RETURNS TABLE(
  asset_type public.asset_type,
  asset_data_encrypted TEXT,
  asset_data_iv TEXT,
  asset_data_tag TEXT,
  asset_description TEXT
) AS $$
BEGIN
  -- Atualizar status para sold
  UPDATE public.digital_inventory
  SET status = 'sold', sold_at = NOW()
  WHERE sold_to_order_item_id = p_order_item_id AND status = 'reserved';

  -- Retornar dados do asset para entrega (via service_role)
  RETURN QUERY
  SELECT di.asset_type, di.asset_data_encrypted, di.asset_data_iv, di.asset_data_tag, di.asset_description
  FROM public.digital_inventory di
  WHERE di.sold_to_order_item_id = p_order_item_id AND di.status = 'sold';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Auto-confirmar ordem após 7 dias
-- Agenda via pg_cron ou Edge Function
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.auto_confirm_expired_orders()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.orders
  SET
    status = 'confirmed',
    confirmed_at = NOW(),
    auto_confirm_at = NOW()
  WHERE status = 'delivered'
    AND delivered_at < NOW() - INTERVAL '7 days'
    AND confirmed_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Escalão de nível do vendor com notificação
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_vendor_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level != OLD.level THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'vendor',
      '🎉 Subiu de nível!',
      CASE NEW.level
        WHEN 'silver' THEN 'Parabéns! Agora és Silver — taxa de 8%!'
        WHEN 'gold' THEN 'Incrível! Nível Gold alcançado — taxa de 6%!'
        WHEN 'diamond' THEN 'Lendário! Diamond — taxa de apenas 5%!'
        WHEN 'platinum' THEN '🏆 PLATINUM! A elite do Kiyvo — taxa de 3%!'
        ELSE 'Novo nível alcançado!'
      END,
      '/vendor/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vendor_level_change ON public.vendor_metrics;
CREATE TRIGGER on_vendor_level_change
  AFTER UPDATE OF level ON public.vendor_metrics
  FOR EACH ROW
  WHEN (NEW.level != OLD.level)
  EXECUTE FUNCTION public.notify_vendor_level_up();

-- ───────────────────────────────────────────────────────────────
-- TRIGGER: updated_at para novas tabelas
-- ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS vendor_metrics_updated_at ON public.vendor_metrics;
DROP TRIGGER IF EXISTS digital_inventory_updated_at ON public.digital_inventory;
DROP TRIGGER IF EXISTS chat_conversations_updated_at ON public.chat_conversations;

CREATE TRIGGER vendor_metrics_updated_at BEFORE UPDATE ON public.vendor_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER digital_inventory_updated_at BEFORE UPDATE ON public.digital_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (executar no SQL Editor ou Dashboard)
-- ═══════════════════════════════════════════════════════════════

-- Bucket para documentos KYC (PRIVADO — vendor não pode ler após upload)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, max_file_size)
VALUES ('vendor-docs', 'vendor-docs', false, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 10485760)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de produtos (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, max_file_size)
VALUES ('product-images', 'product-images', true, ARRAY['image/jpeg', 'image/png', 'image/webp'], 5242880)
ON CONFLICT (id) DO NOTHING;

-- Bucket para arquivos digitais (PRIVADO — entrega via download_token)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, max_file_size)
VALUES ('digital-files', 'digital-files', false, ARRAY['application/zip', 'application/x-rar-compressed', 'application/pdf', 'application/octet-stream'], 524288000)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STORAGE POLICIES — vendor-docs (BLINDADO)
-- ═══════════════════════════════════════════════════════════════

-- Vendor pode fazer upload para a sua pasta
DROP POLICY IF EXISTS "vendor_docs_upload" ON storage.objects;
CREATE POLICY "vendor_docs_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'vendor-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Vendor NÃO pode ler seus docs após upload (anti-fraude)
-- Apenas admin pode ler
DROP POLICY IF EXISTS "vendor_docs_admin_read" ON storage.objects;
CREATE POLICY "vendor_docs_admin_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'vendor-docs' AND
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Product images: qualquer um pode ler, vendor pode upload
DROP POLICY IF EXISTS "product_images_read" ON storage.objects;
CREATE POLICY "product_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_upload" ON storage.objects;
CREATE POLICY "product_images_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

-- Digital files: apenas via download_token (service_role entrega)
DROP POLICY IF EXISTS "digital_files_service" ON storage.objects;
CREATE POLICY "digital_files_service" ON storage.objects FOR SELECT USING (
  bucket_id = 'digital-files' AND
  EXISTS (SELECT 1 FROM public.download_tokens dt WHERE dt.file_path = name AND dt.buyer_id = auth.uid() AND dt.is_active = TRUE AND dt.expires_at > NOW())
);

-- ═══════════════════════════════════════════════════════════════
-- ✅ SCHEMA V6.0 — COLOSSO BRASIL COMPLETO
-- Inclui: Cofre Digital, KYC, Gamificação, PIX, Chat, Rate Limit
-- Execute no SQL Editor do Supabase APÓS o v5
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: increment_product_stock
-- Chamada pelo VaultEngine ao adicionar assets ao Cofre
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_product_stock(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = (
    SELECT COUNT(*)::INTEGER FROM public.digital_inventory
    WHERE product_id = p_product_id AND status = 'available'
  )
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: increment_affiliate_earnings
-- Usada pelo webhook quando há conversão de afiliado
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(
  affiliate_id_input UUID,
  amount_input DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates
  SET
    total_earnings = total_earnings + amount_input,
    total_conversions = total_conversions + 1
  WHERE id = affiliate_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: increment_affiliate_clicks
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(
  affiliate_id_input UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates
  SET total_clicks = total_clicks + 1
  WHERE id = affiliate_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Marcar order_items como delivered + criar download_token
-- Chamada quando o asset é entregue ao comprador
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_order_item_delivered(
  p_order_item_id UUID,
  p_asset_type TEXT DEFAULT NULL,
  p_delivery_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_token_id UUID;
  v_buyer_id UUID;
  v_file_path TEXT;
BEGIN
  -- Atualizar order_item
  UPDATE public.order_items
  SET
    delivery_status = 'delivered',
    delivered_asset_type = p_asset_type::public.asset_type,
    digital_delivery_url = p_delivery_url,
    delivered_at = NOW()
  WHERE id = p_order_item_id;

  -- Buscar buyer_id e file_path para criar download token
  SELECT o.buyer_id, oi.digital_delivery_url
  INTO v_buyer_id, v_file_path
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE oi.id = p_order_item_id;

  -- Criar download token seguro
  INSERT INTO public.download_tokens (order_item_id, buyer_id, token, file_path, max_downloads, expires_at)
  VALUES (
    p_order_item_id,
    v_buyer_id,
    encode(gen_random_bytes(32), 'hex'),
    COALESCE(v_file_path, ''),
    5,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- FUNCTION: Atualizar wallet do vendor quando escrow é liberado
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.release_escrow_to_vendor(
  p_order_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_vendor_user_id UUID;
  v_vendor_net DECIMAL(14,2);
BEGIN
  -- Buscar vendor_net e vendor user_id
  SELECT v.user_id, o.vendor_net
  INTO v_vendor_user_id, v_vendor_net
  FROM public.orders o
  JOIN public.vendors v ON v.id = o.vendor_id
  WHERE o.id = p_order_id;

  -- Atualizar wallet
  UPDATE public.wallets
  SET balance_available = balance_available + v_vendor_net
  WHERE user_id = v_vendor_user_id;

  -- Atualizar order
  UPDATE public.orders
  SET escrow_released_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
