// ─────────────────────────────────────────────────────────────
// KYC Engine v0.0.1 — Verificação de identidade (selfie + documento)
// Selfie com detecção facial, document upload, validação CPF
// ─────────────────────────────────────────────────────────────

export type KYCSelfieRequirement = 'selfie' | 'selfie_with_doc' | 'document_only'

export interface KYCSubmission {
  id: string
  userId: string
  selfieUrl: string
  documentUrl: string
  documentType: 'cnh' | 'rg' | 'passport' | 'cpf'
  cpf: string
  fullName: string
  birthDate: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface KYCSettings {
  requireSelfie: boolean
  requireDocumentPhoto: boolean
  minAgeYears: number
  allowedDocumentTypes: string[]
  maxFileSizeMB: number
  autoApproveForTrustedUsers: boolean
}

const DEFAULT_KYC_SETTINGS: KYCSettings = {
  requireSelfie: true,
  requireDocumentPhoto: true,
  minAgeYears: 18,
  allowedDocumentTypes: ['cnh', 'rg', 'passport'],
  maxFileSizeMB: 10,
  autoApproveForTrustedUsers: false,
}

export class KYCEngine {
  /**
   * Verifica idade mínima
   */
  checkMinAge(birthDate: string, minAgeYears: number = 18): { valid: boolean; age: number } {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return { valid: age >= minAgeYears, age }
  }

  /**
   * Valida documentos permitidos
   */
  validateDocumentType(docType: string, allowedTypes: string[] = DEFAULT_KYC_SETTINGS.allowedDocumentTypes): boolean {
    return allowedTypes.includes(docType)
  }

  /**
   * Verifica se auto-approve pode ser aplicado
   */
  checkAutoApprove(params: {
    trustScore: number
    hasPreviousKYC: boolean
    previousKYCStatus: string
    totalSales: number
    accountAgeHours: number
  }): { shouldAutoApprove: boolean; reason?: string } {
    if (params.hasPreviousKYC && params.previousKYCStatus === 'approved') {
      return { shouldAutoApprove: true, reason: 'KYC prévio aprovado' }
    }

    if (params.trustScore >= 80 && params.accountAgeHours >= 720) {
      return { shouldAutoApprove: true, reason: 'Alta confiança e conta madura' }
    }

    if (params.totalSales >= 100 && params.accountAgeHours >= 168) {
      return { shouldAutoApprove: true, reason: 'Vendedor experiente com bom histórico' }
    }

    return { shouldAutoApprove: false }
  }

  /**
   * Gera status de KYC baseado em regras
   */
  getKYCStatus(params: {
    submitted: boolean
    approved: boolean
    rejected: boolean
    pendingReview: boolean
  }): 'not_submitted' | 'pending' | 'approved' | 'rejected' {
    if (!params.submitted) return 'not_submitted'
    if (params.rejected) return 'rejected'
    if (params.approved) return 'approved'
    return 'pending'
  }

  /**
   * Valida requirementos de KYC
   */
  validateKYCRequirements(settings: KYCSettings = DEFAULT_KYC_SETTINGS): KYCSelfieRequirement {
    if (settings.requireSelfie && settings.requireDocumentPhoto) return 'selfie_with_doc'
    if (settings.requireSelfie) return 'selfie'
    return 'document_only'
  }

  getSettings(): KYCSettings {
    return { ...DEFAULT_KYC_SETTINGS }
  }
}

export const kycEngine = new KYCEngine()
