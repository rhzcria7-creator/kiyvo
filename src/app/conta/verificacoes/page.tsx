'use client'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Upload, Shield } from 'lucide-react'

export default function VerificacoesPage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 mb-6">Verificação de Conta</h1>

        <div className="card-base p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-brand-600" />
            <div>
              <h2 className="font-display font-bold text-surface-900">Status da Verificação</h2>
              <p className="text-sm text-surface-500">Contas verificadas têm mais credibilidade e podem retirar dinheiro</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'E-mail verificado', done: true },
              { label: 'Celular verificado', done: true },
              { label: 'Documento (RG/CPF)', done: false },
              { label: 'Selfie com documento', done: false },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-100' : 'bg-surface-100'}`}>
                  <CheckCircle size={16} className={step.done ? 'text-emerald-500' : 'text-surface-300'} />
                </div>
                <span className={`text-sm ${step.done ? 'text-surface-900 font-medium' : 'text-surface-500'}`}>{step.label}</span>
                {step.done && <Badge variant="success">Concluído</Badge>}
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="font-display font-bold text-surface-900 mb-3">Enviar Documento</h3>
          <p className="text-sm text-surface-500 mb-4">Envie uma foto nítida do seu RG ou CNH. O processo de verificação leva até 24 horas.</p>
          <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-brand-300 transition-all cursor-pointer mb-4">
            <Upload size={28} className="text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-500">Clique ou arraste o documento aqui</p>
            <p className="text-xs text-surface-400">PNG, JPG até 10MB</p>
          </div>
          <Button className="w-full">Enviar Documento</Button>
        </div>
      </div>
    </PageTransition>
  )
}
