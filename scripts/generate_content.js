/**
 * KIYVO — Gerador de Conteúdo Contextual para Páginas Placeholder
 * Substitui "Conteúdo em construção" por conteúdo real baseado no path
 * Usa template string que respeita JSX chaves
 */
const fs = require('fs');
const path = require('path');

// Conteúdo contextual por seção
const CONTENT_MAP = {
  'ajuda/conta': {
    subtitle: 'Gerencie sua conta Kiyvo com facilidade',
    items: [
      { title: 'Como alterar meu e-mail?', desc: 'Acesse Configurações → Conta → E-mail. Insira o novo e-mail e confirme via link de verificação. Por segurança, a alteração requer confirmação no e-mail atual.' },
      { title: 'Como alterar minha senha?', desc: 'Vá em Configurações → Segurança → Alterar senha. Digite a senha atual e a nova senha. Recomendamos senhas fortes com 12+ caracteres.' },
      { title: 'Como ativar 2FA?', desc: 'Em Configurações → Segurança → Autenticação em 2 passos, escaneie o QR code com app autenticador (Google Authenticator, Authy). Guarde os códigos de backup.' },
      { title: 'Como excluir minha conta?', desc: 'Acesse Configurações → Conta → Excluir conta. Você terá 30 dias para reativar. Após esse prazo, todos os dados são removidos permanentemente.' },
      { title: 'Como alterar meu username?', desc: 'Em Configurações → Perfil → Username, digite o novo nome. Disponibilidade verificada em tempo real. Alterações limitadas a 1 por mês.' },
    ],
  },
  'ajuda/compras': {
    subtitle: 'Tudo sobre compras na Kiyvo',
    items: [
      { title: 'Como comprar um produto?', desc: 'Navegue pelo marketplace, encontre o produto e clique "Comprar Agora". Escolha a forma de pagamento, confirme e aguarde a entrega.' },
      { title: 'O pagamento é seguro?', desc: 'Sim. Utilizamos Escrow: seu dinheiro fica retido pela Kiyvo e só é liberado ao vendedor após você confirmar o recebimento.' },
      { title: 'E se eu não receber o produto?', desc: 'Abra uma disputa em até 7 dias após a compra. Nossa equipe analisará e, se procedente, você receberá reembolso integral.' },
      { title: 'Posso cancelar uma compra?', desc: 'Sim, enquanto o produto não foi entregue. Após a entrega, abra uma disputa caso haja problemas.' },
      { title: 'Quanto tempo leva a entrega?', desc: 'Produtos com entrega automática: segundos. Produtos manuais: até 24h, dependendo do vendedor.' },
    ],
  },
  'ajuda/vendas': {
    subtitle: 'Comece a vender na Kiyvo',
    items: [
      { title: 'Como me tornar vendedor?', desc: 'Crie sua conta, complete a verificação KYC e ative o perfil de vendedor em Configurações → Vendedor.' },
      { title: 'Quais são as taxas?', desc: 'Prata: 9,99%. Ouro: 11,99% com destaque. Diamante: 12,99% com máximo destaque e benefícios exclusivos.' },
      { title: 'Como anunciar um produto?', desc: 'Clique "Anunciar", preencha título, descrição, preço, categoria e imagens. Revisão em até 6h.' },
      { title: 'Como receber pagamentos?', desc: 'Pagamentos ficam em Escrow até confirmação do comprador. Após liberação, solicite saque via PIX.' },
      { title: 'O que é o Cofre Digital?', desc: 'Armazena chaves de licença, credenciais e links de download de forma segura. Entrega automática ao comprador.' },
    ],
  },
  'ajuda/pagamentos': {
    subtitle: 'Formas de pagamento e regras',
    items: [
      { title: 'Quais formas de pagamento são aceitas?', desc: 'PIX (instantâneo), cartão de crédito (Visa, Mastercard, Elo), boleto bancário, saldo Kiyvo e KD Points.' },
      { title: 'Como funciona o Escrow?', desc: 'O pagamento fica retido pela Kiyvo. O vendedor só recebe após o comprador confirmar o recebimento. Prazo: 4-7 dias.' },
      { title: 'Posso combinar formas de pagamento?', desc: 'Sim! Combine saldo Kiyvo + cartão, ou KD Points + PIX para completar o valor.' },
      { title: 'PIX: como funciona?', desc: 'Após confirmar o pedido, um QR Code é gerado. Escaneie com seu banco. Confirmação em segundos.' },
      { title: 'Reembolso: quanto tempo?', desc: 'PIX: até 1 dia útil. Cartão: até 2 faturas. Saldo Kiyvo: instantâneo.' },
    ],
  },
  'ajuda/seguranca': {
    subtitle: 'Proteção para compradores e vendedores',
    items: [
      { title: 'A Kiyvo é segura?', desc: 'Sim. Criptografia TLS/SSL, 2FA, Escrow para pagamentos, verificação KYC e monitoramento anti-fraude 24/7.' },
      { title: 'O que é verificação KYC?', desc: 'Verificação de identidade com CPF, documento com foto e selfie. Vendedores verificados recebem badge de confiança.' },
      { title: 'Como denunciar fraude?', desc: 'Acesse Centro de Segurança → Denunciar, ou abra uma disputa no pedido. Denúncias anônimas são aceitas.' },
      { title: 'Como evitar golpes?', desc: 'Só compre de vendedores verificados. Nunca pague fora da plataforma. Confira avaliações antes de comprar.' },
      { title: 'Programa de Integridade', desc: 'Detecta comportamentos suspeitos como vendas duplicadas, preços irreais ou contas falsas. Infratores são banidos.' },
    ],
  },
};

// Ícones por seção
const ICON_MAP = {
  admin: 'Settings', ajuda: 'HelpCircle', categoria: 'FolderOpen', tipo: 'Package',
  vendedor: 'Store', comprador: 'ShoppingBag', tutorial: 'GraduationCap',
  blog: 'BookOpen', 'api-docs': 'Code2', denunciar: 'AlertTriangle',
  seguranca: 'Shield', auth: 'KeyRound', '2fa': 'Smartphone',
};

function generateContent(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const rel = filepath.replace(/.*src\/app\//, '').replace(/\/page\.tsx$/, '');
  const parts = rel.split('/');
  const slug = parts[parts.length - 1];
  const section = parts[0];
  const pageName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Extrair ícone atual
  const iconMatch = content.match(/import \{ (\w+) \} from 'lucide-react'/);
  const icon = iconMatch ? iconMatch[1] : (ICON_MAP[section] || 'FileText');

  // Buscar conteúdo específico
  let pageData = null;
  for (const [key, data] of Object.entries(CONTENT_MAP)) {
    if (rel === key || rel.endsWith('/' + key)) {
      pageData = data;
      break;
    }
  }

  const subtitle = pageData ? pageData.subtitle : `Informações sobre ${pageName.toLowerCase()} na Kiyvo`;
  const items = pageData ? pageData.items : [
    { title: `O que é ${pageName}?`, desc: `Na Kiyvo, ${pageName.toLowerCase()} é uma funcionalidade que permite aos usuários interagir com o marketplace de forma segura e eficiente.` },
    { title: 'Como funciona?', desc: `Acesse a área de ${pageName.toLowerCase()} através do menu de navegação. Siga as instruções para configurar ou utilizar os recursos disponíveis.` },
    { title: 'Precisa de ajuda?', desc: 'Se tiver problemas, acesse nossa Central de Ajuda em /ajuda ou entre em contato com o suporte pelo chat 24/7.' },
  ];

  // Gerar items como strings de JSX
  const itemsJsx = items.map((item, i) =>
    `          <FadeInOnScroll delay={${i * 0.1}}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">${item.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">${item.desc}</p>
            </div>
          </FadeInOnScroll>`
  ).join('\n');

  return `'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { ${icon} } from 'lucide-react'

export default function Page() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <${icon} size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            ${pageName}
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            ${subtitle}
          </p>
        </motion.div>

        <div className="space-y-4">
${itemsJsx}
        </div>
      </div>
    </PageTransition>
  )
}
`;
}

// Processar todas as páginas placeholder
const appDir = 'src/app';
let count = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Conteúdo em construção')) {
        const newContent = generateContent(fullPath);
        fs.writeFileSync(fullPath, newContent);
        const rel = fullPath.replace(/.*src\/app\//, '').replace(/\/page\.tsx$/, '');
        console.log(`  ✓ ${rel}`);
        count++;
      }
    }
  }
}

console.log('Gerando conteúdo para páginas placeholder...\n');
walk(appDir);
console.log(`\nTotal: ${count} páginas atualizadas`);
