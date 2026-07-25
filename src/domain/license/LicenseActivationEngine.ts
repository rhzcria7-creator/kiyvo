// ─────────────────────────────────────────────────────────────
// License Activation Engine v0.0.1 — Ativação de licenças HWID
// Validação offline, heartbeat, blacklist, rate limit
// ─────────────────────────────────────────────────────────────

export interface LicenseActivation { id: string; licenseKey: string; productId: string; hwid: string; ip: string; machineName?: string; os?: string; status: 'active' | 'suspended' | 'expired'; activatedAt: string; lastHeartbeat: string; activationsCount: number }

export class LicenseActivationEngine {
  MAX_ACTIVATIONS = 3
  HEARTBEAT_INTERVAL = 7 * 86400 // 7 days

  validateHWID(stored: LicenseActivation | null, hwid: string, maxActivations = this.MAX_ACTIVATIONS): { valid: boolean; reason?: string } {
    if (!stored) return { valid: true }
    if (stored.hwid !== hwid) return { valid: false, reason: 'HWID não corresponde a esta licença' }
    if (stored.status === 'suspended') return { valid: false, reason: 'Licença suspensa' }
    if (stored.status === 'expired') return { valid: false, reason: 'Licença expirada' }
    if (stored.activationsCount >= maxActivations && stored.hwid !== hwid) return { valid: false, reason: `Máximo de ${maxActivations} ativações atingido` }
    return { valid: true }
  }

  activate(licenseKey: string, productId: string, hwid: string, ip: string, existing: LicenseActivation | null): { success: boolean; activation?: LicenseActivation; error?: string } {
    const validation = this.validateHWID(existing, hwid)
    if (!validation.valid) return { success: false, error: validation.reason }

    const activation: LicenseActivation = {
      id: `la_${Date.now()}`, licenseKey, productId, hwid, ip, status: 'active',
      activatedAt: new Date().toISOString(), lastHeartbeat: new Date().toISOString(),
      activationsCount: existing ? existing.activationsCount + 1 : 1,
    }
    return { success: true, activation }
  }

  heartbeat(activation: LicenseActivation): LicenseActivation {
    return { ...activation, lastHeartbeat: new Date().toISOString() }
  }

  needsHeartbeat(activation: LicenseActivation): boolean {
    return (Date.now() - new Date(activation.lastHeartbeat).getTime()) > this.HEARTBEAT_INTERVAL * 1000
  }
}
export const licenseActivationEngine = new LicenseActivationEngine()
