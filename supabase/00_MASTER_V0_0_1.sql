-- ─────────────────────────────────────────────────────────────
-- KIYVO Master Schema v0.0.1 — 40+ tabelas
-- Idempotente: CREATE IF NOT EXISTS + safety checks
-- ─────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  cpf TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  seller_level TEXT DEFAULT 'bronze' CHECK (seller_level IN ('bronze','silver','gold','platinum','diamond','master','legend')),
  seller_plan TEXT DEFAULT 'free' CHECK (seller_plan IN ('free','starter','pro','business','enterprise')),
  kd_points_balance INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_seller BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  kyc_selfie_url TEXT,
  kyc_doc_url TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  totp_secret TEXT,
  backup_codes_encrypted TEXT,
  device_fingerprint TEXT,
  last_ip TEXT,
  ip_reputation TEXT,
  risk_score INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_seller_level ON profiles(seller_level);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  delivery_type TEXT DEFAULT 'instant' CHECK (delivery_type IN ('instant','manual','subscription')),
  delivery_instructions TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_mime TEXT,
  thumbnail TEXT,
  images TEXT[],
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','flagged')),
  rejection_reason TEXT,
  has_boost BOOLEAN DEFAULT false,
  boost_expires_at TIMESTAMPTZ,
  boost_package TEXT,
  is_tax_free BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_bundle BOOLEAN DEFAULT false,
  min_price_for_discount DECIMAL(10,2),
  max_quantity INTEGER DEFAULT 999,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(description,''))) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_trgm ON products USING GIN(title gin_trgm_ops);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id),
  order_number TEXT UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  total_with_fees DECIMAL(10,2),
  buyer_service_fee DECIMAL(10,2) DEFAULT 0,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  affiliate_commission DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('pix','credit_card','debit_card','boleto','crypto','kd_points','balance')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','processing','confirmed','failed','refunded')),
  stripe_payment_intent TEXT,
  pix_txid TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','paid','processing','delivered','completed','cancelled','refunded','disputed')),
  coupon_code TEXT,
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  kd_points_used INTEGER DEFAULT 0,
  kd_points_discount DECIMAL(10,2) DEFAULT 0,
  kd_points_earned INTEGER DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  seller_id UUID REFERENCES profiles(id),
  product_title TEXT,
  product_price DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  total DECIMAL(10,2),
  delivery_type TEXT,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending','delivered','confirmed','expired','revoked')),
  download_token TEXT,
  license_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ESCROW TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  seller_id UUID REFERENCES profiles(id),
  buyer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','held','released','refunded','disputed')),
  held_at TIMESTAMPTZ,
  release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  opened_by TEXT CHECK (opened_by IN ('buyer','seller','system')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','awaiting_evidence','resolved','cancelled')),
  resolution TEXT CHECK (resolution IN ('buyer_win','seller_win','split','cancelled')),
  resolution_note TEXT,
  admin_id UUID REFERENCES profiles(id),
  escrow_action TEXT CHECK (escrow_action IN ('release_to_seller','refund_buyer','split')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- DISPUTE EVIDENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('message','file','screenshot','link','other')),
  content TEXT,
  uploaded_by TEXT CHECK (uploaded_by IN ('buyer','seller','admin')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOWNLOAD TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  buyer_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  max_downloads INTEGER DEFAULT 5,
  downloads_used INTEGER DEFAULT 0,
  ip_bound TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);

-- ============================================================
-- LICENSE KEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS license_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','reserved','used','refunded','expired')),
  hwid_bound TEXT,
  ip_bound TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT KEYS (for multi-key products)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','reserved','used','refunded','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  buyer_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  has_photos BOOLEAN DEFAULT false,
  photos TEXT[],
  kd_points_awarded INTEGER DEFAULT 10,
  is_approved BOOLEAN DEFAULT true,
  nsfw_flagged BOOLEAN DEFAULT false,
  fraud_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_id);

-- ============================================================
-- WALLET TRANSACTIONS (Ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('sale','refund','payout','adjustment','fee','affiliate','escrow_release','escrow_refund','withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2),
  balance_after DECIMAL(10,2),
  description TEXT,
  reference_type TEXT CHECK (reference_type IN ('order','withdrawal','dispute','adjustment')),
  reference_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id);

-- ============================================================
-- PAYOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0.99),
  fee DECIMAL(10,2) DEFAULT 0,
  method TEXT CHECK (method IN ('pix','ted','boleto')),
  pix_key TEXT,
  pix_type TEXT,
  bank_code TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AFFILIATES
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(4,2) DEFAULT 5.00 CHECK (commission_rate >= 1 AND commission_rate <= 50),
  total_clicks INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  cookie_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AFFILIATE CLICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  product_id UUID REFERENCES products(id),
  ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage','fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  seller_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error','order','chat','promotion','system')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- ============================================================
-- CHAT CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_sender_id UUID,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text','image','file','system')),
  file_url TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);

-- ============================================================
-- RATE LIMITS (persistent)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  ip TEXT NOT NULL,
  route TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start BIGINT NOT NULL,
  window_end BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_id ON rate_limits(identifier, window_start);

-- ============================================================
-- AUDIT LOGS (immutable chain)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_role TEXT CHECK (actor_role IN ('user','seller','admin','system')),
  target TEXT,
  target_type TEXT,
  description TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  ip TEXT,
  user_agent TEXT,
  metadata JSONB,
  previous_hash TEXT,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- PIX PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS pix_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  qr_code TEXT,
  qr_code_base64 TEXT,
  txid TEXT UNIQUE,
  amount DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','expired','failed')),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PIX SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS pix_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pix_key TEXT NOT NULL,
  pix_type TEXT CHECK (pix_type IN ('cpf','cnpj','email','phone','random')),
  fee_percent DECIMAL(4,2) DEFAULT 0.99,
  min_amount DECIMAL(10,2) DEFAULT 0.99,
  max_amount DECIMAL(10,2) DEFAULT 50000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- RECENTLY VIEWED
-- ============================================================
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FLASH DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS flash_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  deal_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_quantity INTEGER DEFAULT 100,
  sold_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  deal_price DECIMAL(10,2) NOT NULL,
  deal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOST PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS boost_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEATURED PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) UNIQUE,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GIFT CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  recipient_email TEXT,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('basic','pro','plus','enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES profiles(id),
  cover_image TEXT,
  tags TEXT[],
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEVICE PROFILES (fingerprint)
-- ============================================================
CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  fingerprint_hash TEXT NOT NULL,
  canvas_data TEXT,
  webgl_data TEXT,
  fonts TEXT[],
  timezone TEXT,
  platform TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  confidence DECIMAL(4,3),
  last_ip TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_fingerprint ON device_profiles(fingerprint_hash);

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  permissions TEXT[],
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WEBHOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  url TEXT NOT NULL,
  events TEXT[],
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own profile, admins can read all
CREATE POLICY IF NOT EXISTS profiles_read ON profiles
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY IF NOT EXISTS profiles_update ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Products: active products visible to all, sellers manage own
CREATE POLICY IF NOT EXISTS products_read ON products
  FOR SELECT USING (is_active = true OR seller_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY IF NOT EXISTS products_insert ON products
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY IF NOT EXISTS products_update ON products
  FOR UPDATE USING (seller_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));

-- Orders: buyer and seller can view
CREATE POLICY IF NOT EXISTS orders_read ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = id AND p.seller_id = auth.uid()));

-- Reviews: anyone can read
CREATE POLICY IF NOT EXISTS reviews_read ON reviews
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS reviews_insert ON reviews
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Notifications: user can read own
CREATE POLICY IF NOT EXISTS notifications_read ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Chat: participants can read
CREATE POLICY IF NOT EXISTS chat_conversations_read ON chat_conversations
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY IF NOT EXISTS chat_messages_read ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_conversations WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at') THEN
    CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated_at') THEN
    CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at') THEN
    CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
