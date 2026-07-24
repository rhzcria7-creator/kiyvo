const fs = require('fs');
const path = require('path');

const v9Files = [
  'checkoutmax','scarcitypro','provaosocialpro','emailboasvindas','leadmagnet',
  'whatsappvendas','ofertarelampago','bundlecriador','faqobjetor','quizvendas',
  'captionvendas','refundminimizer','afiliadorpro','metodohero','nomesdominio',
  'checklistvp','clientepravida','scriptbotresposta','viralloop','kdcalculator',
  'abtestideas','socialcopy','cancelasaver','seotags','precoguerra',
  'lucromax','upsellmax','carrinhoabandonado','precificacaointeligente','garantia',
];

const fnNameFromFile = {
  checkoutmax: 'CheckoutMax', scarcitypro: 'ScarcityPro', provaosocialpro: 'ProvaSocialPro',
  emailboasvindas: 'EmailBoasVindas', leadmagnet: 'LeadMagnet', whatsappvendas: 'WhatsAppVendas',
  ofertarelampago: 'OfertaRelampago', bundlecriador: 'BundleCriador', faqobjetor: 'FAQObjetor',
  quizvendas: 'QuizVendas', captionvendas: 'CaptionVendas', refundminimizer: 'RefundMinimizer',
  afiliadorpro: 'AfiliadorPro', metodohero: 'MetodoHero', nomesdominio: 'NomesDominio',
  checklistvp: 'ChecklistPaginaVendas', clientepravida: 'ClientePraVida',
  scriptbotresposta: 'ScriptBotResposta', viralloop: 'ViralLoop', kdcalculator: 'KDCalculator',
  abtestideas: 'ABTestIdeas', socialcopy: 'SocialCopy', cancelasaver: 'CancelaSaver',
  seotags: 'SEOTags', precoguerra: 'PrecoGuerra', lucromax: 'LucroMax', upsellmax: 'UpsellMax',
  carrinhoabandonado: 'CarrinhoAbandonado', precificacaointeligente: 'PrecificacaoInteligente',
  garantia: 'Garantia',
};

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', 'agents');

for (const file of v9Files) {
  const fn = fnNameFromFile[file];
  const runFn = 'run' + fn;
  const content = `// POST /api/agents/${file}
import { NextRequest, NextResponse } from 'next/server'
import { ${runFn} } from '@/lib/agents/${file}'
import { getPlanForUser } from '@/lib/agents/plans'
import { getUsage, setUsage, trackUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'
    let userPlano = 'free'
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: profile } = await supabase
          .from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (profile as any)?.plano || 'free'
      }
    } catch { /* anon ok */ }

    const input = await request.json()
    const plan = getPlanForUser({ plano: userPlano as any })
    const result = await ${runFn}(input, { userId, plan } as any)

    if (userId !== 'anon') {
      try {
        const u = getUsage(userId)
        u.copiesHoje = (u.copiesHoje || 0) + 1
        setUsage(userId, u)
        trackUsage(userId, '${file}')
      } catch { /* ignore */ }
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 })
  }
}
`;
  fs.writeFileSync(path.join(apiDir, file, 'route.ts'), content);
}
console.log('✅ Rotas refeitas');
