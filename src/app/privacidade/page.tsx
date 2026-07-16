'use client'

import { PageTransition } from '@/components/shared/PageTransition'

export default function PrivacidadePage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-6">Política de Privacidade</h1>
        <div className="prose prose-slate max-w-none text-surface-600 leading-relaxed space-y-4">
          <p className="text-sm text-surface-400">Última atualização: 15 de julho de 2026</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Dados que Coletamos</h2>
          <p>Coletamos dados fornecidos voluntariamente (nome, CPF, e-mail, celular) e dados coletados automaticamente (IP, geolocalização, dados de navegação, cookies). Também podemos receber dados de serviços de terceiros como Google e Discord.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Finalidade</h2>
          <p>Utilizamos seus dados para: gerenciar compras e vendas; processar pagamentos e reembolsos; melhorar a experiência do usuário; enviar comunicações; garantir a segurança da plataforma; cumprir obrigações legais.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Compartilhamento</h2>
          <p>Seus dados podem ser compartilhados com fornecedores e parceiros sob obrigação contratual de segurança, autoridades públicas quando determinado por lei, e em caso de movimentações societárias.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Seus Direitos (LGPD)</h2>
          <p>Você tem direito a: acessar seus dados; solicitar correção; solicitar anonimização ou eliminação; revogar consentimento. Para exercer seus direitos, entre em contato conosco.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Cookies</h2>
          <p>Utilizamos cookies para melhorar a navegação, personalizar conteúdo e analisar tráfego. Você pode gerenciar suas preferências de cookies a qualquer momento.</p>
        </div>
      </div>
    </PageTransition>
  )
}
