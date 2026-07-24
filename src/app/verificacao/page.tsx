'use client'
// Verificação de identidade KYC KIYVO — v2
// Campos: nome completo, CPF/CNPJ, data nasc., nome do PAI e MÃE,
// telefone, email, endereço completo, UPLOAD DE DOCUMENTOS (selfie + doc frente + comprovante),
// aceite triplo (termos, privacidade, riscos demo).
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, CreditCard, Calendar, Heart, Phone, Mail, MapPin,
  Building2, Hash, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Camera, UploadCloud, FileText, X, UserCircle, AlertCircle, UserCheck,
} from 'lucide-react'
import { useKYC } from '@/lib/kyc/store'
import { useAuth } from '@/lib/auth/context'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────
// Máscaras BR
// ─────────────────────────────────────────────────────────────
function maskCPF_CNPJ(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}
function maskCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.replace(/(\d{5})(\d{3})/, '$1-$2')
}

// Comprime imagem para base64 (limite 2MB)
function compressImage(file: File, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas error'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function VerificacaoPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('next') || '/vender'
  const { data, loaded, submit, isVerified } = useKYC()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [docs, setDocs] = useState({ selfie: '', front: '', back: '', address: '' })
  const [form, setForm] = useState({
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
    accepted_terms: false,
    accepted_risks: false,
    accepted_privacy: false,
  })

  useEffect(() => {
    if (data && loaded) {
      setForm({
        full_name: data.full_name || '',
        cpf_cnpj: data.cpf_cnpj || '',
        birth_date: data.birth_date || '',
        mother_name: data.mother_name || '',
        father_name: data.father_name || '',
        phone: data.phone || '',
        email: data.email || user?.email || '',
        address: data.address || '',
        address_number: data.address_number || '',
        complement: data.complement || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        cep: data.cep || '',
        accepted_terms: data.accepted_terms,
        accepted_risks: data.accepted_risks,
        accepted_privacy: data.accepted_privacy,
      })
      setDocs({
        selfie: data.documents?.selfieDataUrl || '',
        front: data.documents?.documentFrontDataUrl || '',
        back: data.documents?.documentBackDataUrl || '',
        address: data.documents?.proofAddressDataUrl || '',
      })
    } else if (user?.email) {
      setForm(f => ({ ...f, email: user.email }))
    }
  }, [data, loaded, user])

  useEffect(() => {
    if (loaded && isVerified()) {
      toast.success('✅ Identidade já verificada!')
      setTimeout(() => router.push(redirectTo), 1200)
    }
  }, [loaded, isVerified, redirectTo, router])

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k as string]; return n })
  }

  async function handleFile(key: 'selfie' | 'front' | 'back' | 'address', file?: File) {
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 8MB)')
      return
    }
    try {
      const compressed = await compressImage(file)
      setDocs(d => ({ ...d, [key]: compressed }))
      setErrors(e => { const n = { ...e }; delete n[`doc_${key}`]; return n })
      toast.success('📸 Documento enviado!')
    } catch {
      toast.error('Erro ao processar imagem. Tente outra.')
    }
  }

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (form.full_name.trim().length < 8 || !form.full_name.includes(' ')) e.full_name = 'Informe nome completo'
      const doc = form.cpf_cnpj.replace(/\D/g, '')
      if (doc.length !== 11 && doc.length !== 14) e.cpf_cnpj = 'CPF (11) ou CNPJ (14) dígitos'
      if (!form.birth_date) e.birth_date = 'Data obrigatória'
      if (form.mother_name.trim().length < 6) e.mother_name = 'Nome da mãe obrigatório (anti-fraude)'
      if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    }
    if (s === 2) {
      if (form.address.trim().length < 4) e.address = 'Logradouro obrigatório'
      if (!form.address_number.trim()) e.address_number = 'Número obrigatório'
      if (form.neighborhood.trim().length < 2) e.neighborhood = 'Bairro obrigatório'
      if (form.city.trim().length < 2) e.city = 'Cidade obrigatória'
      if (form.state.length !== 2) e.state = 'UF (2 letras)'
      if (form.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP 8 dígitos'
    }
    if (s === 3) {
      if (!docs.selfie) e.doc_selfie = 'Selfie obrigatória'
      if (!docs.front) e.doc_front = 'Foto da frente do documento obrigatória'
      if (!form.accepted_terms) e.accepted_terms = 'Aceite os Termos'
      if (!form.accepted_privacy) e.accepted_privacy = 'Aceite a Privacidade'
      if (!form.accepted_risks) e.accepted_risks = 'Confirme ciência dos riscos'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function finalSubmit() {
    setLoading(true)
    const result = submit({
      full_name: form.full_name,
      cpf_cnpj: form.cpf_cnpj,
      birth_date: form.birth_date,
      mother_name: form.mother_name,
      father_name: form.father_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      address_number: form.address_number,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      cep: form.cep,
      documents: {
        selfieDataUrl: docs.selfie || undefined,
        documentFrontDataUrl: docs.front || undefined,
        documentBackDataUrl: docs.back || undefined,
        proofAddressDataUrl: docs.address || undefined,
      },
      accepted_terms: form.accepted_terms,
      accepted_risks: form.accepted_risks,
      accepted_privacy: form.accepted_privacy,
      human_review_required: true,
    })
    setLoading(false)
    if (!result.ok) {
      setErrors(result.errors)
      toast.error('Verifique os campos em destaque')
      if (result.errors.cpf_cnpj || result.errors.birth_date || result.errors.full_name) setStep(1)
      else if (result.errors.address || result.errors.cep) setStep(2)
      else setStep(3)
      return
    }
    toast.success('🎉 Verificação concluída!')
    setTimeout(() => router.push(redirectTo), 1500)
  }

  const totalSteps = 3

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 lg:py-12 pb-24">
        {/* Título */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/vender" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-none">Verificação de Identidade</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">KYC anti-fraude • obrigatório para vender</p>
            </div>
          </div>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > n ? 'bg-green-500 text-white' : step === n ? 'bg-[#0F172A] text-white scale-110' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className={`flex-1 h-1 rounded-full ${step > n ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>
        <div className="flex text-[11px] font-black uppercase tracking-widest text-slate-500 mb-8">
          <div className="flex-1">Dados pessoais</div>
          <div className="flex-1 text-center">Endereço</div>
          <div className="flex-1 text-right">Documentos</div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Dados pessoais */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-[#0F172A] rounded-[1.75rem] p-6 lg:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
              <Field icon={User} label="Nome completo (sem abreviações)" error={errors.full_name}>
                <input value={form.full_name} onChange={e => update('full_name', e.target.value.toUpperCase())} placeholder="EX: JOÃO DA SILVA SANTOS" className={inputCls(!!errors.full_name)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={CreditCard} label="CPF ou CNPJ" error={errors.cpf_cnpj}>
                  <input value={form.cpf_cnpj} onChange={e => update('cpf_cnpj', maskCPF_CNPJ(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" className={inputCls(!!errors.cpf_cnpj)} />
                </Field>
                <Field icon={Calendar} label="Data de nascimento" error={errors.birth_date}>
                  <input type="date" value={form.birth_date} onChange={e => update('birth_date', e.target.value)} className={inputCls(!!errors.birth_date)} />
                </Field>
              </div>
              <Field icon={Heart} label="Nome completo da MÃE (obrigatório — anti-fraude)" error={errors.mother_name}>
                <input value={form.mother_name} onChange={e => update('mother_name', e.target.value.toUpperCase())} placeholder="MARIA APARECIDA DA SILVA" className={inputCls(!!errors.mother_name)} />
              </Field>
              <Field icon={UserCircle} label="Nome completo do PAI (opcional, mas recomendado)">
                <input value={form.father_name} onChange={e => update('father_name', e.target.value.toUpperCase())} placeholder="JOSÉ CARLOS SANTOS" className={inputCls(false)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={Phone} label="Celular (com DDD)" error={errors.phone}>
                  <input value={form.phone} onChange={e => update('phone', maskPhone(e.target.value))} placeholder="(11) 99999-9999" inputMode="tel" className={inputCls(!!errors.phone)} />
                </Field>
                <Field icon={Mail} label="E-mail" error={errors.email}>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value.toLowerCase())} placeholder="voce@email.com" className={inputCls(!!errors.email)} />
                </Field>
              </div>
              <NextButton onClick={() => { if (validateStep(1)) setStep(2) }} />
            </motion.div>
          )}

          {/* STEP 2: Endereço */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-[#0F172A] rounded-[1.75rem] p-6 lg:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field icon={MapPin} label="Logradouro (rua, avenida)" error={errors.address}>
                    <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="AV. BRASIL" className={inputCls(!!errors.address)} />
                  </Field>
                </div>
                <Field icon={Hash} label="Número" error={errors.address_number}>
                  <input value={form.address_number} onChange={e => update('address_number', e.target.value)} placeholder="123" className={inputCls(!!errors.address_number)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={Building2} label="Complemento (opcional)">
                  <input value={form.complement} onChange={e => update('complement', e.target.value)} placeholder="Apto 101, Casa 2..." className={inputCls(false)} />
                </Field>
                <Field icon={MapPin} label="Bairro" error={errors.neighborhood}>
                  <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="CENTRO" className={inputCls(!!errors.neighborhood)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field icon={Hash} label="CEP" error={errors.cep}>
                  <input value={form.cep} onChange={e => update('cep', maskCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" className={inputCls(!!errors.cep)} />
                </Field>
                <Field icon={MapPin} label="Cidade" error={errors.city}>
                  <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="SÃO PAULO" className={inputCls(!!errors.city)} />
                </Field>
                <Field label="UF" error={errors.state}>
                  <input value={form.state} onChange={e => update('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} className={inputCls(!!errors.state)} />
                </Field>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                Seus dados são protegidos por LGPD. Em produção são criptografados em AES-256 e nunca compartilhados.
              </p>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(1)} className="flex-1 px-5 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm uppercase tracking-wide">
                  Voltar
                </motion.button>
                <div className="flex-[2]"><NextButton onClick={() => { if (validateStep(2)) setStep(3) }} label="Próximo: documentos" /></div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Documentos + aceites */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-[#0F172A] rounded-[1.75rem] p-6 lg:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800 space-y-4">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 flex gap-3">
                <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-black uppercase text-[11px] tracking-widest mb-1">Verificação humana</p>
                  <p>Envie fotos nítidas do seu documento. Nosso time revisará em até 24h úteis. Selfie deve mostrar seu rosto segurando o documento.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DocUpload label="Selfie com documento" hint="Obrigatória" value={docs.selfie} error={errors.doc_selfie} icon={UserCheck} onChange={f => handleFile('selfie', f)} onClear={() => setDocs(d => ({ ...d, selfie: '' }))} />
                <DocUpload label="Frente do RG/CPF/CNH" hint="Obrigatória" value={docs.front} error={errors.doc_front} icon={FileText} onChange={f => handleFile('front', f)} onClear={() => setDocs(d => ({ ...d, front: '' }))} />
                <DocUpload label="Verso do documento" hint="Recomendado" value={docs.back} icon={FileText} onChange={f => handleFile('back', f)} onClear={() => setDocs(d => ({ ...d, back: '' }))} />
                <DocUpload label="Comprovante residência" hint="Recomendado" value={docs.address} icon={Building2} onChange={f => handleFile('address', f)} onClear={() => setDocs(d => ({ ...d, address: '' }))} />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <Checkbox checked={form.accepted_terms} onChange={v => update('accepted_terms', v)} error={errors.accepted_terms}>
                  Li e aceito os <Link href="/termos" target="_blank" className="text-brand-600 underline font-bold">Termos de Uso</Link>
                </Checkbox>
                <Checkbox checked={form.accepted_privacy} onChange={v => update('accepted_privacy', v)} error={errors.accepted_privacy}>
                  Li e aceito a <Link href="/politica-privacidade" target="_blank" className="text-brand-600 underline font-bold">Política de Privacidade (LGPD)</Link>
                </Checkbox>
                <Checkbox checked={form.accepted_risks} onChange={v => update('accepted_risks', v)} error={errors.accepted_risks}>
                  Estou ciente que o modo demonstração armazena dados apenas neste navegador e posso PERDER dados
                </Checkbox>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(2)} className="flex-1 px-5 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm uppercase tracking-wide">
                  Voltar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={finalSubmit}
                  className="flex-[2] px-5 py-3.5 rounded-full bg-[#0F172A] text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-brand-500/20 hover:bg-slate-900 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><ShieldCheck className="w-4 h-4" /> Concluir verificação</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-slate-400 mt-8 dark:text-slate-500">
          🔒 Seus dados são protegidos e nunca vendidos • Respeitamos a LGPD
        </p>
      </main>
      <Footer />
    </div>
  )
}

function inputCls(err: boolean) {
  return `w-full bg-slate-50 dark:bg-slate-900/50 border-2 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-brand-500 transition-colors ${err ? 'border-red-400 focus:border-red-500' : 'border-transparent'}`
}

function Field({ icon: Icon, label, error, children }: { icon?: any; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />}{label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function NextButton({ onClick, label = 'Continuar' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full px-5 py-3.5 rounded-full bg-[#0F172A] text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-brand-500/20 hover:bg-slate-900 flex items-center justify-center gap-2"
    >
      {label} <ArrowRight className="w-4 h-4" />
    </motion.button>
  )
}

function Checkbox({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div
        onClick={(e) => { e.preventDefault(); onChange(!checked) }}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${checked ? 'bg-[#2563EB] border-[#2563EB]' : error ? 'border-red-400' : 'border-slate-400 dark:border-slate-500'}`}
      >
        {checked && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{children}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
    </label>
  )
}

function DocUpload({ label, hint, value, error, icon: Icon, onChange, onClear }: { label: string; hint: string; value: string; error?: string; icon: any; onChange: (f?: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={`relative rounded-2xl border-2 overflow-hidden transition-all ${error ? 'border-red-400' : value ? 'border-green-500' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500'}`}>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e => onChange(e.target.files?.[0])} className="sr-only" />
      {value ? (
        <div className="relative aspect-video">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button onClick={onClear} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Enviado
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full aspect-video flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${error ? 'bg-red-100 text-red-600' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'}`}>
            {error ? <AlertCircle className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{label}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{hint} • tocar</p>
          </div>
        </button>
      )}
    </div>
  )
}
