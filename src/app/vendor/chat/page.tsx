'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { MessageCircle, Send, Shield, Clock, Package } from 'lucide-react';

// /vendor/chat — Caixa de entrada com compradores (Supabase Realtime ready)

interface Conversation {
  id: string;
  buyerName: string;
  productTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  isRead: boolean;
}

export default function VendorChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadConversations();
  }, [user, authLoading]);

  async function loadConversations() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations((data.conversations || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          buyerName: ((c.buyer as Record<string, unknown>)?.full_name as string) || 'Comprador',
          productTitle: ((c.product as Record<string, unknown>)?.title as string) || 'Produto',
          lastMessage: (c.last_message as string) || '',
          lastMessageAt: (c.updated_at as string) || '',
          isRead: c.is_read as boolean || false,
        })));
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-purple-400" /> Chat
          </h1>
          <p className="text-slate-400 text-sm mt-1">Converse com compradores em tempo real</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-slate-800/30 rounded-xl p-5 h-20 animate-pulse" />)}</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c, i) => (
              <motion.button key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="w-full flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500/30 transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
                  {c.buyerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{c.buyerName}</p>
                    {!c.isRead && <span className="w-2 h-2 bg-purple-400 rounded-full" />}
                  </div>
                  <p className="text-slate-400 text-xs truncate">{c.lastMessage || 'Nenhuma mensagem'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-500 text-xs">{new Date(c.lastMessageAt).toLocaleDateString('pt-BR')}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{c.productTitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
