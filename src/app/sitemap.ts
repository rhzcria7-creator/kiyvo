import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

// Páginas estáticas principais (marketing + catálogo + institucional)
const STATIC_PATHS = [
  '',
  '/categorias',
  '/buscar',
  '/como-funciona',
  '/planos',
  '/indique-ganhe',
  '/faq',
  '/suporte',
  '/garantia',
  '/termos',
  '/privacidade',
  '/politica-cookies',
  '/seguranca',
  '/tarifas',
  '/sobre',
  '/parceiros',
  '/depoimentos',
  '/comunidade',
  '/recompensas',
  '/blog',
  '/changelog',
  '/comparativo',
  '/transparencia',
  '/boost',
  '/renda-extra',
  '/saque',
  '/roadmap',
  '/recompensas',
  '/calculadora-lucro',
  '/calcular-taxas',
  '/simulador-taxas',
  '/cupons',
  '/afiliados',
  '/programa-afiliados',
  '/vender',
  '/precos',
  '/precificacao',
  '/ofertas',
  '/freelance',
  '/comprar-guia',
  '/vender-guia',
  '/tutorial/kd-points',
  '/tutorial/primeiros-passos',
  '/tutorial/como-comprar',
  '/tutorial/como-vender',
  '/tutorial/seguranca',
  '/newsletter',
  // Páginas SEO de cauda longa (alternativas a concorrentes)
  '/alternativa/hotmart',
  '/alternativa/monetizze',
  '/alternativa/eduzz',
  '/alternativa/kiwify',
  '/alternativa/ggmax',
  '/alternativa/microsoft-store',
  '/alternativa/braip',
  '/alternativa/ticto',
  '/alternativa/hubla',
  '/alternativa/payt',
  '/alternativa/perfectpay',
  '/alternativa/yampi',
  '/alternativa/doppus',
  '/alternativa/lastlink',
  '/melhor-plataforma-produtos-digitais',
  '/taxa-zero',
  '/blackfriday',
  // Blog posts
  '/blog/como-vender-cursos-online',
  '/blog/quanto-custa-vender-online',
  '/blog/melhor-plataforma-para-vender-cursos',
  '/blog/como-ganhar-dinheiro-com-ia',
]

// Páginas de agentes IA (todas as do sistema)
const AGENT_SLUGS = [
  'bannerforge','copymaster','pricemaster','hunter','reviewshield','adoptimizer',
  'replymaster','seoboost','seoscore','translate','promogen','responder','scarcity',
  'titlesplit','scriptforge','emailforge','funnelforge','descfetcher','taxcalc',
  'competidor','trafficoptimizer','hashtagger','captionforge','objectiondestroyer',
  'biogenerator','faqmaker','contentcalendar','seooptimizer','personabuilder',
  'nameforge','promptengineer','whatsappforge','storybuilder','pixelperfect',
  'urltracker','landingforge','bulletforge','abtester','automod','dynamicpricing',
  'churnpredictor','smartcart','retargetpredictor','titlescorer','thumbnailmaker',
  'scriptshort','offerstacker','voiceclonepreview','landingchecker','reviewreplier',
  'competitormonitor','socialproofengine','quizfunnel','seobriefing','contentauditor',
  'emojipicker','launchchecklist','personacraft','urgenciamaker','metricsanalyzer',
  'webhooktester','qrcodegen','senhaforge','validatorbr','contadorregressivo',
  'gradehorarios','ctamaker','npsanalyzer','slugmaker','headlineanalyzer',
  'emailsequencia','blogideia','problemaagitacao','podcastscript','faturaprojecao',
  'whatsappboasvindas','invoicegen','testimonialcrafter','plrsearch','warmup',
  'affiliateproposal','faqauto','referralbadge','riskscore','feedbackinterpreter',
  'valedecesconto','contratorapido','checkoutmax','scarcitypro','provaosocialpro',
  'emailboasvindas','leadmagnet','whatsappvendas','ofertarelampago','bundlecriador',
  'faqobjetor','quizvendas','captionvendas','refundminimizer','afiliadorpro',
  'metodohero','nomesdominio','checklistvp','clientepravida','scriptbotresposta',
  'viralloop','kdcalculator','abtestideas','socialcopy','cancelasaver','seotags',
  'precoguerra','lucromax','upsellmax','carrinhoabandonado','precificacaointeligente',
  'garantia','aumentarticket','precoassinatura','upsellcarrinho','cupomrelampago',
  'upgradeplano','vendacruzada','boasvindascompra','roianuncios','blackfridayplaybook',
  'simuladorsaque','mrrcalc','scriptlancamento','copylancamento','upsellengine',
  'vendascruzadas','warmup','bonusforge','cuponmaker','ofertarapida','whatsappvendas',
  // v10 MONSTER novos 22 agentes
  'blackfridayplaybook','leadmagnetpro','tiktokscripts','seolocalpages','roiads',
  'upsellquiz','canvaprompts','hotjarheatmap','emailswipefile','whatsappfunnel',
  'instagramgrid','reviewrequest','salespageminimalista','podcastguestpitch',
  'croaudit','kdpointscampaign','plrspinner','launchecklist30d','vslgenerator',
  'churnreduce','webhooktest','bolsadeapostas',
  // v10.1 BOOM — 25 novos agentes
  'cartareembolso','calculadoratributos','contratoprestserv','otimizadoranuncios',
  'quizcriador','audiencelab','roteiroreels','legendainsta','emailboasvindasbf',
  'criticanegativa','descricaoproduto','polosprivados','termosuso','scriptprejulgado',
  'calendarioconteudo','ofertairresistivel','tituloviral','whatsappsequencia',
  'personaplus','checkoutkick','emailrecuperacao','historiasucesso','faqproduto',
  'calculadorapl','planilhagastos',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticUrls = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' as const : path.startsWith('/blog') || path.startsWith('/alternativa') ? 'weekly' as const : 'weekly' as const,
    priority: path === '' ? 1 : path.startsWith('/categorias') || path.startsWith('/buscar') || path.startsWith('/alternativa') ? 0.9 : path.startsWith('/blog') ? 0.8 : 0.7,
  }))

  const agentUrls = AGENT_SLUGS.map((slug) => ({
    url: `${BASE_URL}/agentes/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Produtos dinâmicos (se conectar ao Supabase)
  let productUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('status', 'active')
      .limit(5000)
    if (data) {
      productUrls = data.map((p: any) => ({
        url: `${BASE_URL}/p/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch {
    // Em build sem Supabase, apenas ignorar — não quebrar o sitemap
  }

  return [...staticUrls, ...agentUrls, ...productUrls]
}
