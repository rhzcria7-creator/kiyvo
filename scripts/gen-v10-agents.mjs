// Script gerador: cria API routes e páginas UI para os 22 novos agentes v10
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const AGENTS = [
  { file: 'blackfridayplaybook', fn: 'blackfridayplaybook', title: 'Black Friday Playbook', tagline: 'Estratégia completa de Black Friday em 30 dias — calendário, preços, emails, copy.', icon: '🔥', color: 'bg-gradient-to-br from-red-500 to-orange-600', plan: 'plus' },
  { file: 'leadmagnetpro', fn: 'leadmagnetpro', title: 'Lead Magnet Pro', tagline: 'Crie iscas digitais irresistíveis que convertem 20-40% — checklist, ebook, template.', icon: '🧲', color: 'bg-gradient-to-br from-blue-500 to-cyan-600', plan: 'free' },
  { file: 'tiktokscripts', fn: 'tiktokscripts', title: 'TikTok & Reels Scripts', tagline: 'Roteiros virais para TikTok, Reels e Shorts — hook em 3s, CTA que converte.', icon: '🎬', color: 'bg-gradient-to-br from-pink-500 to-rose-600', plan: 'free' },
  { file: 'seolocalpages', fn: 'seolocalpages', title: 'SEO Local (cidades)', tagline: 'Gera páginas SEO otimizadas por cidade + nicho para rankear no Google Brasil.', icon: '📍', color: 'bg-gradient-to-br from-emerald-500 to-green-600', plan: 'pro' },
  { file: 'roiads', fn: 'roiads', title: 'Calculadora de ROI de Anúncios', tagline: 'Calcule ROI/ROAS real de Meta, Google e TikTok Ads em 3 cenários.', icon: '📊', color: 'bg-gradient-to-br from-indigo-500 to-purple-600', plan: 'free' },
  { file: 'upsellquiz', fn: 'upsellquiz', title: 'Quiz de Upsell', tagline: 'Quiz inteligente que aumenta ticket médio em 40% recomendando o produto certo.', icon: '🎯', color: 'bg-gradient-to-br from-violet-500 to-purple-700', plan: 'plus' },
  { file: 'canvaprompts', fn: 'canvaprompts', title: 'Prompts Canva/Midjourney', tagline: 'Prompts prontos para criar criativos profissionais no Canva AI, Midjourney e DALL-E.', icon: '🎨', color: 'bg-gradient-to-br from-fuchsia-500 to-pink-600', plan: 'free' },
  { file: 'hotjarheatmap', fn: 'hotjarheatmap', title: 'Auditoria Heatmap CRO', tagline: 'Análise heurística de CRO que detecta os problemas que estão matando sua conversão.', icon: '🔥', color: 'bg-gradient-to-br from-orange-500 to-red-600', plan: 'plus' },
  { file: 'emailswipefile', fn: 'emailswipefile', title: 'Email Swipe File', tagline: '100+ assuntos e templates de email que abrem e vendem (boas-vindas, carrinho, lançamento).', icon: '📧', color: 'bg-gradient-to-br from-sky-500 to-blue-700', plan: 'free' },
  { file: 'whatsappfunnel', fn: 'whatsappfunnel', title: 'Funil de WhatsApp', tagline: 'Sequência completa de mensagens WhatsApp que converte em 5-7 dias.', icon: '💬', color: 'bg-gradient-to-br from-green-500 to-emerald-600', plan: 'plus' },
  { file: 'instagramgrid', fn: 'instagramgrid', title: 'Instagram Grid Planner', tagline: 'Planeje 9/18 posts do Instagram, bio, destaques e calendário de 30 dias.', icon: '📸', color: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', plan: 'free' },
  { file: 'reviewrequest', fn: 'reviewrequest', title: 'Pedido de Review', tagline: 'Emails e WhatsApp que fazem 40% dos clientes deixarem avaliação honestamente.', icon: '⭐', color: 'bg-gradient-to-br from-yellow-400 to-orange-500', plan: 'free' },
  { file: 'salespageminimalista', fn: 'salespageminimalista', title: 'Estrutura de Página de Vendas', tagline: 'Estrutura de página de vendas de alta conversão (3-8%) com copy pronta.', icon: '💰', color: 'bg-gradient-to-br from-slate-800 to-black', plan: 'plus' },
  { file: 'podcastguestpitch', fn: 'podcastguestpitch', title: 'Pitch para Podcast/YouTube', tagline: 'Templates de email para ser convidado em podcasts e ganhar autoridade no nicho.', icon: '🎙️', color: 'bg-gradient-to-br from-red-500 to-rose-700', plan: 'pro' },
  { file: 'croaudit', fn: 'croaudit', title: 'Auditoria CRO', tagline: 'Auditoria de conversão com score, falhas e checklist de correção.', icon: '📈', color: 'bg-gradient-to-br from-teal-500 to-cyan-700', plan: 'free' },
  { file: 'kdpointscampaign', fn: 'kdpointscampaign', title: 'Campanha KD Points', tagline: 'Crie campanhas de KD Points para fidelizar clientes e aumentar compras repetidas.', icon: '💎', color: 'bg-gradient-to-br from-amber-400 to-yellow-500', plan: 'free' },
  { file: 'plrspinner', fn: 'plrspinner', title: 'Reescrever PLR', tagline: 'Reescreva conteúdo PLR para ficar 100% original e rankear no Google sem penalidade.', icon: '🔄', color: 'bg-gradient-to-br from-cyan-500 to-blue-600', plan: 'plus' },
  { file: 'launchecklist30d', fn: 'launchecklist30d', title: 'Checklist Lançamento 30 dias', tagline: 'Checklist completo de lançamento de produto digital em 30 dias — do zero ao carrinho aberto.', icon: '🚀', color: 'bg-gradient-to-br from-indigo-600 to-violet-700', plan: 'free' },
  { file: 'vslgenerator', fn: 'vslgenerator', title: 'Gerador de VSL', tagline: 'Script completo de VSL (Video Sales Letter) de 10 minutos com alto poder de conversão.', icon: '📹', color: 'bg-gradient-to-br from-red-600 to-rose-800', plan: 'pro' },
  { file: 'churnreduce', fn: 'churnreduce', title: 'Reduzir Churn', tagline: 'Fluxos de email e winback para reduzir cancelamento de assinatura em 15-30%.', icon: '🛡️', color: 'bg-gradient-to-br from-emerald-600 to-teal-700', plan: 'plus' },
  { file: 'webhooktest', fn: 'webhooktest', title: 'Teste de Webhook', tagline: 'Gere payloads Stripe/Supabase para testar seus webhooks sem depender de eventos reais.', icon: '🔌', color: 'bg-gradient-to-br from-slate-600 to-slate-800', plan: 'pro' },
  { file: 'bolsadeapostas', fn: 'bolsadeapostas', title: 'Calculadora Dutching/Apostas', tagline: 'Calcule valores para apostar em múltiplas odds e lucrar independente do resultado.', icon: '🎲', color: 'bg-gradient-to-br from-green-600 to-emerald-800', plan: 'free' },
]

const ROOT = '/home/user/kiyvo'

function apiRoute(agent) {
  return `// POST /api/agents/${agent.file}
import { NextRequest, NextResponse } from 'next/server'
import { ${agent.fn} } from '@/lib/agents/v10-monster'
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
    const result = await ${agent.fn}(input, { userId, plan } as any)

    if (userId !== 'anon') {
      try {
        const u = getUsage(userId)
        u.copiesHoje = (u.copiesHoje || 0) + 1
        setUsage(userId, u)
        trackUsage(userId, '${agent.file}')
      } catch { /* ignore */ }
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 })
  }
}
`
}

function pageRoute(agent) {
  const fieldsByAgent = {
    blackfridayplaybook: `
      <Field label="Nome do produto"><input className={inputClass} name="produto" placeholder="Ex: Curso de Marketing Digital" required /></Field>
      <Field label="Preço atual (R$)"><input className={inputClass} type="number" step="0.01" name="precoAtual" placeholder="97.00" required defaultValue="97" /></Field>
      <Field label="Preço de custo (opcional)"><input className={inputClass} type="number" step="0.01" name="precoCusto" placeholder="0" /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Tamanho da lista de emails"><input className={inputClass} type="number" name="listaEmails" placeholder="500" defaultValue="500" /></Field>
      <Field label="Seguidores redes sociais"><input className={inputClass} type="number" name="seguidoresSocial" placeholder="2000" defaultValue="2000" /></Field>
      <Field label="Dias até a BF"><input className={inputClass} type="number" name="diasAteBF" placeholder="30" defaultValue="30" /></Field>`,
    leadmagnetpro: `
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Produto principal"><input className={inputClass} name="produtoPrincipal" placeholder="Curso Completo de Tráfego Pago" required /></Field>
      <Field label="Público alvo"><input className={inputClass} name="publico" placeholder="empreendedores digitais" required /></Field>
      <Field label="Dor principal"><input className={inputClass} name="dorPrincipal" placeholder="não conseguem vender pelo Instagram" required /></Field>
      <Field label="Formato">
        <select className={selectClass} name="formato">
          <option value="checklist">Checklist (PDF)</option>
          <option value="ebook">eBook</option>
          <option value="template">Template</option>
          <option value="planilha">Planilha</option>
          <option value="quiz">Quiz</option>
          <option value="webinar">Webinar</option>
        </select>
      </Field>`,
    tiktokscripts: `
      <Field label="Nome do produto"><input className={inputClass} name="produto" placeholder="Curso de Instagram" required /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Público alvo"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>
      <Field label="Duração (segundos)">
        <select className={selectClass} name="duracao">
          <option value="15">15s</option>
          <option value="30" selected>30s</option>
          <option value="60">60s</option>
        </select>
      </Field>`,
    seolocalpages: `
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="cursos de marketing" required /></Field>
      <Field label="Palavra-chave principal"><input className={inputClass} name="palavraChave" placeholder="Curso de Marketing Digital" required /></Field>
      <Field label="Cidades (separadas por vírgula)"><input className={inputClass} name="cidadesStr" placeholder="São Paulo, Rio de Janeiro, Belo Horizonte" /></Field>`,
    roiads: `
      <Field label="Nome do produto"><input className={inputClass} name="produto" placeholder="Curso XYZ" required /></Field>
      <Field label="Preço de venda (R$)"><input className={inputClass} type="number" step="0.01" name="precoVenda" defaultValue="97" required /></Field>
      <Field label="Custo do produto (R$)"><input className={inputClass} type="number" step="0.01" name="custoProduto" defaultValue="0" /></Field>
      <Field label="Taxa plataforma (%)"><input className={inputClass} type="number" step="0.01" name="taxaPlataformaPct" defaultValue="8" /></Field>
      <Field label="CPA estimado (R$)"><input className={inputClass} type="number" step="0.01" name="cpaEstimado" defaultValue="15" required /></Field>
      <Field label="Investimento mensal (R$)"><input className={inputClass} type="number" name="investimentoMensal" defaultValue="1000" required /></Field>`,
    upsellquiz: `
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso Completo" required /></Field>
      <Field label="Preço base (R$)"><input className={inputClass} type="number" step="0.01" name="precoBase" defaultValue="97" required /></Field>
      <Field label="Categoria"><input className={inputClass} name="categoria" placeholder="marketing digital" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>`,
    canvaprompts: `
      <Field label="Tipo de arte">
        <select className={selectClass} name="tipo">
          <option value="banner">Banner</option>
          <option value="capa">Capa</option>
          <option value="anuncio">Anúncio</option>
          <option value="story" selected>Story (9:16)</option>
          <option value="feed">Feed Instagram (1:1)</option>
          <option value="thumbnail">Thumbnail YouTube</option>
          <option value="mockup">Mockup</option>
          <option value="logo">Logo</option>
          <option value="poster">Poster</option>
        </select>
      </Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso de Instagram" required /></Field>
      <Field label="Estilo">
        <select className={selectClass} name="estilo">
          <option value="moderno" selected>Moderno</option>
          <option value="minimalista">Minimalista</option>
          <option value="luxo">Luxo</option>
          <option value="despojado">Despojado</option>
          <option value="corporativo">Corporativo</option>
          <option value="criativo">Criativo</option>
          <option value="3d">3D</option>
        </select>
      </Field>`,
    hotjarheatmap: `
      <Field label="URL da página"><input className={inputClass} name="url" placeholder="https://seusite.com.br/oferta" /></Field>
      <Field label="Descreva a página"><textarea className={textareaClass} name="descricaoPagina" placeholder="Página de vendas do curso X, com headline no topo e vídeo..."></textarea></Field>
      <Field label="Tem CTA acima da dobra?"><select className={selectClass} name="temCTAAcimaDobra"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Tem prova social?"><select className={selectClass} name="temProvaSocial"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Quantos campos tem o formulário?"><input className={inputClass} type="number" name="camposFormulario" defaultValue="0" /></Field>
      <Field label="Tem garantia visível?"><select className={selectClass} name="temGarantia"><option value="true">Sim</option><option value="false" selected>Não</option></select></Field>
      <Field label="Mobile responsivo?"><select className={selectClass} name="mobileResponsivo"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Preço claro?"><select className={selectClass} name="precoClaro"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>`,
    emailswipefile: `
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Tipo de sequência">
        <select className={selectClass} name="tipo">
          <option value="boasvindas">Boas-vindas</option>
          <option value="lancamento">Lançamento</option>
          <option value="carrinho">Carrinho abandonado</option>
          <option value="reentrada">Reativação</option>
          <option value="vendas" selected>Vendas</option>
          <option value="newsletter">Newsletter</option>
          <option value="bfsale">Black Friday</option>
          <option value="abandonado">Checkout abandonado</option>
        </select>
      </Field>`,
    whatsappfunnel: `
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso de Instagram" required /></Field>
      <Field label="Preço (R$)"><input className={inputClass} type="number" step="0.01" name="preco" defaultValue="97" required /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Público alvo"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>
      <Field label="Objeção principal"><input className={inputClass} name="objeoPrincipal" placeholder="muito caro" defaultValue="muito caro" /></Field>`,
    instagramgrid: `
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso Completo" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>
      <Field label="Tom de voz">
        <select className={selectClass} name="tom">
          <option value="profissional">Profissional</option>
          <option value="descontraido">Descontraído</option>
          <option value="educativo" selected>Educativo</option>
          <option value="inspiracional">Inspiracional</option>
          <option value="ousado">Ousado</option>
        </select>
      </Field>`,
    reviewrequest: `
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso de Instagram" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="alunos" required /></Field>
      <Field label="Dias após a compra"><input className={inputClass} type="number" name="diasAposCompra" defaultValue="3" /></Field>`,
    salespageminimalista: `
      <Field label="Nome do produto"><input className={inputClass} name="produto" placeholder="Curso Completo" required /></Field>
      <Field label="Preço (R$)"><input className={inputClass} type="number" step="0.01" name="preco" defaultValue="97" required /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>
      <Field label="Promessa principal"><input className={inputClass} name="promessa" placeholder="Saia do zero aos R$10k/mês em 90 dias" required /></Field>`,
    podcastguestpitch: `
      <Field label="Seu nome"><input className={inputClass} name="nomeEspecialista" placeholder="João Silva" required /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Sua especialidade"><input className={inputClass} name="especialidade" placeholder="tráfego pago para pequenos negócios" required /></Field>
      <Field label="Resultados"><input className={inputClass} name="resultados" placeholder="mais de 1.000 alunos transformados" /></Field>`,
    croaudit: `
      <Field label="Headline principal"><input className={inputClass} name="headline" placeholder="Curso Completo de Marketing Digital" /></Field>
      <Field label="Tem CTA acima da dobra?"><select className={selectClass} name="temCTAAcimaDobra"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Tem prova social?"><select className={selectClass} name="temProvaSocial"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Tem garantia?"><select className={selectClass} name="temGarantia"><option value="true">Sim</option><option value="false" selected>Não</option></select></Field>
      <Field label="Tem FAQ?"><select className={selectClass} name="temFAQ"><option value="true">Sim</option><option value="false" selected>Não</option></select></Field>
      <Field label="Campos no formulário"><input className={inputClass} type="number" name="camposFormulario" defaultValue="0" /></Field>
      <Field label="Velocidade do site"><select className={selectClass} name="velocidadeCarregamento"><option value="rapido" selected>Rápido</option><option value="medio">Médio</option><option value="lento">Lento</option></select></Field>
      <Field label="Mobile responsivo?"><select className={selectClass} name="mobileResponsivo"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Preço claro?"><select className={selectClass} name="precoClaro"><option value="true" selected>Sim</option><option value="false">Não</option></select></Field>
      <Field label="Objeções respondidas?"><select className={selectClass} name="temObjeoesRespondidas"><option value="true">Sim</option><option value="false" selected>Não</option></select></Field>`,
    kdpointscampaign: `
      <Field label="Tipo de campanha">
        <select className={selectClass} name="tipo">
          <option value="cadastro">Boas-vindas (cadastro)</option>
          <option value="compra" selected>Cashback em compras</option>
          <option value="review">Pedido de review</option>
          <option value="indicacao">Indique e ganhe</option>
          <option value="aniversario">Aniversário</option>
          <option value="primeira_compra">Primeira compra</option>
          <option value="comentario">Comentário no blog</option>
        </select>
      </Field>
      <Field label="Pontos por R$1 (se cashback)"><input className={inputClass} type="number" name="pontosPorReal" defaultValue="5" /></Field>`,
    plrspinner: `
      <Field label="Texto PLR original"><textarea className={textareaClass} name="textoOriginal" rows="8" placeholder="Cole aqui o texto original do PLR que você quer reescrever..." required></textarea></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Tom de voz">
        <select className={selectClass} name="tom">
          <option value="profissional">Profissional</option>
          <option value="conversacional" selected>Conversacional</option>
          <option value="autoritativo">Autoritativo</option>
        </select>
      </Field>`,
    launchecklist30d: `
      <Field label="Produto"><input className={inputClass} name="produto" placeholder="Curso Completo" required /></Field>
      <Field label="Preço (R$)"><input className={inputClass} type="number" step="0.01" name="preco" defaultValue="97" required /></Field>
      <Field label="Data de lançamento"><input className={inputClass} type="date" name="dataLancamento" /></Field>
      <Field label="Tamanho da lista de emails"><input className={inputClass} type="number" name="listaEmails" defaultValue="100" /></Field>
      <Field label="Seguidores"><input className={inputClass} type="number" name="seguidores" defaultValue="500" /></Field>`,
    vslgenerator: `
      <Field label="Nome do produto"><input className={inputClass} name="produto" placeholder="Curso Completo" required /></Field>
      <Field label="Preço (R$)"><input className={inputClass} type="number" step="0.01" name="preco" defaultValue="97" required /></Field>
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="empreendedores" required /></Field>
      <Field label="Promessa principal"><input className={inputClass} name="promessa" placeholder="Saia do zero aos R$10k/mês" required /></Field>`,
    churnreduce: `
      <Field label="Produto/assinatura"><input className={inputClass} name="produto" placeholder="Plano Plus" required /></Field>
      <Field label="Preço mensal (R$)"><input className={inputClass} type="number" step="0.01" name="precoMensal" defaultValue="19.90" required /></Field>
      <Field label="Público"><input className={inputClass} name="publico" placeholder="assinantes" required /></Field>`,
    webhooktest: `
      <Field label="Evento Stripe">
        <select className={selectClass} name="evento">
          <option value="checkout.completed" selected>checkout.session.completed</option>
          <option value="subscription.created">customer.subscription.created</option>
          <option value="invoice.paid">invoice.paid</option>
          <option value="payment.failed">invoice.payment_failed</option>
          <option value="refund.created">charge.refunded</option>
          <option value="payout.paid">payout.paid</option>
        </select>
      </Field>
      <Field label="Valor (R$)"><input className={inputClass} type="number" step="0.01" name="valor" defaultValue="97" /></Field>
      <Field label="ID do produto"><input className={inputClass} name="produto" placeholder="produto-teste" defaultValue="produto-teste" /></Field>`,
    bolsadeapostas: `
      <Field label="Odds (separadas por vírgula)"><input className={inputClass} name="oddsStr" placeholder="2.10, 3.50, 4.20" required /></Field>
      <Field label="Valor total a apostar (R$)"><input className={inputClass} type="number" step="0.01" name="valorTotal" defaultValue="100" required /></Field>`,
  }

  // parser custom
  const getFormData = `const formData = new FormData(e.currentTarget)
    const raw = Object.fromEntries(formData.entries())
    const input: any = { ...raw }
    ${agent.file === 'seolocalpages' ? "if (raw.cidadesStr) input.cidades = String(raw.cidadesStr).split(',').map((s: string) => s.trim()).filter(Boolean); delete input.cidadesStr" : ''}
    ${agent.file === 'roiads' ? "input.precoVenda = parseFloat(raw.precoVenda as string); input.custoProduto = parseFloat(raw.custoProduto as string || '0'); input.custoFrete = 0; input.taxaPlataforma = parseFloat(raw.taxaPlataformaPct as string || '8') / 100; delete input.taxaPlataformaPct; input.cpaEstimado = parseFloat(raw.cpaEstimado as string); input.investimentoMensal = parseFloat(raw.investimentoMensal as string); input.refugo = 0.03" : ''}
    ${agent.file === 'bolsadeapostas' ? "input.odds = String(raw.oddsStr).split(',').map((s: string) => parseFloat(s.trim())).filter(n => !isNaN(n)); delete input.oddsStr; input.valorTotal = parseFloat(raw.valorTotal as string)" : ''}
    ${agent.file === 'croaudit' ? "['temCTAAcimaDobra','temProvaSocial','temGarantia','temFAQ','mobileResponsivo','precoClaro','temObjeoesRespondidas'].forEach(k => { input[k] = raw[k] === 'true' }); input.camposFormulario = parseInt(raw.camposFormulario as string || '0')" : ''}
    // campos numéricos genéricos
    ;['precoAtual','precoCusto','precoBase','preco','precoMensal','valor','diasAposCompra','pontosPorReal','listaEmails','listaEmails','seguidores','seguidoresSocial','diasAteBF','valorTotal','cpaEstimado','investimentoMensal'].forEach(k => {
      if (raw[k] !== undefined) input[k] = parseFloat(raw[k] as string)
    })
    `

  return `'use client'
// Página do agente: ${agent.title}
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ${agent.icon.startsWith('<') ? 'Sparkles' : iconFor(agent.icon)}, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function AgentePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGerar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      ${getFormData}
      const res = await fetch('/api/agents/${agent.file}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro ao gerar')
      setResult(data.data)
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const icon = <${componentForIcon(agent.icon)} className="w-7 h-7" />

  return (
    <AgentShell
      titulo="${agent.title}"
      tagline="${agent.tagline}"
      icone={icon}
      cor="${agent.color}"
      onGerar={() => Promise.resolve()}
      loading={loading}
      output={
        error ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-semibold">
            ❌ {error}
          </div>
        ) : result ? (
          <Resultado data={result} />
        ) : null
      }
      labelBotao="Gerar com IA ⚡"
    >
      <form onSubmit={handleGerar} id="form-${agent.file}">
        ${fieldsByAgent[agent.file] || `<Field label="Seu pedido"><textarea className={textareaClass} name="prompt" rows="5" placeholder="Descreva o que você quer..." required></textarea></Field>`}
        <button form="form-${agent.file}" type="submit" className="hidden">Gerar</button>
      </form>
    </AgentShell>
  )
}

function Resultado({ data }: { data: any }) {
  const json = JSON.stringify(data, null, 2)
  function copiar() { navigator.clipboard.writeText(json) }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <CheckCircle className="w-4 h-4" /> Gerado com sucesso
        </div>
        <button onClick={copiar} className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <Copy className="w-3 h-3" /> Copiar JSON
        </button>
      </div>
      <pre className="bg-slate-950 dark:bg-black text-slate-200 rounded-2xl p-4 text-xs overflow-auto max-h-[500px] leading-relaxed">
        {json}
      </pre>
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
        Dica: clique em "Copiar JSON" e cole no seu projeto, planilha ou em outro agente KIYVO para continuar trabalhando o resultado.
      </p>
    </motion.div>
  )
}
`
}

function iconFor(emoji) { return 'Sparkles' }
function componentForIcon(emoji) {
  const map = {
    '🔥': 'Flame', '🧲': 'Magnet', '🎬': 'Clapperboard', '📍': 'MapPin',
    '📊': 'BarChart3', '🎯': 'Target', '🎨': 'Palette', '📧': 'Mail',
    '💬': 'MessageCircle', '📸': 'Camera', '⭐': 'Star', '💰': 'Banknote',
    '🎙️': 'Mic', '📈': 'TrendingUp', '💎': 'Gem', '🔄': 'RefreshCw',
    '🚀': 'Rocket', '📹': 'Video', '🛡️': 'Shield', '🔌': 'Plug', '🎲': 'Dices',
  }
  return map[emoji] || 'Sparkles'
}

let apiCount = 0
let pageCount = 0

for (const agent of AGENTS) {
  const apiDir = join(ROOT, 'src/app/api/agents', agent.file)
  const pageDir = join(ROOT, 'src/app/agentes', agent.file)
  mkdirSync(apiDir, { recursive: true })
  mkdirSync(pageDir, { recursive: true })
  writeFileSync(join(apiDir, 'route.ts'), apiRoute(agent))
  writeFileSync(join(pageDir, 'page.tsx'), pageRoute(agent))
  apiCount++
  pageCount++
}

console.log(`✅ Geradas ${apiCount} APIs + ${pageCount} páginas`)
