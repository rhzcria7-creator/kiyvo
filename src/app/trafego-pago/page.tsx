'use client'
// /trafego-pago — Central completo de TRÁFEGO PAGO para vendedores KIYVO.
// Calculadora de ROI, sugestões de budget, agentes de criativos/otimização,
// passo a passo para Google, Meta, TikTok e Pinterest Ads.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, Target, DollarSign, MousePointerClick, Calculator,
  Rocket, Sparkles, ArrowRight, Brain, LineChart, Megaphone, Play,
  CheckCircle2, Zap, Search, Hash,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GradientText } from '@/components/ui/ReactBits'

interface Plataforma {
  nome: string
  icon: string
  ctr: string
  cpcMedio: string
  cpa: string
  roas: string
  cor: string
  publico: string
  dica: string
}
const PLATAFORMAS: Plataforma[] = [
  { nome: 'Meta Ads (Facebook/Instagram)', icon: '📘', ctr: '1.0-1.5%', cpcMedio: 'R$0,80-2,50', cpa: 'R$15-45', roas: '2.5-4.5x', cor: 'from-blue-500 to-indigo-600', publico: 'B2C, moda, beleza, infoprodutos', dica: 'Comece por CBO com 3-5 criativos por adset.' },
  { nome: 'Google Ads (Search/Shoping)', icon: '🔍', ctr: '3-6%', cpcMedio: 'R$1,50-8,00', cpa: 'R$25-80', roas: '3-6x', cor: 'from-amber-400 to-orange-500', publico: 'Intenção de compra, SaaS, serviços', dica: 'Palavras long tail + negativas = ROAS maior.' },
  { nome: 'TikTok Ads', icon: '🎵', ctr: '1.5-2.5%', cpcMedio: 'R$0,30-1,20', cpa: 'R$8-30', roas: '2-4x', cor: 'from-pink-500 to-rose-600', publico: 'Jovens 16-34, viral, produtos virais', dica: 'Criativos nativos (sem texto na tela) convertem mais.' },
  { nome: 'Pinterest Ads', icon: '📌', ctr: '2-3%', cpcMedio: 'R$0,50-2,00', cpa: 'R$12-40', roas: '3-5x', cor: 'from-red-500 to-rose-600', publico: 'Mulheres, decoração, DIY, moda', dica: 'Ideal para produtos visuais com preço ≥ R$47.' },
  { nome: 'Kwai for Business', icon: '⭐', ctr: '1-2%', cpcMedio: 'R$0,20-0,80', cpa: 'R$6-25', roas: '1.8-3x', cor: 'from-orange-500 to-red-500', publico: 'Nordeste/Norte, ofertas baratas', dica: 'CPM muito baixo, ótimo para aquecer pixel.' },
  { nome: 'YouTube Ads', icon: '▶️', ctr: '0.8-2%', cpcMedio: 'R$0,40-2,00', cpa: 'R$20-60', roas: '2.5-5x', cor: 'from-red-600 to-red-700', publico: 'Info-produtos, lançamentos VSL', dica: 'Anúncios in-stream curtos + hook nos 3 primeiros segundos.' },
]

const AGENTES_TRAFEGO = [
  { nome: 'Otimizador de Anúncios', href: '/agentes/otimizadoranuncios', desc: 'Analisa seus anúncios e sugere ajustes em tempo real.', icon: '🎯' },
  { nome: 'Copy para Criativos', href: '/agentes/criativoads', desc: 'Grena copies de headline e CTA que convertem.', icon: '✍️' },
  { nome: 'Gerador de Banners', href: '/agentes/bannerforge', desc: 'Criativos e templates de banner prontos para editar.', icon: '🖼️' },
  { nome: 'ROI Ads Calculadora', href: '/agentes/roiads', desc: 'Calcula o ROAS mínimo para cada campanha ser lucrativa.', icon: '📊' },
  { nome: 'Criador de Script de VSL', href: '/agentes/vslgenerator', desc: 'Scripts completos de VSL para YouTube.', icon: '🎬' },
  { nome: 'Pack Hashtags Tráfego', href: '/agentes/hashtagger', desc: 'Hashtags segmentadas por nicho para tráfego orgânico+pago.', icon: '#' },
]

export default function TrafegoPagoPage() {
  const [budget, setBudget] = useState('50')
  const [ticket, setTicket] = useState('47')
  const [cpa, setCpa] = useState('12')

  const budgetN = parseFloat(budget.replace(',', '.')) || 0
  const ticketN = parseFloat(ticket.replace(',', '.')) || 0
  const cpaN = parseFloat(cpa.replace(',', '.')) || 0

  const metrics = useMemo(() => {
    const vendas = cpaN > 0 ? Math.floor(budgetN / cpaN) : 0
    const receita = vendas * ticketN
    const roi = budgetN > 0 ? ((receita - budgetN) / budgetN) * 100 : 0
    const roas = budgetN > 0 ? receita / budgetN : 0
    const lucro = receita - budgetN
    return { vendas, receita, roi, roas, lucro }
  }, [budgetN, ticketN, cpaN])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-300 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-black uppercase tracking-widest mb-4">
              <Megaphone className="w-3.5 h-3.5" /> Tráfego pago que converte
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05]">
              Venda mais com <GradientText className="text-white">anúncios</GradientText><br />
              que realmente funcionam
            </h1>
            <p className="mt-4 text-white/85 text-lg max-w-2xl">
              Planilhas, agentes de IA, comparador de plataformas e calculadora de ROI — tudo que você
              precisa para escalar vendas de produtos digitais no Brasil, em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#calculadora"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] text-white font-black text-sm shadow-lg hover:bg-black transition">
                <Calculator className="w-4 h-4" /> Calcular meu ROI
              </a>
              <a href="#plataformas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur border border-white/30 font-black text-sm hover:bg-white/25 transition">
                Ver plataformas <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Stats rápidos */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { kpi: '6', label: 'plataformas de anúncio' },
                { kpi: '200+', label: 'agentes de IA' },
                { kpi: 'R$0,20', label: 'CPC mínimo (Kwai)' },
                { kpi: '3-6x', label: 'ROAS médio Google' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }} transition={{ delay: i*0.1 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
                  <p className="text-2xl font-black">{s.kpi}</p>
                  <p className="text-xs text-white/75 font-bold">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-12">
          {/* Calculadora ROI */}
          <section id="calculadora" className="bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-6 h-6 text-brand-500" />
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Calculadora de ROI de campanha</h2>
            </div>
            <p className="text-slate-500 mb-6">Estime o resultado do seu investimento em anúncios. Valores em R$.</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Field label="Orçamento diário" prefix="R$" value={budget} onChange={setBudget} hint="ex: 50" />
              <Field label="Preço do produto (ticket)" prefix="R$" value={ticket} onChange={setTicket} hint="ex: 47" />
              <Field label="CPA estimado (custo por venda)" prefix="R$" value={cpa} onChange={setCpa} hint="ex: 12" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Resultado label="Vendas/dia" valor={String(metrics.vendas)} cor="from-brand-500 to-brand-700" icon={<Target className="w-4 h-4" />} />
              <Resultado label="Receita/dia" valor={`R$${metrics.receita.toFixed(2).replace('.',',')}`} cor="from-violet-500 to-fuchsia-600" icon={<DollarSign className="w-4 h-4" />} />
              <Resultado label="ROI" valor={`${metrics.roi.toFixed(0)}%`} cor="from-emerald-500 to-teal-600" icon={<TrendingUp className="w-4 h-4" />} positive={metrics.lucro >= 0} />
              <Resultado label="ROAS" valor={`${metrics.roas.toFixed(2)}x`} cor="from-amber-500 to-orange-600" icon={<LineChart className="w-4 h-4" />} positive={metrics.roas >= 1} />
              <Resultado label="Lucro/dia" valor={`R$${metrics.lucro.toFixed(2).replace('.',',')}`} cor={metrics.lucro >= 0 ? 'from-emerald-500 to-emerald-700' : 'from-red-500 to-red-700'} icon={<Zap className="w-4 h-4" />} positive={metrics.lucro >= 0} />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <Brain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 dark:text-amber-200">
                <b>💡 Dica da Kiya:</b> para infoprodutos em lançamento, busque CPA menor ou igual a 25% do ticket.
                Se CPA = 25% do valor do produto, você tem margem para operar em escala.
              </p>
            </div>
          </section>

          {/* Plataformas */}
          <section id="plataformas">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Qual plataforma usar?</h2>
                <p className="text-slate-500 mt-1">Comparador rápido das principais plataformas de anúncios do Brasil.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATAFORMAS.map((p, i) => (
                <motion.div key={p.nome}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i*0.05,0.4) }}
                  className="bg-white dark:bg-[#0F172A] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition">
                  <div className={`bg-gradient-to-br ${p.cor} p-5 text-white`}>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{p.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full backdrop-blur">tráfego pago</span>
                    </div>
                    <h3 className="mt-3 font-black text-lg leading-tight">{p.nome}</h3>
                    <p className="text-xs text-white/85 mt-1">{p.publico}</p>
                  </div>
                  <div className="p-5 space-y-2.5 text-sm">
                    <Linha label="CTR médio" valor={p.ctr} icon={<MousePointerClick className="w-3.5 h-3.5" />} />
                    <Linha label="CPC médio" valor={p.cpcMedio} icon={<DollarSign className="w-3.5 h-3.5" />} />
                    <Linha label="CPA médio" valor={p.cpa} icon={<Target className="w-3.5 h-3.5" />} />
                    <Linha label="ROAS esperado" valor={p.roas} icon={<TrendingUp className="w-3.5 h-3.5" />} />
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                        <span><b>Dica:</b> {p.dica}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Passo a passo */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Como começar em 7 passos</h2>
            <p className="text-slate-500 mb-6">Do pixel à primeira venda lucrativa.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { n: 1, t: 'Instale o pixel/tag', d: 'Pixel Meta, Google Tag, TikTok Pixel. Sem pixel você não consegue otimizar.' },
                { n: 2, t: 'Defina orçamento', d: 'Comece com R$30-50/dia por campanha. Não escale antes de 50 conversões.' },
                { n: 3, t: 'Crie 3-5 criativos', d: 'Teste ângulos diferentes: dor, desejo, prova social, escassez.' },
                { n: 4, t: 'Audiência ideal', d: 'Comece amplo (Brasil, 18+) deixando o pixel otimizar.' },
                { n: 5, t: 'Lance e espere 72h', d: 'NÃO mexa antes de 72h. Meta demora para sair da fase de aprendizado.' },
                { n: 6, t: 'Desligue os ruins', d: 'Desative criativos com CPA acima de 30% do ticket após 500 impressões.' },
                { n: 7, t: 'Dobre os bons', d: 'Escalone 20% a cada 3 dias criativos/adsets com ROAS > 2x.' },
                { n: 8, t: 'Retargeting obrigatório', d: 'Anuncie para quem visitou mas não comprou — ROAS pode chegar a 10x.' },
              ].map((passo, i) => (
                <motion.div key={passo.n}
                  initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} viewport={{ once: true }} transition={{ delay: i*0.05 }}
                  className="flex gap-4 p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-black flex items-center justify-center flex-shrink-0">{passo.n}</div>
                  <div>
                    <p className="font-black text-[#0F172A] dark:text-white text-sm">{passo.t}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{passo.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Agentes de IA */}
          <section className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-950/30 dark:to-violet-950/30 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-brand-500" />
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Agentes de IA para tráfego</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Deixe a KIYVO gerar criativos, copies, análises e cálculos por você.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENTES_TRAFEGO.map((a, i) => (
                <Link key={a.nome} href={a.href}
                  className="group bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:-translate-y-1 transition">
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <p className="font-black text-sm text-[#0F172A] dark:text-white group-hover:text-brand-600">{a.nome}</p>
                  <p className="text-xs text-slate-500 mt-1">{a.desc}</p>
                  <p className="text-xs font-black text-brand-600 mt-2 flex items-center gap-1">Usar agente <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" /></p>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/agentes" className="inline-flex items-center gap-2 text-brand-600 font-black text-sm hover:gap-3 transition-all">
                Ver todos os 200+ agentes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* CTA vender */}
          <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-black leading-tight">Anuncie seus produtos e veja vendas chegarem no mesmo dia.</h2>
              <p className="mt-3 text-white/90">Cadastre-se na KIYVO, publique seu produto e use as ferramentas de tráfego + agentes de IA para escalar — com <b>0% de taxa nas primeiras 5.000 vendas</b>.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/vender"
                  className="inline-flex items-center gap-2 bg-[#0F172A] text-white rounded-full px-6 py-3 font-black text-sm shadow-lg hover:scale-105 transition">
                  <Rocket className="w-4 h-4" /> Começar a vender
                </Link>
                <Link href="/planos"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-6 py-3 font-black text-sm border border-white/30 hover:bg-white/30">
                  Ver planos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 0% nas 5k primeiras vendas</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saque em 1 dia via PIX</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 7 dias de garantia</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Field({ label, prefix, value, onChange, hint }: { label: string; prefix?: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
          className={`w-full bg-slate-50 dark:bg-[#0B0F1A] rounded-xl border border-transparent focus:border-brand-500 outline-none py-3 font-black text-lg ${prefix ? 'pl-11 pr-4' : 'px-4'}`} />
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}
function Resultado({ label, valor, cor, icon, positive }: { label: string; valor: string; cor: string; icon: React.ReactNode; positive?: boolean }) {
  return (
    <div className={`bg-gradient-to-br ${cor} text-white rounded-2xl p-4 relative overflow-hidden ${positive === false ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-black uppercase tracking-widest">{icon}{label}</div>
      <p className="text-xl md:text-2xl font-black mt-1 leading-none">{valor}</p>
    </div>
  )
}
function Linha({ label, valor, icon }: { label: string; valor: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-slate-500 font-bold">{icon}{label}</span>
      <span className="font-black text-[#0F172A] dark:text-white">{valor}</span>
    </div>
  )
}
