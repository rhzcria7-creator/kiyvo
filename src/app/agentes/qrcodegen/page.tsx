'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Download } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'

interface Result { svg: string; textoOriginal: string; dica: string }
export default function Page() {
  const [texto, setTexto] = useState('https://kiyvo.com.br')
  const [tamanho, setTamanho] = useState('240')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/qrcodegen', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ texto, tamanho: Number(tamanho) }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const baixar = () => {
    if (!result) return
    const blob = new Blob([result.svg], { type:'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'kiyvo-qr.svg'; a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <AgentShell titulo="QRGenerator" tagline="Gera QR Codes estilizados com logo KIYVO para PIX, links e WhatsApp" icone={<QrCode className="w-7 h-7" />} cor="bg-gradient-to-br from-slate-700 to-slate-900" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-white rounded-2xl">
            <motion.div initial={{scale:.6,opacity:0}} animate={{scale:1,opacity:1}} dangerouslySetInnerHTML={{__html: result.svg}} />
          </div>
          <div className="flex gap-2">
            <button onClick={baixar} className="flex-1 bg-[#0F172A] text-white rounded-full py-3 font-bold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4"/> Baixar SVG</button>
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">💡 {result.dica}</div>
        </div>
      )}>
      <Field label="Texto/URL/PIX"><input className={inputClass} value={texto} onChange={e=>setTexto(e.target.value)} placeholder="https://kiyvo.com.br"/></Field>
      <Field label="Tamanho (px)"><input type="number" className={inputClass} value={tamanho} onChange={e=>setTamanho(e.target.value)}/></Field>
    </AgentShell>
  )
}
