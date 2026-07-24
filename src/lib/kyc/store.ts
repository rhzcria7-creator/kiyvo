'use client'
// Store KYC (verificação de identidade) — localStorage
// Armazena dados de verificação do vendedor com validação completa.
// Inclui: nome completo, CPF/CNPJ, data nascimento, nome do PAI E MÃE,
// upload de documentos (selfie, CPF, comprovante), contato, endereço.
// Aprovação em 2 níveis: 'pending' (submetido) → 'verified' (aprovado).
import { create } from 'zustand'

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface KYCDocuments {
  selfieDataUrl?: string      // selfie com documento (base64)
  documentFrontDataUrl?: string  // frente do RG/CPF/CNH
  documentBackDataUrl?: string   // verso do documento
  proofAddressDataUrl?: string   // comprovante de residência
}

export interface KYCData {
  full_name: string
  cpf_cnpj: string
  birth_date: string
  mother_name: string
  father_name: string         // NOVO: nome do pai (opcional, mas recomendado)
  phone: string
  email: string
  address: string
  address_number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  cep: string
  documents: KYCDocuments
  accepted_terms: boolean
  accepted_risks: boolean
  accepted_privacy: boolean
  verified: boolean
  verification_status: KYCStatus
  verified_at: string | null
  submitted_at: string | null
  rejected_reason?: string
  human_review_required: boolean
}

interface KYCStore {
  data: KYCData | null
  loaded: boolean
  init: () => void
  submit: (d: Omit<KYCData, 'verified' | 'verification_status' | 'verified_at' | 'submitted_at'>) => { ok: boolean; errors: Record<string, string> }
  approve: () => void  // aprovação manual (demo: instantânea)
  reject: (reason: string) => void
  reset: () => void
  isVerified: () => boolean
  isPending: () => boolean
  hasDocuments: () => boolean
}

const STORAGE_KEY = 'kiyvo_kyc'

const empty: KYCData = {
  full_name: '',
  cpf_cnpj: '',
  birth_date: '',
  mother_name: '',
  father_name: '',
  phone: '',
  email: '',
  address: '',
  address_number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  cep: '',
  documents: {},
  accepted_terms: false,
  accepted_risks: false,
  accepted_privacy: false,
  verified: false,
  verification_status: 'unverified',
  verified_at: null,
  submitted_at: null,
  human_review_required: true,
}

// ─────────────────────────────────────────────────────────────
// Validações BR reais (dígitos verificadores)
// ─────────────────────────────────────────────────────────────
function validarCPF(cpf: string): boolean {
  const s = cpf.replace(/\D/g, '')
  if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false
  let soma = 0, resto
  for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i)
  resto = 11 - (soma % 11)
  if (resto >= 10) resto = 0
  if (resto !== parseInt(s[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i)
  resto = 11 - (soma % 11)
  if (resto >= 10) resto = 0
  return resto === parseInt(s[10])
}

function validarCNPJ(cnpj: string): boolean {
  const s = cnpj.replace(/\D/g, '')
  if (s.length !== 14) return false
  if (/^(\d)\1{13}$/.test(s)) return false
  let tamanho = 12, numeros = s.slice(0, tamanho), digitos = s.slice(tamanho), soma = 0, pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) { soma += Number(numeros.charAt(tamanho - i)) * pos--; if (pos < 2) pos = 9 }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
  if (resultado !== Number(digitos.charAt(0))) return false
  tamanho = 13; numeros = s.slice(0, tamanho); soma = 0; pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) { soma += Number(numeros.charAt(tamanho - i)) * pos--; if (pos < 2) pos = 9 }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
  return resultado === Number(digitos.charAt(1))
}

function calcularIdade(birthDate: string): number {
  const hoje = new Date()
  const nasc = new Date(birthDate)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

const UFS_VALIDAS = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
])

export const useKYC = create<KYCStore>((set, get) => ({
  data: null,
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as KYCData
        // Garante campos novos (backward compat)
        const merged: KYCData = { ...empty, ...data, documents: { ...(data.documents || {}) } }
        set({ data: merged, loaded: true })
      } else {
        set({ data: null, loaded: true })
      }
    } catch {
      set({ data: null, loaded: true })
    }
  },

  submit: (d) => {
    const errors: Record<string, string> = {}
    const nome = d.full_name.trim().toUpperCase()
    if (nome.length < 8) errors.full_name = 'Informe seu nome completo (mínimo 8 caracteres)'
    if (!nome.includes(' ')) errors.full_name = 'Informe nome E sobrenome'

    const doc = d.cpf_cnpj.replace(/\D/g, '')
    if (doc.length === 11) {
      if (!validarCPF(doc)) errors.cpf_cnpj = 'CPF inválido (dígitos verificadores)'
    } else if (doc.length === 14) {
      if (!validarCNPJ(doc)) errors.cpf_cnpj = 'CNPJ inválido (dígitos verificadores)'
    } else {
      errors.cpf_cnpj = 'CPF (11 dígitos) ou CNPJ (14 dígitos)'
    }

    if (!d.birth_date) errors.birth_date = 'Data de nascimento obrigatória'
    else if (calcularIdade(d.birth_date) < 18) errors.birth_date = 'Você precisa ter 18 anos ou mais'
    else if (calcularIdade(d.birth_date) > 120) errors.birth_date = 'Data de nascimento inválida'

    if (d.mother_name.trim().length < 6) errors.mother_name = 'Nome completo da mãe obrigatório (anti-fraude)'
    // Pai é opcional, mas se informado validar
    if (d.father_name && d.father_name.trim().length > 0 && d.father_name.trim().length < 6) {
      errors.father_name = 'Nome do pai muito curto (mínimo 6 caracteres), ou deixe em branco'
    }

    const phone = d.phone.replace(/\D/g, '')
    if (phone.length < 10) errors.phone = 'Telefone inválido (DDD + número)'
    if (phone.length > 11) errors.phone = 'Telefone inválido'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.email = 'E-mail inválido'

    if (d.address.trim().length < 4) errors.address = 'Logradouro obrigatório'
    if (!d.address_number.trim()) errors.address_number = 'Número obrigatório'
    if (d.neighborhood.trim().length < 2) errors.neighborhood = 'Bairro obrigatório'
    if (d.city.trim().length < 2) errors.city = 'Cidade obrigatória'
    if (!UFS_VALIDAS.has(d.state.toUpperCase())) errors.state = 'UF inválida (ex: SP, MG, RJ)'
    const cep = d.cep.replace(/\D/g, '')
    if (cep.length !== 8) errors.cep = 'CEP inválido (8 dígitos)'

    // Documentos: selfie e documento obrigatórios
    if (!d.documents.selfieDataUrl) errors.doc_selfie = 'Envie uma selfie segurando seu documento'
    if (!d.documents.documentFrontDataUrl) errors.doc_front = 'Envie foto da FRENTE do documento'

    if (!d.accepted_terms) errors.accepted_terms = 'Aceite os Termos de Uso'
    if (!d.accepted_privacy) errors.accepted_privacy = 'Aceite a Política de Privacidade'
    if (!d.accepted_risks) errors.accepted_risks = 'Confirme ciência dos riscos do modo demonstração'

    if (Object.keys(errors).length > 0) return { ok: false, errors }

    // Salva como PENDING (em produção vai para revisão humana)
    const data: KYCData = {
      ...d,
      full_name: nome,
      mother_name: d.mother_name.trim().toUpperCase(),
      father_name: d.father_name.trim().toUpperCase(),
      state: d.state.toUpperCase(),
      cpf_cnpj: doc,
      cep,
      phone,
      verification_status: 'verified', // demo: auto-aprova após validação completa
      verified: true,
      verified_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      human_review_required: true,
    }
    set({ data })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* noop */ }
    return { ok: true, errors: {} }
  },

  approve: () => {
    const { data } = get()
    if (!data) return
    const next = { ...data, verified: true, verification_status: 'verified' as KYCStatus, verified_at: new Date().toISOString(), rejected_reason: undefined }
    set({ data: next })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
  },

  reject: (reason: string) => {
    const { data } = get()
    if (!data) return
    const next = { ...data, verified: false, verification_status: 'rejected' as KYCStatus, rejected_reason: reason }
    set({ data: next })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
  },

  reset: () => {
    set({ data: null })
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
  },

  isVerified: () => {
    const d = get().data
    return !!d?.verified && d.verification_status === 'verified'
  },

  isPending: () => {
    const d = get().data
    return !!d && d.verification_status === 'pending' && !d.verified
  },

  hasDocuments: () => {
    const d = get().data
    return !!d?.documents?.selfieDataUrl && !!d?.documents?.documentFrontDataUrl
  },
}))

export { empty as emptyKYC }
