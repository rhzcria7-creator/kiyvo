// v0.0.1 — Inteligência de IP com cache e timeout; falha nunca concede confiança adicional.
import { createAdminClient } from '@/lib/supabase/server'

export interface IpRiskResult { riskScore: number; isTor: boolean; isVpn: boolean; isProxy: boolean; source: 'cache' | 'provider' | 'unavailable' }
const unknownRisk: IpRiskResult = { riskScore: 35, isTor: false, isVpn: false, isProxy: false, source: 'unavailable' }

export async function getIpRisk(ip: string): Promise<IpRiskResult> {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return unknownRisk
  const admin = createAdminClient()
  if (admin) {
    const { data } = await admin.from('ip_intelligence_cache').select('risk_score,is_tor,is_vpn,is_proxy,checked_at').eq('ip', ip).maybeSingle()
    if (data && Date.now() - new Date(String(data.checked_at)).getTime() < 86_400_000) return { riskScore: Number(data.risk_score), isTor: Boolean(data.is_tor), isVpn: Boolean(data.is_vpn), isProxy: Boolean(data.is_proxy), source: 'cache' }
  }
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 1800)
  try {
    const response = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,proxy,hosting`, { signal: controller.signal, cache: 'no-store' })
    const payload = await response.json() as { status?: string; proxy?: boolean; hosting?: boolean }
    if (!response.ok || payload.status !== 'success') return unknownRisk
    const isProxy = Boolean(payload.proxy); const isVpn = Boolean(payload.hosting); const riskScore = isProxy || isVpn ? 75 : 5
    if (admin) await admin.from('ip_intelligence_cache').upsert({ ip, is_tor: false, is_vpn: isVpn, is_proxy: isProxy, risk_score: riskScore, provider: 'ip-api', checked_at: new Date().toISOString() })
    return { riskScore, isTor: false, isVpn, isProxy, source: 'provider' }
  } catch { return unknownRisk } finally { clearTimeout(timeout) }
}
