'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, HelpCircle, MessageCircle, FileText, Mail, Shield, CreditCard, ShoppingBag, User, Package, ArrowRight } from 'lucide-react'

const FAQS = [
  { q: 'Como funciona a taxa do KIYVO?', a: 'A taxa e ZERO nas primeiras R$ 5.000 em vendas. Apos isso, as taxas variam de 1% a 7% dependendo do seu nivel de vendedor (Bronze a Legend). Nao cobramos taxa de cadastro ou mensalidade.' },
  { q: 'Como recebo o dinheiro das vendas?', a: 'O saque pode ser feito via PIX (minimo R$ 30) ou TED. O valor fica em escrow por 7 dias para seguranca, e depois e liberado automaticamente.' },
  { q: 'Como faco para comecar a vender?', a: 'Basta criar uma conta gratuita, clicar em "Vender" e cadastrar seu primeiro produto. Voce pode vender softwares, cursos, ebooks, templates, design e muito mais.' },
  { q: 'O que sao KD Points?', a: 'KD Points sao pontos de recompensa que voce ganha ao comprar no KIYVO. Cada real gasto gera pontos que podem ser usados como desconto em compras futuras (ate 50% do valor).' },
  { q: 'Como funciona o escrow de 7 dias?', a: 'Apos a compra, o dinheiro fica retido em custodia por 7 dias. Esse prazo garante que o comprador receba o produto corretamente. Apos esse periodo, o valor e liberado automaticamente para o vendedor.' },
  { q: 'E seguro comprar no KIYVO?', a: 'Sim! Utilizamos escrow de 7 dias, sistema anti-fraude com deteccao de dispositivos, bloqueio de IPs suspeitos, verificacao de CPF e cartao, alem de criptografia SSL em todas as transacoes.' },
  { q: 'Como abrir uma disputa?', a: 'Caso tenha problemas com um pedido, va em "Meus Pedidos", selecione o pedido e clique em "Abrir Disputa". Anexe provas e aguarde a mediacao do nosso time em ate 48h.' },
  { q: 'Qual o prazo de entrega?', a: 'Produtos digitais sao entregues instantaneamente apos a confirmacao do pagamento. Produtos manuais tem prazo definido pelo vendedor.' },
]

const CATEGORIES = [
  { icon: <ShoppingBag className="w-5 h-5" />, title: 'Compras', desc: 'Como comprar, pagamentos, entregas', href: '/help/orders' },
  { icon: <Package className="w-5 h-5" />, title: 'Vendas', desc: 'Vender produtos, taxas, saques', href: '/sell' },
  { icon: <User className="w-5 h-5" />, title: 'Conta', desc: 'Cadastro, seguranca, configuracoes', href: '/help/account' },
  { icon: <CreditCard className="w-5 h-5" />, title: 'Pagamentos', desc: 'PIX, cartao, boleto, KD Points', href: '/help/payments' },
  { icon: <Shield className="w-5 h-5" />, title: 'Seguranca', desc: 'Protecao, disputas, fraudes', href: '/help/security' },
  { icon: <MessageCircle className="w-5 h-5" />, title: 'Suporte', desc: 'Fale conosco, tickets, chat', href: '/help/contact' },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const filtered = search ? FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())) : FAQS

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-[#0B0F1A] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4">Central de Ajuda</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Tire suas duvidas sobre o KIYVO</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar duvidas..."
              className="w-full h-12 pl-12 pr-4 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <a key={cat.title} href={cat.href}
              className="flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">{cat.icon}</div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">{cat.title}</span>
              <span className="text-xs text-zinc-400">{cat.desc}</span>
            </a>
          ))}
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Perguntas Frequentes</h2>
        <div className="space-y-2 mb-12">
          {filtered.map(faq => (
            <div key={faq.q} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-white pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${openFaq === faq.q ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === faq.q && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="text-center py-8 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Ainda precisa de ajuda?</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Nosso time de suporte responde em ate 2 horas</p>
          <div className="flex items-center justify-center gap-3">
            <a href="/contact" className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:opacity-90">
              <Mail className="w-4 h-4" /> Email
            </a>
            <a href="/chat" className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
