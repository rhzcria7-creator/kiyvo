// v0.0.1 — Feature flags determinísticas por usuário, com rollout gradual.
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> { const admin = createAdminClient(); if (!admin) return false; const { data } = await admin.from('feature_flags').select('enabled,rollout_percent').eq('key', key).maybeSingle(); if (!data?.enabled) return false; if (Number(data.rollout_percent) >= 100) return true; if (!userId) return false; const bucket = createHash('sha256').update(`${key}:${userId}`).digest()[0] % 100; return bucket < Number(data.rollout_percent) }
