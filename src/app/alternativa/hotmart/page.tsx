// /alternativa/hotmart — página SEO de cauda longa "alternativa à Hotmart"
import type { Metadata } from 'next'
import Link from 'next/link'
import { LongTailPage } from '@/components/seo/LongTailPage'

export const metadata: Metadata = {
  title: 'Alternativa à Hotmart em 2026: Taxa 8% Máx (teto R$50) | KIYVO',
  description: 'Procurando alternativa à Hotmart? KIYVO cobra no MÁXIMO 8% + R$0,50 com teto de R$50 por venda — a metade da Hotmart. Saque PIX em 1 dia útil, 200+ agentes IA, sem letras miúdas.',
  keywords: ['alternativa hotmart', 'substituta hotmart', 'plataforma melhor que hotmart', 'taxa menor que hotmart', 'vender cursos online brasil', 'kiyvo vs hotmart'],
  alternates: { canonical: 'https://kiyvo.com.br/alternativa/hotmart' },
  openGraph: {
    title: 'Alternativa à Hotmart com taxa JUSTA | KIYVO',
    description: 'KIYVO: 8% máximo (teto R$50) — menos da metade da Hotmart. Saque PIX em 1 dia útil.',
    url: 'https://kiyvo.com.br/alternativa/hotmart',
    type: 'website',
  },
}

export default function AlternativaHotmart() {
  return (
    <LongTailPage
      titulo={<>Alternativa à <span className="text-brand-500">Hotmart</span> em 2026 — taxa de 8% no máximo</>}
      subtitulo="Cansado de pagar taxas abusivas, saques travados e burocracia na Hotmart? Conheça a KIYVO, marketplace brasileiro de produtos digitais com taxa transparente de até 8% + R$0,50 (teto R$50) e saque PIX em 1 dia útil."
      concorrente="Hotmart"
      concorrenteTaxa="10,99% + R$1,00 por venda (sem teto)"
      concorrenteProblemas={[
        'Taxa de 10,99% + R$1 por venda SEM TETO — em produto de R$1.000 eles ficam com R$110,90',
        'Saque só em 15+ dias corridos (mesmo após confirmação do pagamento)',
        'Saque mínimo de R$20 para afiliados',
        'Afiliado sem garantia de recebimento por atribuição falha',
        'Processo de aprovação demora dias',
        'Bloqueios de conta sem aviso prévio (muitos relatos na internet)',
        'Pouca automação para vendedores (sem IA integrada)',
        'Layout antigo e UX complicada',
      ]}
      kiyvoDiferenciais={[
        { icone: 'BadgePercent', titulo: '8% no MÁXIMO (teto R$50)', desc: 'Em produtos caros (acima de R$625) você paga MUITO menos que na Hotmart. Teto de R$50 protege sua margem.' },
        { icone: 'Clock', titulo: 'Saque PIX em 1 dia útil', desc: 'Após 7 dias de garantia, o dinheiro cai na sua conta via PIX em 1 dia útil. Taxa fixa de R$0,99 por saque (transparente).' },
        { icone: 'TrendingUp', titulo: '200+ agentes IA de vendas', desc: 'Tem IA de copy, ROI, page-check, CRO, Black Friday, funil WhatsApp, VSL e muito mais — nativo na plataforma, sem pagar extra.' },
        { icone: 'Shield', titulo: 'Garantia anti-bloqueio', desc: 'Se você vender produtos legais e seguir as regras, não há bloqueio arbitrário. Políticas claras publicadas publicamente.' },
        { icone: 'Banknote', titulo: 'Saque mínimo R$30', desc: 'Você não precisa acumular fortunas para sacar. R$30 mínimos e o dinheiro é seu.' },
        { icone: 'Zap', titulo: 'Boost de produtos nativo', desc: 'Imprima seu produto na página inicial por R$4,90 a R$199,90 — sem leilão de CPC complicado, sem surpresas.' },
      ]}
      comparativo={[
        { criterio: 'Taxa sobre venda', concorrente: '10,99% + R$1,00 (sem teto)', kiyvo: '8% + R$0,50 (teto R$50)' },
        { criterio: 'Tempo de saque', concorrente: '15+ dias após venda', kiyvo: '1 dia útil (após garantia)' },
        { criterio: 'Saque mínimo', concorrente: 'R$20,00 (afiliado)', kiyvo: 'R$30,00' },
        { criterio: 'Taxa de saque', concorrente: 'Variável (R$1,99 + 3,99%)', kiyvo: 'R$0,99 fixo (PIX)' },
        { criterio: 'Plano grátis', concorrente: 'Taxa cheia sempre', kiyvo: 'Sem mensalidade, só paga quando vende' },
        { criterio: 'Agentes IA inclusos', concorrente: 'Nenhum', kiyvo: '200+ agentes gratuitos' },
        { criterio: 'Atribuição de afiliado', concorrente: 'Cookie 60 dias (falha conhecida)', kiyvo: 'First-click + last-click, 30 dias' },
        { criterio: 'KD Points (fidelidade)', concorrente: 'Não tem', kiyvo: '100 KD = R$1 de desconto' },
      ]}
      faq={[
        { pergunta: 'A KIYVO é brasileira?', resposta: 'Sim. KIYVO é uma empresa brasileira registrada, com CNPJ ativo, servidores no Brasil (Supabase São Paulo) e suporte em português 7 dias por semana.' },
        { pergunta: 'Consigo migrar meu produto da Hotmart para a KIYVO?', resposta: 'Sim. Você pode cadastrar o mesmo produto na KIYVO em menos de 10 minutos e começar a vender imediatamente. Não há fidelidade.' },
        { pergunta: 'A KIYVO tem programa de afiliados?', resposta: 'Sim. Afiliado ganha comissão configurável pelo vendedor, com rastreamento por link único e primeira + última atribuição.' },
        { pergunta: 'Quanto eu pago por mês para usar?', resposta: 'ZERO. Não tem mensalidade, não tem taxa de adesão. Você só paga quando vende: 8% + R$0,50 com teto de R$50. Planos Plus/Pro/Vendor Pro (opcionais) reduzem a taxa mas não são obrigatórios.' },
        { pergunta: 'A KIYVO aceita PIX?', resposta: 'Sim. PIX com aprovação instantânea e 0% de taxa (cobre apenas o custo do gateway). Saque em PIX em 1 dia útil.' },
        { pergunta: 'Como funciona o "teto de R$50"?', resposta: 'Independente do preço do seu produto, a KIYVO nunca vai reter mais do que R$50 em comissão por venda. Em um produto de R$2.000, por exemplo, a Hotmart cobra R$220,80 e a KIYVO cobra apenas R$50. Uma economia de mais de R$170 por venda.' },
      ]}
      cta={{
        titulo: 'Migre para a KIYVO em 10 minutos e comece a pagar MUITO menos',
        subtitulo: 'Cadastro grátis, sem mensalidade, sem letras miúdas. Publique seu primeiro produto ainda hoje.',
        botao: 'Criar conta gratuita',
        href: '/cadastro',
      }}
      tags={['alternativa hotmart', 'melhor plataforma de produtos digitais', 'vender curso online', 'plataforma brasileira', 'taxa transparente']}
    />
  )
}
