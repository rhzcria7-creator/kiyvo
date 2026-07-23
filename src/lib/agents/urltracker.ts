// Agente URLTracker — gerador de UTM links e rastreamento
export interface UTMInput {
  urlBase: string
  fonte: 'google'|'facebook'|'instagram'|'tiktok'|'youtube'|'email'|'whatsapp'|'afiliado'|'organico'|string
  midia?: string
  campanha: string
  conteudo?: string
  termo?: string
}
export interface UTMOutput { url: string; utmString: string; explicacao: Record<string,string>; qrcode?: string; urlsPlataformas: Array<{plataforma: string; url: string}> }
export function gerarUtmLink(input: UTMInput): UTMOutput {
  const { urlBase, fonte, campanha, conteudo = '', termo = '', midia = '' } = input
  const u = new URL(urlBase.startsWith('http') ? urlBase : 'https://' + urlBase)
  const params = new URLSearchParams()
  params.set('utm_source', fonte)
  params.set('utm_medium', midia || fonteMidia(fonte))
  params.set('utm_campaign', campanha.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  if (conteudo) params.set('utm_content', conteudo.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  if (termo) params.set('utm_term', termo.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  // Adiciona utm para identificar plataforma KIYVO
  params.set('utm_platform','kiyvo')
  const utmString = params.toString()
  const url = `${u.origin}${u.pathname}${u.search ? u.search + '&' : '?'}${utmString}`
  const plataformas: Array<{plataforma: string; url: string}> = [
    { plataforma: 'Meta Ads (FB/IG)', url: buildUrl(u, 'facebook', 'paid_social', campanha, conteudo, termo) },
    { plataforma: 'TikTok Ads', url: buildUrl(u, 'tiktok', 'paid_social', campanha, conteudo, termo) },
    { plataforma: 'Google Ads', url: buildUrl(u, 'google', 'cpc', campanha, conteudo, termo) },
    { plataforma: 'YouTube', url: buildUrl(u, 'youtube', 'video', campanha, conteudo, termo) },
    { plataforma: 'E-mail marketing', url: buildUrl(u, 'email', 'email', campanha, conteudo, termo) },
    { plataforma: 'WhatsApp', url: buildUrl(u, 'whatsapp', 'messaging', campanha, conteudo, termo) },
    { plataforma: 'Afiliado', url: buildUrl(u, 'afiliado', 'affiliate', campanha, conteudo, termo) },
  ]
  return {
    url,
    utmString,
    explicacao: {
      utm_source: `Onde o tráfego vem de (ex: ${fonte})`,
      utm_medium: 'Tipo de mídia: cpc, paid_social, email, affiliate',
      utm_campaign: 'Nome da campanha (ex: black_friday_2025)',
      utm_content: 'Diferencia criativos/ad sets (opcional)',
      utm_term: 'Palavra-chave (Google Ads — opcional)',
    },
    urlsPlataformas: plataformas,
  }
}
function buildUrl(u: URL, source: string, medium: string, campaign: string, content: string, term: string): string {
  const p = new URLSearchParams()
  p.set('utm_source', source)
  p.set('utm_medium', medium)
  p.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  if (content) p.set('utm_content', content.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  if (term) p.set('utm_term', term.toLowerCase().replace(/\s+/g,'_').slice(0,50))
  p.set('utm_platform','kiyvo')
  return `${u.origin}${u.pathname}?${p.toString()}`
}
function fonteMidia(fonte: string): string {
  const map: Record<string,string> = {
    google:'cpc', facebook:'paid_social', instagram:'social', tiktok:'paid_social', youtube:'video',
    email:'email', whatsapp:'messaging', afiliado:'affiliate', organico:'organic',
  }
  return map[fonte.toLowerCase()] || 'referral'
}
export function formatarRelatorioUtm(dados: Array<{source: string; medium: string; campaign: string; visits: number; conversions: number; receita: number}>): string {
  const linhas = dados.map(d => {
    const cpa = d.conversions > 0 ? d.receita/d.conversions : 0
    return `${d.source} (${d.campaign}): ${d.visits} visitas, ${d.conversions} vendas, R$ ${d.receita.toFixed(2)} receita, CPA R$ ${cpa.toFixed(2)}`
  }).join('\n')
  return linhas
}
