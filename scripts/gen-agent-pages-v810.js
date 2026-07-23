// Gera páginas simples para os novos agentes v8.10
const fs = require('fs')
const path = require('path')

const agentes = [
  { slug: 'headlineanalyzer', nome: 'HeadlineAnalyzer', tagline: '10 fórmulas clássicas de headlines que vendem', icone: 'Type', cor: 'from-red-500 to-rose-600', api: '/api/agents/headlineanalyzer',
    fields: [['nicho','Nicho','text','marketing'],['produto','Produto','text','Curso X']],
    render: 'headline' },
  { slug: 'emailsequencia', nome: 'EmailSequencia', tagline: 'Sequência completa de e-mails de 7 dias', icone: 'Mail', cor: 'from-cyan-500 to-blue-600', api: '/api/agents/emailsequencia',
    fields: [['produto','Produto','text',''],['nicho','Nicho','text','marketing'],['publico','Público','text','amigo'],['preco','Preço (R$)','number','97']],
    render: 'emails' },
  { slug: 'blogideia', nome: 'BlogIdeia', tagline: '15 ideias de posts para blog com ângulos e palavras-chave', icone: 'Newspaper', cor: 'from-indigo-500 to-violet-600', api: '/api/agents/blogideia',
    fields: [['nicho','Nicho','text',''],['qtd','Quantidade','number','15']],
    render: 'blog' },
  { slug: 'problemaagitacao', nome: 'PAS Copy', tagline: 'Copy com fórmula Problema-Agitação-Solução', icone: 'Flame', cor: 'from-red-500 to-orange-500', api: '/api/agents/problemaagitacao',
    fields: [['dor','Dor principal','text','não consegue vender'],['publico','Público','text','iniciantes'],['solucao','Solução','text','meu método'],['produto','Produto','text','']],
    render: 'pas' },
  { slug: 'podcastscript', nome: 'PodcastScript', tagline: 'Pauta completa de podcast/entrevista com blocos e perguntas', icone: 'AudioLines', cor: 'from-purple-500 to-pink-600', api: '/api/agents/podcastscript',
    fields: [['tema','Tema','text',''],['convidado','Convidado','text','João Silva'],['duracao','Duração (min)','number','40']],
    render: 'podcast' },
  { slug: 'faturaprojecao', nome: 'FaturaProjeção', tagline: 'Projeção de faturamento e lucro com cenários', icone: 'BarChart3', cor: 'from-emerald-500 to-green-600', api: '/api/agents/faturaprojecao',
    fields: [['visitas','Visitantes/mês','number','1000'],['tx','Taxa conversão (0.02 = 2%)','number','0.02'],['aov','Ticket médio (R$)','number','97'],['cpa','CPA (R$)','number','2']],
    render: 'projecao' },
  { slug: 'whatsappboasvindas', nome: 'WhatsAppBoasVindas', tagline: 'Fluxo automático de boas-vindas para WhatsApp/IG', icone: 'MessageCircle', cor: 'from-green-500 to-emerald-600', api: '/api/agents/whatsappboasvindas',
    fields: [['nome','Nome lead','text','Maria'],['nicho','Nicho','text','marketing'],['produto','Produto','text',''],['tom','Tom','select','amigavel']],
    render: 'whats' },
  { slug: 'invoicegen', nome: 'InvoiceGen', tagline: 'Recibos/NF em HTML prontos para imprimir', icone: 'Receipt', cor: 'from-slate-600 to-slate-900', api: '/api/agents/invoicegen',
    fields: [['clienteNome','Nome cliente','text',''],['produto','Produto','text','Curso'],['preco','Valor (R$)','number','97'],['pagamento','Pagamento','text','PIX']],
    render: 'invoice' },
  { slug: 'testimonialcrafter', nome: 'TestimonialCrafter', tagline: 'Exemplos de depoimentos para mock de layout (nunca usar em produção)', icone: 'BookHeart', cor: 'from-rose-500 to-pink-600', api: '/api/agents/testimonialcrafter',
    fields: [['produto','Produto','text',''],['qtd','Quantidade','number','5']],
    render: 'depo' },
  { slug: 'plrsearch', nome: 'PLRSearch', tagline: 'Ideias de produtos PLR por nicho', icone: 'FileText', cor: 'from-amber-500 to-orange-600', api: '/api/agents/plrsearch',
    fields: [['nicho','Nicho','text',''],['qtd','Quantidade','number','10']],
    render: 'plr' },
  { slug: 'warmup', nome: 'WarmupPlan', tagline: 'Plano de aquecimento de domínio para email marketing', icone: 'ArrowDownToLine', cor: 'from-teal-500 to-emerald-600', api: '/api/agents/warmup',
    fields: [['dominio','Domínio','text','seudominio.com'],['dias','Dias','number','14'],['vol','Volume inicial/dia','number','10']],
    render: 'warmup' },
  { slug: 'affiliateproposal', nome: 'AffiliateProposal', tagline: 'DM + email de proposta de parceria com afiliados', icone: 'Handshake', cor: 'from-violet-500 to-purple-700', api: '/api/agents/affiliateproposal',
    fields: [['produto','Produto','text',''],['afiliado','Afiliado','text','Criador'],['preco','Preço (R$)','number','97']],
    render: 'aff' },
  { slug: 'faqauto', nome: 'FAQAuto', tagline: 'FAQ automática baseada em nicho e objeções', icone: 'HelpCircle', cor: 'from-teal-500 to-cyan-600', api: '/api/agents/faqauto',
    fields: [['nicho','Nicho','text',''],['produto','Produto','text',''],['preco','Preço (R$)','number','97']],
    render: 'faq' },
  { slug: 'referralbadge', nome: 'ReferralBadge', tagline: 'Selo SVG "Eu recomendo" para afiliados', icone: 'FileBadge', cor: 'from-blue-500 to-indigo-600', api: '/api/agents/referralbadge',
    fields: [['nome','Seu nome','text','João'],['codigo','Código de indicação','text','JOAO10']],
    render: 'badge' },
  { slug: 'riskscore', nome: 'RiskScore', tagline: 'Score de risco antifraude para pedidos', icone: 'ShieldAlert', cor: 'from-red-600 to-rose-700', api: '/api/agents/riskscore',
    fields: [['valor','Valor (R$)','number','297'],['idadeEmail','Idade do email (dias)','number','30'],['falhas','Tentativas falhas','number','0']],
    render: 'risk' },
  { slug: 'feedbackinterpreter', nome: 'FeedbackInterpreter', tagline: 'Interpreta feedbacks, detecta sentimento e prioridade', icone: 'MessageCircleWarning', cor: 'from-orange-500 to-red-600', api: '/api/agents/feedbackinterpreter',
    fields: [['texto','Texto feedback','textarea',''],['nota','Nota (1-5)','number','5']],
    render: 'feed' },
  { slug: 'valedecesconto', nome: 'CupomMaker', tagline: 'Gera códigos de cupom criativos por tipo', icone: 'Ticket', cor: 'from-pink-500 to-rose-600', api: '/api/agents/valedecesconto',
    fields: [['tema','Tema','text','KIYVO'],['desconto','Desconto (%)','number','10'],['tipo','Tipo','select','boasvindas']],
    render: 'cupom' },
  { slug: 'contratorapido', nome: 'ContratoRápido', tagline: 'Minutas básicas (freelance, afiliado, parceria, licença)', icone: 'ScrollText', cor: 'from-slate-700 to-slate-900', api: '/api/agents/contratorapido',
    fields: [['tipo','Tipo','select','freelance'],['contratante','Contratante','text',''],['contratado','Contratado','text',''],['valor','Valor (R$)','number','1000'],['prazo','Prazo','text','30 dias'],['escopo','Escopo','text','']],
    render: 'contr' },
]

function esc(s){return String(s).replace(/"/g,'&quot;')}
function renderField(f){
  const [name,label,type,ph]=f
  if(type==='textarea')return `<Field label={${JSON.stringify(label)}}><textarea className={textareaClass} value={form.${name} as string} onChange={e=>setForm({...form,${name}:e.target.value})} placeholder={${JSON.stringify(ph)}}/></Field>`
  if(type==='select'){
    if(name==='tom'){var opts=['amigavel','profissional','descontraido']}
    else if(name==='tipo' && f[0]==='tipo' && f[3]==='boasvindas'){var opts=['boasvindas','lancamento','parceiro','recuperacao','aniversario','blackfriday']}
    else if(name==='tipo'){var opts=['prestacao','afiliado','parceria','licenca','freelance']}
    else var opts=['freelance','prestacao','afiliado','parceria','licenca']
    const optsHtml = opts.map(o=>`<option value={${JSON.stringify(o)}}>${o}</option>`).join('')
    return `<Field label={${JSON.stringify(label)}}><select className={selectClass} value={form.${name} as string} onChange={e=>setForm({...form,${name}:e.target.value})}>${optsHtml}</select></Field>`
  }
  if(type==='number')return `<Field label={${JSON.stringify(label)}}><input type="number" className={inputClass} value={form.${name} as string} onChange={e=>setForm({...form,${name}:e.target.value})} placeholder={${JSON.stringify(ph)}}/></Field>`
  return `<Field label={${JSON.stringify(label)}}><input className={inputClass} value={form.${name} as string} onChange={e=>setForm({...form,${name}:e.target.value})} placeholder={${JSON.stringify(ph)}}/></Field>`
}

function renderOut(r){
  switch(r){
    case 'headline':return `{result && (<div><h3 className="font-black text-sm mb-3">Títulos ({result.titulos.length})</h3><div className="space-y-2">{result.titulos.map((t:any,i:number)=><motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm font-bold">{t}</motion.div>)}</div></div>)}`
    case 'emails':return `{result && (<div><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">Sequência de {result.sequencia.length} emails</h3><div className="space-y-3">{result.sequencia.map((e:any,i:number)=><div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-baseline mb-2"><span className="text-[10px] font-black uppercase tracking-widest text-brand-500">Dia {e.dia}</span><span className="text-sm font-bold">{e.assunto}</span></div><p className="text-sm whitespace-pre-line text-slate-600 dark:text-slate-300">{e.corpo}</p></div>)}</div></div>)}`
    case 'blog':return `{result && (<div><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">{result.posts.length} ideias de posts</h3><div className="space-y-2">{result.posts.map((p:any,i:number)=><motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20"><div className="font-bold text-sm">{i+1}. {p.titulo}</div><div className="text-xs text-slate-500 mt-1">Ângulo: {p.angulo} · Leitura: {p.duracaoLeitura}min</div></motion.div>)}</div></div>)}`
    case 'pas':return `{result && (<div className="space-y-4"><div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white"><div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Headline</div><h3 className="text-xl font-black">{result.headline}</h3></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Hook</h4><p className="text-sm">{result.hook}</p></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Corpo</h4><p className="text-sm whitespace-pre-line">{result.corpo}</p></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Bullets</h4><ul className="space-y-1 text-sm">{result.bullets.map((b:string,i:number)=><li key={i}>{b}</li>)}</ul></div><div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold">👉 {result.cta}</div></div>)}`
    case 'podcast':return `{result && (<div className="space-y-4"><div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white"><div className="text-xs font-black uppercase opacity-80">Episódio</div><div className="text-xl font-black mt-1">{result.tituloEpisodio}</div><p className="text-sm opacity-90 mt-2">{result.descricao}</p></div><div className="space-y-2">{result.blocos.map((b:any,i:number)=><div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-baseline mb-1"><span className="text-xs font-mono text-slate-500">{b.tempo}</span><span className="text-[10px] font-black uppercase tracking-widest text-purple-600">{b.tipo}</span></div><p className="text-sm">{b.descricao}</p>{b.perguntas && <ul className="mt-2 space-y-1 text-xs text-slate-500 list-disc list-inside">{b.perguntas.map((p:string,j:number)=><li key={j}>{p}</li>)}</ul>}</div>)}</div></div>)}`
    case 'projecao':return `{result && (<div className="space-y-4"><div className="grid grid-cols-3 gap-3"><div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A] text-center"><div className="text-[10px] font-black uppercase tracking-widest text-red-500">Pior cenário</div><div className="text-lg font-black">R$ {result.piorCenario.faturamento.toFixed(0)}</div></div><div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-center"><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Realista</div><div className="text-lg font-black text-emerald-700 dark:text-emerald-300">R$ {result.resumo.faturamento.toFixed(0)}</div></div><div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-center"><div className="text-[10px] font-black uppercase tracking-widest text-brand-600">Melhor</div><div className="text-lg font-black text-brand-700 dark:text-brand-300">R$ {result.melhorCenario.faturamento.toFixed(0)}</div></div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ações prioritárias</div><ul className="space-y-1 text-sm">{result.acoes.map((a:string,i:number)=><li key={i}>→ {a}</li>)}</ul></div></div>)}`
    case 'whats':return `{result && (<div className="space-y-3 bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-2xl"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Fluxo de boas-vindas</div>{result.sequencia.map((m:any,i:number)=><motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[90%] shadow-sm"><div>{m.mensagem}</div><div className="text-right text-[10px] text-slate-400 mt-1">{m.delay}</div></motion.div>)}</div>)}`
    case 'invoice':return `{result && (<div className="space-y-3"><iframe className="w-full h-[500px] rounded-2xl border" srcDoc={result.html}/><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Totais</div><div className="flex justify-between py-1 text-sm"><span>Subtotal</span><span>R$ {result.subtotal.toFixed(2).replace('.',',')}</span></div>{result.desconto>0&&<div className="flex justify-between py-1 text-sm text-red-500"><span>Desconto</span><span>- R$ {result.desconto.toFixed(2).replace('.',',')}</span></div>}<div className="flex justify-between py-2 font-black border-t">TOTAL R$ {result.total.toFixed(2).replace('.',',')}</div></div></div>)}`
    case 'depo':return `{result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">⚠️ {result.aviso}</div><div className="grid gap-3">{result.depoimentos.map((d:any,i:number)=><motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800"><div className="flex justify-between items-start mb-2"><div><div className="font-black text-sm">{d.nome}</div><div className="text-xs text-slate-500">{d.cidade} · {'⭐'.repeat(d.estrelas)}</div></div><div className="text-xs font-bold text-amber-600">{d.titulo}</div></div><p className="text-sm">{d.texto}</p></motion.div>)}</div></div>)}`
    case 'plr':return `{result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">💡 {result.aviso}</div><div className="space-y-2">{result.produtos.map((p:any,i:number)=><div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex justify-between items-center"><div><div className="text-sm font-bold">{p.titulo}</div><div className="text-xs text-slate-500">{p.formato} · {p.idioma}</div></div><div className="text-right"><div className="font-black text-amber-600">R$ {p.precoSugerido.toFixed(2)}</div><div className="text-xs text-slate-400">VP: R$ {p.valorPercebido.toFixed(0)}</div></div></div>)}</div></div>)}`
    case 'warmup':return `{result && (<div className="space-y-4"><div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-teal-600">Taxa de entrega esperada</div><div className="text-2xl font-black text-teal-700 dark:text-teal-300">{result.taxaEsperadaEntrega}%</div></div><div className="space-y-1">{result.plano.map((p:any,i:number)=><div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-[#0B0F1A] text-sm"><span className="font-mono text-xs text-slate-500 w-12">D{p.dia}</span><span className="flex-1">{p.lista}</span><span className="font-black text-teal-600">{p.enviar}/dia</span></div>)}</div></div>)}`
    case 'aff':return `{result && (<div className="space-y-4"><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">DM curta</div><div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-sm whitespace-pre-line">{result.mensagemDM}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Proposta completa</div><pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 text-xs overflow-auto whitespace-pre-wrap">{result.propostaCompleta}</pre></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Comissão</div><div className="text-3xl font-black text-violet-600">{result.comissaoSugerida}%</div></div></div>)}`
    case 'faq':return `{result && (<div className="space-y-2">{result.faq.map((f:any,i:number)=><details key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 group"><summary className="font-bold text-sm cursor-pointer list-none flex items-center justify-between">{f.pergunta}<span className="transition group-open:rotate-45 text-xl font-thin">+</span></summary><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.resposta}</p></details>)}</div>)}`
    case 'badge':return `{result && (<div className="space-y-4"><div className="bg-slate-900 rounded-2xl p-6 flex justify-center" dangerouslySetInnerHTML={{__html:result.svg}}/><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Código embed</div><pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs overflow-auto whitespace-pre-wrap break-all">{result.htmlEmbed}</pre></div></div>)}`
    case 'risk':return `{result && (<div className="space-y-4"><div className={\`p-6 rounded-2xl text-white text-center \${result.decisao==='aprovar'?'bg-gradient-to-br from-emerald-500 to-green-600':result.decisao==='revisao'?'bg-gradient-to-br from-amber-500 to-orange-500':'bg-gradient-to-br from-red-500 to-rose-600'}\`}><div className="text-xs font-black uppercase tracking-widest opacity-80">Decisão</div><div className="text-3xl font-black uppercase my-1">{result.decisao}</div><div className="text-sm opacity-90">Score: {result.score}/100</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Fatores</div><ul className="space-y-1 text-sm">{result.fatores.map((f:string,i:number)=><li key={i} className="text-amber-700 dark:text-amber-400">⚠️ {f}</li>)}{result.fatores.length===0 && <li className="text-emerald-600">✅ Sem sinais de risco</li>}</ul></div></div>)}`
    case 'feed':return `{result && (<div className="space-y-4"><div className={\`p-4 rounded-2xl \${result.sentimento==='positivo'?'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300':result.sentimento==='negativo'?'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300':'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'}\`}><div className="text-[10px] font-black uppercase tracking-widest">{result.sentimento} · prioridade {result.prioridade}</div><div className="flex gap-1 mt-1 flex-wrap">{result.categorias.map((c:any,i:number)=><span key={i} className="px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-black uppercase">{c}</span>)}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Resposta automática</div><p className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm">{result.respostaAutomatica}</p></div></div>)}`
    case 'cupom':return `{result && (<div className="space-y-4"><div className="p-6 rounded-2xl border-4 border-dashed border-pink-500 text-center bg-pink-50 dark:bg-pink-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300 mb-2">Cupom</div><div className="text-4xl font-black font-mono text-pink-700 dark:text-pink-300 tracking-widest">{result.codigo}</div><div className="text-xs text-pink-600 dark:text-pink-300 mt-2">{result.descricao} · Válido {result.validade}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Alternativos</div><div className="flex gap-2 flex-wrap">{result.alternativos.map((a:string,i:number)=><code key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-mono">{a}</code>)}</div></div></div>)}`
    case 'contr':return `{result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">⚠️ {result.aviso}</div><div><div className="text-xl font-black mb-2">{result.titulo}</div></div><pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs whitespace-pre-wrap">{result.clausulas.join("\\n\\n")}</pre></div>)}`
    default:return `{result && <pre className="text-xs overflow-auto">{JSON.stringify(result,null,2)}</pre>}`
  }
}

// Build form init
for (const a of agentes) {
  const init = {}
  for (const f of a.fields) {
    if (f[2]==='number') init[f[0]] = ''
    else if (f[2]==='select') init[f[0]] = f[3]
    else init[f[0]] = ''
  }
  // Build fetch body
  const bodyParts = []
  for (const f of a.fields) {
    const name = f[0]
    if (f[2]==='number') bodyParts.push(`${name}: form.${name}===''?undefined:Number(form.${name})`)
    else if (name==='nicho'||name==='qtd'||name==='produto'||name==='publico'||name==='dor'||name==='solucao'||name==='tema'||name==='convidado'||name==='duracao'||name==='visitas'||name==='tx'||name==='aov'||name==='cpa'||name==='nome'||name==='idadeEmail'||name==='falhas'||name==='texto'||name==='nota'||name==='tema'||name==='desconto'||name==='tipo'||name==='contratante'||name==='contratado'||name==='valor'||name==='prazo'||name==='escopo'||name==='pagamento'||name==='clienteNome'||name==='preco'||name==='afiliado'||name==='codigo'||name==='cor1'||name==='cor2'||name==='dominio'||name==='dias'||name==='vol'||name==='tom'||name==='resultado') {
      bodyParts.push(`${name}: form.${name}===''?undefined:form.${name}`)
    } else bodyParts.push(`${name}: form.${name}===''?undefined:form.${name}`)
  }
  const body = `{${bodyParts.join(',')}}`
  const iconI = a.icone
  const tsx = `'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ${iconI} } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>(${JSON.stringify(init)})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch(${JSON.stringify(a.api)}, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(${body}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={${JSON.stringify(a.nome)}} tagline={${JSON.stringify(a.tagline)}} icone={<${iconI} className="w-7 h-7"/>} cor={${JSON.stringify('bg-gradient-to-br '+a.cor)}} onGerar={gerar} loading={loading}
      output=${renderOut(a.render)}>
${a.fields.map(f=>'      '+renderField(f)).join('\n')}
    </AgentShell>
  )
}
`
  const outPath = path.join(__dirname,'..','src','app','agentes',a.slug,'page.tsx')
  fs.mkdirSync(path.dirname(outPath),{recursive:true})
  fs.writeFileSync(outPath, tsx)
}
console.log('páginas geradas:', agentes.length)
