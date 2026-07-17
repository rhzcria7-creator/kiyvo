// ─────────────────────────────────────────────────────────────
// Verificação de Conta — Fluxo real com KYC
// Redireciona para /vendor/onboarding/kyc quando necessário
// ─────────────────────────────────────────────────────────────

'use client'

import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Upload, Shield, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function VerificacoesPage() {
  const { profile } = useAuth()

  const steps = [
    { label: 'E-mail verificado', done: true },
    { label: 'Celular verificado', done: !!profile?.phone },
    { label: 'Documento (RG/CPF)', done: profile?.kyc_status === 'approved' },
    { label: 'Selfie com documento', done: profile?.kyc_status === 'approved' },
  ]

  const kycStatusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
    approved: { variant: 'success', label: 'Aprovado' },
    pending: { variant: 'warning', label: 'Em análise' },
    rejected: { variant: 'danger', label: 'Rejeitado' },
  }

  const currentKyc = profile?.kyc_status ? kycStatusMap[profile.kyc_status] : null

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6">Verificação de Conta</h1>

        <div className="card-base p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="font-display font-bold text-surface-900 dark:text-white">Status da Verificação</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400">Contas verificadas têm mais credibilidade e podem retirar dinheiro</p>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-surface-100 dark:bg-surface-800'}`}>
                  <CheckCircle size={16} className={step.done ? 'text-emerald-500' : 'text-surface-300 dark:text-surface-600'} />
                </div>
                <span className={`text-sm ${step.done ? 'text-surface-900 dark:text-white font-medium' : 'text-surface-500 dark:text-surface-400'}`}>{step.label}</span>
                {step.done && <Badge variant="success">Concluído</Badge>}
              </div>
            ))}
          </div>

          {currentKyc && (
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-500 dark:text-surface-400">Status KYC:</span>
                <Badge variant={currentKyc.variant} dot>{currentKyc.label}</Badge>
              </div>
            </div>
          )}
        </div>

        {profile?.kyc_status !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6"
          >
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-3">Iniciar Verificação</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
              Complete a verificação de identidade para desbloquear vendas e retiradas. O processo leva poucos minutos.
            </p>
            <Link href="/vendor/onboarding/kyc">
              <Button className="w-full" icon={<ArrowRight size={18} />}>
                Iniciar Verificação KYC
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
