#!/usr/bin/env python3
"""
KIYVO — Gerador de Conteúdo Contextual para Páginas Placeholder
Substitui "Conteúdo em construção" por conteúdo real baseado no path da página
"""
import os
import re
import glob

# Conteúdo contextual por seção
CONTENT_MAP = {
    # Ajuda
    'ajuda/conta': {
        'subtitle': 'Gerencie sua conta Kiyvo com facilidade',
        'items': [
            {'title': 'Como alterar meu e-mail?', 'desc': 'Acesse Configurações → Conta → E-mail. Insira o novo e-mail e confirme via link de verificação. Por segurança, a alteração requer confirmação no e-mail atual.'},
            {'title': 'Como alterar minha senha?', 'desc': 'Vá em Configurações → Segurança → Alterar senha. Digite a senha atual e a nova senha. Recomendamos usar senhas fortes com 12+ caracteres.'},
            {'title': 'Como ativar 2FA?', 'desc': 'Em Configurações → Segurança → Autenticação em 2 passos, escaneie o QR code com um app autenticador (Google Authenticator, Authy). Guarde os códigos de backup em local seguro.'},
            {'title': 'Como excluir minha conta?', 'desc': 'Acesse Configurações → Conta → Excluir conta. Você terá 30 dias para reativar. Após esse prazo, todos os dados são removidos permanentemente.'},
            {'title': 'Como alterar meu username?', 'desc': 'Em Configurações → Perfil → Username, digite o novo nome. Disponibilidade é verificada em tempo real. Alterações são limitadas a 1 por mês.'},
        ]
    },
    'ajuda/compras': {
        'subtitle': 'Tudo sobre compras na Kiyvo',
        'items': [
            {'title': 'Como comprar um produto?', 'desc': 'Navegue pelo marketplace, encontre o produto desejado e clique "Comprar Agora". Escolha a forma de pagamento, confirme o pedido e aguarde a entrega.'},
            {'title': 'O pagamento é seguro?', 'desc': 'Sim. Utilizamos Escrow: seu dinheiro fica retido pela Kiyvo e só é liberado ao vendedor após você confirmar o recebimento do produto.'},
            {'title': 'E se eu não receber o produto?', 'desc': 'Abra uma disputa em até 7 dias após a compra. Nossa equipe analisará o caso e, se procedente, você receberá reembolso integral.'},
            {'title': 'Posso cancelar uma compra?', 'desc': 'Sim, enquanto o produto não foi entregue. Após a entrega, você deve abrir uma disputa caso haja problemas.'},
            {'title': 'Quanto tempo leva a entrega?', 'desc': 'Produtos com entrega automática são entregues em segundos. Produtos manuais dependem do vendedor, com prazo de até 24h.'},
        ]
    },
    'ajuda/vendas': {
        'subtitle': 'Comece a vender na Kiyvo',
        'items': [
            {'title': 'Como me tornar vendedor?', 'desc': 'Crie sua conta, complete a verificação de identidade (KYC) e ative o perfil de vendedor em Configurações → Vendedor.'},
            {'title': 'Quais são as taxas?', 'desc': 'Plano Prata: 9,99% por venda. Ouro: 11,99% com destaque. Diamante: 12,99% com máximo destaque e benefícios exclusivos.'},
            {'title': 'Como anunciar um produto?', 'desc': 'Clique em "Anunciar", preencha título, descrição, preço, categoria e adicione imagens. Seu anúncio passa por revisão em até 6h.'},
            {'title': 'Como receber pagamentos?', 'desc': 'Os pagamentos ficam em Escrow até a confirmação do comprador. Após liberação, solicite saque via PIX em Minhas Retiradas.'},
            {'title': 'O que é o Cofre Digital?', 'desc': 'O Cofre Digital armazena chaves de licença, credenciais e links de download de forma segura. A entrega ao comprador é automática após o pagamento.'},
        ]
    },
    'ajuda/pagamentos': {
        'subtitle': 'Formas de pagamento e regras',
        'items': [
            {'title': 'Quais formas de pagamento são aceitas?', 'desc': 'PIX (instantâneo), cartão de crédito (Visa, Mastercard, Elo), boleto bancário (até 3 dias), saldo Kiyvo e KD Points.'},
            {'title': 'Como funciona o Escrow?', 'desc': 'O pagamento fica retido pela Kiyvo. O vendedor só recebe após o comprador confirmar o recebimento. Prazo de liberação: 4-7 dias conforme a categoria.'},
            {'title': 'Posso usar mais de uma forma de pagamento?', 'desc': 'Sim! Você pode combinar saldo Kiyvo + cartão, ou KD Points + PIX, para completar o valor da compra.'},
            {'title': 'Como funciona o pagamento com PIX?', 'desc': 'Após confirmar o pedido, um QR Code é gerado. Escaneie com seu banco ou copie o código PIX. O pagamento é confirmado em segundos.'},
            {'title': 'Reembolso: quanto tempo leva?', 'desc': 'Reembolso via PIX: até 1 dia útil. Cartão de crédito: até 2 faturas. Saldo Kiyvo: instantâneo.'},
        ]
    },
    'ajuda/seguranca': {
        'subtitle': 'Proteção para compradores e vendedores',
        'items': [
            {'title': 'A Kiyvo é segura?', 'desc': 'Sim. Utilizamos criptografia TLS/SSL, autenticação 2FA, Escrow para pagamentos, verificação KYC de vendedores e monitoramento anti-fraude 24/7.'},
            {'title': 'O que é verificação KYC?', 'desc': 'Know Your Customer: processo de verificação de identidade com CPF, documento com foto e selfie. Vendedores verificados recebem badge de confiança.'},
            {'title': 'Como denunciar fraude?', 'desc': 'Acesse Centro de Segurança → Denunciar, ou abra uma disputa diretamente no pedido. Denúncias anônimas são aceitas.'},
            {'title': 'Como evitar golpes?', 'desc': 'Só compre de vendedores verificados. Nunca faça pagamentos fora da plataforma. Confira avaliações e histórico do vendedor antes de comprar.'},
            {'title': 'O que é o Programa de Integridade?', 'desc': 'Sistema de monitoramento que detecta comportamentos suspeitos, como vendas duplicadas, preços irreais ou contas falsas. Infratores são banidos permanentemente.'},
        ]
    },
}

def get_path_key(filepath):
    """Extrai a chave do path para busca no CONTENT_MAP"""
    rel = filepath.replace('src/app/', '').replace('/page.tsx', '')
    parts = rel.split('/')
    # Tenta combinações do path
    for i in range(len(parts)):
        key = '/'.join(parts[i:])
        if key in CONTENT_MAP:
            return key
    return None

def generate_content(filepath):
    """Gera conteúdo contextual para uma página placeholder"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extrair info da página atual
    rel_path = filepath.replace('src/app/', '').replace('/page.tsx', '')
    slug = rel_path.split('/')[-1]
    section = rel_path.split('/')[0] if '/' in rel_path else ''
    
    # Tentar encontrar conteúdo específico
    path_key = get_path_key(filepath)
    page_data = CONTENT_MAP.get(path_key, None)
    
    # Extrair ícone atual
    icon_match = re.search(r'from \'lucide-react\'.*?(\w+)', content)
    icon_name = icon_match.group(1) if icon_match else 'FileText'
    
    # Extrair título
    title_match = re.search(r'Admin — (\w+)|h1[^>]*>([^<]+)</h1>', content)
    current_title = title_match.group(2) if title_match and title_match.group(2) else slug.replace('-', ' ').title()
    
    if page_data:
        subtitle = page_data['subtitle']
        items = page_data['items']
    else:
        # Gerar conteúdo genérico baseado na seção
        section_titles = {
            'ajuda': 'Central de Ajuda',
            'categoria': 'Categoria',
            'tipo': 'Tipo de Produto',
            'vendedor': 'Vendedor',
            'comprador': 'Comprador',
            'admin': 'Administração',
            'tutorial': 'Tutorial',
            'blog': 'Blog',
            'api-docs': 'Documentação API',
            'denunciar': 'Denúncia',
            'seguranca': 'Segurança',
            'auth': 'Autenticação',
            '2fa': 'Autenticação em 2 Passos',
        }
        subtitle = f'Informações sobre {current_title.lower()} na Kiyvo'
        items = [
            {'title': f'O que é {current_title}?', 'desc': f'Na Kiyvo, {current_title.lower()} é uma funcionalidade que permite aos usuários interagir com o marketplace de forma segura e eficiente. Acesse esta seção para configurar e gerenciar suas preferências.'},
            {'title': 'Como funciona?', 'desc': f'Acesse a área de {current_title.lower()} através do menu de navegação. Siga as instruções na tela para configurar ou utilizar os recursos disponíveis. Em caso de dúvidas, consulte nosso FAQ ou entre em contato com o suporte.'},
            {'title': 'Preciso de ajuda?', 'desc': f'Se você tiver problemas com {current_title.lower()}, acesse nossa Central de Ajuda em /ajuda ou entre em contato com o suporte pelo chat. Nossa equipe está disponível 24/7 para ajudar.'},
        ]
    
    # Gerar items JSX
    items_jsx = ''
    for i, item in enumerate(items):
        items_jsx += f'''
            <FadeInOnScroll delay={{i * 0.1}}>
              <div className="card-base p-6">
                <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">{{item['title']}}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{{item['desc']}}</p>
              </div>
            </FadeInOnScroll>'''
    
    # Construir nova página
    new_content = f"""'use client'

import {{ motion }} from 'framer-motion'
import {{ PageTransition }} from '@/components/shared/PageTransition'
import {{ FadeInOnScroll }} from '@/components/animations'
import {{ {icon_name} }} from 'lucide-react'

export default function Page() {{
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
            <{icon_name} size={{36}} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            {current_title}
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="space-y-4">
          {items_jsx}
        </div>
      </div>
    </PageTransition>
  )
}}
"""
    return new_content

# Processar todas as páginas placeholder
placeholder_files = []
for root, dirs, files in os.walk('src/app'):
    for f in files:
        if f == 'page.tsx':
            filepath = os.path.join(root, f)
            with open(filepath, 'r') as fh:
                content = fh.read()
            if 'Conteúdo em construção' in content:
                placeholder_files.append(filepath)

print(f"Encontradas {len(placeholder_files)} páginas placeholder")

for filepath in placeholder_files:
    new_content = generate_content(filepath)
    with open(filepath, 'w') as f:
        f.write(new_content)
    rel = filepath.replace('src/app/', '').replace('/page.tsx', '')
    print(f"  ✓ {rel}")

print(f"\nTotal: {len(placeholder_files)} páginas atualizadas")
