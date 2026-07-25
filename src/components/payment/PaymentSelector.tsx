'use client'

// ─────────────────────────────────────────────────────────────
// PaymentSelector v0.0.1 — Seletor de método de pagamento
// PIX (5% OFF), Cartão Crédito/Débito, Boleto, KD Points
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, FileText, Coins, Zap, Check } from 'lucide-react'
import clsx from 'clsx'

export type PaymentMethodType = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'kd_points'

interface PaymentOption {
  id: PaymentMethodType
  name: string
  description: string
  icon: React.ReactNode
  discount?: string
  processingTime: string
  fee: string
}

interface PaymentSelectorProps {
  selected: PaymentMethodType
  onChange: (method: PaymentMethodType) => void
  total: number
  kdPointsBalance?: number
}

const OPTIONS: PaymentOption[] = [
  {
    id: 'pix',
    name: 'PIX',
    description: 'Pagamento instantâneo',
    icon: <Smartphone className="w-5 h-5" />,
    discount: '5% OFF',
    processingTime: 'Confirmação imediata',
    fee: '0,99%',
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    description: 'Até 12x sem juros',
    icon: <CreditCard className="w-5 h-5" />,
    processingTime: 'Confirmação em até 3 dias',
    fee: '4,99% + R$0,50',
  },
  {
    id: 'debit_card',
    name: 'Cartão de Débito',
    description: 'Débito em conta',
    icon: <CreditCard className="w-5 h-5" />,
    processingTime: 'Confirmação em até 2 dias',
    fee: '2,99% + R$0,30',
  },
  {
    id: 'boleto',
    name: 'Boleto Bancário',
    description: 'Vencimento em 3 dias',
    icon: <FileText className="w-5 h-5" />,
    processingTime: 'Confirmação em até 3 dias úteis',
    fee: '1,99% + R$3,00',
  },
  {
    id: 'kd_points',
    name: 'KD Points',
    description: `Saldo via KD Points`,
    icon: <Coins className="w-5 h-5" />,
    processingTime: 'Instantâneo',
    fee: '0%',
  },
]

export default function PaymentSelector({ selected, onChange, total, kdPointsBalance = 0 }: PaymentSelectorProps) {
  const OPTIONS: PaymentOption[] = [
    { id: 'pix', name: 'PIX', description: 'Pagamento instantâneo', icon: <Smartphone className="w-5 h-5" />, discount: '5% OFF', processingTime: 'Confirmação imediata', fee: '0,99%' },
    { id: 'credit_card', name: 'Cartão de Crédito', description: 'Até 12x sem juros', icon: <CreditCard className="w-5 h-5" />, processingTime: 'Confirmação em até 3 dias', fee: '4,99% + R$0,50' },
    { id: 'debit_card', name: 'Cartão de Débito', description: 'Débito em conta', icon: <CreditCard className="w-5 h-5" />, processingTime: 'Confirmação em até 2 dias', fee: '2,99% + R$0,30' },
    { id: 'boleto', name: 'Boleto Bancário', description: 'Vencimento em 3 dias', icon: <FileText className="w-5 h-5" />, processingTime: 'Confirmação em até 3 dias úteis', fee: '1,99% + R$3,00' },
    { id: 'kd_points', name: 'KD Points', description: `Saldo: ${(kdPointsBalance || 0).toLocaleString()} pts`, icon: <Coins className="w-5 h-5" />, processingTime: 'Instantâneo', fee: '0%' },
  ]
  const pixDiscount = total * 0.05

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Forma de Pagamento</h3>

      {OPTIONS.map((option, index) => {
        const isSelected = selected === option.id
        const isDisabled = option.id === 'kd_points' && kdPointsBalance < total * 100

        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !isDisabled && onChange(option.id)}
            disabled={isDisabled}
            className={clsx(
              'w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl border text-left transition-all',
              isSelected
                ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
              isDisabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {/* Icon */}
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              isSelected ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            )}>
              {option.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{option.name}</span>
                {option.discount && selected === 'pix' && (
                  <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                    {option.discount}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{option.description}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400">
                <span>⏱ {option.processingTime}</span>
                <span>💰 {option.fee === '0%' ? 'Sem taxa' : `Taxa: ${option.fee}`}</span>
              </div>
            </div>

            {/* Selected check + Discount */}
            <div className="text-right shrink-0">
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white dark:text-zinc-900" />
                </div>
              )}
              {option.id === 'pix' && selected === 'pix' && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  -R$ {pixDiscount.toFixed(2)}
                </p>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
