'use client'

import { PageTransition } from '@/components/shared/PageTransition'

export default function TermosPage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-6">Termos de Uso</h1>
        <div className="prose prose-slate max-w-none text-surface-600 leading-relaxed space-y-4">
          <p className="text-sm text-surface-400">Última atualização: 15 de julho de 2026</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">1. Aceitação dos Termos</h2>
          <p>Ao acessar e utilizar a plataforma Playdex, você declara ter lido, compreendido e aceitado integralmente estes Termos e Condições de Uso. A Playdex é uma plataforma tecnológica de intermediação que conecta compradores e vendedores de produtos e serviços digitais.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">2. Natureza do Serviço</h2>
          <p>A Playdex atua exclusivamente como facilitadora de pagamentos e ambiente de negociação. Não é proprietária dos produtos anunciados e não se responsabiliza pelas condições comerciais estabelecidas entre as partes.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">3. Cadastro e Conta</h2>
          <p>Para utilizar os serviços da Playdex, é necessário criar uma conta fornecendo dados verdadeiros e completos. O usuário é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">4. Compras e Vendas</h2>
          <p>Todas as transações são intermediadas pela Playdex. O pagamento é retido até que a entrega seja confirmada pelo comprador. Em caso de problemas, a plataforma oferece sistema de intervenção e reembolso conforme nossa Política de Reembolso.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">5. Proibições</h2>
          <p>É proibido: anunciar produtos ilegais ou roubados; realizar transações fora da plataforma; utilizar-se de fraude ou má-fé; assediar outros usuários; violar direitos de propriedade intelectual.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">6. Sanções</h2>
          <p>O descumprimento destes termos pode acarretar: advertência, suspensão temporária, banimento permanente, retenção de valores e comunicação às autoridades competentes.</p>
        </div>
      </div>
    </PageTransition>
  )
}
