const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const files = ['saquesimulator','precoassinatura','upsellcarrinho','cupomrelampago','upgradeplano','vendacruzada','boasvindas','roiads','bfstrategy','mrrcalc','sniperlancamento','copysniper'];

// MW
const mw = path.join(root, 'src', 'middleware.ts');
let s = fs.readFileSync(mw, 'utf8');
const marker = "// FIM DA WHITELIST";
if (!s.includes("'/agentes/saquesimulator'")) {
  const newRoutes = files.map(f => `  '/agentes/${f}', '/api/agents/${f}',`).join('\n');
  s = s.replace(marker, newRoutes + '\n' + marker);
  fs.writeFileSync(mw, s);
  console.log('✅ middleware atualizado');
}

// Hub
const hub = path.join(root, 'src', 'app', 'agentes', 'page.tsx');
let h = fs.readFileSync(hub, 'utf8');
const meta = {
  saquesimulator: { nome: 'Simulador de Saque', desc: 'Quanto chega na conta', icon: '💸', cor: 'bg-gradient-to-br from-green-500 to-emerald-700' },
  precoassinatura: { nome: 'Preço de Assinatura', desc: 'Mensal/trimestral/anual', icon: '🔁', cor: 'from-blue-500 to-indigo-700' },
  upsellcarrinho: { nome: 'Upsell de Carrinho', desc: 'Bump + upsell', icon: '🛒', cor: 'from-purple-500 to-pink-600' },
  cupomrelampago: { nome: 'Cupom Relâmpago', desc: 'Cupom rápido de desconto', icon: '⚡', cor: 'from-yellow-500 to-orange-600' },
  upgradeplano: { nome: 'Oferta Upgrade', desc: 'Convence upgrade de plano', icon: '🚀', cor: 'from-emerald-500 to-teal-700' },
  vendacruzada: { nome: 'Venda Cruzada', desc: 'Sugere complementos', icon: '🔗', cor: 'from-rose-500 to-pink-700' },
  boasvindas: { nome: 'Boas-Vindas Compra', desc: 'Mensagem pós-compra', icon: '🎉', cor: 'from-pink-500 to-fuchsia-700' },
  roiads: { nome: 'ROI de Anúncios', desc: 'Calcula se tráfego pago dá lucro', icon: '📊', cor: 'from-orange-500 to-red-700' },
  bfstrategy: { nome: 'Black Friday Playbook', desc: 'Estratégia BF completa', icon: '🖤', cor: 'from-slate-800 to-black' },
  mrrcalc: { nome: 'MRR Calculator', desc: 'Receita recorrente e LTV', icon: '📈', cor: 'from-cyan-500 to-blue-700' },
  sniperlancamento: { nome: 'Script Lançamento 7d', desc: 'Cronograma completo', icon: '🎯', cor: 'from-violet-500 to-purple-700' },
  copysniper: { nome: 'Copy Lançamento', desc: 'Emails que convertem', icon: '🎯', cor: 'from-red-500 to-rose-700' },
};
const hubMarker = '// === FIM DOS AGENTES ===';
if (!h.includes("id: 'saquesimulator'")) {
  const blocos = files.map(f => {
    const m = meta[f];
    return `  { id: '${f}', nome: ${JSON.stringify(m.nome)}, desc: ${JSON.stringify(m.desc)}, icone: ${JSON.stringify(m.icon)}, cor: '${m.cor}', categoria: 'Monetização & Vendas', rota: '/agentes/${f}' },`;
  }).join('\n');
  h = h.replace(hubMarker, blocos + '\n' + hubMarker);
  fs.writeFileSync(hub, h);
  console.log('✅ Hub atualizado');
}
