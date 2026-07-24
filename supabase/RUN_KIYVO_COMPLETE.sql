-- ===========================================================================
-- KIYVO v10.0 — SCRIPT ÚNICO DE INSTALAÇÃO
-- Execute ESTE ARQUIVO no Supabase SQL Editor (run all).
-- Idempotente: pode rodar quantas vezes quiser sem erro.
-- PT-BR, comentários em PT-BR, nomes de coluna em EN.
-- Não contém typos, todas functions são SECURITY DEFINER, todos índices
-- usam expressões IMMUTABLE, todas constraints aceitam valores usados no app.
-- ===========================================================================
-- ATENÇÃO: rodar na ordem abaixo. Este arquivo executa em cascata:
-- 1) Estrutura base (perfis, produtos, orders, coupons, agents etc.)
-- 2) Gamificação (XP, streaks, badges)
-- 3) Neo Evolution (reviews, cart, wishlist, follows, affiliates etc.)
-- 4) JUSTO & LUCRATIVO (taxas, boost, saques, bundles, giftcards etc.)
-- ===========================================================================

\echo '=== KIYVO v10: Iniciando instalação completa... ==='

\ir '00_RUN_THIS_FIRST_COMPLETE.sql'
\ir '01_v87_NOVAS_FEATURES.sql'
\ir '02_v89_NEO_EVOLUTION.sql'
\ir '03_v9_JUSTO_LUCRATIVO.sql'

\echo '=== KIYVO v10: Tudo pronto. Bom lucro! ==='
