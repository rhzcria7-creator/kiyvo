const fs = require('fs');
const path = require('path');
const agentsDir = path.join(__dirname, '..', 'src', 'lib', 'agents');

const agents = [
  { file: 'checkoutmax', fn: 'runCheckoutMax', iface: 'CheckoutMaxInput' },
  { file: 'scarcitypro', fn: 'runScarcityPro', iface: 'ScarcityProInput' },
  { file: 'provaosocialpro', fn: 'runProvaSocialPro', iface: 'ProvaSocialProInput' },
  { file: 'emailboasvindas', fn: 'runEmailBoasVindas', iface: 'EmailBoasVindasInput' },
  { file: 'leadmagnet', fn: 'runLeadMagnet', iface: 'LeadMagnetInput' },
  { file: 'whatsappvendas', fn: 'runWhatsAppVendas', iface: 'WhatsAppVendasInput' },
  { file: 'ofertarelampago', fn: 'runOfertaRelampago', iface: 'OfertaRelampagoInput' },
  { file: 'bundlecriador', fn: 'runBundleCriador', iface: 'BundleCriadorInput' },
  { file: 'faqobjetor', fn: 'runFAQObjetor', iface: 'FAQObjetorInput' },
  { file: 'quizvendas', fn: 'runQuizVendas', iface: 'QuizVendasInput' },
  { file: 'captionvendas', fn: 'runCaptionVendas', iface: 'CaptionVendasInput' },
  { file: 'refundminimizer', fn: 'runRefundMinimizer', iface: 'RefundMinimizerInput' },
  { file: 'afiliadorpro', fn: 'runAfiliadorPro', iface: 'AfiliadorProInput' },
  { file: 'metodohero', fn: 'runMetodoHero', iface: 'MetodoHeroInput' },
  { file: 'nomesdominio', fn: 'runNomesDominio', iface: 'NomesDominioInput' },
  { file: 'checklistvp', fn: 'runChecklistPaginaVendas', iface: 'ChecklistPaginaVendasInput' },
  { file: 'clientepravida', fn: 'runClientePraVida', iface: 'ClientePraVidaInput' },
  { file: 'scriptbotresposta', fn: 'runScriptBotResposta', iface: 'ScriptBotRespostaInput' },
  { file: 'viralloop', fn: 'runViralLoop', iface: 'ViralLoopInput' },
  { file: 'kdcalculator', fn: 'runKDCalculator', iface: 'KDCalculatorInput' },
  { file: 'abtestideas', fn: 'runABTestIdeas', iface: 'ABTestIdeasInput' },
  { file: 'socialcopy', fn: 'runSocialCopy', iface: 'SocialCopyInput' },
  { file: 'cancelasaver', fn: 'runCancelaSaver', iface: 'CancelaSaverInput' },
  { file: 'seotags', fn: 'runSEOTags', iface: 'SEOTagsInput' },
  { file: 'precoguerra', fn: 'runPrecoGuerra', iface: 'PrecoGuerraInput' },
];

for (const a of agents) {
  const src = `// Re-export do agente ${a.fn} (implementado em ./v9-agents)\nexport { ${a.fn} } from './v9-agents'\nexport type { ${a.iface} } from './v9-agents'\n`;
  fs.writeFileSync(path.join(agentsDir, a.file + '.ts'), src);
}
console.log('✅ Re-exports corrigidos com export type');
