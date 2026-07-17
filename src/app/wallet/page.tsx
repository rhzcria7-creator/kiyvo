'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { PageTransition } from '@/components/shared/PageTransition'
import { AnimatedCounter } from '@/components/animations'
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const mockBalance = { available: 1847.50, pending: 325.00, total: 2172.50 }
const mockTransactions = [
  { id: 1, type: 'received', desc: 'Venda — Windows 11 Pro', amount: 49.90, status: 'completed', date: '17/07/26' },
  { id: 2, type: 'received', desc: 'Venda — Curso Full Stack', amount: 34.90, status: 'completed', date: '16/07/26' },
  { id: 3, type: 'withdrawal', desc: 'Saque via PIX', amount: -500.00, status: 'completed', date: '15/07/26' },
  { id: 4, type: 'received', desc: 'Venda — Steam Keys Pack', amount: 29.90, status: 'pending', date: '15/07/26' },
  { id: 5, type: 'received', desc: 'Venda — Templates Canva', amount: 19.90, status: 'completed', date: '14/07/26' },
  { id: 6, type: 'withdrawal', desc: 'Saque via PIX', amount: -300.00, status: 'completed', date: '13/07/26' },
  { id: 7, type: 'received', desc: 'Venda — Netflix Gift Card', amount: 45.00, status: 'pending', date: '13/07/26' },
  { id: 8, type: 'fee', desc: 'Taxa Kiyvo (9.99%)', amount: -5.00, status: 'completed', date: '14/07/26' },
]

export default function WalletPage() {
  const { profile } = useAuth()
  const [withdrawing, setWithdrawing] = useState(false)
  const [pixKey, setPixKey] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)

  const handleWithdraw = () => {
    if (!pixKey.trim()) { toast.error('Informe sua chave PIX'); return }
    setWithdrawing(true)
    setTimeout(() => {
      setWithdrawing(false)
      setShowWithdraw(false)
      setPixKey('')
      toast.success('Saque solicitado! Chegará em até 24h.')
    }, 2000)
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white flex items-center gap-2">
            <WalletIcon size={28} className="text-brand-600 dark:text-brand-400" /> Carteira
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Gerencie seus ganhos e saques</p>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Disponível', value: mockBalance.available, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            { label: 'Pendente', value: mockBalance.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            { label: 'Total', value: mockBalance.total, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950/30' },
          ].map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-base p-5">
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{b.label}</p>
              <p className={`font-display font-extrabold text-2xl mt-1 ${b.color}`}>
                R$ <AnimatedCounter target={b.value} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Withdraw */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          {!showWithdraw ? (
            <button onClick={() => setShowWithdraw(true)} className="btn-primary flex items-center gap-2">
              <ArrowUpCircle size={18} /> Solicitar saque
            </button>
          ) : (
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Solicitar saque via PIX</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">Valor</label>
                  <p className="font-display font-extrabold text-xl text-emerald-600 dark:text-emerald-400">R$ {mockBalance.available.toFixed(2)}</p>
                  <p className="text-xs text-surface-400">Saldo disponível para saque</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleWithdraw} disabled={withdrawing} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {withdrawing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpCircle size={16} />} Confirmar saque
                  </button>
                  <button onClick={() => setShowWithdraw(false)} className="btn-secondary">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-base overflow-hidden mt-6">
          <div className="p-5 border-b border-surface-100 dark:border-surface-800">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Histórico de transações</h2>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {mockTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="p-4 flex items-center gap-3 hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'received' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
                  tx.type === 'withdrawal' ? 'bg-blue-50 dark:bg-blue-950/30' :
                  'bg-surface-100 dark:bg-surface-800'
                }`}>
                  {tx.type === 'received' ? <ArrowDownCircle size={20} className="text-emerald-500" /> :
                   tx.type === 'withdrawal' ? <ArrowUpCircle size={20} className="text-blue-500" /> :
                   <WalletIcon size={20} className="text-surface-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{tx.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span>{tx.date}</span>
                    {tx.status === 'completed' && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle size={10} /> Concluído</span>}
                    {tx.status === 'pending' && <span className="flex items-center gap-1 text-amber-500"><Clock size={10} /> Pendente</span>}
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-900 dark:text-white'}`}>
                  {tx.amount >= 0 ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
