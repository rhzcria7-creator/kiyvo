-- KIYVO v0.0.1 — núcleo transacional, confiança e growth (idempotente).
-- Execute após KIYVO_V10_COMPLETE.sql. Este arquivo não remove dados existentes.
-- Todos os IDs são UUIDs desacoplados para permitir migração gradual do legado.

create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table if not exists public.device_fingerprints (id uuid primary key default gen_random_uuid(), user_id uuid, fingerprint_hash text not null, user_agent text, ip inet, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), is_trusted boolean not null default false, unique(user_id, fingerprint_hash));
create table if not exists public.ip_intelligence_cache (ip inet primary key, is_tor boolean not null default false, is_vpn boolean not null default false, is_proxy boolean not null default false, risk_score integer not null default 0 check(risk_score between 0 and 100), provider text, checked_at timestamptz not null default now());
create table if not exists public.risk_events (id uuid primary key default gen_random_uuid(), user_id uuid, event_type text not null, score integer not null check(score between 0 and 100), ip inet, fingerprint_hash text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.risk_profiles (user_id uuid primary key, score integer not null default 0 check(score between 0 and 100), level text not null default 'low' check(level in ('low','medium','high','blocked')), reviewed_at timestamptz, updated_at timestamptz not null default now());
create table if not exists public.rate_limits (id uuid primary key default gen_random_uuid(), identifier_hash text not null, endpoint text not null, window_start timestamptz not null, request_count integer not null default 1, blocked_until timestamptz, unique(identifier_hash, endpoint, window_start));
create table if not exists public.audit_logs_v001 (id uuid primary key default gen_random_uuid(), actor_id uuid, action text not null, target_type text not null, target_id uuid, ip inet, user_agent text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.user_totp_secrets (user_id uuid primary key, encrypted_secret text not null, iv text not null, tag text not null, enabled_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.user_backup_codes (id uuid primary key default gen_random_uuid(), user_id uuid not null, code_hash text not null, used_at timestamptz, created_at timestamptz not null default now(), unique(user_id, code_hash));
create table if not exists public.product_keys (id uuid primary key default gen_random_uuid(), product_id uuid not null, encrypted_value text not null, value_hint text, status text not null default 'available' check(status in ('available','reserved','delivered','revoked')), reserved_order_id uuid, used_by uuid, used_at timestamptz, created_at timestamptz not null default now());
create unique index if not exists product_keys_available_reservation_idx on public.product_keys(product_id) where status = 'available';
create table if not exists public.file_scans (id uuid primary key default gen_random_uuid(), storage_path text not null unique, uploaded_by uuid, declared_mime text, detected_mime text, size_bytes bigint not null check(size_bytes >= 0), scan_status text not null check(scan_status in ('pending','clean','blocked','failed')), reason text, scanned_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.escrow_holds (id uuid primary key default gen_random_uuid(), order_id uuid not null unique, seller_id uuid, amount numeric(12,2) not null check(amount >= 0), currency text not null default 'BRL', status text not null default 'pending' check(status in ('pending','available','frozen','refunded')), available_at timestamptz not null, released_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.ledger_accounts (id uuid primary key default gen_random_uuid(), owner_id uuid, account_type text not null check(account_type in ('buyer','seller_pending','seller_available','platform','escrow')), currency text not null default 'BRL', created_at timestamptz not null default now(), unique(owner_id, account_type, currency));
create table if not exists public.ledger_postings (id uuid primary key default gen_random_uuid(), journal_id uuid not null, account_id uuid not null references public.ledger_accounts(id), direction text not null check(direction in ('debit','credit')), amount numeric(12,2) not null check(amount > 0), balance_after numeric(12,2), reference_type text not null, reference_id uuid, created_at timestamptz not null default now());
create table if not exists public.disputes_v001 (id uuid primary key default gen_random_uuid(), order_id uuid not null, buyer_id uuid not null, seller_id uuid, reason text not null, status text not null default 'open' check(status in ('open','seller_response','admin_review','resolved','refunded','rejected')), resolution text, opened_at timestamptz not null default now(), seller_due_at timestamptz not null default now() + interval '48 hours', resolved_at timestamptz);
create table if not exists public.dispute_messages (id uuid primary key default gen_random_uuid(), dispute_id uuid not null references public.disputes_v001(id) on delete cascade, author_id uuid, body text not null check(char_length(body) <= 5000), created_at timestamptz not null default now());
create table if not exists public.dispute_evidences (id uuid primary key default gen_random_uuid(), dispute_id uuid not null references public.disputes_v001(id) on delete cascade, uploader_id uuid, storage_path text not null, mime_type text not null, created_at timestamptz not null default now());
create table if not exists public.seller_reputation (seller_id uuid primary key, level text not null default 'bronze' check(level in ('bronze','silver','gold','platinum','diamond','top_rated')), fulfillment_rate numeric(5,2) not null default 0, response_minutes integer, dispute_rate numeric(5,2) not null default 0, score integer not null default 0, updated_at timestamptz not null default now());
create table if not exists public.buyer_reputation (buyer_id uuid primary key, level text not null default 'bronze', completed_orders integer not null default 0, dispute_rate numeric(5,2) not null default 0, score integer not null default 0, updated_at timestamptz not null default now());
create table if not exists public.product_questions (id uuid primary key default gen_random_uuid(), product_id uuid not null, buyer_id uuid, question text not null check(char_length(question) <= 1500), answer text, answered_by uuid, created_at timestamptz not null default now(), answered_at timestamptz);
create table if not exists public.store_follows (store_id uuid not null, user_id uuid not null, created_at timestamptz not null default now(), primary key(store_id,user_id));
create table if not exists public.wishlists_v001 (user_id uuid not null, product_id uuid not null, created_at timestamptz not null default now(), primary key(user_id,product_id));
create table if not exists public.referral_codes (id uuid primary key default gen_random_uuid(), user_id uuid not null unique, code text not null unique, created_at timestamptz not null default now());
create table if not exists public.referral_attributions (id uuid primary key default gen_random_uuid(), code_id uuid not null references public.referral_codes(id), referred_user_id uuid not null unique, expires_at timestamptz not null, converted_order_id uuid, created_at timestamptz not null default now());
create table if not exists public.daily_checkins (user_id uuid not null, checkin_date date not null, streak integer not null default 1, kd_awarded integer not null default 0, primary key(user_id,checkin_date));
create table if not exists public.feature_flags (key text primary key, enabled boolean not null default false, rollout_percent integer not null default 0 check(rollout_percent between 0 and 100), metadata jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.experiments (id uuid primary key default gen_random_uuid(), key text not null unique, status text not null default 'draft', variants jsonb not null default '[]'::jsonb, created_at timestamptz not null default now());
create table if not exists public.analytics_events (id uuid primary key default gen_random_uuid(), user_id uuid, event_name text not null, properties jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now());
create table if not exists public.agent_conversations (id uuid primary key default gen_random_uuid(), user_id uuid, agent_slug text not null, summary text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agent_messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.agent_conversations(id) on delete cascade, role text not null check(role in ('user','assistant','tool')), content text not null, created_at timestamptz not null default now());
create table if not exists public.partner_catalog_imports (id uuid primary key default gen_random_uuid(), partner_name text not null, authorization_reference text not null, imported_by uuid, source_file_path text, status text not null default 'draft' check(status in ('draft','review','approved','rejected')), created_at timestamptz not null default now());
create table if not exists public.partner_catalog_items (id uuid primary key default gen_random_uuid(), import_id uuid not null references public.partner_catalog_imports(id) on delete cascade, external_id text, original_title text not null, display_title text, external_url text not null, price numeric(12,2), currency text default 'BRL', availability text default 'unknown', status text not null default 'draft', last_synced_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.vendor_api_keys (id uuid primary key default gen_random_uuid(), vendor_id uuid not null, label text not null, key_prefix text not null, secret_hash text not null, last_used_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.vendor_webhooks (id uuid primary key default gen_random_uuid(), vendor_id uuid not null, url text not null, secret_hash text not null, events text[] not null default '{}', is_active boolean not null default true, created_at timestamptz not null default now());

-- Reserva uma key de forma concorrente segura. O valor nunca é retornado pelo SQL.
create or replace function public.reserve_product_key(p_product_id uuid, p_order_id uuid, p_buyer_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare key_id uuid;
begin
  select id into key_id from product_keys where product_id=p_product_id and status='available' order by created_at for update skip locked limit 1;
  if key_id is null then raise exception 'OUT_OF_STOCK'; end if;
  update product_keys set status='delivered', reserved_order_id=p_order_id, used_by=p_buyer_id, used_at=now() where id=key_id;
  return key_id;
end; $$;

-- RLS: nenhuma tabela nova fica aberta por acidente.
alter table public.device_fingerprints enable row level security;
alter table public.risk_events enable row level security;
alter table public.risk_profiles enable row level security;
alter table public.audit_logs_v001 enable row level security;
alter table public.disputes_v001 enable row level security;
alter table public.dispute_messages enable row level security;
alter table public.dispute_evidences enable row level security;
alter table public.wishlists_v001 enable row level security;
alter table public.store_follows enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;
alter table public.daily_checkins enable row level security;

drop policy if exists "users manage own wishlist v001" on public.wishlists_v001;
create policy "users manage own wishlist v001" on public.wishlists_v001 for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "users manage own follows v001" on public.store_follows;
create policy "users manage own follows v001" on public.store_follows for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "users read own agent conversations" on public.agent_conversations;
create policy "users read own agent conversations" on public.agent_conversations for select using(auth.uid()=user_id);
