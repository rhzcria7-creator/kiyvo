import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa à Microsoft Store (30% de taxa) em 2026 | KIYVO',
  description: 'Microsoft Store cobra 30% de taxa (12% jogos). KIYVO cobra 8% no máximo com teto de R$50. Venda software, plugins e produtos digitais sem a taxação abusiva.',
  alternates: { canonical: 'https://kiyvo.com.br/alternativa/microsoft-store' },
}

export default function Page() {
  return (
    <LongTailPage
      titulo={<>Alternativa à <span className="text-brand-500">Microsoft Store</span> (30% de taxa)</>}
      subtitulo="Microsoft e Apple cobram 30% de comissão (12% para jogos). Na KIYVO você paga no máximo 8% + R$0,50 (teto R$50) — menos de 1/3 da taxa."
      concorrente="Microsoft Store"
      concorrenteTaxa="30% (12% jogos)"
      concorrenteProblemas={['Comissão de 30% — perde 1/3 da venda', 'Aprovação demora dias/semanas', 'Muitas restrições de conteúdo', 'Não aceita cursos/serviços', 'Pagamento em 30-60 dias', 'Sem ferramentas de marketing brasileiras']}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: '8% + R$0,50 (teto R$50)', desc: 'Menos de 1/3 da taxa da Microsoft.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia', desc: 'Pagamento rápido para BR.' },
        { icone: 'TrendingUp', titulo: 'Venda qualquer produto digital', desc: 'Cursos, software, plugins, templates, e-books, serviços.' },
        { icone: 'Shield', titulo: 'Aprovação rápida', desc: 'Cadastro e produto no ar em horas.' },
        { icone: 'Banknote', titulo: 'Sem mensalidade', desc: 'Só paga quando vende.' },
        { icone: 'Zap', titulo: '200+ agentes IA', desc: 'Ferramentas de marketing inclusas.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: '30% (12% jogos)', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Em R$100', concorrente: 'R$30', kiyvo: 'R$8,50' },
        { criterio: 'Em R$1.000', concorrente: 'R$120 (jogos) a R$300', kiyvo: 'R$50' },
        { criterio: 'Pagamento', concorrente: '30-60 dias', kiyvo: '1 dia útil PIX' },
        { criterio: 'Aprovação', concorrente: 'Dias/semanas', kiyvo: 'Horas' },
      ]}
      faq={[
        { pergunta: 'Posso vender software na KIYVO?', resposta: 'Sim. Software, plugins, SAAS, cursos, templates, e-books, música, artes digitais — tudo pode ser vendido.' },
        { pergunta: 'A KIYVO cobra 30%?', resposta: 'Não. Máximo de 8% + R$0,50 com teto R$50.' },
        { pergunta: 'Como é a entrega?', resposta: 'Entrega digital instantânea após confirmação do pagamento.' },
        { pergunta: 'Tem API?', resposta: 'Sim, API pública para integração.' },
        { pergunta: 'Saque para fora do Brasil?', resposta: 'Saque PIX para conta bancária brasileira.' },
      ]}
      cta={{ titulo: 'Pare de pagar 30%', subtitulo: 'Venda software na KIYVO com taxa de 8% no máximo.', botao: 'Criar conta grátis', href: '/cadastro' }}
    />
  )
}
