-- KIYVO v13.0 — complemento idempotente para backend, entrega e ledger.
-- Execute primeiro KIYVO_V10_COMPLETE.sql e depois este arquivo no SQL Editor do Supabase.
-- Não remove dados nem altera produtos existentes.

create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid,
  status text not null default 'active' check (status in ('active','refunded','revoked')),
  purchased_at timestamptz not null default now(),
  refunded_at timestamptz
);

create table if not exists public.delivery_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  asset_type text not null check (asset_type in ('file','license_key','external_link','instructions','service')),
  storage_path text,
  file_name text,
  content_type text,
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.download_tokens (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  delivery_asset_id uuid references public.delivery_assets(id) on delete set null,
  token text not null unique,
  expires_at timestamptz not null,
  max_downloads integer not null default 5 check (max_downloads between 1 and 50),
  download_count integer not null default 0 check (download_count >= 0),
  ip_address text,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists download_tokens_token_idx on public.download_tokens(token);
create index if not exists purchases_buyer_idx on public.purchases(buyer_id, purchased_at desc);
create index if not exists delivery_assets_product_idx on public.delivery_assets(product_id);

-- Operação atômica: só incrementa enquanto token ainda está válido e com saldo.
create or replace function public.consume_download_token(p_token_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update download_tokens
     set download_count = download_count + 1
   where id = p_token_id
     and revoked_at is null
     and expires_at > now()
     and download_count < max_downloads;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  account_id uuid,
  entry_type text not null check (entry_type in ('debit','credit')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  available_at timestamptz,
  description text not null,
  created_at timestamptz not null default now()
);
create index if not exists ledger_entries_account_idx on public.ledger_entries(account_id, created_at desc);

alter table public.purchases enable row level security;
alter table public.delivery_assets enable row level security;
alter table public.download_tokens enable row level security;
alter table public.ledger_entries enable row level security;

-- Comprador vê somente sua própria biblioteca. Arquivos e tokens são acessados pela rota server-side.
drop policy if exists "buyers read own purchases" on public.purchases;
create policy "buyers read own purchases" on public.purchases for select using (auth.uid() = buyer_id);
drop policy if exists "buyers read own tokens" on public.download_tokens;
create policy "buyers read own tokens" on public.download_tokens for select using (
  exists (select 1 from public.purchases p where p.id = purchase_id and p.buyer_id = auth.uid())
);
drop policy if exists "account owner reads ledger" on public.ledger_entries;
create policy "account owner reads ledger" on public.ledger_entries for select using (auth.uid() = account_id);

-- Storage buckets criados de forma idempotente. Configure policies no README antes de produção.
insert into storage.buckets (id, name, public) values
  ('documents', 'documents', false),
  ('delivery', 'delivery', false),
  ('avatars', 'avatars', true),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;
