'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Image, MoreVertical, Shield, Star, Clock, CheckCheck } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/ui/AdvancedAnimations'

const conversations = [
  { id: '1', name: 'PixelKing', avatar: 'https://picsum.photos/seed/ch1/40/40', lastMessage: 'Conta entregue, pode confirmar!', time: '2h', unread: 2, product: 'Conta Valorant', status: 'delivered' },
  { id: '2', name: 'SoftVault', avatar: 'https://picsum.photos/seed/ch2/40/40', lastMessage: 'A licença foi enviada por e-mail', time: '5h', unread: 0, product: 'Windows 11 Pro', status: 'delivered' },
  { id: '3', name: 'EduPro', avatar: 'https://picsum.photos/seed/ch3/40/40', lastMessage: 'Acesse o curso pelo link que enviei', time: '1 dia', unread: 1, product: 'Curso Full Stack', status: 'pending' },
]

const messages = [
  { id: '1', sender: 'seller', text: 'Olá! Obrigado pela compra da Conta Valorant. Vou enviar os dados agora.', time: '14:30' },
  { id: '2', sender: 'system', text: '💳 Pagamento de R$ 89,90 confirmado via PIX', time: '14:31' },
  { id: '3', sender: 'seller', text: 'Login: joao@email.com\nSenha: xK9#mP2!\nAcesse e altere a senha imediatamente por segurança.', time: '14:32' },
  { id: '4', sender: 'buyer', text: 'Recebi! Vou acessar agora', time: '14:35' },
  { id: '5', sender: 'seller', text: 'Conta entregue, pode confirmar!', time: '14:40' },
]

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(conversations[0])
  const [message, setMessage] = useState('')

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 mb-6">Mensagens</h1>
        </FadeInOnScroll>

        <div className="card-base overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-surface-100 overflow-y-auto shrink-0">
              <div className="p-3">
                <input type="text" placeholder="Buscar conversa..." className="input-base text-sm" />
              </div>
              <div className="divide-y divide-surface-100">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ backgroundColor: 'rgba(37,99,235,0.03)' }}
                    onClick={() => setActiveChat(conv)}
                    className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                      activeChat.id === conv.id ? 'bg-brand-50 border-l-4 border-brand-500' : ''
                    }`}
                  >
                    <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-surface-900 truncate">{conv.name}</p>
                        <span className="text-xs text-surface-400 shrink-0">{conv.time}</span>
                      </div>
                      <p className="text-xs text-surface-500 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-brand-600 mt-0.5">{conv.product}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeChat.avatar} alt={activeChat.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-display font-bold text-sm text-surface-900">{activeChat.name}</p>
                    <p className="text-xs text-surface-400 flex items-center gap-1">
                      <Shield size={10} className="text-emerald-500" /> Pedido: {activeChat.product}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeChat.status === 'delivered' && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCheck size={12} /> Entregue
                    </span>
                  )}
                  <button className="p-2 hover:bg-surface-100 rounded-lg"><MoreVertical size={16} className="text-surface-400" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'buyer' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {msg.sender === 'system' ? (
                      <div className="px-4 py-2 bg-surface-100 rounded-xl text-xs text-surface-600 text-center max-w-md">
                        {msg.text}
                      </div>
                    ) : (
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                        msg.sender === 'buyer'
                          ? 'bg-brand-600 text-white rounded-br-md'
                          : 'bg-surface-100 text-surface-800 rounded-bl-md'
                      }`}>
                        {msg.text}
                        <p className={`text-[10px] mt-1 ${msg.sender === 'buyer' ? 'text-brand-200' : 'text-surface-400'}`}>{msg.time}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-surface-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface-100 rounded-lg"><Paperclip size={18} className="text-surface-400" /></button>
                  <button className="p-2 hover:bg-surface-100 rounded-lg"><Image size={18} className="text-surface-400" /></button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="input-base flex-1 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
