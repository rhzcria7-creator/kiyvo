'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShoppingBag, Star, DollarSign, Shield, Gift, Check, Trash2, CheckCheck } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, PulseRing } from '@/components/ui/AdvancedAnimations'
import toast from 'react-hot-toast'

const initialNotifications = [
  { id: '1', type: 'order', title: 'Novo pedido recebido!', message: 'Alguém comprou seu "Windows 11 Pro"', time: '2 min', isRead: false },
  { id: '2', type: 'review', title: 'Nova avaliação ⭐⭐⭐⭐⭐', message: 'SoftVault avaliou sua entrega com 5 estrelas', time: '15 min', isRead: false },
  { id: '3', type: 'verification', title: 'Verificação aprovada!', message: 'Sua verificação de identidade foi aprovada. Você já pode anunciar!', time: '1h', isRead: false },
  { id: '4', type: 'withdrawal', title: 'Saque processado', message: 'Seu saque de R$ 450,00 via PIX foi processado com sucesso', time: '3h', isRead: true },
  { id: '5', type: 'promotion', title: '🎁 Cupom disponível!', message: 'Use SOFTWARE25 para 25% de desconto em licenças', time: '6h', isRead: true },
  { id: '6', type: 'order', title: 'Pedido entregue', message: 'O pedido PD-2607-088 foi entregue com sucesso', time: '1 dia', isRead: true },
  { id: '7', type: 'system', title: 'Novos recursos', message: 'Agora você pode favoritar produtos! Clique no ❤️ para salvar', time: '2 dias', isRead: true },
  { id: '8', type: 'review', title: 'Nova avaliação', message: 'DesignLab avaliou sua entrega com 4 estrelas', time: '3 dias', isRead: true },
]

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  order: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  verification: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  withdrawal: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  promotion: { icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
  system: { icon: Bell, color: 'text-brand-600', bg: 'bg-brand-50' },
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); toast.success('Todas marcadas como lidas') }
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Notificações</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full font-display">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
              <CheckCheck size={16} /> Marcar todas como lidas
            </button>
          )}
        </motion.div>

        <StaggerContainer className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.system
              const Icon = config.icon
              return (
                <StaggerItem key={notif.id}>
                  <motion.div
                    layout
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    className={`card-base p-4 flex items-start gap-4 ${!notif.isRead ? 'border-l-4 border-brand-500 bg-brand-50/30' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${!notif.isRead ? 'text-surface-900' : 'text-surface-700'}`}>{notif.title}</p>
                        {!notif.isRead && <PulseRing className="shrink-0" />}
                      </div>
                      <p className="text-sm text-surface-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-surface-400 mt-1">{notif.time}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <button onClick={() => markRead(notif.id)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors" title="Marcar como lida">
                          <Check size={14} className="text-surface-400" />
                        </button>
                      )}
                      <button onClick={() => deleteNotif(notif.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Remover">
                        <Trash2 size={14} className="text-surface-400 hover:text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                </StaggerItem>
              )
            })}
          </AnimatePresence>
        </StaggerContainer>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">Nenhuma notificação</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
