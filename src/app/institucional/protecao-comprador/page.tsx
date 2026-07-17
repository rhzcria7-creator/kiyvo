'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, ChevronRight, Scale, Users, AlertTriangle, CheckCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /institucional/protecao-comprador — Proteção ao Comprador
// SEO crítico — mostra que o dinheiro fica em Escrow
// ═══════════════════════════════════════════════════════════════

export default function ProtecaoCompradorPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-blue-600/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Proteção ao Comprador</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Seu dinheiro fica seguro do início ao fim. O Kiyvo retém o pagamento em Escrow até você confirmar que recebeu o produto.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-12">
        {/* Como funciona */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-white mb-6">Como funciona a proteção</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: <CheckCircle className="w-6 h-6" />, title: 'Você paga', desc: 'O pagamento vai para a conta do Kiyvo, não para o vendedor.' },
              { step: '2', icon: <Eye className="w-6 h-6" />, title: 'Produto entregue', desc: 'O vendedor entrega a chave/produto. Você visualiza na Biblioteca.' },
              { step: '3', icon: <Lock className="w-6 h-6" />, title: 'Confirmação', desc: 'Após confirmar ou 7 dias, o dinheiro é liberado ao vendedor.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">{item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Garantias */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-white mb-6">Suas garantias</h2>
          <div className="space-y-4">
            {[
              { icon: <Lock className="w-5 h-5 text-emerald-400" />, title: 'Escrow 100% seguro', desc: 'O dinheiro fica retido em custódia pela plataforma. O vendedor só recebe após a confirmação.' },
              { icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />, title: '7 dias para disputa', desc: 'Se a chave não funcionar ou o produto não corresponder à descrição, abra uma disputa em até 7 dias.' },
              { icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'Reembolso garantido', desc: 'Em caso de fraude comprovada, devolvemos 100% do seu dinheiro.' },
              { icon: <Users className="w-5 h-5 text-purple-400" />, title: 'Vendedores verificados (KYC)', desc: 'Todo vendedor passa por verificação de identidade com CPF, documento e selfie.' },
              { icon: <Eye className="w-5 h-5 text-cyan-400" />, title: 'Entrega instantânea rastreável', desc: 'Produtos com auto-entrega são entregues no exato milissegundo da confirmação do pagamento.' },
              { icon: <Scale className="w-5 h-5 text-orange-400" />, title: 'Mediação imparcial', desc: 'Nossa equipe de suporte analisa todas as disputas de forma justa e imparcial.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-600/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Compre com confiança</h2>
          <p className="text-slate-400 mb-6">Todos os produtos no Kiyvo estão protegidos pelo nosso sistema de Escrow</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition-colors">
              Explorar Produtos
            </Link>
            <Link href="/institucional/como-funciona" className="px-6 py-3 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-white font-medium transition-colors">
              Como Funciona
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
