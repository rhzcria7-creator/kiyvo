'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/shared/PageTransition'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display font-extrabold text-lg">P</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Bem-vindo de volta</h1>
            <p className="text-surface-500 text-sm mt-1">Entre na sua conta Playdex</p>
          </div>

          <div className="card-base p-6 sm:p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input label="E-mail" type="email" placeholder="seu@email.com" icon={<Mail size={18} />} />
              <Input label="Senha" type="password" placeholder="••••••••" icon={<Lock size={18} />} />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-surface-600">
                  <input type="checkbox" className="rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  Lembrar de mim
                </label>
                <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">Esqueceu a senha?</a>
              </div>

              <Button className="w-full" size="lg">Entrar</Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400">ou continue com</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Google', 'Discord', 'Facebook'].map((provider) => (
                <button
                  key={provider}
                  className="px-3 py-2.5 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 transition-all"
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-surface-500 mt-6">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="text-brand-600 hover:text-brand-700 font-semibold">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
