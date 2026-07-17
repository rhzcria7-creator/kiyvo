'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, MessageSquare, Upload, Send, Clock, CheckCircle, Shield, FileText } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '@/components/ui/AdvancedAnimations'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

const disputes = [
  { id: 'DSP-001', order: 'PD-2606-045', product: 'Key Steam — Elden Ring', seller: 'PixelKing', amount: 149.90, status: 'open', reason: 'Produto não entregue após 48h', date: '14/07/26', messages: 3 },
  { id: 'DSP-002', order: 'PD-2605-032', product: 'Conta LoL Esmeralda', seller: 'SoftVault', amount: 199.90, status: 'investigating', reason: 'Conta não corresponde à descrição', date: '12/07/26', messages: 7 },
  { id: 'DSP-003', order: 'PD-2604-021', product: 'Curso Design Figma', seller: 'EduPro', amount: 27.90, status: 'resolved', resolution: 'Reembolso integral concedido', date: '10/07/26', messages: 5 },
]

const statusConfig: Record<string, { label: string; badge: 'danger' | 'warning' | 'success'; color: string }> = {
  open: { label: 'Aberta', badge: 'danger', color: 'border-red-300 bg-red-50' },
  investigating: { label: 'Em análise', badge: 'warning', color: 'border-amber-300 bg-amber-50' },
  resolved: { label: 'Resolvida', badge: 'success', color: 'border-emerald-300 bg-emerald-50' },
}

export default function DisputasPage() {
  const [selectedDispute, setSelectedDispute] = useState(disputes[0])
  const [message, setMessage] = useState('')

  const sendMessage = () => {
    if (!message.trim()) return
    toast.success('Mensagem enviada')
    setMessage('')
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <div className="flex items-center gap-3 mb-2">
            <Shield size={28} className="text-brand-600" />
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Centro de Disputas</h1>
          </div>
          <p className="text-surface-500 text-sm mb-6">Gerencie disputas e problemas com pedidos</p>
        </FadeInOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disputes List */}
          <div className="space-y-3">
            <StaggerContainer className="space-y-3">
              {disputes.map((dispute) => {
                const config = statusConfig[dispute.status]
                return (
                  <StaggerItem key={dispute.id}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedDispute(dispute)}
                      className={`card-base p-4 cursor-pointer border-l-4 ${config.color} ${selectedDispute.id === dispute.id ? 'ring-2 ring-brand-200' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-surface-500">{dispute.id}</span>
                        <Badge variant={config.badge}>{config.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-surface-900 line-clamp-1">{dispute.product}</p>
                      <p className="text-xs text-surface-400 mt-1">{dispute.reason}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MessageSquare size={10} /> {dispute.messages}</span>
                        <span>R$ {dispute.amount.toFixed(2)}</span>
                        <span>{dispute.date}</span>
                      </div>
                    </motion.div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>

            {/* Open New Dispute */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full card-base p-4 border-2 border-dashed border-surface-300 text-center hover:border-brand-400 transition-colors"
            >
              <AlertTriangle size={20} className="text-surface-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-surface-500">Abrir Nova Disputa</p>
            </motion.button>
          </div>

          {/* Dispute Detail */}
          <div className="lg:col-span-2">
            <div className="card-base overflow-hidden">
              <div className="p-5 border-b border-surface-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-lg text-surface-900">{selectedDispute.product}</h2>
                    <p className="text-xs text-surface-400">Pedido {selectedDispute.order} • {selectedDispute.date}</p>
                  </div>
                  <Badge variant={statusConfig[selectedDispute.status].badge}>
                    {statusConfig[selectedDispute.status].label}
                  </Badge>
                </div>
              </div>

              {/* Reason */}
              <div className="p-5 bg-amber-50/50 border-b border-surface-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Motivo da disputa</p>
                    <p className="text-sm text-surface-600 mt-0.5">{selectedDispute.reason}</p>
                  </div>
                </div>
                {selectedDispute.resolution && (
                  <div className="flex items-start gap-3 mt-3 pt-3 border-t border-amber-200">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">Resolução</p>
                      <p className="text-sm text-surface-600 mt-0.5">{selectedDispute.resolution}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
                {[
                  { sender: 'buyer', text: 'Faz mais de 48h que paguei e não recebi a key. Quero reembolso.', time: '14/07 10:30' },
                  { sender: 'system', text: '⚠️ O vendedor tem 24h para responder antes da mediação automática.', time: '14/07 10:30' },
                  { sender: 'seller', text: 'Desculpe o atraso! Tive um problema técnico. Vou enviar agora.', time: '14/07 14:20' },
                  { sender: 'buyer', text: 'Ainda não recebi. Vou manter a disputa aberta.', time: '14/07 18:00' },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${msg.sender === 'buyer' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {msg.sender === 'system' ? (
                      <div className="px-4 py-2 bg-amber-50 rounded-xl text-xs text-amber-800 text-center">{msg.text}</div>
                    ) : (
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'buyer' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-surface-100 text-surface-800 rounded-bl-md'}`}>
                        {msg.text}
                        <p className={`text-[10px] mt-1 ${msg.sender === 'buyer' ? 'text-brand-200' : 'text-surface-400'}`}>{msg.time}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              {selectedDispute.status !== 'resolved' && (
                <div className="p-4 border-t border-surface-100">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-surface-100 rounded-lg"><Upload size={18} className="text-surface-400" /></button>
                    <button className="p-2 hover:bg-surface-100 rounded-lg"><FileText size={18} className="text-surface-400" /></button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Adicionar mensagem..."
                      className="input-base flex-1 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage} className="p-2.5 bg-brand-600 text-white rounded-xl">
                      <Send size={18} />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
