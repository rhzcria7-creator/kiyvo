// Agente ReferralBadge — gera selos de indicação ("eu recomendo") em SVG
export interface ReferralBadgeInput { nome: string; codigo: string; corPrimaria?: string; corSecundaria?: string; texto?: string }
export interface ReferralBadgeResult { svg: string; htmlEmbed: string; textoSelo: string }

export function gerarBadgeIndicacao(input: ReferralBadgeInput): ReferralBadgeResult {
  const { nome, codigo, corPrimaria = '#2563EB', corSecundaria = '#0F172A' } = input
  const iniciais = nome.split(' ').map(p=>p[0]?.toUpperCase()).slice(0,2).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="130" viewBox="0 0 320 130">
  <defs><linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${corPrimaria}"/><stop offset="100%" stop-color="${corSecundaria}"/></linearGradient></defs>
  <rect width="320" height="130" rx="20" fill="url(#gb)"/>
  <circle cx="35" cy="65" r="28" fill="white" opacity="0.15"/>
  <text x="35" y="75" text-anchor="middle" fill="white" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="26">${iniciais}</text>
  <text x="80" y="52" fill="white" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="16">${nome} recomenda</text>
  <text x="80" y="78" fill="white" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="12" opacity="0.85">Use o código</text>
  <rect x="80" y="88" width="160" height="28" rx="14" fill="white"/>
  <text x="160" y="108" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="15" fill="${corPrimaria}">${codigo}</text>
  <circle cx="280" cy="65" r="22" fill="white" opacity="0.2"/>
  <text x="280" y="72" text-anchor="middle" font-size="24">🎁</text>
</svg>`
  const htmlEmbed = `<a href="https://kiyvo.com.br?ref=${codigo}" style="display:inline-block">${svg.replace(/\n/g,'')}</a>`
  return { svg, htmlEmbed, textoSelo: `${nome} recomenda KIYVO — use o código ${codigo} e ganhe 100 KD Points` }
}
