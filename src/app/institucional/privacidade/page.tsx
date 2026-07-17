'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, Eye, Shield, Database, Mail, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /institucional/privacidade — Política de Privacidade
// ═══════════════════════════════════════════════════════════════

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-400" /> Política de Privacidade
            </h1>
            <p className="text-slate-400 text-sm mt-2">Última atualização: Julho 2026 — Em conformidade com a LGPD</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-white text-xl font-bold">1. Dados Coletados</h2>
            <p>Coletamos apenas os dados necessários para o funcionamento da plataforma:</p>
            <ul>
              <li><strong className="text-white">Dados de cadastro</strong>: Nome, e-mail, telefone, CPF/CNPJ (hash encriptado);</li>
              <li><strong className="text-white">Dados de KYC</strong>: Documentos de identidade e selfie — armazenados em bucket privado encriptado;</li>
              <li><strong className="text-white">Dados de transação</strong>: Histórico de compras, vendas e pagamentos;</li>
              <li><strong className="text-white">Dados técnicos</strong>: IP (hash), user-agent, logs de segurança.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">2. Finalidade do Tratamento</h2>
            <ul>
              <li>Processar pagamentos e entregas digitais;</li>
              <li>Verificar identidade de vendedores (KYC);</li>
              <li>Prevenir fraudes e atividades ilícitas;</li>
              <li>Comunicar-se sobre pedidos, disputas e atualizações;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">3. Armazenamento e Segurança</h2>
            <p>Seus dados são protegidos por:</p>
            <ul>
              <li>Row Level Security (RLS) no Supabase PostgreSQL;</li>
              <li>Encriptação AES-256-GCM para ativos digitais no Cofre;</li>
              <li>Bucket privado para documentos KYC (acesso apenas admin);</li>
              <li>HTTPS em todas as comunicações;</li>
              <li>Stripe Connect para processamento financeiro (certificação PCI DSS).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">4. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul>
              <li><strong className="text-white">Acesso</strong>: Solicitar cópia dos seus dados;</li>
              <li><strong className="text-white">Retificação</strong>: Corrigir dados incorretos;</li>
              <li><strong className="text-white">Exclusão</strong>: Solicitar a remoção dos seus dados;</li>
              <li><strong className="text-white">Portabilidade</strong>: Exportar seus dados em formato estruturado;</li>
              <li><strong className="text-white">Revogação</strong>: Revogar consentimento a qualquer momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">5. Cookies</h2>
            <p>Utilizamos cookies apenas para autenticação e preferências de tema. Não utilizamos cookies de rastreamento de terceiros. Consulte nossa <Link href="/politica-cookies" className="text-purple-400 hover:text-purple-300">Política de Cookies</Link>.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">6. Compartilhamento</h2>
            <p>Seus dados não são vendidos ou compartilhados com terceiros, exceto:</p>
            <ul>
              <li>Stripe (processamento de pagamentos);</li>
              <li>Supabase (infraestrutura de banco de dados);</li>
              <li>Autoridades legais quando exigido por lei.</li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Para exercer seus direitos, entre em contato pelo <strong className="text-white">privacidade@kiyvo.com.br</strong></p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/institucional/termos" className="text-purple-400 text-sm hover:text-purple-300">Termos de Uso</Link>
              <Link href="/institucional/tarifas" className="text-purple-400 text-sm hover:text-purple-300">Taxas</Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
