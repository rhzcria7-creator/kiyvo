'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, ShoppingBag, Heart, Library, Settings, LogOut, ChevronRight, Award, Wallet, MessageCircle, HelpCircle, FileText } from 'lucide-react'
import clsx from 'clsx'

interface AccountMenuItem { id: string; label: string; icon: React.ReactNode; href: string; badge?: number; highlight?: boolean }
interface AccountMenuProps { userName?: string; userEmail?: string; avatar?: string; onLogout?: () => void; role?: 'buyer' | 'seller' }

const BUYER_ITEMS: AccountMenuItem[] = [
  { id: 'orders', label: 'Meus Pedidos', icon: <ShoppingBag className="w-4 h-4" />, href: '/account/orders' },
  { id: 'library', label: 'Biblioteca', icon: <Library className="w-4 h-4" />, href: '/account/library' },
  { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-4 h-4" />, href: '/favorites' },
  { id: 'kd-points', label: 'KD Points', icon: <Award className="w-4 h-4" />, href: '/account/kd-points', badge: 150 },
  { id: 'wallet', label: 'Carteira', icon: <Wallet className="w-4 h-4" />, href: '/wallet' },
  { id: 'tickets', label: 'Suporte', icon: <MessageCircle className="w-4 h-4" />, href: '/account/tickets' },
  { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" />, href: '/configuracoes' },
]

const SELLER_ITEMS: AccountMenuItem[] = [
  { id: 'products', label: 'Meus Produtos', icon: <FileText className="w-4 h-4" />, href: '/seller/products' },
  { id: 'sales', label: 'Vendas', icon: <ShoppingBag className="w-4 h-4" />, href: '/seller/sales' },
  { id: 'analytics', label: 'Analytics', icon: <Award className="w-4 h-4" />, href: '/seller/analytics', highlight: true },
  { id: 'wallet', label: 'Financeiro', icon: <Wallet className="w-4 h-4" />, href: '/wallet' },
  { id: 'boost', label: 'Impulsionar', icon: <Award className="w-4 h-4" />, href: '/seller/boost' },
  { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" />, href: '/configuracoes' },
]

export default function AccountMenu({ userName = 'Usuário', userEmail, avatar, onLogout, role = 'buyer' }: AccountMenuProps) {
  const items = role === 'seller' ? SELLER_ITEMS : BUYER_ITEMS

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 mb-2">
        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-500 overflow-hidden shrink-0">
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{userName}</p>
          {userEmail && <p className="text-xs text-zinc-500 truncate">{userEmail}</p>}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <motion.a
            key={item.id} href={item.href}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className={clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all group',
              item.highlight ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
            )}
          >
            <span className={clsx('p-1.5 rounded-lg', item.highlight ? 'opacity-80' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500')}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{item.badge}</span>}
            <ChevronRight className={clsx('w-3.5 h-3.5', item.highlight ? 'opacity-80' : 'text-zinc-300')} />
          </motion.a>
        ))}
      </div>

      {/* Logout */}
      <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 w-full mt-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut className="w-4 h-4" /> <span>Sair</span>
      </button>
    </div>
  )
}
