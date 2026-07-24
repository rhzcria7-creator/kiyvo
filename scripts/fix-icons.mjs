// Corrige imports de ícones nas páginas dos novos agentes
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ICONS = {
  blackfridayplaybook: 'Flame',
  leadmagnetpro: 'Magnet',
  tiktokscripts: 'Clapperboard',
  seolocalpages: 'MapPin',
  roiads: 'BarChart3',
  upsellquiz: 'Target',
  canvaprompts: 'Palette',
  hotjarheatmap: 'Flame',
  emailswipefile: 'Mail',
  whatsappfunnel: 'MessageCircle',
  instagramgrid: 'Camera',
  reviewrequest: 'Star',
  salespageminimalista: 'Banknote',
  podcastguestpitch: 'Mic',
  croaudit: 'TrendingUp',
  kdpointscampaign: 'Gem',
  plrspinner: 'RefreshCw',
  launchecklist30d: 'Rocket',
  vslgenerator: 'Video',
  churnreduce: 'Shield',
  webhooktest: 'Plug',
  bolsadeapostas: 'Dice',
}

const ROOT = '/home/user/kiyvo/src/app/agentes'

for (const [file, icon] of Object.entries(ICONS)) {
  const p = join(ROOT, file, 'page.tsx')
  try {
    let s = readFileSync(p, 'utf8')
    s = s.replace(
      /import \{[^}]*\} from 'lucide-react'/,
      `import { ${icon}, CheckCircle, Copy, ExternalLink } from 'lucide-react'`
    )
    s = s.replace(
      /const icon = <[^>]*>/,
      `const icon = <${icon} className="w-7 h-7" />`
    )
    // Remove any cast errors like "Flame," typo:
    s = s.replace(/<(Flame|Magnet|Clapperboard|MapPin|BarChart3|Target|Palette|Mail|MessageCircle|Camera|Star|Banknote|Mic|TrendingUp|Gem|RefreshCw|Rocket|Video|Shield|Plug|Dice),?\s*className="w-7 h-7" \/>/, `<${icon} className="w-7 h-7" />`)
    writeFileSync(p, s)
  } catch (e: any) {
    console.error('Erro em', file, e.message)
  }
}
console.log('✅ Import de ícones corrigido')
