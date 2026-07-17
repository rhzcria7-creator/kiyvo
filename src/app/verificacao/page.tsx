'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Calendar, Camera, MapPin, CheckCircle, Loader2, ArrowRight, ArrowLeft, Shield } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import toast from 'react-hot-toast'

const steps = [
  { id: 'cpf', icon: CreditCard, title: 'CPF', desc: 'Informe seu CPF' },
  { id: 'birth_date', icon: Calendar, title: 'Nascimento', desc: 'Data de nascimento' },
  { id: 'selfie', icon: Camera, title: 'Selfie', desc: 'Foto facial para verificação' },
  { id: 'address', icon: MapPin, title: 'Endereço', desc: 'Comprovante de residência' },
]

export default function VerificacaoPage() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    cpf: '',
    birth_date: '',
    selfie_file: null as File | null,
    selfie_preview: '',
    address_cep: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_proof_file: null as File | null,
    address_proof_preview: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const formatCPF = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCEP = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const lookupCEP = async (cep: string) => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) { toast.error('CEP não encontrado'); return }
      update('address_street', data.logradouro || '')
      update('address_neighborhood', data.bairro || '')
      update('address_city', data.localidade || '')
      update('address_state', data.uf || '')
    } catch { /* ignore */ }
  }

  const handleFileUpload = (field: 'selfie_file' | 'address_proof_file', preview: 'selfie_preview' | 'address_proof_preview', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Arquivo máximo 5MB'); return }
    setForm(prev => ({ ...prev, [field]: file, [preview]: URL.createObjectURL(file) }))
  }

  const saveStep = async () => {
    if (!user) return
    setLoading(true)

    const stepId = steps[currentStep].id

    if (stepId === 'cpf') {
      if (form.cpf.replace(/\D/g, '').length !== 11) { toast.error('CPF inválido'); setLoading(false); return }
      await supabase.from('profiles').update({ cpf: form.cpf }).eq('id', user.id)
      await supabase.from('verifications').insert({ user_id: user.id, step: 'cpf', status: 'approved', document_data: { cpf: form.cpf } })
    }

    if (stepId === 'birth_date') {
      if (!form.birth_date) { toast.error('Informe sua data de nascimento'); setLoading(false); return }
      await supabase.from('profiles').update({ birth_date: form.birth_date }).eq('id', user.id)
      await supabase.from('verifications').insert({ user_id: user.id, step: 'birth_date', status: 'approved', document_data: { birth_date: form.birth_date } })
    }

    if (stepId === 'selfie') {
      if (!form.selfie_file) { toast.error('Envie sua selfie'); setLoading(false); return }
      const ext = form.selfie_file.name.split('.').pop()
      const path = `verifications/${user.id}/selfie.${ext}`
      await supabase.storage.from('documents').upload(path, form.selfie_file, { upsert: true })
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      await supabase.from('verifications').insert({ user_id: user.id, step: 'selfie', status: 'pending', document_url: urlData.publicUrl })
    }

    if (stepId === 'address') {
      if (!form.address_cep || !form.address_street || !form.address_city) { toast.error('Preencha o endereço completo'); setLoading(false); return }
      await supabase.from('profiles').update({
        address_cep: form.address_cep,
        address_street: form.address_street,
        address_number: form.address_number,
        address_complement: form.address_complement,
        address_neighborhood: form.address_neighborhood,
        address_city: form.address_city,
        address_state: form.address_state,
      }).eq('id', user.id)

      if (form.address_proof_file) {
        const ext = form.address_proof_file.name.split('.').pop()
        const path = `verifications/${user.id}/address_proof.${ext}`
        await supabase.storage.from('documents').upload(path, form.address_proof_file, { upsert: true })
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
        await supabase.from('verifications').insert({ user_id: user.id, step: 'address', status: 'pending', document_url: urlData.publicUrl, document_data: { address: form } })
      } else {
        await supabase.from('verifications').insert({ user_id: user.id, step: 'address', status: 'approved', document_data: { address: form } })
      }

      // Update profile verification status
      await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    }

    await refreshProfile()
    toast.success('Etapa salva com sucesso!')

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }

    setLoading(false)
  }

  const isComplete = profile?.verification_status === 'verified'
  const isPending = profile?.verification_status === 'pending'

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="text-white" size={28} />
          </motion.div>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Verificação de Identidade</h1>
          <p className="text-surface-500 text-sm mt-1">Para vender na Playdex, precisamos verificar sua identidade</p>
        </motion.div>

        {isComplete ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card-base p-8 text-center">
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-surface-900">Verificação Completa!</h2>
            <p className="text-surface-500 mt-2">Sua identidade foi verificada. Você já pode anunciar produtos.</p>
            <a href="/anunciar" className="btn-primary mt-6 inline-block">Começar a Vender</a>
          </motion.div>
        ) : isPending ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card-base p-8 text-center">
            <Loader2 size={64} className="text-amber-500 mx-auto mb-4 animate-spin" />
            <h2 className="font-display font-bold text-xl text-surface-900">Verificação em Análise</h2>
            <p className="text-surface-500 mt-2">Nossa equipe está analisando seus documentos. Você será notificado quando terminar.</p>
          </motion.div>
        ) : (
          <>
            {/* Step Progress */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: i <= currentStep ? '#2563EB' : '#F1F5F9',
                      color: i <= currentStep ? '#fff' : '#94A3B8',
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-display"
                  >
                    {i < currentStep ? <CheckCircle size={18} /> : <s.icon size={18} />}
                  </motion.div>
                  <div className="hidden sm:block ml-2">
                    <p className={`text-xs font-medium ${i <= currentStep ? 'text-surface-900' : 'text-surface-400'}`}>{s.title}</p>
                  </div>
                  {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < currentStep ? 'bg-brand-500' : 'bg-surface-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="card-base p-8">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div key="cpf" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-surface-900 flex items-center gap-2"><CreditCard size={20} className="text-brand-600" /> CPF</h3>
                    <p className="text-surface-500 text-sm">Informe seu CPF para verificação de identidade. Este dado é protegido e não será exibido publicamente.</p>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => update('cpf', formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="input-base text-lg font-mono tracking-wider"
                    />
                  </motion.div>
                )}
                {currentStep === 1 && (
                  <motion.div key="birth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-surface-900 flex items-center gap-2"><Calendar size={20} className="text-brand-600" /> Data de Nascimento</h3>
                    <p className="text-surface-500 text-sm">Confirme sua data de nascimento para validação do CPF.</p>
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => update('birth_date', e.target.value)}
                      className="input-base text-lg"
                    />
                  </motion.div>
                )}
                {currentStep === 2 && (
                  <motion.div key="selfie" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-surface-900 flex items-center gap-2"><Camera size={20} className="text-brand-600" /> Foto Facial</h3>
                    <p className="text-surface-500 text-sm">Tire uma selfie nítida com o rosto visível para confirmar sua identidade.</p>
                    <div className="flex flex-col items-center gap-4">
                      {form.selfie_preview ? (
                        <motion.img
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          src={form.selfie_preview}
                          alt="Preview selfie"
                          className="w-48 h-48 rounded-2xl object-cover border-4 border-brand-200"
                        />
                      ) : (
                        <label className="w-48 h-48 rounded-2xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all">
                          <Camera size={32} className="text-surface-400 mb-2" />
                          <span className="text-sm text-surface-500">Tirar selfie</span>
                          <input type="file" accept="image/*" capture="user" onChange={(e) => handleFileUpload('selfie_file', 'selfie_preview', e)} className="hidden" />
                        </label>
                      )}
                      {form.selfie_preview && (
                        <button onClick={() => setForm(p => ({ ...p, selfie_file: null, selfie_preview: '' }))} className="text-sm text-brand-600 font-medium">Tirar outra foto</button>
                      )}
                    </div>
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-surface-900 flex items-center gap-2"><MapPin size={20} className="text-brand-600" /> Endereço</h3>
                    <p className="text-surface-500 text-sm">Informe seu endereço residencial para completar a verificação.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">CEP *</label>
                        <input type="text" value={form.address_cep} onChange={(e) => { update('address_cep', formatCEP(e.target.value)); if (e.target.value.replace(/\D/g, '').length === 8) lookupCEP(e.target.value) }} placeholder="00000-000" className="input-base" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Número *</label>
                        <input type="text" value={form.address_number} onChange={(e) => update('address_number', e.target.value)} placeholder="123" className="input-base" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-surface-600 mb-1 block">Rua *</label>
                      <input type="text" value={form.address_street} onChange={(e) => update('address_street', e.target.value)} placeholder="Nome da rua" className="input-base" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-surface-600 mb-1 block">Complemento</label>
                      <input type="text" value={form.address_complement} onChange={(e) => update('address_complement', e.target.value)} placeholder="Apto, bloco, etc." className="input-base" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Bairro</label>
                        <input type="text" value={form.address_neighborhood} onChange={(e) => update('address_neighborhood', e.target.value)} className="input-base" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Cidade *</label>
                        <input type="text" value={form.address_city} onChange={(e) => update('address_city', e.target.value)} className="input-base" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">UF *</label>
                        <input type="text" value={form.address_state} onChange={(e) => update('address_state', e.target.value.toUpperCase())} maxLength={2} className="input-base" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-surface-600 mb-1 block">Comprovante de residência (opcional)</label>
                      <label className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all">
                        <MapPin size={20} className="text-surface-400" />
                        <div>
                          <p className="text-sm font-medium text-surface-700">Clique para enviar</p>
                          <p className="text-xs text-surface-400">PDF, JPG ou PNG (máx. 5MB)</p>
                        </div>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('address_proof_file', 'address_proof_preview', e)} className="hidden" />
                      </label>
                      {form.address_proof_preview && <p className="text-xs text-emerald-600 mt-1">✓ Arquivo selecionado</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-6 border-t border-surface-100">
                <motion.button
                  onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={currentStep === 0}
                  className="btn-secondary py-2.5 disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> Voltar
                </motion.button>
                <motion.button
                  onClick={saveStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="btn-primary py-2.5"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    currentStep === steps.length - 1 ? 'Enviar Verificação' : <span className="flex items-center gap-1">Próximo <ArrowRight size={16} /></span>
                  )}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
