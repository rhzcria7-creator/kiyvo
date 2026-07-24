import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Melhor Plataforma de Produtos Digitais do Brasil 2026 | KIYVO',
  description: 'Compare Hotmart, Monetizze, Eduzz, Kiwify, GGMax e KIYVO. Menor taxa, saque mais rápido, IA inclusa.',
  alternates: { canonical: 'https://kiyvo.com.br/melhor-plataforma-produtos-digitais' },
}

export default function MelhorPlataforma() {
  return (
    <LongTailPage
      titulo={<>Qual a <span className="text-brand-500">melhor plataforma</span> de produtos digitais do Brasil em 2026?</>}
      subtitulo="Comparamos Hotmart, Monetizze, Eduzz, Kiwify, GGMax e KIYVO para você escolher a menor taxa, saque mais rápido e melhor ferramental."
      concorrente="Média do mercado"
      concorrenteProblemas={['Hotmart: 10,99% + R$1, saque 15+ dias', 'Monetizze: 9,9% + R$1', 'Eduzz: 9,9% + R$1', 'Kiwify: 12% + R$1', 'GGMax: relatos de bloqueio', 'Microsoft/Apple: 30%']}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: 'Menor taxa: 8% máx (teto R$50)', desc: 'Acima de R$625, KIYVO cobra menos que todas.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Mais rápido do Brasil.' },
        { icone: 'TrendingUp', titulo: '200+ agentes IA', desc: 'Copy, ROI, CRO, WhatsApp, VSL.' },
        { icone: 'Shield', titulo: 'Garantia de 7 dias', desc: 'Proteção para comprador e vendedor.' },
        { icone: 'Banknote', titulo: 'KD Points', desc: 'Fidelidade que gera recompra.' },
        { icone: 'Zap', titulo: 'Boost por preço fixo', desc: 'Sem CPC leilão.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: '9,9% a 30%', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Teto por venda', concorrente: 'Sem teto', kiyvo: 'R$50' },
        { criterio: 'Saque', concorrente: '7-30 dias', kiyvo: '1 dia útil PIX' },
        { criterio: 'Taxa saque', concorrente: 'R$1,99 a R$9+', kiyvo: 'R$0,99 fixo' },
        { criterio: 'IA inclusa', concorrente: '0', kiyvo: '200+ agentes' },
      ]}
      faq={[
        { pergunta: 'Qual tem a menor taxa em 2026?', resposta: 'KIYVO: 8% + R$0,50 com teto de R$50.' },
        { pergunta: 'Melhor para iniciantes?', resposta: 'KIYVO: sem mensalidade, agentes IA que fazem copy e precificação.' },
        { pergunta: 'Vale migrar da Hotmart/Kiwify?', resposta: 'Para produtos acima de R$500, a economia é grande. Você pode manter produtos nas duas.' },
        { pergunta: 'KIYVO é confiável?', resposta: 'Sim. CNPJ ativo, servidores no Brasil, página /transparencia pública.' },
        { pergunta: 'Tem afiliados?', resposta: 'Sim, com rastreamento de 30 dias.' },
      ]}
      cta={{ titulo: 'Comece na KIYVO hoje', subtitulo: 'Cadastro grátis em 2 minutos, sem mensalidade.', botao: 'Criar conta grátis', href: '/cadastro' }}
    />
  )
}
