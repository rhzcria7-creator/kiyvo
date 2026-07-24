'use client'
// /library — Biblioteca de produtos comprados pelo usuário.
// Downloads FUNCIONAM de verdade: baixa o arquivo real ou gera um comprovante de acesso.
// Comentários em PT-BR.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, Download, Star, Clock, Search, Library as LibIcon, BookOpen, Shield, Sparkles, CheckCircle2 } from 'lucide-react'
import { usePurchases } from '@/lib/purchases/store'
import { useAuth } from '@/lib/auth/context'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'react-hot-toast'

export default function LibraryPage() {
  const { user } = useAuth()
  const { init, list } = usePurchases()
  const [busca, setBusca] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { init(); setLoaded(true) }, [init])

  const compras = useMemo(() => {
    const todos = list()
    if (!busca.trim()) return todos
    const q = busca.toLowerCase()
    return todos.filter(p => p.titulo.toLowerCase().includes(q) || (p.vendedor_nome||'').toLowerCase().includes(q) || (p.categoria||'').toLowerCase().includes(q))
  }, [list, busca])

  const totalGasto = compras.reduce((s, p) => s + p.preco, 0)

  function baixar(p: ReturnType<typeof list>[number]) {
    try {
      if (p.arquivos && p.arquivos.length > 0) {
        // Baixa o arquivo real (URL blob)
        const a = document.createElement('a')
        a.href = p.arquivos[0].url
        a.download = p.arquivos[0].nome
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success('Download iniciado!', { icon: '⬇️' })
        return
      }
      // Fallback: gera um arquivo .txt com os dados de acesso
      const conteudo = `KIYVO - ACESSO AO PRODUTO
==================================
Produto: ${p.titulo}
Código: ${p.id}
Comprado em: ${new Date(p.compradoEm).toLocaleString('pt-BR')}
Valor: R$ ${p.preco.toFixed(2).replace('.', ',')}
Vendedor: ${p.vendedor_nome || 'KIYVO'}
==================================
INSTRUÇÕES:
Seu produto foi liberado automaticamente.

Para acessar:
1. Entre na KIYVO
2. Vá em Minha Biblioteca
3. Clique em "Ver" para abrir a página do produto

Em caso de dúvidas, contate o suporte: https://t.me/kiyvosuporte
Garantia de 7 dias — devolução 100% se não ficar satisfeito.
`
      const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${p.id}-acesso.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Arquivo de acesso baixado!', { icon: '📄' })
    } catch {
      toast.error('Erro ao baixar. Tente novamente.')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:from-[#0B0F1A] dark:to-[#0B0F1A] pb-24">
        <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 text-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-violet-400/20 blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/80 mb-2">
              <LibIcon className="w-3.5 h-3.5" /> Sua biblioteca
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">Meus produtos digitais</h1>
            <p className="text-white/80 mt-2 max-w-xl">
              Todos os produtos que você comprou ficam disponíveis aqui para download, sempre que quiser.
              Acesso vitalício para qualquer compra na KIYVO.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat icon={<Package className="w-4 h-4" />} valor={String(compras.length)} label="Produtos" />
              <Stat icon={<Star className="w-4 h-4" />} valor={`R$${totalGasto.toFixed(2).replace('.',',')}`} label="Total investido" />
              <Stat icon={<Download className="w-4 h-4" />} valor="∞" label="Downloads" />
              <Stat icon={<Shield className="w-4 h-4" />} valor="7 dias" label="Garantia" />
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Busca */}
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar na biblioteca..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm transition" />
          </motion.div>

          {!user ? (
            <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-10 text-center border border-slate-100 dark:border-slate-800 shadow-lg">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-xl font-black mb-2 text-[#0F172A] dark:text-white">Faça login para ver sua biblioteca</h2>
              <p className="text-slate-500 text-sm mb-5">Entre com a mesma conta usada nas compras para ver todos os produtos que você já adquiriu.</p>
              <Link href="/login?redirect=/library" className="inline-flex items-center gap-2 bg-[#0F172A] text-white rounded-full px-6 py-3 font-black text-sm hover:bg-black transition shadow-lg">
                Entrar
              </Link>
            </motion.div>
          ) : !loaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0F172A] rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 animate-pulse">
                  <div className="aspect-video rounded-xl bg-slate-100 dark:bg-white/5" />
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded mt-4" />
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded mt-2 w-2/3" />
                </div>
              ))}
            </div>
          ) : compras.length === 0 ? (
            <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-10 text-center border border-slate-100 dark:border-slate-800 shadow-lg">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-xl font-black mb-2 text-[#0F172A] dark:text-white">Sua biblioteca está vazia</h2>
              <p className="text-slate-500 text-sm mb-5">Quando você comprar algo na KIYVO, os produtos aparecerão aqui com botão de download.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/buscar" className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-full px-6 py-3 font-black text-sm hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">Explorar produtos</Link>
                <Link href="/ofertas" className="inline-flex items-center gap-2 border-2 border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 font-black text-sm hover:border-brand-500 transition">Ver ofertas</Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compras.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }} transition={{ delay: Math.min(i*0.04,0.4), type: 'spring', stiffness: 200, damping: 20 }}
                  className="group bg-white dark:bg-[#0F172A] rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all">
                  <Link href={p.productSlug ? `/p/${p.productSlug}` : '#'} className="block">
                    <div className={`aspect-[5/3] bg-gradient-to-br ${p.gradient || 'from-brand-500 to-violet-600'} flex items-center justify-center relative overflow-hidden`}>
                      <motion.span
                        initial={{ scale: 0.7 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200, delay: i*0.04 + 0.1 }}
                        className="text-6xl md:text-7xl drop-shadow-lg group-hover:scale-110 transition-transform"
                      >
                        {p.emoji || '📦'}
                      </motion.span>
                      <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" /> Entregue
                      </span>
                      <span className="absolute top-3 right-3 bg-black/30 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded-full">
                        R${p.preco.toFixed(2).replace('.',',')}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-600">{p.categoria || 'Produto digital'}</p>
                    <h3 className="font-black text-base text-[#0F172A] dark:text-white mt-0.5 line-clamp-2">{p.titulo}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(p.compradoEm).toLocaleDateString('pt-BR')}
                    </p>
                    {p.vendedor_nome && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">por <b className="text-slate-700 dark:text-slate-300">{p.vendedor_nome}</b></p>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => baixar(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full py-2.5 font-black text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </button>
                      <Link href={p.productSlug ? `/p/${p.productSlug}` : '#'}
                        className="px-4 inline-flex items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700 font-black text-xs hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition">
                        Ver
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function Stat({ icon, valor, label }: { icon: React.ReactNode; valor: string; label: string }) {
  return (
    <motion.div initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }}
      className="bg-white/15 backdrop-blur rounded-2xl p-3 border border-white/20 hover:bg-white/20 transition">
      <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-black uppercase tracking-widest">{icon}{label}</div>
      <p className="text-xl font-black mt-1">{valor}</p>
    </motion.div>
  )
}
