'use client'

/**
 * /checkout/sucesso - Pagina de confirmacao pos-compra.
 * Tema #FAFAFA consistente com o novo design system.
 */

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2, Key, Eye, Copy, ShieldCheck, Star, Loader2,
  AlertTriangle, Package, Sparkles, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { KiyvoLogoSvg } from '@/components/brand'
import Confetti from '@/components/ui/Confetti'

interface OrderData {
  id: string
  order_number: string
  status: string
  subtotal: number
  title: string
  kd_points: number
  asset?: { type: string; data: string } | null
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function SuccessContent() {
  const sp = useSearchParams()
  const sessionId = sp.get('session_id')
  const piId = sp.get('payment_intent')

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [polls, setPolls] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        let url = ''
        if (piId) url = `/api/v1/orders/${piId}?by=payment`
        else if (sessionId) url = `/api/v1/orders/${sessionId}?by=session`
        else { setError('Pedido nao encontrado'); setLoading(false); return }
        const res = await fetch(url)
        if (!res.ok) {
          if (polls < 20) { setTimeout(() => { if (mounted) { setPolls(p => p+1); load() } }, 1500); return }
          setError('Pedido em processamento. Acesse "Meus Pedidos" em instantes.')
          setLoading(false); return
        }
        const data = await res.json()
        if (!data.ok || !data.order) { setError('Pedido nao encontrado'); setLoading(false); return }
        setOrder(data.order)
        if (data.order.is_official && !data.safeOrder.asset && data.order.status !== 'delivered' && polls < 20) {
          setTimeout(() => mounted && setPolls(p => p+1), 1500); return
        }
        setLoading(false)
      } catch {
        setError('Nao foi possivel carregar agora')
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [sessionId, piId, polls])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); toast.success('Copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error('Falha ao copiar') }
  }

  // OBS: error pode existir mesmo após o loading (ex: polling finalizado sem sucesso)
  if (loading && !error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <KiyvoLogoSvg size={48} />
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mt-6" />
          <h2 className="font-display font-black text-xl mt-4 text-[#0F172A] dark:text-white">Processando seu pedido...</h2>
          <p className="text-[#64748B] dark:text-white/60 text-sm mt-1">Verificando pagamento e preparando entrega</p>
        </motion.div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-display font-black text-xl text-[#0F172A] dark:text-white">Quase la!</h2>
          <p className="text-[#64748B] dark:text-white/60 text-sm mt-2 mb-6">{error}</p>
          <Link href="/buyer/orders" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white font-black">
            <Package size={18} /> Meus pedidos
          </Link>
        </div>
      </div>
    )
  }

  // Se chegamos aqui, order existe (mesmo com possível warning de erro após o load)
  const safeOrder = order as OrderData

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] py-12 px-4 relative">
      <Confetti duration={4000} particleCount={180} />
      <div className="max-w-xl mx-auto relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/"><KiyvoLogoSvg size={32}/></Link>
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 size={56} className="text-white"/>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1] tracking-tight">Pagamento confirmado! 🎉</h1>
          <p className="text-[#64748B] mt-3">Seu produto chegou. Obrigado pela compra.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-[2rem] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] border border-black/5 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Pedido</p><p className="font-mono font-black text-sm mt-1">{safeOrder.order_number}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Valor</p><p className="font-display font-black text-base mt-1">{fmt(safeOrder.subtotal)}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Pontos</p><p className="font-display font-black text-base mt-1 text-amber-600">+{safeOrder.kd_points} KD</p></div>
          </div>
        </motion.div>
        {safeOrder.asset ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2rem] p-6 text-white shadow-2xl shadow-emerald-500/30 mb-4">
            <div className="flex items-center gap-2 mb-4"><Sparkles size={20}/><h3 className="font-display font-black text-lg">Seu produto digital</h3></div>
            {revealed ? (
              <>
                <div className="bg-black/30 backdrop-blur rounded-2xl p-4 border border-white/20"><p className="font-mono text-sm break-all select-all">{safeOrder.asset.data}</p></div>
                <button onClick={() => copy(safeOrder.asset!.data)} className="w-full mt-3 py-3 bg-white text-emerald-700 font-black rounded-full flex items-center justify-center gap-2 hover:bg-emerald-50 transition">
                  {copied ? <><CheckCircle2 size={18}/> Copiado!</> : <><Copy size={18}/> Copiar chave/codigo</>}
                </button>
                <p className="text-xs text-emerald-100 mt-3 text-center">Guarde em local seguro. Tambem esta na sua Biblioteca.</p>
              </>
            ) : (
              <button onClick={() => setRevealed(true)} className="w-full py-5 bg-white text-emerald-700 font-black rounded-full flex items-center justify-center gap-2 hover:bg-emerald-50 transition text-lg">
                <Eye size={22}/> Clique para revelar
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 flex items-start gap-3">
            <Package size={20} className="text-amber-600 shrink-0 mt-0.5"/>
            <div><p className="font-black text-amber-900 text-sm">Entrega em andamento</p><p className="text-xs text-amber-700 mt-0.5">Este produto requer entrega manual. O vendedor foi notificado e entregara em ate 24h.</p></div>
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex items-start gap-2">
            <ShieldCheck size={18} className="text-brand-600 shrink-0 mt-0.5"/>
            <div><p className="font-black text-brand-900 text-sm">Protecao KIYVO</p><p className="text-xs text-brand-700 mt-0.5">Dinheiro em custodia por 7 dias. Problema? Reembolso.</p></div>
          </div>
          {safeOrder.kd_points > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2">
              <Star size={18} className="text-amber-600 shrink-0 mt-0.5 fill-amber-500"/>
              <div><p className="font-black text-amber-900 text-sm">+{safeOrder.kd_points} KD Points</p><p className="text-xs text-amber-700 mt-0.5">Creditados agora. Use na proxima compra.</p></div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {safeOrder.asset ? (
            <Link href="/buyer/library" className="flex items-center justify-center gap-2 py-4 rounded-full bg-[#0F172A] text-white font-black">
              <Key size={18}/> Minha Biblioteca
            </Link>
          ) : (
            <Link href="/buyer/orders" className="flex items-center justify-center gap-2 py-4 rounded-full bg-[#0F172A] text-white font-black">
              <Package size={18}/> Acompanhar
            </Link>
          )}
          <Link href="/categorias" className="flex items-center justify-center gap-1 py-4 rounded-full bg-white border border-black/10 text-[#0F172A] font-black hover:border-[#0F172A] transition">
            Continuar comprando <ChevronRight size={18}/>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-600"/></div>}>
      <SuccessContent/>
    </Suspense>
  )
}
