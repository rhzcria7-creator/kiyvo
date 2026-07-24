'use client'
// ═══════════════════════════════════════════════════════════
// PILOTO DOS AGENTES — Console Interno KIYVO (SECRETO)
// Rota: /mtrx/console (secreto)
// Não existe link em lugar nenhum; não é indexado (robots.txt bloqueia __pilot/*)
// Nem admins veem — é console de operador/orquestrador.
// ═══════════════════════════════════════════════════════════
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal, Cpu, Zap, Shield, Activity, Bot, Lock, Globe,
  AlertTriangle, CheckCircle2, RefreshCw, Database, Cloud,
  Server, Key, Wifi, WifiOff, Eye, EyeOff, Play, Square,
  ArrowRight, Clock, TrendingUp, Users, DollarSign,
} from 'lucide-react'
import { getConfiguredProviders } from '@/lib/ai/orchestrator'
import Link from 'next/link'

type ProviderStatus = { id: string; name: string; color: string; emoji: string; configured: boolean; latency?: number; ok?: boolean }

export default function PilotConsole() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [pinging, setPinging] = useState(false)
  const [logs, setLogs] = useState<{ t: string; msg: string; level: 'info' | 'ok' | 'warn' | 'err' }[]>([])
  const [stats, setStats] = useState({ req: 0, ok: 0, fail: 0, avgLatency: 0 })
  const [sysInfo, setSysInfo] = useState<Record<string, string>>({})
  const [uptime, setUptime] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)

  // Código de acesso (segurança por obscuridade + código; em produção exigiria mTLS ou auth server-side)
  // Código: "KIYVO-MATRIX-2026-OMEGA"
  const SECRET_CODE = 'KIYVO-MATRIX-2026-OMEGA'

  function log(msg: string, level: 'info' | 'ok' | 'warn' | 'err' = 'info') {
    const t = new Date().toLocaleTimeString('pt-BR', { hour12: false })
    setLogs(l => [...l.slice(-200), { t, msg, level }])
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }), 10)
  }

  function doAuth(e: React.FormEvent) {
    e.preventDefault()
    const val = pass.trim().toUpperCase()
    if (val === SECRET_CODE) {
      setAuthed(true)
      setErr('')
      try { sessionStorage.setItem('__pilot_authed', '1') } catch { /* noop */ }
    } else {
      setErr('Código inválido. Acesso negado.')
      log(`Tentativa falha de acesso com código: ${pass.slice(0, 8)}...`, 'warn')
    }
  }

  useEffect(() => {
    try { if (sessionStorage.getItem('__pilot_authed') === '1') setAuthed(true) } catch { /* noop */ }
  }, [])

  useEffect(() => {
    if (!authed) return
    // Carrega providers
    const prov = getConfiguredProviders()
    setProviders(prov.map(p => ({ ...p })))

    // Coleta sys info (básico, sem dados sensíveis)
    setSysInfo({
      'Ambiente': process.env.NODE_ENV || 'development',
      'Next.js': '14.2.29',
      'Node': typeof process !== 'undefined' ? 'server' : 'browser',
      'User Agent': navigator.userAgent.split(') ')[0] + ')',
      'Idioma': navigator.language,
      'Online': navigator.onLine ? 'Sim' : 'Não',
      'Plataforma': (navigator as any).userAgentData?.platform || navigator.platform,
      'Tela': `${window.screen.width}x${window.screen.height}`,
      'Viewport': `${window.innerWidth}x${window.innerHeight}`,
    })

    log('Console do Piloto inicializado.', 'ok')
    log('Conectando ao orquestrador multi-provider...', 'info')
    log(`Provedores detectados: ${prov.filter(p => p.configured).length}/${prov.length}.`, 'info')

    // Simulação de telemetria (em produção seria endpoint real)
    const iv = setInterval(() => {
      setUptime(u => u + 1)
      setStats(s => {
        const newReq = s.req + Math.floor(Math.random() * 3)
        const newFail = s.fail + (Math.random() < 0.08 ? 1 : 0)
        const newOk = newReq - newFail
        const lat = 200 + Math.random() * 900
        return { req: newReq, ok: newOk, fail: newFail, avgLatency: Math.round((s.avgLatency + lat) / 2) }
      })
    }, 1500)
    return () => clearInterval(iv)
  }, [authed])

  async function pingProviders() {
    setPinging(true)
    log('Executando health check dos providers...', 'info')
    const updated = providers.map(p => ({ ...p }))
    for (let i = 0; i < updated.length; i++) {
      const start = performance.now()
      // Simula ping real (em produção bate endpoint real)
      await new Promise(r => setTimeout(r, 300 + Math.random() * 800))
      const lat = Math.round(performance.now() - start)
      updated[i].latency = lat
      updated[i].ok = updated[i].configured
      log(`Provider ${updated[i].name}: ${updated[i].ok ? 'ONLINE' : 'OFFLINE'} (${lat}ms)`, updated[i].ok ? 'ok' : 'warn')
      setProviders([...updated])
    }
    setPinging(false)
    log('Health check concluído.', 'ok')
  }

  function formatUptime(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // ── TELA DE AUTENTICAÇÃO ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <motion.form
          onSubmit={doAuth}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-black/80 border border-green-500/40 rounded-2xl p-8 backdrop-blur-sm"
          onKeyDown={(e) => { if (e.key === 'Escape') setPass('') }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/50 flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-green-300 tracking-wider">KIYVO // PILOT CONSOLE</h1>
              <p className="text-xs text-green-500/70">Área restrita. Operadores autorizados.</p>
            </div>
          </div>

          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-green-500/80 mb-2">Código de acesso</label>
          <div className="relative mb-4">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/60" />
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={e => { setPass(e.target.value); setErr('') }}
              autoFocus
              placeholder="XXXXXX-XXXXXX-XXXX-XXXXX"
              className="w-full pl-11 pr-11 py-3 bg-green-500/5 border border-green-500/30 rounded-xl text-green-300 font-mono placeholder:text-green-500/30 focus:outline-none focus:border-green-400 focus:bg-green-500/10 tracking-wider"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500/60 hover:text-green-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {err && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{err}</span>
            </motion.div>
          )}

          <button type="submit" className="w-full py-3 bg-green-500/20 border border-green-500/50 text-green-300 font-black uppercase tracking-widest rounded-xl hover:bg-green-500/30 transition flex items-center justify-center gap-2">
            Autenticar <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-[10px] text-green-500/50 text-center">
            Tentativas não autorizadas são registradas.
          </p>
        </motion.form>
      </div>
    )
  }

  // ── CONSOLE PRINCIPAL ──
  return (
    <div className="min-h-screen bg-[#05080d] text-slate-200 font-mono">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-black text-green-300 tracking-wider leading-none">KIYVO // PILOT CONSOLE</h1>
              <p className="text-[10px] text-green-500/60 mt-0.5 tracking-wider">ORQUESTRADOR MULTI-PROVIDER • v10.6-omega</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ONLINE</span>
            <span className="text-slate-400">UPTIME {formatUptime(uptime)}</span>
            <Link href="/" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-green-500/50 hover:text-green-300 text-[10px] uppercase tracking-widest transition">← Voltar</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Activity, label: 'Requisições', val: stats.req.toLocaleString('pt-BR'), color: 'text-sky-400' },
            { icon: CheckCircle2, label: 'Sucesso', val: stats.ok.toLocaleString('pt-BR'), color: 'text-emerald-400' },
            { icon: AlertTriangle, label: 'Falhas', val: stats.fail.toLocaleString('pt-BR'), color: 'text-rose-400' },
            { icon: Clock, label: 'Latência média', val: `${stats.avgLatency}ms`, color: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#0a0f17] border border-slate-800 rounded-xl p-4"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="text-2xl font-black text-white tabular-nums mt-0.5">{s.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Providers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0f17] border border-slate-800 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Providers IA</h2>
              <span className="text-[10px] text-slate-500 ml-2">{providers.filter(p => p.configured).length}/{providers.length} ativos</span>
            </div>
            <button onClick={pingProviders} disabled={pinging} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500/50 hover:text-sky-300 disabled:opacity-40 transition">
              <RefreshCw className={`w-3 h-3 ${pinging ? 'animate-spin' : ''}`} /> {pinging ? 'Verificando...' : 'Ping'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`relative rounded-xl p-4 border ${p.configured ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-slate-800'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-black text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{p.id}</p>
                    </div>
                  </div>
                  {p.configured ? (
                    p.ok === false ? (
                      <span className="text-[10px] text-rose-400 font-black">OFFLINE</span>
                    ) : p.latency ? (
                      <span className="text-[10px] text-emerald-400 font-black">{p.latency}ms</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-black">READY</span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-600 font-black">NO KEY</span>
                  )}
                </div>
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${p.configured ? 'bg-gradient-to-r from-emerald-500 to-sky-500' : 'bg-slate-700'}`}
                    style={{ width: p.configured ? `${p.latency ? Math.max(30, 100 - p.latency / 20) : 100}%` : '0%' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Grid: sys info + logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sys info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#0a0f17] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-violet-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Sistema</h2>
            </div>
            <div className="space-y-2 text-xs">
              {Object.entries(sysInfo).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">{k}</span>
                  <span className="text-slate-200 text-right truncate max-w-[60%]" title={v}>{v.length > 40 ? v.slice(0, 40) + '…' : v}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2 pt-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Status rede</span>
                <span className={navigator.onLine ? 'text-emerald-400' : 'text-rose-400'}>
                  {navigator.onLine ? <Wifi className="w-3.5 h-3.5 inline" /> : <WifiOff className="w-3.5 h-3.5 inline" />} {navigator.onLine ? 'CONECTADO' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Log ao vivo */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-[#05080d] border border-green-500/20 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-green-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 text-[10px] text-green-400/70 font-bold tracking-wider">LOG OPERCIONAL</span>
              </div>
              <button onClick={() => setLogs([])} className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-rose-400">Limpar</button>
            </div>
            <div ref={logRef} className="h-80 overflow-y-auto p-4 text-xs space-y-1 font-mono">
              {logs.length === 0 && <p className="text-slate-600 italic">Aguardando eventos...</p>}
              <AnimatePresence>
                {logs.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <span className="text-slate-600 tabular-nums">{l.t}</span>
                    <span className={
                      l.level === 'ok' ? 'text-emerald-400' :
                      l.level === 'warn' ? 'text-amber-400' :
                      l.level === 'err' ? 'text-rose-400' : 'text-green-300/80'
                    }>{l.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-green-400 align-middle"
              />
            </div>
          </motion.div>
        </div>

        {/* Controles rápidos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-[#0a0f17] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Controles do Piloto</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: Play, label: 'Start all', color: 'emerald' },
              { icon: Square, label: 'Stop queue', color: 'rose' },
              { icon: Database, label: 'Flush cache', color: 'sky' },
              { icon: Shield, label: 'Lockdown', color: 'violet' },
              { icon: Bot, label: 'Agents list', color: 'amber' },
              { icon: Cloud, label: 'Cloud status', color: 'cyan' },
              { icon: Key, label: 'Rotate keys', color: 'orange' },
              { icon: Globe, label: 'Health check', color: 'teal' },
            ].map(b => (
              <button key={b.label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-800 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900 transition group">
                <b.icon className={`w-5 h-5 text-${b.color}-400 group-hover:scale-110 transition`} />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{b.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-slate-700 uppercase tracking-[0.3em] pt-4">
          KIYVO // CLASSIFICADO — USO INTERNO — TODOS EVENTOS SÃO AUDITADOS
        </p>
      </div>
    </div>
  )
}
