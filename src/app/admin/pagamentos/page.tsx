'use client'
// ─────────────────────────────────────────────────────────────
// Painel do Operador — Pagamentos & Recebimento Real
// Cadastre sua chave PIX para RECEBER DINHEIRO DE VERDADE no modo
// demo/local (pagamento manual via PIX). Veja os pedidos que estão
// aguardando confirmação e marque como entregues.
// Comentários em PT-BR.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { toast } from 'react-hot-toast'
import { QrCode, CheckCircle2, Loader2, Copy, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'

interface PendingOrder {
  order_id: string
  order_number: string
  title: string
  amount: number
  created_at: string
}

export default function PagamentosAdminPage() {
  const [pixKey, setPixKey] = useState('')
  const [pixHolder, setPixHolder] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pixAtivo, setPixAtivo] = useState(false)
  const [pending, setPending] = useState<PendingOrder[]>([])
  const [fulfillingId, setFulfillingId] = useState<string | null>(null)
  const [revelado, setRevelado] = useState<Record<string, string>>({})

  async function carregar() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pix-settings')
      if (res.ok) {
        const data = await res.json()
        setPixKey(data.pix_key || '')
        setPixHolder(data.pix_holder || '')
        setPixAtivo(Boolean(data.pix_manual_enabled))
        setPending(data.pending_orders || [])
      } else if (res.status === 401) {
        toast.error('Acesso restrito ao administrador. Faça login como admin@kiyvo.com.br.')
      }
    } catch {
      // ignora
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pix-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pix_key: pixKey, pix_holder: pixHolder }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setPixAtivo(Boolean(data.pix_manual_enabled))
        toast.success(data.pix_manual_enabled ? 'Chave PIX salva! Agora você recebe dinheiro de verdade. 💸' : 'Configuração salva.')
        carregar()
      } else {
        toast.error(data.error || 'Erro ao salvar a chave PIX.')
      }
    } catch {
      toast.error('Erro de conexão ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function marcarEntregue(orderId: string) {
    setFulfillingId(orderId)
    try {
      const res = await fetch('/api/admin/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        toast.success('Pedido marcado como entregue! ✅')
        if (data.asset?.data) {
          setRevelado((prev) => ({ ...prev, [orderId]: String(data.asset.data) }))
        }
        carregar()
      } else {
        toast.error(data.error || 'Erro ao confirmar o pedido.')
      }
    } catch {
      toast.error('Erro de conexão ao confirmar.')
    } finally {
      setFulfillingId(null)
    }
  }

  function copiar(texto: string) {
    try {
      navigator.clipboard?.writeText(texto)
      toast.success('Chave PIX copiada!')
    } catch {
      toast.error('Copie manualmente.')
    }
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-surface-900 dark:text-white">Pagamentos & Recebimento</h1>
              <p className="text-surface-500 text-sm mt-0.5">Receba dinheiro de verdade via PIX manual (sem Stripe, sem cartão, sem boleto).</p>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${pixAtivo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
            {pixAtivo ? <><CheckCircle2 className="w-3.5 h-3.5" /> PIX real ATIVO — compras viram dinheiro na sua conta</> : <><ShieldCheck className="w-3.5 h-3.5" /> PIX ainda não configurado</>}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando configurações...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Configurar chave PIX */}
            <FadeInOnScroll delay={0}>
              <div className="card-base p-6">
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-1 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" /> Sua chave PIX
                </h2>
                <p className="text-sm text-surface-500 mb-4">
                  Cole aqui sua chave PIX (e-mail, CPF, telefone, CNPJ ou aleatória). Ela aparecerá no checkout dos compradores.
                </p>
                <form onSubmit={salvar} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-surface-500 block mb-1.5">Chave PIX</label>
                    <input
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="ex.: voce@email.com ou 11999999999"
                      className="w-full rounded-xl border border-surface-200 dark:border-white/10 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-surface-500 block mb-1.5">Titular (opcional)</label>
                    <input
                      value={pixHolder}
                      onChange={(e) => setPixHolder(e.target.value)}
                      placeholder="ex.: KIYVO LTDA / João Silva"
                      className="w-full rounded-xl border border-surface-200 dark:border-white/10 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full py-3.5 font-black text-sm shadow-lg shadow-emerald-500/30 disabled:opacity-70"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Salvando...</> : 'Salvar chave PIX'}
                  </button>
                </form>

                {pixAtivo && pixKey && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Chave atual</p>
                      <p className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 break-all">{pixKey}</p>
                    </div>
                    <button onClick={() => copiar(pixKey)} className="shrink-0 text-emerald-700 dark:text-emerald-300 hover:scale-110 transition">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </FadeInOnScroll>

            {/* Como funciona */}
            <FadeInOnScroll delay={0.1}>
              <div className="card-base p-6">
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" /> Como o dinheiro entra
                </h2>
                <ol className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
                  <li className="flex gap-2"><span className="font-black text-brand-600">1.</span> O comprador escolhe um produto e vai ao checkout.</li>
                  <li className="flex gap-2"><span className="font-black text-brand-600">2.</span> Com a chave PIX salva, ele vê sua chave e o valor exato.</li>
                  <li className="flex gap-2"><span className="font-black text-brand-600">3.</span> Ele paga o PIX e clica em “Já efetuei o PIX”.</li>
                  <li className="flex gap-2"><span className="font-black text-brand-600">4.</span> O pedido aparece aqui em “Aguardando PIX”. Você confere e marca como entregue.</li>
                  <li className="flex gap-2"><span className="font-black text-brand-600">5.</span> O dinheiro ficou na sua conta PIX. Sem taxas de intermediário, só a taxa KIYVO (8% + R$0,50).</li>
                </ol>
                <p className="mt-4 text-[11px] text-surface-400 leading-relaxed">
                  Dica: produtos com entrega automática (ex.: o teste ChatGPT Plus via Outlook) liberam as credenciais sozinhos. Para os demais, você envia o acesso manualmente após confirmar o PIX.
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        )}

        {/* Pedidos aguardando PIX */}
        <FadeInOnScroll delay={0.15}>
          <div className="card-base p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> Pedidos aguardando PIX
                {pending.length > 0 && <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{pending.length}</span>}
              </h2>
              <button onClick={carregar} className="text-xs font-bold text-brand-600 hover:underline">Atualizar</button>
            </div>

            {pending.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-8">Nenhum pedido aguardando PIX no momento. Compartilhe seus produtos para começar a vender! 🚀</p>
            ) : (
              <div className="space-y-3">
                {pending.map((o) => (
                  <div key={o.order_id} className="border border-surface-100 dark:border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-surface-900 dark:text-white truncate">{o.title}</p>
                        <p className="text-[11px] text-surface-400 font-mono">{o.order_number} · {new Date(o.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">R$ {o.amount.toFixed(2).replace('.', ',')}</span>
                        <button
                          onClick={() => marcarEntregue(o.order_id)}
                          disabled={fulfillingId === o.order_id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-2 text-xs font-black disabled:opacity-60"
                        >
                          {fulfillingId === o.order_id ? <><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> Confirmando</> : 'Marcar entregue'}
                        </button>
                      </div>
                    </div>
                    {revelado[o.order_id] && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Acesso a enviar ao comprador</p>
                        <p className="font-mono text-xs break-all">{revelado[o.order_id]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
