import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa à Eduzz 2026: Taxa 8% Máx | KIYVO',
  description: 'Eduzz cobra 9,9% + R$1. KIYVO cobra 8% + R$0,50 (teto R$50). Migre para a plataforma brasileira mais transparente.',
  alternates: { canonical: 'https://kiyvo.com.br/alternativa/eduzz' },
}

export default function Page() {
  return (
    <LongTailPage
      titulo={<>Alternativa à <span className="text-brand-500">Eduzz</span> em 2026</>}
      subtitulo="Eduzz cobra 9,9% + R$1 sem teto. KIYVO: 8% + R$0,50, teto R$50, saque PIX em 1 dia útil, 200+ agentes IA."
      concorrente="Eduzz"
      concorrenteTaxa="9,9% + R$1,00"
      concorrenteProblemas={['Taxa de 9,9% + R$1 sem teto', 'Interface menos intuitiva', 'Saque demora vários dias', 'Poucas ferramentas nativas', 'Sem IA integrada']}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: '8% + R$0,50 (teto R$50)', desc: 'Taxa máxima da KIYVO.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Após 7 dias de garantia.' },
        { icone: 'TrendingUp', titulo: '200+ agentes IA', desc: 'Copy, ROI, CRO, WhatsApp, VSL...' },
        { icone: 'Shield', titulo: 'Garantia anti-bloqueio', desc: 'Regras públicas e transparentes.' },
        { icone: 'Banknote', titulo: 'Sem mensalidade', desc: 'Só paga quando vende.' },
        { icone: 'Zap', titulo: 'Boost de produtos', desc: 'Imprima na home por preço fixo.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: '9,9% + R$1', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Saque', concorrente: '7+ dias', kiyvo: '1 dia útil PIX' },
        { criterio: 'Agentes IA', concorrente: 'Nenhum', kiyvo: '200+ gratuitos' },
        { criterio: 'Mensalidade', concorrente: 'Grátis', kiyvo: 'Grátis' },
        { criterio: 'Transparência', concorrente: 'Média', kiyvo: '100% pública' },
      ]}
      faq={[
        { pergunta: 'KIYVO é brasileira?', resposta: 'Sim, CNPJ ativo e suporte em português.' },
        { pergunta: 'Posso migrar meus produtos?', resposta: 'Sim, em 10 minutos.' },
        { pergunta: 'Tem afiliados?', resposta: 'Sim, comissão configurável.' },
        { pergunta: 'Custa para começar?', resposta: 'Zero.' },
        { pergunta: 'Saque?', resposta: 'PIX 1 dia útil, R$0,99 fixo.' },
      ]}
      cta={{ titulo: 'Comece com taxa justa', subtitulo: 'Cadastro gratuito em 2 minutos.', botao: 'Criar conta grátis', href: '/cadastro' }}
    />
  )
}
