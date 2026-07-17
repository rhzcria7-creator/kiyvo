'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Bell, Shield, Camera, Save, Loader2, Moon, Sun, Palette, Globe, Eye } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { ThemeSelector } from '@/components/ui/ThemeToggle'
import { useTheme } from '@/lib/theme/useTheme'
import toast from 'react-hot-toast'

export default function ConfiguracoesPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { isDark } = useTheme()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        username: form.username,
        bio: form.bio,
        phone: form.phone,
      })
      .eq('id', user.id)

    if (error) toast.error('Erro ao salvar')
    else { toast.success('Perfil atualizado!'); await refreshProfile() }
    setLoading(false)
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white">Configurações</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Gerencie seu perfil e preferências</p>
        </motion.div>

        <div className="mt-8 space-y-6">
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4 flex items-center gap-2"><User size={20} className="text-brand-600 dark:text-brand-400" /> Perfil</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-display font-extrabold text-2xl">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="px-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center gap-2">
                <Camera size={16} /> Alterar foto
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Nome de usuário</label>
                <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Nome completo</label>
                <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Telefone</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(11) 99999-9999" className="input-base" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">E-mail</label>
                <input type="email" value={user?.email || ''} disabled className="input-base bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Bio</label>
                <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} placeholder="Conte um pouco sobre você..." className="input-base resize-none" />
              </div>
            </div>
          </motion.div>

          {/* Appearance / Theme */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Palette size={20} className="text-brand-600 dark:text-brand-400" /> Aparência</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    {isDark ? <Moon size={18} className="text-brand-400" /> : <Sun size={18} className="text-brand-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">Tema</p>
                    <p className="text-xs text-surface-400">Escolha entre claro, escuro ou automático</p>
                  </div>
                </div>
                <ThemeSelector />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Bell size={20} className="text-brand-600 dark:text-brand-400" /> Notificações</h2>
            <div className="space-y-3">
              {[
                { label: 'Novas mensagens', desc: 'Receba notificações de chat', default: true },
                { label: 'Atualizações de pedidos', desc: 'Status de compras e vendas', default: true },
                { label: 'Promoções e ofertas', desc: 'Cupons e descontos exclusivos', default: false },
                { label: 'Newsletter semanal', desc: 'Resumo de novidades da Kiyvo', default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-surface-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-10 h-5 bg-surface-300 dark:bg-surface-600 peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={20} className="text-brand-600 dark:text-brand-400" /> Segurança</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-surface-500 dark:text-surface-400" />
                  <div className="text-left"><p className="text-sm font-medium text-surface-900 dark:text-white">Alterar senha</p><p className="text-xs text-surface-400">Última alteração: nunca</p></div>
                </div>
                <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">Alterar</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-surface-500 dark:text-surface-400" />
                  <div className="text-left"><p className="text-sm font-medium text-surface-900 dark:text-white">Verificação de identidade</p><p className="text-xs text-surface-400">Status: {profile?.verification_status === 'verified' ? '✅ Verificado' : '⚠️ Não verificado'}</p></div>
                </div>
                <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">Verificar</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-surface-500 dark:text-surface-400" />
                  <div className="text-left"><p className="text-sm font-medium text-surface-900 dark:text-white">Sessões ativas</p><p className="text-xs text-surface-400">Gerencie seus dispositivos conectados</p></div>
                </div>
                <span className="text-brand-600 dark:text-brand-400 text-sm font-medium">Gerenciar</span>
              </button>
            </div>
          </motion.div>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary py-3.5"
          >
            {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2"><Save size={18} /> Salvar Alterações</span>}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
