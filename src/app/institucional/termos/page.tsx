'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Scale, Shield, Lock, FileText, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /institucional/termos — Termos de Uso (SEO, SSG)
// ═══════════════════════════════════════════════════════════════

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-600/20 via-slate-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-400" /> Termos de Uso
            </h1>
            <p className="text-slate-400 text-sm mt-2">Última atualização: Julho 2026</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-white text-xl font-bold">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma Kiyvo, você concorda com estes Termos de Uso. O Kiyvo é um marketplace de produtos 100% digitais que conecta compradores e vendedores, operando sob sistema de Escrow para garantir a segurança de ambas as partes.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">2. Definições</h2>
            <ul>
              <li><strong className="text-white">Kiyvo</strong>: A plataforma de marketplace digital.</li>
              <li><strong className="text-white">Vendedor</strong>: Usuário que oferece produtos digitais para venda, devidamente verificado via KYC.</li>
              <li><strong className="text-white">Comprador</strong>: Usuário que adquire produtos digitais.</li>
              <li><strong className="text-white">Escrow</strong>: Sistema de custódia onde o pagamento é retido até a confirmação da entrega.</li>
              <li><strong className="text-white">Cofre Digital</strong>: Sistema encriptado onde os ativos digitais são armazenados para entrega automática.</li>
              <li><strong className="text-white">Ativo Digital</strong>: Chaves de licença, credenciais de conta, links de download, scripts ou qualquer produto entregue de forma digital.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">3. Sistema de Escrow</h2>
            <p>Todo pagamento realizado no Kiyvo segue o fluxo de Escrow:</p>
            <ol>
              <li>O comprador realiza o pagamento (PIX ou cartão).</li>
              <li>O valor é retido na conta custódia do Kiyvo.</li>
              <li>O produto é entregue ao comprador (auto-entrega ou manual).</li>
              <li>O comprador tem 7 (sete) dias para confirmar o recebimento ou abrir disputa.</li>
              <li>Após confirmação ou expiração do prazo, o valor é liberado ao vendedor, descontando a taxa da plataforma.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">4. Verificação de Identidade (KYC)</h2>
            <p>Todo vendedor deve completar a verificação de identidade antes de vender, incluindo:</p>
            <ul>
              <li>Validação de CPF ou CNPJ;</li>
              <li>Upload de documento de identidade (frente e verso);</li>
              <li>Selfie com documento e data;</li>
              <li>Comprovante de residência.</li>
            </ul>
            <p>Documentos são armazenados em bucket privado com criptografia. O vendedor não pode acessar seus documentos após o envio.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">5. Taxas</h2>
            <p>O Kiyvo cobra uma comissão sobre cada venda, variável conforme o nível do vendedor:</p>
            <ul>
              <li><strong className="text-white">Bronze</strong> (0-9 vendas): 10%</li>
              <li><strong className="text-white">Prata</strong> (10-49 vendas): 8%</li>
              <li><strong className="text-white">Ouro</strong> (50-199 vendas): 6%</li>
              <li><strong className="text-white">Diamante</strong> (200-999 vendas): 5%</li>
              <li><strong className="text-white">Platina</strong> (1000+ vendas): 3%</li>
            </ul>
            <p>As taxas mais baixas do mercado são possíveis graças ao nosso sistema automatizado de entrega e baixa taxa de fraude.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">6. Disputas e Reembolsos</h2>
            <p>O comprador pode abrir disputa em até 7 dias após a entrega. Motivos válidos:</p>
            <ul>
              <li>Chave de licença inválida ou já utilizada;</li>
              <li>Credenciais de acesso não funcionais;</li>
              <li>Produto não corresponde à descrição;</li>
              <li>Produto não entregue no prazo prometido.</li>
            </ul>
            <p>A equipe de suporte do Kiyvo analisará ambas as partes e emitirá resolução em até 5 dias úteis.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">7. Produtos Proibidos</h2>
            <p>É estritamente proibido vender:</p>
            <ul>
              <li>Conteúdo ilegal ou que viole direitos autorais;</li>
              <li>Malware, exploits ou ferramentas de hacking;</li>
              <li>Informações pessoais de terceiros;</li>
              <li>Produtos que violem a legislação brasileira.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">8. Privacidade</h2>
            <p>Consulte nossa <Link href="/institucional/privacidade" className="text-blue-400 hover:text-blue-300">Política de Privacidade</Link> para informações sobre coleta, uso e proteção de dados pessoais.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold">9. Alterações</h2>
            <p>O Kiyvo reserva-se o direito de alterar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail com 30 dias de antecedência.</p>
          </section>

          <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
            <p className="text-slate-400 text-sm">Dúvidas? Entre em contato pelo <strong className="text-white">suporte@kiyvo.com.br</strong></p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/institucional/privacidade" className="text-blue-400 text-sm hover:text-blue-300">Política de Privacidade</Link>
              <Link href="/institucional/tarifas" className="text-blue-400 text-sm hover:text-blue-300">Tabela de Taxas</Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
