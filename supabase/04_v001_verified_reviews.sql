-- KIYVO v0.0.1 — Avaliações somente após compra ativa e token consumido.
create table if not exists public.verified_reviews_v001 (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  rating integer not null check(rating between 1 and 5),
  comment text not null check(char_length(comment) between 3 and 1500),
  photo_paths text[] not null default '{}',
  seller_reply text,
  seller_replied_at timestamptz,
  status text not null default 'published' check(status in ('published','hidden','reported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id,buyer_id)
);
create index if not exists verified_reviews_product_created_idx on public.verified_reviews_v001(product_id,created_at desc);
alter table public.verified_reviews_v001 enable row level security;
drop policy if exists "public reads published verified reviews" on public.verified_reviews_v001;
create policy "public reads published verified reviews" on public.verified_reviews_v001 for select using(status='published');
drop policy if exists "buyer reads own verified reviews" on public.verified_reviews_v001;
create policy "buyer reads own verified reviews" on public.verified_reviews_v001 for select using(auth.uid()=buyer_id);
