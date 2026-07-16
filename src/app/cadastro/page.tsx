'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/shared/PageTransition'
import { Mail, Lock, User, Phone } from 'lucide-react'

export default function CadastroPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display font-extrabold text-lg">P</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Crie sua conta</h1>
            <p className="text-surface-500 text-sm mt-1">Comece a comprar e vender agora</p>
          </div>

          <div className="card-base p-6 sm:p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome" placeholder="Seu nome" icon={<User size={18} />} />
                <Input label="Username" placeholder="nickname" />
              </div>
              <Input label="E-mail" type="email" placeholder="seu@email.com" icon={<Mail size={18} />} />
              <Input label="Celular" type="tel" placeholder="(31) 99999-9999" icon={<Phone size={18} />} />
              <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" icon={<Lock size={18} />} />
              <Input label="Confirmar Senha" type="password" placeholder="Repita a senha" icon={<Lock size={18} />} />

              <label className="flex items-start gap-2 text-sm text-surface-600">
                <input type="checkbox" className="mt-1 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                <span>Li e concordo com os <Link href="/termos" className="text-brand-600 font-medium hover:underline">Termos de Uso</Link> e a <Link href="/privacidade" className="text-brand-600 font-medium hover:underline">Política de Privacidade</Link></span>
              </label>

              <Button className="w-full" size="lg">Criar Conta</Button>
            </form>
          </div>

          <p className="text-center text-sm text-surface-500 mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
