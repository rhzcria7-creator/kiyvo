'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

interface Tarefa { horario: string; tarefa: string; duracaoMin: number; categoria: string }
interface Dia { dia: string; tarefas: Tarefa[]; tema: string }
interface Result { resumo: string; totalHorasSemana: number; postsPorSemana: number; grade: Dia[]; ferramentasSugeridas: string[] }

const corCat: Record<string,string> = {
  engajamento: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  criacao: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  publicacao: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  crescimento: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  live: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
}
export default function Page() {
  const [nicho, setNicho] = useState('marketing digital')
  const [horas, setHoras] = useState('2')
  const [dias, setDias] = useState('6')
  const [redes, setRedes] = useState('Instagram,TikTok')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/gradehorarios', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ nicho, horas: Number(horas), dias: Number(dias), redes: redes.split(',').map(s=>s.trim()).filter(Boolean) }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="GradeHorários" tagline="Grade semanal de conteúdo produtiva com horários e tarefas otimizadas" icone={<Calendar className="w-7 h-7" />} cor="bg-gradient-to-br from-indigo-500 to-violet-600" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20"><div className="text-2xl font-black">{result.postsPorSemana}</div><div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-300">posts/semana</div></div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><div className="text-2xl font-black">{result.totalHorasSemana}h</div><div className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-300">horas/semana</div></div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-2xl font-black">{result.grade.length}</div><div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">dias ativos</div></div>
          </div>
          <div className="space-y-3">
            {result.grade.map((d,i)=>(
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-black">{d.dia}</h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Tema: {d.tema}</span>
                </div>
                <div className="space-y-1.5">
                  {d.tarefas.map((t,j)=>(
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-mono text-slate-500 w-12 flex-shrink-0">{t.horario}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${corCat[t.categoria]||'bg-slate-100 text-slate-600'}`}>{t.categoria}</span>
                      <span className="flex-1">{t.tarefa}</span>
                      <span className="text-xs text-slate-400">{t.duracaoMin}min</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ferramentas recomendadas</div><div className="flex flex-wrap gap-2">{result.ferramentasSugeridas.map((f,i)=><span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">{f}</span>)}</div></div>
        </div>
      )}>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)}/></Field>
      <Field label="Horas por dia"><input type="number" min={1} max={8} className={inputClass} value={horas} onChange={e=>setHoras(e.target.value)}/></Field>
      <Field label="Dias por semana"><input type="number" min={3} max={7} className={inputClass} value={dias} onChange={e=>setDias(e.target.value)}/></Field>
      <Field label="Redes (separadas por vírgula)"><input className={inputClass} value={redes} onChange={e=>setRedes(e.target.value)}/></Field>
    </AgentShell>
  )
}
