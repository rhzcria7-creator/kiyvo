'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/Button'
import { Store, CreditCard, Shield, CheckCircle, Loader2, ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Página de Onboarding do Vendor — Stripe Connect
 * 
 * Fluxo:
 * 1. Vendor cria a loja (store_name, slug, description)
 * 2. Sistema cria Stripe Connect Account
 * 3. Vendor é redirecionado para onboarding do Stripe
 * 4. Após completar, stripe_onboarding_complete = true
 * 5. Vendor pode começar a vender
 */

const steps = [
  { id: 1, title: 'Criar Loja', desc: 'Nome, slug e descrição' },
  { id: 2, title: 'Conectar Stripe', desc: 'Conta bancária para receber' },
  { id: 3, title: 'Começar a Vender', desc: 'Publicar seus primeiros produtos' },
]

export default function VendorOnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleStoreNameChange = (value: string) => {
    setStoreName(value)
    setSlug(generateSlug(value))
  }

  const handleCreateStore = async () => {
    if (!storeName.trim() || !slug.trim()) {
      toast.error('Preencha o nome da loja')
      return
    }

    setLoading(true)
    try {
      // Em produção: POST /api/v1/vendors com Supabase insert
      // + createConnectAccount()
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock stripe account id
      setStripeAccountId('acct_mock_12345')
      setStep(2)
      toast.success('Loja criada! Agora conecte sua conta Stripe.')
    } catch {
      toast.error('Erro ao criar loja')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeOnboarding = async () => {
    setLoading(true)
    try {
      // Em produção: chamar createOnboardingLink() e redirecionar
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock: simular que o onboarding foi completado
      setStep(3)
      toast.success('Conta Stripe conectada com sucesso!')
    } catch {
      toast.error('Erro ao conectar Stripe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
            Torne-se um Vendedor
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            Crie sua loja e comece a vender produtos digitais na Kiyvo
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <motion.div
                animate={{
                  backgroundColor: step >= s.id ? '#2563EB' : '#F1F5F9',
                  color: step >= s.id ? '#fff' : '#94A3B8',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold"
              >
                {step > s.id ? <CheckCircle size={18} /> : s.id}
              </motion.div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.id ? 'text-surface-900 dark:text-white' : 'text-surface-400'}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${step > s.id ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Create Store */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-base p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Dados da Loja</h2>

              <div>
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">Nome da Loja</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  placeholder="Ex: SoftVault Digital"
                  className="input-base"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">Slug (URL da loja)</label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-3 bg-surface-100 dark:bg-surface-800 border border-r-0 border-surface-200 dark:border-surface-700 rounded-l-xl text-sm text-surface-400">
                    kiyvo.com.br/store/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                    placeholder="softvault"
                    className="input-base rounded-l-none"
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sua loja e o tipo de produtos que vende..."
                  className="input-base min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-surface-400 mt-1">{description.length}/500</p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">Comissão padrão: 10%</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">A Kiyvo retém 10% de cada venda para manutenção da plataforma, segurança e suporte. Planos com menor comissão disponíveis.</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCreateStore} disabled={loading || !storeName.trim()}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span className="flex items-center gap-2">Criar Loja <ArrowRight size={18} /></span>}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Stripe Connect */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-base p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Conectar Conta Stripe</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Para receber seus ganhos, você precisa conectar uma conta Stripe. O Stripe é o processador de pagamentos mais seguro do mundo — seus dados bancários ficam apenas com eles, nunca conosco.
              </p>

              <div className="p-5 bg-brand-50 dark:bg-brand-950/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-brand-600 dark:text-brand-400" />
                  <div>
                    <p className="font-display font-bold text-sm text-surface-900 dark:text-white">Stripe Connect</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Receba pagamentos diretamente na sua conta</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-surface-600 dark:text-surface-400">
                  <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /> Pagamentos via PIX, cartão e boleto</div>
                  <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /> Saques automáticos para sua conta bancária</div>
                  <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /> Sistema de custódia (Escrow) para proteção</div>
                  <div className="flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500" /> Dashboard financeiro completo</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Seus dados bancários são processados exclusivamente pelo Stripe (certificação PCI DSS Level 1). A Kiyvo nunca tem acesso às suas informações financeiras.
                  </p>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleStripeOnboarding} disabled={loading} icon={loading ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}>
                {loading ? 'Conectando...' : 'Conectar com Stripe'}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card-base p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">
                Loja pronta! 🎉
              </h2>
              <p className="text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
                Sua loja <strong>{storeName}</strong> está configurada e pronta para receber vendas. Comece publicando seus primeiros produtos!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <a href="/vender">
                  <Button size="lg" icon={<ArrowRight size={18} />}>Publicar Primeiro Produto</Button>
                </a>
                <a href={`/store/${slug}`}>
                  <Button variant="secondary" size="lg">Ver Minha Loja</Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
