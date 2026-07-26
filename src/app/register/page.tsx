'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Chrome } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [agree, setAgree] = useState(false)
  const valid = name.length > 2 && email.includes('@') && password.length >= 6 && agree

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-[#0B0F1A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Criar Conta</h1>
            <p className="text-sm text-zinc-500 mt-1">Gratis. Sem cartao.</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 caracteres"
                  className="w-full h-11 pl-10 pr-10 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="mt-0.5 rounded" />
              <span className="text-xs text-zinc-400">Aceito os <a href="/terms" className="text-blue-600 underline">Termos</a></span>
            </label>
            <button type="submit" disabled={!valid}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-40">
              Criar Conta <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-xs text-zinc-400 mt-6">
            Ja tem conta? <a href="/login" className="text-blue-600 font-medium hover:underline">Entrar</a>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
