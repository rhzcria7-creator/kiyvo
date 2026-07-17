'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Shield, Users, TrendingUp, ArrowRight, Star, Package, Lock, Eye, CheckCircle } from 'lucide-react';

// /institucional/como-funciona — Landing explicativa

const steps = [
  { num: '01', icon: <Users className="w-6 h-6" />, title: 'Crie sua conta', desc: 'Cadastro rápido com e-mail. Escolha se quer comprar ou vender (ou os dois!).' },
  { num: '02', icon: <Package className="w-6 h-6" />, title: 'Explore produtos', desc: 'Mais de 20 categorias digitais: jogos, software, cursos, e-books, gift cards...' },
  { num: '03', icon: <Lock className="w-6 h-6" />, title: 'Compre com Escrow', desc: 'Seu dinheiro fica retido em custódia. O vendedor só recebe após sua confirmação.' },
  { num: '04', icon: <Zap className="w-6 h-6" />, title: 'Receba na hora', desc: 'Auto-entrega instantânea: a chave chega em milissegundos após o pagamento.' },
];

const sellerSteps = [
  { num: '01', icon: <Shield className="w-6 h-6" />, title: 'Verifique-se (KYC)', desc: 'CPF, documento, selfie. Documentos encriptados e inacessíveis após envio.' },
  { num: '02', icon: <Package className="w-6 h-6" />, title: 'Crie anúncios', desc: 'Adicione produtos ao catálogo com título, preço, tipo de entrega e descrição.' },
  { num: '03', icon: <Lock className="w-6 h-6" />, title: 'Alimente o Cofre', desc: 'Adicione chaves/contas em massa (bulk upload). Dados encriptados com AES-256-GCM.' },
  { num: '04', icon: <TrendingUp className="w-6 h-6" />, title: 'Venda e lucre', desc: 'Entrega automática + Escrow = menos disputas. Taxas de 3% a 10% conforme nível.' },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-purple-600/5" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Como o Kiyvo Funciona</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              O maior marketplace 100% digital do Brasil. Compra segura com Escrow, entrega instantânea e taxas que caem conforme você vende.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-20">
        {/* Para Compradores */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
            <span className="text-sm font-semibold text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full">Para Compradores</span>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors">
                <div className="text-3xl font-bold text-blue-500/20 mb-2">{step.num}</div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 mx-auto mb-3">{step.icon}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Para Vendedores */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
            <span className="text-sm font-semibold text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full">Para Vendedores</span>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {sellerSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-colors">
                <div className="text-3xl font-bold text-amber-500/20 mb-2">{step.num}</div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 mx-auto mb-3">{step.icon}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Diferenciais */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Por que o Kiyvo?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Escrow Bancário', desc: 'Dinheiro retido até confirmação. Zero risco de golpe.', color: 'emerald' },
              { icon: <Zap className="w-6 h-6" />, title: 'Auto-Entrega', desc: 'Chave/conta entregue em milissegundos após pagamento.', color: 'blue' },
              { icon: <Lock className="w-6 h-6" />, title: 'Cofre Digital', desc: 'Ativos encriptados com AES-256-GCM. Segurança militar.', color: 'purple' },
              { icon: <Eye className="w-6 h-6" />, title: 'KYC Completo', desc: 'Vendedores verificados com documento e selfie.', color: 'yellow' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Taxas que Caem', desc: 'De 10% até 3% conforme volume de vendas.', color: 'amber' },
              { icon: <Star className="w-6 h-6" />, title: 'Afiliações Virais', desc: 'Ganhe 5% por cada compra via seu link de afiliado.', color: 'cyan' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-blue-500/20 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}-600/20 flex items-center justify-center text-${item.color}-400 mb-3`}>{item.icon}</div>
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-transparent border border-blue-600/20 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Comece agora mesmo</h2>
          <p className="text-slate-400 mb-6">Cadastre-se em 30 segundos e explore o maior marketplace digital do Brasil</p>
          <div className="flex gap-4 justify-center">
            <Link href="/cadastro" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-colors flex items-center gap-2">
              Criar Conta <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/institucional/tarifas" className="px-8 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium transition-colors">
              Ver Taxas
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
