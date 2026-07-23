// Gera páginas SEO de cauda longa para "alternativa a X" e "melhor Y"
const { writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

const ROOT = '/home/user/kiyvo/src/app'

const PAGES = [
  {
    path: 'alternativa/monetizze',
    title: 'Alternativa à Monetizze 2026: Taxa 8% Máx (teto R$50) | KIYVO',
    desc: 'Procura alternativa à Monetizze? KIYVO tem taxa 8% + R$0,50 (teto R$50), saque PIX em 1 dia útil, e 180+ agentes IA.',
    h1tpl: 'titulo={<>Alternativa à <span className="text-brand-500">Monetizze</span> em 2026 — taxa justa e sem enrolação</>}',
    subtitulo: 'A Monetizze cobra 9,9% + R$1 por venda sem teto, e saques demoram. Na KIYVO você paga no máximo 8% + R$0,50, com teto de R$50, e recebe o dinheiro em 1 dia útil via PIX.',
    concorrente: 'Monetizze',
    concorrenteTaxa: '9,9% + R$1,00 (sem teto)',
    problemas: [
      'Taxa de 9,9% + R$1 sem teto (em produto de R$1.000 = R$100)',
      'Saque em 10+ dias úteis',
      'Afiliados com atribuição instável',
      'Checkout com pouca customização',
      'Sem IA ou ferramentas de vendas integradas',
      'Suporte demorado',
    ],
  },
  {
    path: 'alternativa/eduzz',
    title: 'Alternativa à Eduzz 2026: Taxa Justa e Saque Rápido | KIYVO',
    desc: 'Eduzz cobra 9,9% + R$1 por venda. KIYVO cobra 8% + R$0,50 com teto de R$50. Migre para a plataforma brasileira mais transparente.',
    h1tpl: 'titulo={<>Alternativa à <span className="text-brand-500">Eduzz</span> em 2026 — melhor margem e saque PIX</>}',
    subtitulo: 'Eduzz cobra 9,9% + R$1 sem teto. Na KIYVO você paga 8% no máximo, com teto de R$50, e recebe saque em 1 dia via PIX.',
    concorrente: 'Eduzz',
    concorrenteTaxa: '9,9% + R$1,00',
    problemas: [
      '9,9% + R$1 por venda (sem teto)',
      'Interface menos intuitiva',
      'Saque demora vários dias',
      'Poucas ferramentas nativas (tudo é terceiro)',
      'Sem IA integrada para vendedores',
    ],
  },
  {
    path: 'alternativa/kiwify',
    title: 'Alternativa à Kiwify 2026: Taxa 8% em vez de 12%+ | KIYVO',
    desc: 'Kiwify cobra 12% + R$1 por venda. KIYVO cobra apenas 8% + R$0,50 (teto R$50). Saque PIX em 1 dia útil, 180+ agentes IA.',
    h1tpl: 'titulo={<>Alternativa à <span className="text-brand-500">Kiwify</span> em 2026 — pague menos e venda mais</>}',
    subtitulo: 'Kiwify ficou famosa mas a taxa subiu para 12% + R$1 por venda, sem teto. KIYVO cobra 8% + R$0,50 (teto R$50) — e tem 180+ agentes IA de venda.',
    concorrente: 'Kiwify',
    concorrenteTaxa: '12% + R$1,00 (sem teto)',
    problemas: [
      'Taxa de 12% + R$1 por venda — uma das mais altas do mercado',
      'Em produto de R$1.000 a Kiwify fica com R$121',
      'Bloqueios de conta sem explicação',
      'Saque demora 2-7 dias',
      'Checkout com bugs frequentes',
      'Ferramentas de IA muito limitadas',
    ],
  },
  {
    path: 'alternativa/ggmax',
    title: 'Alternativa ao GGMax em 2026: Sem Roubo | KIYVO',
    desc: 'Cansado do GGMax? KIYVO é a alternativa ética — taxa 8% máx (teto R$50), saque em 1 dia, sem bloqueios arbitrários.',
    h1tpl: 'titulo={<>Alternativa ao <span className="text-brand-500">GGMax</span> em 2026 — plataforma ética sem roubo</>}',
    subtitulo: 'GGMax é conhecido por taxas abusivas, bloqueios de saldo e falta de transparência. KIYVO é a alternativa brasileira com taxa JUSTA e sem pegadinhas.',
    concorrente: 'GGMax',
    concorrenteTaxa: 'Taxas opacas, saques travados',
    problemas: [
      'Relatos generalizados de bloqueio de saldo de vendedores',
      'Taxas não claras e mudanças sem aviso',
      'Suporte quase inexistente',
      'Contas banidas sem explicação',
      'Sem transparência sobre taxas reais',
    ],
  },
  {
    path: 'alternativa/microsoft-store',
    title: 'Alternativa à Microsoft Store (30% de taxa) | KIYVO',
    desc: 'Microsoft Store cobra 30% de taxa (12% para jogos). KIYVO cobra 8% no máximo com teto de R$50. A alternativa brasileira para software e produtos digitais.',
    h1tpl: 'titulo={<>Alternativa à <span className="text-brand-500">Microsoft Store</span> (30% de taxa) em 2026</>}',
    subtitulo: 'Microsoft e Apple cobram 30% de comissão. Na KIYVO você paga no máximo 8% + R$0,50 (teto R$50) — menos de 1/3 da taxa deles. Venda software, plugins, cursos e produtos digitais.',
    concorrente: 'Microsoft Store',
    concorrenteTaxa: '30% (12% para jogos)',
    problemas: [
      '30% de comissão — você perde quase 1/3 da venda',
      'Aprovação demora dias ou semanas',
      'Muitas restrições de conteúdo',
      'Não permite vender cursos ou serviços',
      'Pagamento em 30-60 dias',
      'Sem ferramentas de marketing brasileiras',
    ],
  },
]

for (const p of PAGES) {
  const dir = join(ROOT, p.path)
  mkdirSync(dir, { recursive: true })
  const content = `// ${p.path} — página SEO long-tail
import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: ${JSON.stringify(p.title)},
  description: ${JSON.stringify(p.desc)},
  alternates: { canonical: 'https://kiyvo.com.br/${p.path}' },
  openGraph: { title: ${JSON.stringify(p.title)}, description: ${JSON.stringify(p.desc)}, url: 'https://kiyvo.com.br/${p.path}', type: 'website' },
}

export default function Page() {
  return (
    <LongTailPage
      ${p.h1tpl}
      subtitulo=${JSON.stringify(p.subtitulo)}
      concorrente=${JSON.stringify(p.concorrente)}
      concorrenteTaxa=${JSON.stringify(p.concorrenteTaxa)}
      concorrenteProblemas={${JSON.stringify(p.problemas)}}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: '8% + R$0,50 (teto R$50)', desc: 'Taxa máxima da KIYVO — uma das menores do Brasil. Sem letras miúdas.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Receba seu dinheiro no dia útil seguinte após garantia de 7 dias.' },
        { icone: 'TrendingUp', titulo: '180+ agentes IA', desc: 'Ferramentas gratuitas de IA para copy, CRO, ROI, anúncios, WhatsApp e mais.' },
        { icone: 'Shield', titulo: 'Garantia anti-bloqueio', desc: 'Produtos legais não são bloqueados. Regras públicas e transparentes.' },
        { icone: 'Banknote', titulo: 'Sem mensalidade', desc: 'Você só paga quando vende — R$0 para abrir e manter a conta.' },
        { icone: 'Zap', titulo: 'Boost de produtos', desc: 'Imprima seu produto na página inicial por preço fixo.' },
      ]}
      comparativo={[
        { criterio: 'Taxa', concorrente: ${JSON.stringify(p.concorrenteTaxa)}, kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Saque', concorrente: '7-30 dias', kiyvo: '1 dia útil (PIX)' },
        { criterio: 'Mensalidade', concorrente: 'N/A ou cara', kiyvo: 'Grátis' },
        { criterio: 'Agentes IA', concorrente: 'Nenhum', kiyvo: '180+ gratuitos' },
        { criterio: 'Transparência', concorrente: 'Taxas opacas', kiyvo: 'Transparência 100% pública' },
      ]}
      faq={[
        { pergunta: 'A KIYVO é brasileira?', resposta: 'Sim, 100% brasileira com CNPJ e suporte em português.' },
        { pergunta: 'Posso migrar meus produtos para cá?', resposta: 'Sim — basta cadastrar seus produtos (10 minutos) e começar a vender.' },
        { pergunta: 'Tem programa de afiliados?', resposta: 'Sim, afiliado ganha comissão configurável com rastreamento confiável.' },
        { pergunta: 'Quanto custa para começar?', resposta: 'Zero. Sem mensalidade, sem adesão. Só paga quando vende.' },
        { pergunta: 'Como é o saque?', resposta: 'PIX em 1 dia útil, taxa R$0,99 fixa, mínimo R$30.' },
      ]}
      cta={{
        titulo: 'Comece a vender com taxa justa na KIYVO',
        subtitulo: 'Cadastro gratuito em 2 minutos. Publique seu primeiro produto ainda hoje.',
        botao: 'Criar conta grátis',
        href: '/cadastro',
      }}
    />
  )
}
`
  writeFileSync(join(dir, 'page.tsx'), content)
}

console.log('✅ Páginas "alternativa a" geradas:', PAGES.length)

// Página "melhor plataforma de produtos digitais"
const melhorPage = `// /melhor-plataforma-produtos-digitais
import type { Metadata } from 'next'
import Link from 'next/link'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Melhor Plataforma de Produtos Digitais do Brasil em 2026 | KIYVO',
  description: 'Compare Hotmart, Monetizze, Eduzz, Kiwify, GGMax e KIYVO. Descubra qual é a melhor plataforma de produtos digitais para brasileiros em 2026 — com taxa justa, saque rápido e IA.',
  keywords: ['melhor plataforma produtos digitais', 'melhor plataforma cursos online', 'hotmart vs monetizze vs kiwify', 'plataforma menor taxa', 'vender infoproduto brasil'],
  alternates: { canonical: 'https://kiyvo.com.br/melhor-plataforma-produtos-digitais' },
}

export default function MelhorPlataforma() {
  return (
    <LongTailPage
      titulo={<>Qual a <span className="text-brand-500">melhor plataforma</span> de produtos digitais do Brasil em 2026?</>}
      subtitulo="Comparamos Hotmart, Monetizze, Eduzz, Kiwify, GGMax e KIYVO para você escolher a opção com menor taxa, saque mais rápido e melhor ferramental."
      concorrente="Outras plataformas"
      concorrenteProblemas={[
        'Hotmart: 10,99% + R$1 sem teto, saque em 15+ dias',
        'Monetizze: 9,9% + R$1 sem teto',
        'Eduzz: 9,9% + R$1 sem teto',
        'Kiwify: 12% + R$1 (uma das mais altas)',
        'GGMax: relatos de bloqueio de saldo',
        'Microsoft/Apple: 30% de comissão',
      ]}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: 'Menor taxa: 8% máx (teto R$50)', desc: 'Em produtos acima de R$625, a KIYVO cobra menos que qualquer concorrente.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Receba em 1 dia útil após os 7 dias de garantia — mais rápido do Brasil.' },
        { icone: 'TrendingUp', titulo: '180+ agentes IA gratuitos', desc: 'Copy, ROI, CRO, funil WhatsApp, VSL, Black Friday, análise de concorrente e muito mais.' },
        { icone: 'Shield', titulo: 'Garantia de 7 dias para comprador', desc: 'Comprador protegido; vendedor recebe o dinheiro só após 7 dias, protegendo contra chargebacks.' },
        { icone: 'Banknote', titulo: 'KD Points (fidelidade)', desc: 'Comprador ganha pontos em cada compra (100 KD = R$1) que geram desconto em compras futuras.' },
        { icone: 'Zap', titulo: 'Boost de produtos por preço fixo', desc: 'Imprima seu produto na home por R$4,90 a R$199,90 — sem CPC leilão.' },
      ]}
      comparativo={[
        { criterio: 'Taxa máxima', concorrente: '9,9% a 30%', kiyvo: '8% + R$0,50 (teto R$50)', kiyvoMelhor: true },
        { criterio: 'Teto de taxa por venda', concorrente: 'Sem teto', kiyvo: 'R$50', kiyvoMelhor: true },
        { criterio: 'Saque', concorrente: '7-30 dias', kiyvo: '1 dia útil PIX', kiyvoMelhor: true },
        { criterio: 'Taxa de saque', concorrente: 'R$1,99 a R$9+', kiyvo: 'R$0,99 fixo', kiyvoMelhor: true },
        { criterio: 'Agentes IA inclusos', concorrente: '0', kiyvo: '180+', kiyvoMelhor: true },
        { criterio: 'Boost/Anúncio nativo', concorrente: 'CPC caro', kiyvo: 'Preço fixo (de R$4,90)', kiyvoMelhor: true },
      ]}
      faq={[
        { pergunta: 'Qual a plataforma com menor taxa em 2026?', resposta: 'Entre as plataformas principais, a KIYVO é a que tem menor taxa: 8% + R$0,50 com teto de R$50 por venda. Em produtos de ticket alto (R$1.000+), a economia é de R$50 a R$170 por venda.' },
        { pergunta: 'Qual é melhor para iniciantes?', resposta: 'KIYVO: sem mensalidade, interface simples, agentes IA que ajudam a criar copy, preço e página de vendas sem saber nada de marketing.' },
        { pergunta: 'Vale a pena migrar da Hotmart/Kiwify?', resposta: 'Se você vende produtos acima de R$500, a economia de taxa justifica a migração. Você pode manter produtos nas duas plataformas sem problema.' },
        { pergunta: 'KIYVO é confiável?', resposta: 'Sim. CNPJ ativo, servidores no Brasil (Supabase SP), políticas públicas, página /transparencia com todas as taxas e garantia de 7 dias.' },
        { pergunta: 'Tem afiliado?', resposta: 'Sim, programa de afiliados com link único e rastreamento de 30 dias.' },
      ]}
      cta={{
        titulo: 'Comece a vender na KIYVO — cadastro grátis',
        subtitulo: 'Publique seu produto em 10 minutos e só pague quando vender.',
        botao: 'Criar conta gratuita',
        href: '/cadastro',
      }}
    />
  )
}
mkdirSync(join(ROOT, 'melhor-plataforma-produtos-digitais'), { recursive: true })
writeFileSync(join(ROOT, 'melhor-plataforma-produtos-digitais/page.tsx'), melhorPage)

console.log('✅ Página "melhor plataforma" gerada')
