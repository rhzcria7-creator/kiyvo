'use client'
// Página de NOTIFICAÇÕES — lista real com mark-as-read e limpar.
// Comentários em PT-BR.
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bell, CheckCheck, Trash2, ShoppingBag, Gift, Star,
  Shield, Sparkles, Heart, Award, UserPlus,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useNotif } from '@/lib/notifications/store'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'

const iconesMap: Record<string, React.ReactNode> = {
  compra: <ShoppingBag className="w-5 h-5" />,
  venda: <Award className="w-5 h-5" />,
  review: <Star className="w-5 h-5" />,
  kd: <Award className="w-5 h-5" />,
  cupom: <Gift className="w-5 h-5" />,
  sistema: <Shield className="w-5 h-5" />,
  follow: <Heart className="w-5 h-5" />,
  afiliado: <UserPlus className="w-5 h-5" />,
  freela: <Sparkles className="w-5 h-5" />,
}

export default function NotificacoesPage() {
  const { user } = useAuth()
  const { init, listar, marcarLida, marcarTodasLidas, limpar, unread } = useNotif()

  useEffect(() => { init() }, [init])
  const items = listar()

  function tempoAtras(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'agora'
    if (m < 60) return `há ${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `há ${h}h`
    const d = Math.floor(h / 24)
    if (d < 7) return `há ${d}d`
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
        <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-brand-500" /> Notificações
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unread > 0 ? `${unread} não lida${unread > 1 ? 's' : ''}` : 'Tudo em dia'}
              </p>
            </div>
            {items.length > 0 && (
              <div className="flex gap-1">
                <button onClick={() => { marcarTodasLidas(); toast.success('Todas marcadas como lidas') }}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Marcar todas como lidas">
                  <CheckCheck className="w-5 h-5" />
                </button>
                <button onClick={() => { limpar(); toast.success('Notificações limpas') }}
                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-950/30 text-red-500" title="Limpar tudo">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {!user ? (
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-10 text-center border border-slate-100 dark:border-slate-800">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-xl font-black mb-2">Faça login</h2>
              <p className="text-slate-500 text-sm mb-5">Entre para ver suas notificações.</p>
              <Link href="/login?redirect=/notificacoes" className="inline-flex items-center gap-2 bg-[#0F172A] text-white rounded-full px-6 py-3 font-black text-sm">
                Entrar
              </Link>
            </div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-10 text-center border border-slate-100 dark:border-slate-800">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-xl font-black mb-2 text-[#0F172A] dark:text-white">Nada por aqui</h2>
              <p className="text-slate-500 text-sm mb-5">Você não tem notificações ainda.</p>
              <Link href="/buscar" className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-full px-6 py-3 font-black text-sm">
                Explorar produtos
              </Link>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((n, i) => (
                <motion.div key={n.id}
                  initial={{ opacity:0,y:8 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
                  transition={{ delay:i*0.03 }}>
                  <Link href={n.link || '#'}
                    onClick={() => { if (!n.lida) marcarLida(n.id) }}
                    className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition ${!n.lida ? 'bg-brand-50/50 dark:bg-brand-950/10' : ''}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !n.lida ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                             : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                    }`}>
                      {iconesMap[n.tipo] || <Bell className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className={`font-black text-sm ${!n.lida ? 'text-[#0F172A] dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.titulo}</p>
                        {!n.lida && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.mensagem}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{tempoAtras(n.criadaEm)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
