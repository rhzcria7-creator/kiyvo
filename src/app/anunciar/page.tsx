'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/shared/PageTransition'
import { Upload, Image, Tag, Zap } from 'lucide-react'

const categories = ['Valorant', 'Minecraft', 'Fortnite', 'Free Fire', 'Steam', 'Roblox', 'League of Legends', 'Clash of Clans', 'CS2', 'Genshin Impact', 'Gift Cards', 'Assinaturas', 'Outro']

export default function AnunciarPage() {
  const [plan, setPlan] = useState<'silver' | 'gold' | 'diamond'>('gold')

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 mb-2">Criar Anúncio</h1>
        <p className="text-surface-500 text-sm mb-8">Preencha as informações do seu produto e comece a vender</p>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <Input label="Título do Anúncio" placeholder="Ex: Conta Valorant Diamante + 40 Skins" />

          <div>
            <label className="block text-sm font-medium text-surface-700 font-display mb-1.5">Categoria</label>
            <select className="input-base">
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 font-display mb-1.5">Descrição</label>
            <textarea className="input-base min-h-[120px] resize-y" placeholder="Descreva detalhadamente o que está anunciando..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" placeholder="0,00" />
            <div>
              <label className="block text-sm font-medium text-surface-700 font-display mb-1.5">Tipo de Entrega</label>
              <select className="input-base">
                <option value="auto">Automática</option>
                <option value="manual">Manual (via chat)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 font-display mb-1.5">Imagens</label>
            <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer">
              <Upload size={32} className="text-surface-300 mx-auto mb-2" />
              <p className="text-sm text-surface-500">Arraste imagens aqui ou clique para selecionar</p>
              <p className="text-xs text-surface-400 mt-1">PNG, JPG até 5MB • Máximo 8 imagens</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 font-display mb-1.5">Plano do Anúncio</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'silver' as const, name: 'Prata', fee: '9,99%', desc: 'Anúncio padrão' },
                { id: 'gold' as const, name: 'Ouro', fee: '11,99%', desc: 'Destaque na home' },
                { id: 'diamond' as const, name: 'Diamante', fee: '12,99%', desc: 'Máxima visibilidade' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    plan === p.id ? 'border-brand-500 bg-brand-50' : 'border-surface-200 bg-white'
                  }`}
                >
                  <p className="font-display font-bold text-sm text-surface-900">{p.name}</p>
                  <p className="text-xs text-brand-600 font-bold">{p.fee}</p>
                  <p className="text-[10px] text-surface-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" icon={<Zap size={18} />}>Publicar Anúncio</Button>
        </form>
      </div>
    </PageTransition>
  )
}
