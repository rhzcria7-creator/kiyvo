'use client'
// v0.0.1 — Painel de importação somente para catálogos de parceiros autorizados.
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

type CsvItem = { title: string; description?: string; price?: number; externalUrl: string; externalId?: string }

function parseCsv(value: string): CsvItem[] {
  const [headerLine, ...lines] = value.trim().split(/\r?\n/)
  if (!headerLine) return []
  const headers = headerLine.split(',').map((entry) => entry.trim().toLowerCase())
  const index = (name: string) => headers.indexOf(name)
  const titleIndex = index('titulo')
  const urlIndex = index('external_url')
  if (titleIndex < 0 || urlIndex < 0) return []
  return lines.slice(0, 250).flatMap((line) => {
    const row = line.split(',').map((entry) => entry.trim())
    const title = row[titleIndex]
    const externalUrl = row[urlIndex]
    if (!title || !/^https?:\/\//.test(externalUrl || '')) return []
    const price = Number(row[index('preco')])
    return [{ title, externalUrl, description: row[index('descricao')] || undefined, externalId: row[index('external_id')] || undefined, price: Number.isFinite(price) ? price : undefined }]
  })
}

export default function PartnerImportPage() {
  const [partnerName, setPartnerName] = useState('')
  const [authorizationReference, setAuthorizationReference] = useState('')
  const [csv, setCsv] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const items = useMemo(() => parseCsv(csv), [csv])

  async function submit() {
    if (!partnerName.trim() || !authorizationReference.trim() || items.length === 0) {
      setState('error'); setMessage('Informe parceiro, autorização e um CSV válido com titulo e external_url.'); return
    }
    setState('loading'); setMessage('')
    try {
      const response = await fetch('/api/v1/admin/partner-import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partnerName, authorizationReference, items }) })
      const data = await response.json() as { itemCount?: number; error?: string }
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar o lote.')
      setState('success'); setMessage(`${data.itemCount ?? items.length} itens foram salvos como rascunho para revisão.`)
      setCsv('')
    } catch (error) {
      setState('error'); setMessage(error instanceof Error ? error.message : 'Não foi possível criar o lote.')
    }
  }

  return <main className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 lg:py-14">
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-10">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600"><FileSpreadsheet aria-hidden="true" /></div><div><p className="text-[11px] font-black uppercase tracking-widest text-brand-600">Catálogo de parceiros</p><h1 className="mt-1 font-black tracking-tight text-3xl text-[#0F172A] dark:text-white">Importação com procedência</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Use apenas API, afiliado ou autorização contratual. Cada item entra como rascunho, mantém link externo e depende de aprovação humana.</p></div></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700 dark:text-slate-200">Parceiro autorizado<input value={partnerName} onChange={(event) => setPartnerName(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/5 bg-[#FAFAFA] px-4 py-3.5 text-base outline-none focus:border-brand-600 dark:bg-[#0B0F1A]" placeholder="Nome jurídico ou comercial" /></label><label className="text-sm font-bold text-slate-700 dark:text-slate-200">Referência de autorização<input value={authorizationReference} onChange={(event) => setAuthorizationReference(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/5 bg-[#FAFAFA] px-4 py-3.5 text-base outline-none focus:border-brand-600 dark:bg-[#0B0F1A]" placeholder="Contrato, URL do programa ou ID" /></label></div>
      <label className="mt-5 block text-sm font-bold text-slate-700 dark:text-slate-200">CSV: titulo, descricao, preco, external_url, external_id<textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="mt-2 min-h-48 w-full rounded-2xl border border-black/5 bg-[#FAFAFA] p-4 font-mono text-sm outline-none focus:border-brand-600 dark:bg-[#0B0F1A]" placeholder={'titulo,descricao,preco,external_url,external_id\nGift card digital,Entrega por parceiro,50.00,https://parceiro.exemplo/produto,SKU-1'} /></label>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-500" /> {items.length} item(ns) válido(s), máximo 250 por lote.</div>
      {state !== 'idle' && <div role="status" className={`mt-5 flex gap-2 rounded-2xl p-4 text-sm ${state === 'success' ? 'bg-emerald-500/10 text-emerald-700' : state === 'error' ? 'bg-red-500/10 text-red-700' : 'bg-brand-500/10 text-brand-700'}`}>{state === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}{message || 'Criando lote protegido...'}</div>}
      <motion.button type="button" onClick={submit} disabled={state === 'loading'} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0F172A] px-6 py-4 font-black text-white shadow-xl shadow-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"><Upload className="h-4 w-4" />{state === 'loading' ? 'Importando com segurança...' : 'Criar rascunho para revisão'}</motion.button>
    </motion.section>
  </main>
}
