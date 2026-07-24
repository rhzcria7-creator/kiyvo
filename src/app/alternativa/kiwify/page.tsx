import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa à Kiwify 2026: Taxa 8% (ao invés de 12%) | KIYVO',
  description: 'Kiwify cobra 12% + R$1. KIYVO cobra 8% + R$0,50 com teto de R$50. Saque PIX em 1 dia útil, 200+ agentes IA.',
  alternates: { canonical: 'https://kiyvo.com.br/alternativa/kiwify' },
}

export default function Page() {
  return (
    <LongTailPage
      titulo={<>Alternativa à <span className="text-brand-500">Kiwify</span> em 2026 — pague menos e venda mais</>}
      subtitulo="A Kiwify ficou famosa mas a taxa subiu para 12% + R$1 por venda, sem teto. KIYVO cobra 8% + R$0,50 (teto R$50) — e tem 200+ agentes IA de venda."
      concorrente="Kiwify"
      concorrenteTaxa="12% + R$1,00 (sem teto)"
      concorrenteProblemas={['Taxa de 12% + R$1 — uma das mais altas', 'Em R$1.000 a Kiwify fica com R$121', 'Relatos de bloqueio de conta', 'Saque demora 2-7 dias', 'Checkout com bugs frequentes', 'IA muito limitada']}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: '8% + R$0,50 (teto R$50)', desc: 'Menos da metade em tickets altos.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Rápido e transparente.' },
        { icone: 'TrendingUp', titulo: '200+ agentes IA', desc: 'Copy, ROI, CRO, WhatsApp e mais.' },
        { icone: 'Shield', titulo: 'Transparência total', desc: 'Políticas públicas, sem surpresa.' },
        { icone: 'Banknote', titulo: 'Sem mensalidade', desc: 'Só paga quando vende.' },
        { icone: 'Zap', titulo: 'Boost por preço fixo', desc: 'Imprima na home sem CPC.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: '12% + R$1', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Em R$1.000', concorrente: 'R$121', kiyvo: 'R$50' },
        { criterio: 'Saque', concorrente: '2-7 dias', kiyvo: '1 dia útil PIX' },
        { criterio: 'Agentes IA', concorrente: 'Poucos', kiyvo: '200+ gratuitos' },
      ]}
      faq={[
        { pergunta: 'Quanto economizo migrando?', resposta: 'Em produto de R$1.000, você economiza R$71 por venda.' },
        { pergunta: 'Difícil migrar?', resposta: 'Não, cadastro em 10 minutos.' },
        { pergunta: 'Tem afiliado?', resposta: 'Sim.' },
        { pergunta: 'Custa para começar?', resposta: 'Zero.' },
        { pergunta: 'Saque?', resposta: 'PIX 1 dia útil, R$0,99.' },
      ]}
      cta={{ titulo: 'Pague menos em cada venda', subtitulo: 'Migre para KIYVO e pague 8% em vez de 12%.', botao: 'Criar conta grátis', href: '/cadastro' }}
    />
  )
}
