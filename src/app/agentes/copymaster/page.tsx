'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PenTool, RefreshCw, Copy, Check, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

const PUBLICOS = [
  { id: 'gamer', nome: '🎮 Gamer' },
  { id: 'profissional', nome: '💼 Profissional' },
  { id: 'estudante', nome: '🎓 Estudante' },
  { id: 'criador', nome: '🎨 Criador' },
  { id: 'geral', nome: '🌐 Geral' },
] as const

const TONS = [
  { id: 'confiavel', nome: '🛡️ Confiável' },
  { id: 'urgente', nome: '🔥 Urgente' },
  { id: 'premium', nome: '💎 Premium' },
  { id: 'jovem', nome: '😎 Jovem' },
  { id: 'tecnico', nome: '⚙️ Técnico' },
] as const

const CATEGORIAS = ['jogos', 'streaming', 'software', 'cursos', 'giftcards', 'marketing', 'musica', 'produtividade', 'outro']

export default function CopyMasterPage() {
  const [produto, setProduto] = useState('')
  const [categoria, setCategoria] = useState('jogos')
  const [publico, setPublico] = useState<typeof PUBLICOS[number]['id']>('geral')
  const [tom, setTom] = useState<typeof TONS[number]['id']>('confiavel')
  const [preco, setPreco] = useState('')
  const [beneficios, setBeneficios] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function gerar() {
    if (!produto.trim()) return
    setLoading(true)
    try {
      const resp = await fetch('/api/agents/copywriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto,
          categoria,
          publico,
          tom,
          preco: preco ? Number(preco) : undefined,
          beneficios: beneficios.split(',').map((b) => b.trim()).filter(Boolean),
        }),
      })
      const data = await resp.json()
      setResult(data.result)
    } finally {
      setLoading(false)
    }
  }

  function copiar(label: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/agentes" className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] mb-3 inline-flex">
            ← Voltar para agentes
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <PenTool size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">CopyMaster</h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Títulos, bullets e descrições que vendem</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-6 shadow-sm border border-black/5 dark:border-white/5 space-y-5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Nome do produto *</label>
                <input value={produto} onChange={(e) => setProduto(e.target.value)}
                  placeholder="Ex: Netflix Premium 4K mensal"
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3.5 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Público</label>
                <div className="grid grid-cols-2 gap-2">
                  {PUBLICOS.map((p) => (
                    <button key={p.id} onClick={() => setPublico(p.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${publico === p.id ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-white/5 text-[#64748B]'}`}>
                      {p.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Tom de voz</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONS.map((t) => (
                    <button key={t.id} onClick={() => setTom(t.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${tom === t.id ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-white/5 text-[#64748B]'}`}>
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Preço (R$)</label>
                  <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="29,90"
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Benefícios (separados por vírgula)</label>
                <textarea value={beneficios} onChange={(e) => setBeneficios(e.target.value)}
                  placeholder="4K, 4 telas, sem anúncios, offline"
                  rows={2}
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] resize-none" />
              </div>
              <button onClick={gerar} disabled={loading || !produto.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] text-white font-black px-6 py-4 text-sm hover:scale-[1.01] transition-transform disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? 'Escrevendo...' : 'Gerar copy que vende'}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-4">
            {!result && !loading && (
              <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-10 border border-black/5 dark:border-white/5 text-center">
                <PenTool size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-[#64748B] font-bold">Preencha os campos ao lado para gerar sua copy</p>
                <p className="text-xs text-[#94A3B8] mt-1">Você receberá 5 títulos, subtítulos, descrição completa, bullets e hashtags</p>
              </div>
            )}
            {result && (
              <>
                <CopyBlock titulo="🎯 Títulos (5 opções)" conteudo={result.titulos.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}
                  onCopy={() => copiar('titulos', result.titulos.join('\n'))} copied={copied === 'titulos'} />
                <CopyBlock titulo="💬 Subtítulos" conteudo={result.subtitulos.join('\n')}
                  onCopy={() => copiar('subs', result.subtitulos.join('\n'))} copied={copied === 'subs'} />
                <CopyBlock titulo="📝 Descrição longa" conteudo={result.descricaoLonga}
                  onCopy={() => copiar('descLonga', result.descricaoLonga)} copied={copied === 'descLonga'} />
                <CopyBlock titulo="✨ Bullets persuasivos" conteudo={result.bullets.join('\n')}
                  onCopy={() => copiar('bullets', result.bullets.join('\n'))} copied={copied === 'bullets'} />
                <CopyBlock titulo="🔘 Call to action" conteudo={result.callToAction}
                  onCopy={() => copiar('cta', result.callToAction)} copied={copied === 'cta'} />
                <CopyBlock titulo="#️⃣ Hashtags" conteudo={result.hashtags.join(' ')}
                  onCopy={() => copiar('hash', result.hashtags.join(' '))} copied={copied === 'hash'} />
                <button onClick={gerar} disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] text-white font-black px-6 py-3 text-sm hover:scale-[1.01] transition-transform disabled:opacity-50">
                  <RefreshCw size={16} /> Gerar nova variação
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CopyBlock({ titulo, conteudo, onCopy, copied }: { titulo: string; conteudo: string; onCopy: () => void; copied: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-black/5 dark:border-white/5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-black text-[#0F172A] dark:text-white text-sm">{titulo}</h3>
        <button onClick={onCopy} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-slate-200 dark:hover:bg-white/10">
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-[#0F172A] dark:text-slate-200 font-sans leading-relaxed">{conteudo}</pre>
    </motion.div>
  )
}
