// ─────────────────────────────────────────────────────────────
// IP Intelligence v0.0.1 — Bloqueio de Tor/VPN/Proxy + Geolocalização
// Tudo server-side, consulta Supabase profiles.ip_reputation
// ─────────────────────────────────────────────────────────────

export interface IPInfo {
  ip: string
  isTor: boolean
  isVPN: boolean
  isProxy: boolean
  isDatacenter: boolean
  isResidential: boolean
  country: string | null
  region: string | null
  city: string | null
  isp: string | null
  risk: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number // 0-100
}

// Listas de IPs conhecidos de serviços nocivos
const KNOWN_TOR_EXIT_NODES: Set<string> = new Set([
  // Parcial — em produção usar Tor exit node list oficial
  // Atualizado via cron job semanal
])

const KNOWN_VPN_RANGES: Array<{ start: string; end: string; name: string }> = [
  // Ranges de datacenters/VPNs conhecidos
  // Em produção: consultar API ipqualityscore.com ou similar
  { start: '5.0.0.0', end: '5.255.255.255', name: 'EU Datacenter' },
  { start: '34.0.0.0', end: '34.255.255.255', name: 'Google Cloud' },
  { start: '35.0.0.0', end: '35.255.255.255', name: 'Google Cloud' },
  { start: '44.0.0.0', end: '44.255.255.255', name: 'AWS' },
  { start: '52.0.0.0', end: '52.255.255.255', name: 'AWS' },
  { start: '54.0.0.0', end: '54.255.255.255', name: 'AWS' },
  { start: '104.16.0.0', end: '104.31.255.255', name: 'Cloudflare' },
  { start: '172.64.0.0', end: '172.71.255.255', name: 'Cloudflare' },
]

// ISPs residenciais brasileiros (whitelist parcial)
const BRAZILIAN_RESIDENTIAL_ASNS = [
  7738, 8167, 18881, 26599, 26615, 271613, 27699, 28126,
  28343, 28573, 3549, 4230, 53070, 53158, 53265, 53291,
  53326, 53428, 53463, 53588, 53658, 53767, 53824, 53930,
  53937, 53946, 53947, 53958, 53961, 53968, 53969, 61450,
  61578, 61581, 61652, 61657, 61658, 61659, 61660, 61661,
]

/**
 * Analisa um endereço IP para determinar risco
 * Em produção: integrar com ipqualityscore.com, abuseipdb.com, etc
 */
export async function analyzeIP(ip: string): Promise<IPInfo> {
  // Remover IPv6 mapping
  const cleanIP = ip.replace(/^::ffff:/, '')

  const result: IPInfo = {
    ip: cleanIP,
    isTor: false,
    isVPN: false,
    isProxy: false,
    isDatacenter: false,
    isResidential: true,
    country: null,
    region: null,
    city: null,
    isp: null,
    risk: 'low',
    riskScore: 0,
  }

  // 1. Verificar Tor
  if (KNOWN_TOR_EXIT_NODES.has(cleanIP)) {
    result.isTor = true
    result.riskScore += 70
  }

  // 2. Verificar ranges de VPN/Datacenter
  const ipNum = ipToNumber(cleanIP)
  for (const range of KNOWN_VPN_RANGES) {
    const start = ipToNumber(range.start)
    const end = ipToNumber(range.end)
    if (ipNum >= start && ipNum <= end) {
      result.isVPN = true
      result.isDatacenter = true
      result.riskScore += 40
      result.isp = range.name
      break
    }
  }

  // 3. Verificar IPs privados/localhost
  if (isPrivateIP(cleanIP)) {
    result.isResidential = false
    result.risk = 'low'
    result.riskScore = 0
    return result
  }

  // 4. Tentar geolocalização via headers/supabase (placeholder)
  // Em produção: usar API de geolocalização

  // 5. Calcular nível de risco final
  if (result.isTor) {
    result.risk = 'critical'
    result.riskScore = Math.max(result.riskScore, 80)
  } else if (result.isVPN && result.isDatacenter) {
    result.risk = 'high'
    result.riskScore = Math.max(result.riskScore, 60)
  } else if (result.isProxy) {
    result.risk = 'medium'
    result.riskScore = Math.max(result.riskScore, 40)
  }

  return result
}

/**
 * Verifica se um IP deve ser bloqueado
 */
export function shouldBlockIP(ipInfo: IPInfo): { block: boolean; reason: string } {
  if (ipInfo.isTor && !isWhitelistedTorFlow()) {
    return { block: true, reason: 'Tor exit nodes não são permitidos por segurança' }
  }
  if (ipInfo.riskScore >= 80) {
    return { block: true, reason: 'Atividade suspeita detectada deste IP' }
  }
  return { block: false, reason: '' }
}

/**
 * Verifica se o IP é privado (RFC 1918)
 */
function isPrivateIP(ip: string): boolean {
  const num = ipToNumber(ip)
  // 10.0.0.0/8
  if (num >= 167772160 && num <= 184549375) return true
  // 172.16.0.0/12
  if (num >= 2886729728 && num <= 2887778303) return true
  // 192.168.0.0/16
  if (num >= 3232235520 && num <= 3232301055) return true
  // 127.0.0.0/8
  if (num >= 2130706432 && num <= 2147483647) return true
  return false
}

/**
 * Converte IP string para número
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
}

/**
 * Whitelist para Tor em casos específicos (ex: admin interno)
 */
let _torWhitelistActive = false
export function setTorWhitelist(active: boolean): void {
  _torWhitelistActive = active
}
function isWhitelistedTorFlow(): boolean {
  return _torWhitelistActive
}

/**
 * Cache de reputação de IP em memória (TTL 5 min)
 */
const ipReputationCache = new Map<string, { data: IPInfo; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function getCachedIPInfo(ip: string): IPInfo | null {
  const cached = ipReputationCache.get(ip)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }
  ipReputationCache.delete(ip)
  return null
}

export function setCachedIPInfo(ip: string, info: IPInfo): void {
  ipReputationCache.set(ip, { data: info, expiresAt: Date.now() + CACHE_TTL })

  // Limpar cache se crescer demais
  if (ipReputationCache.size > 10000) {
    const now = Date.now()
      Array.from(ipReputationCache.entries()).forEach(([key, val]) => {
        if (val.expiresAt < now) ipReputationCache.delete(key)
      })
  }
}

/**
 * Extrai IP real do request considerando proxies reversos
 */
export function extractIP(headers: Record<string, string | string[] | undefined>): string {
  const xff = headers['x-forwarded-for']
  if (xff) {
    const ips = (Array.isArray(xff) ? xff[0] : xff).split(',')
    return ips[0].trim()
  }
  const xri = headers['x-real-ip']
  if (xri) return Array.isArray(xri) ? xri[0] : xri
  const cf = headers['cf-connecting-ip']
  if (cf) return Array.isArray(cf) ? cf[0] : cf
  return '127.0.0.1'
}
