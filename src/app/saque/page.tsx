'use client'
// Página /saque — saque do saldo da carteira
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownToLine, Shield, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const METODOS = [
  { id: 'pix', nome: 'PIX (Chave aleatória, CPF, email, celular, telefone)', tempo: '1 dia útil', taxa: 0.99 },
  { id: 'pix', naoTemMais: true },
]

export default function SaquePage() {
  const [valor, setValor] = useState<number>(100)
  const [chavePix, setChavePix] = useState('')
  const [tipoChave, setTipoChave] = useState('cpf')
  const [solicitado, setSolicitado] = useState(false)
  const saldo = 450.78 // mock; em produção: buscar de profiles.wallet_balance
  const minimo = 30
  const taxaFixa = 0.99
  const valorLiquido = Math.max(0, valor - taxaFixa)

  const podeSacar = valor >= minimo && valor <= saldo && chavePix.length >= 4

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-10 md:pt-14">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-4">
            <ArrowDownToLine className="w-3.5 h-3.5" /> Saque
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
            Retire seu dinheiro
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3">Saques via PIX a partir de R$30, taxa fixa de R$0,99, em até 1 dia útil. Sem pegadinhas.</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-3 bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            {solicitado ? (
              <div className="py-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-white mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Saque solicitado!</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Solicitamos o saque de <strong>{fmt(valor)}</strong>. O valor líquido de <strong>{fmt(valorLiquido)}</strong> vai cair na sua chave PIX <strong>em até 1 dia útil</strong>.
                </p>
                <button onClick={() => setSolicitado(false)} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                  Novo saque
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-black text-lg text-[#0F172A] dark:text-white mb-5">Quanto você quer sacar?</h2>
                <div className="mb-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Valor</div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">R$</span>
                    <input type="number" value={valor} onChange={e => setValor(Number(e.target.value))} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-black text-[#0F172A] dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[30, 50, 100, Math.floor(saldo)].map(v => (
                      <button key={v} onClick={() => setValor(v)} className="flex-1 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                        R${v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Tipo de chave PIX</div>
                  <select value={tipoChave} onChange={e => setTipoChave(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="celular">Celular/Telefone</option>
                    <option value="aleatoria">Chave aleatória</option>
                  </select>
                </div>

                <div className="mb-6">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Sua chave PIX</div>
                  <input type="text" value={chavePix} onChange={e => setChavePix(e.target.value)} placeholder="Ex: seu@email.com ou (11) 99999-9999" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>

                {valor > saldo && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl p-3 flex gap-2 items-start text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Saldo insuficiente. Seu saldo é {fmt(saldo)}.
                  </div>
                )}
                {valor < minimo && valor > 0 && (
                  <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl p-3 flex gap-2 items-start text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Saque mínimo R$30,00.
                  </div>
                )}

                <button disabled={!podeSacar} onClick={() => setSolicitado(true)}
                  className="w-full bg-[#0F172A] dark:bg-white dark:text-black hover:bg-black text-white rounded-full py-4 font-black text-base flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:hover:bg-[#0F172A]">
                  <ArrowDownToLine className="w-5 h-5" /> Sacar {fmt(valorLiquido)}
                </button>
                <p className="text-[11px] text-slate-500 mt-3 text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Transação protegida. Saques auditados.
                </p>
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-[2rem] p-6">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Saldo disponível</div>
              <div className="text-3xl md:text-4xl font-black leading-none">{fmt(saldo)}</div>
              <div className="text-xs opacity-80 mt-2">Vendas confirmadas + afiliados</div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#0F172A] dark:text-white mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor solicitado</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{fmt(valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxa fixa</span>
                  <span className="font-bold text-red-500">-{fmt(taxaFixa)}</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-200 font-bold">Você recebe</span>
                  <span className="font-black text-emerald-600">{fmt(valorLiquido)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-[#0F172A] dark:text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Regras</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Saque mínimo <strong>R$30</strong></li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Taxa fixa de <strong>R$0,99</strong> por saque (custo operacional)</li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> PIX em até <strong>1 dia útil</strong></li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Saques apenas em dias úteis</li>
                <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Saldo de vendas fica disponível <strong>7 dias</strong> após confirmação (garantia)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function fmt(n: number) { return 'R$' + (n || 0).toFixed(2).replace('.', ',') }
