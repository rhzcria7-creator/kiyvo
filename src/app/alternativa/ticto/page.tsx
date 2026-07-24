import type { Metadata } from 'next'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa à Ticto em 2026: Taxa 8% Máx (teto R$50) | KIYVO',
  description: `Procurando alternativa à Ticto? KIYVO cobra no MÁXIMO 8% + R$0,50 (teto de R$50) por venda. Saque PIX em 1 dia útil, 200+ agentes IA gratuitos, plano free sem mensalidade.`,
  keywords: ['alternativa ticto', 'substituta ticto', 'melhor que ticto', 'plataforma produtos digitais brasil', 'taxa menor que ticto'],
  alternates: { canonical: `https://kiyvo.com.br/alternativa/ticto` },
  openGraph: {
    title: `Alternativa à Ticto com taxa JUSTA | KIYVO`,
    description: 'KIYVO: 8% máximo (teto R$50), saque PIX em 1 dia, 200+ agentes IA.',
    url: `https://kiyvo.com.br/alternativa/ticto`,
    type: 'website',
  },
}

const problemas = [
  "Planos COM MENSALIDADE OBRIGATÓRIA (de R$99 a R$799/mês)",
  "Taxas baixas só em planos caros",
  "Pouca oferta de produtos (catálogo menor)",
  "Sem IA integrada para vendedores",
  "Burocracia para aprovação",
  "Público muito específico (alto ticket)"
];
const diferenciais = [
  {
    "icone": "BadgePercent",
    "titulo": "8% no MÁXIMO (teto R$50)",
    "desc": "Independente do preço do seu produto, a KIYVO nunca cobra mais de R$50 por venda. Acima de R$625, você economiza muito."
  },
  {
    "icone": "Clock",
    "titulo": "Saque PIX em 1 dia útil",
    "desc": "Após os 7 dias de garantia, dinheiro na conta em 1 dia útil por PIX. Taxa fixa R$0,99."
  },
  {
    "icone": "TrendingUp",
    "titulo": "200+ agentes IA de vendas",
    "desc": "Copy, banners, SEO, CRO, Black Friday, WhatsApp, VSL, tributos, jurídico, contratos — tudo nativo."
  },
  {
    "icone": "Shield",
    "titulo": "Garantia anti-bloqueio",
    "desc": "Políticas claras publicadas publicamente. Se vendeu de forma legal, seu dinheiro e conta estão seguros."
  },
  {
    "icone": "Banknote",
    "titulo": "Plano free SEM mensalidade",
    "desc": "Começa hoje a vender: 8% + R$0,50 por venda, zero mensalidade, zero custo fixo."
  },
  {
    "icone": "Zap",
    "titulo": "Boost de produtos e Taxa Zero",
    "desc": "Imprima seu produto na home por R$4,90. Novos vendedores têm 5.000 vendas COM TAXA 0%."
  }
];
const comparativo = [
  {
    "criterio": "Taxa sobre venda",
    "concorrente": "A partir de 5,99% + R$0,50 (com mensalidade)",
    "kiyvo": "8% + R$0,50 (teto R$50)"
  },
  {
    "criterio": "Tempo de saque",
    "concorrente": "3-15+ dias",
    "kiyvo": "1 dia útil (após 7 dias de garantia)"
  },
  {
    "criterio": "Saque mínimo",
    "concorrente": "R$20-50",
    "kiyvo": "R$30,00"
  },
  {
    "criterio": "Taxa de saque",
    "concorrente": "Variável",
    "kiyvo": "R$0,99 fixo via PIX"
  },
  {
    "criterio": "Plano grátis sem mensalidade",
    "concorrente": "Raramente",
    "kiyvo": "Sim (free para sempre)"
  },
  {
    "criterio": "Agentes IA inclusos",
    "concorrente": "0 ou cobrado à parte",
    "kiyvo": "200+ gratuitos"
  },
  {
    "criterio": "Marketplace com tráfego próprio",
    "concorrente": "Pequeno ou nenhum",
    "kiyvo": "Sim (com busca e boost)"
  },
  {
    "criterio": "Taxa Zero para novos",
    "concorrente": "Não",
    "kiyvo": "Sim (primeiras 5.000 vendas)"
  }
];

export default function AlternativaPage() {
  return (
    <LongTailPage
      titulo={<>Alternativa à <span className="text-brand-500">Ticto</span> em 2026 — taxa de 8% no máximo</>}
      subtitulo={`Cansado das taxas e limitações da Ticto? Conheça a KIYVO, marketplace brasileiro de produtos digitais com taxa transparente, saque rápido via PIX e 200+ agentes de IA inclusos.`}
      concorrente="Ticto"
      concorrenteTaxa="A partir de 5,99% + R$0,50 (com mensalidade)"
      concorrenteProblemas={problemas}
      kiyvoDiferenciais={diferenciais}
      comparativo={comparativo}
    />
  )
}
