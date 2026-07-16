'use client'

import { PageTransition } from '@/components/shared/PageTransition'

export default function ReembolsoPage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-6">Política de Reembolso</h1>
        <div className="prose prose-slate max-w-none text-surface-600 leading-relaxed space-y-4">
          <h2 className="font-display font-bold text-xl text-surface-900 mt-6">Quando posso pedir reembolso?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Desistência antes de receber o produto</li>
            <li>Arrependimento, desde que o produto não tenha sido utilizado</li>
            <li>Vendedor não conseguir entregar o produto/serviço</li>
            <li>Produto em desacordo com as informações do anúncio</li>
            <li>Vendedor não responde ou não retorna contato</li>
          </ul>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-6">Como solicitar</h2>
          <p>Acesse o chat do pedido e clique em "Tenho um Problema". Nossa equipe de moderação analisará o caso e, se procedente, o reembolso será processado em até 48 horas úteis.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-6">Métodos de reembolso</h2>
          <p><strong>Cartão de crédito:</strong> Estorno na fatura seguinte. <strong>PIX/Boleto:</strong> Crédito na plataforma ou devolução na conta de origem. <strong>Criptomoeda:</strong> Devolução manual para carteira de origem.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-6">Prazo limite</h2>
          <p>O prazo para solicitação de reembolso coincide com o prazo de liberação do pagamento ao vendedor, informado no início do chat da compra. Após esse prazo, o reembolso é de responsabilidade do vendedor.</p>
        </div>
      </div>
    </PageTransition>
  )
}
