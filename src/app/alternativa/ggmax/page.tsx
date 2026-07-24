import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa ao GGMax em 2026: Ética e Sem Roubo | KIYVO',
  description: 'Cansado do GGMax? KIYVO é a alternativa ética — taxa 8% máx (teto R$50), saque em 1 dia, sem bloqueios arbitrários.',
  alternates: { canonical: 'https://kiyvo.com.br/alternativa/ggmax' },
}

export default function Page() {
  return (
    <LongTailPage
      titulo={<>Alternativa ao <span className="text-brand-500">GGMax</span> em 2026 — plataforma ética</>}
      subtitulo="GGMax é conhecido por relatos de taxas abusivas e bloqueio de saldo de vendedores. KIYVO é a alternativa brasileira com taxa JUSTA e transparente."
      concorrente="GGMax"
      concorrenteTaxa="Taxas opacas e saques travados"
      concorrenteProblemas={['Relatos de bloqueio de saldo', 'Taxas não claras, mudam sem aviso', 'Suporte quase inexistente', 'Contas banidas sem explicação', 'Falta de transparência']}
      kiyvoDiferenciais={[
        { icone: 'Shield', titulo: 'Políticas públicas', desc: 'Regras claras publicadas no site.' },
        { icone: 'BadgePercent', titulo: '8% + R$0,50 (teto R$50)', desc: 'Taxa transparente, sem pegadinha.' },
        { icone: 'Clock', titulo: 'Saque PIX 1 dia útil', desc: 'Seu dinheiro na conta rápido.' },
        { icone: 'TrendingUp', titulo: '200+ agentes IA', desc: 'Ferramentas para VENDER mais.' },
        { icone: 'Banknote', titulo: 'Sem mensalidade', desc: 'Só paga quando vende.' },
        { icone: 'Zap', titulo: 'Suporte real', desc: 'Resposta em até 24h útil.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: 'Opaca / muda', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Bloqueio de saldo', concorrente: 'Relatos frequentes', kiyvo: 'Só bloqueia em fraude comprovada' },
        { criterio: 'Saque', concorrente: 'Travado/demorado', kiyvo: '1 dia útil PIX' },
        { criterio: 'Suporte', concorrente: 'Inexistente', kiyvo: 'Resposta em 24h' },
      ]}
      faq={[
        { pergunta: 'KIYVO bloqueia saldo?', resposta: 'Apenas em caso de fraude comprovada ou chargeback — e sempre com aviso prévio.' },
        { pergunta: 'A taxa é realmente 8%?', resposta: 'Sim, publicamos todas as taxas em /transparencia.' },
        { pergunta: 'Como funciona o saque?', resposta: 'PIX em 1 dia útil, R$0,99 fixo, mínimo R$30.' },
        { pergunta: 'Posso migrar?', resposta: 'Sim, cadastro em 10 minutos.' },
        { pergunta: 'Custa para abrir conta?', resposta: 'Zero.' },
      ]}
      cta={{ titulo: 'Saia do GGMax e venha para a KIYVO', subtitulo: 'Plataforma ética com taxa justa.', botao: 'Criar conta grátis', href: '/cadastro' }}
    />
  )
}
