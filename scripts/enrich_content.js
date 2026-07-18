// ─────────────────────────────────────────────────────────────
// KIYVO — Gerador de Conteúdo Contextual v2
// Substitui páginas genéricas por conteúdo específico
// Cada seção recebe conteúdo relevante e detalhado
// ─────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// ─── MAPA DE CONTEÚDO POR SEÇÃO ──────────────────────────────
// Cada chave é um prefixo de path, cada valor é um objeto com:
// - title: título da página
// - subtitle: subtítulo
// - icon: emoji do ícone
// - sections: array de { title, content } com conteúdo real

const SECTION_CONTENT = {
  // ─── AJUDA ─────────────────────────────────────────────────
  'ajuda/anti-fraude': {
    title: 'Proteção Anti-Fraude',
    icon: '🛡️',
    sections: [
      { title: 'Sistema de Detecção de Fraude', content: 'O KIYVO utiliza um sistema multi-camadas de detecção de fraude que analisa cada transação em tempo real. Nosso algoritmo avalia mais de 20 sinais de risco, incluindo velocidade de compra, valor da transação, histórico de disputas, fingerprint do dispositivo e localização do IP. Transações com score de risco alto são automaticamente bloqueadas e enviadas para revisão manual.' },
      { title: 'Escrow — Seu Dinheiro Protegido', content: 'Todo pagamento no KIYVO passa pelo sistema de Escrow: o dinheiro fica retido pela plataforma e só é liberado ao vendedor após o comprador confirmar o recebimento do produto. Se o produto não for entregue ou estiver diferente do anunciado, o comprador recebe reembolso integral. Esse sistema elimina o risco de golpe para o comprador.' },
      { title: 'Verificação de Identidade (KYC)', content: 'Vendedores precisam completar a verificação KYC (Know Your Customer) antes de anunciar. Isso inclui documento de identidade com foto, comprovante de residência e selfie. A verificação é processada em até 24h e garante que todos os vendedores são reais e identificáveis.' },
      { title: 'Monitoramento 24/7', content: 'Nossa equipe de segurança monitora a plataforma 24 horas por dia, 7 dias por semana. Atividades suspeitas como tentativas de phishing, contas falsas e padrões de golpe são detectadas e bloqueadas automaticamente. Em caso de incidente, nossa equipe responde em menos de 15 minutos.' },
      { title: 'O que fazer se suspeitar de fraude?', content: 'Se você suspeitar de qualquer atividade fraudulenta: 1) Não finalize a compra; 2) Denuncie o anúncio usando o botão "Reportar"; 3) Entre em contato com nosso suporte pelo chat; 4) Se já comprou, abra uma disputa imediatamente. O KIYVO garante reembolso total em casos de fraude comprovada.' },
    ]
  },
  'ajuda/alterar-senha': {
    title: 'Alterar Senha',
    icon: '🔑',
    sections: [
      { title: 'Como alterar sua senha', content: 'Para alterar sua senha, acesse Minha Conta → Segurança → Alterar Senha. Digite sua senha atual e a nova senha. A nova senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números. Recomendamos usar um gerenciador de senhas para criar senhas fortes e únicas.' },
      { title: 'Esqueceu a senha?', content: 'Se esqueceu sua senha, clique em "Esqueceu a senha?" na tela de login. Enviaremos um link de redefinição para seu email cadastrado. O link é válido por 1 hora. Se não receber o email, verifique a pasta de spam ou lixo eletrônico.' },
      { title: 'Segurança da senha', content: 'Nunca compartilhe sua senha com ninguém. O KIYVO nunca pedirá sua senha por email, chat ou telefone. Use uma senha diferente da que usa em outros sites. Ative a autenticação de dois fatores (2FA) para proteção extra — mesmo que alguém descubra sua senha, não conseguirá acessar sem o código do 2FA.' },
    ]
  },
  'ajuda/ativar-2fa': {
    title: 'Ativar Autenticação de Dois Fatores',
    icon: '🔐',
    sections: [
      { title: 'O que é 2FA?', content: 'A autenticação de dois fatores (2FA) adiciona uma camada extra de segurança à sua conta. Além da senha, você precisa de um código gerado pelo seu celular. Mesmo que alguém descubra sua senha, não conseguirá acessar sua conta sem o código 2FA.' },
      { title: 'Como ativar', content: '1) Acesse Minha Conta → Segurança → 2FA; 2) Clique em "Ativar 2FA"; 3) Escaneie o QR Code com seu app autenticador (Google Authenticator, Authy, etc.); 4) Digite o código de 6 dígitos para confirmar; 5) Salve seus códigos de backup em local seguro.' },
      { title: 'Códigos de backup', content: 'Ao ativar o 2FA, você receberá 10 códigos de backup. Guarde-os em local seguro — cada código pode ser usado apenas uma vez. Se perder o acesso ao seu app autenticador, use um código de backup para entrar. Quando restarem 3 ou menos códigos, gere novos em Minha Conta → Segurança.' },
      { title: 'E se perder o acesso?', content: 'Se perdeu o acesso ao app autenticador E aos códigos de backup, entre em contato com nosso suporte. Precisaremos verificar sua identidade com documento com foto para desativar o 2FA e permitir que você reconfigure. Esse processo leva até 48h por segurança.' },
    ]
  },
  'ajuda/abrir-disputa': {
    title: 'Abrir uma Disputa',
    icon: '⚖️',
    sections: [
      { title: 'Quando abrir uma disputa', content: 'Abra uma disputa quando: o produto não foi entregue; o produto está diferente do anunciado; a chave/licença não funciona; o vendedor não responde após 48h; ou houve cobrança indevida. Você tem até 7 dias após a compra para abrir disputa.' },
      { title: 'Como abrir', content: '1) Acesse Minha Conta → Compras; 2) Encontre o pedido e clique em "Abrir Disputa"; 3) Selecione o motivo e descreva o problema detalhadamente; 4) Anexe prints ou evidências; 5) Aguarde a resposta do vendedor (até 72h). Se não houver acordo, o KIYVO intervém e decide com base nas evidências.' },
      { title: 'Resolução e reembolso', content: 'Se a disputa for favorável ao comprador, o reembolso é processado em até 5 dias úteis. O valor volta para o método de pagamento original (PIX, cartão). Em casos de fraude comprovada, o reembolso é imediato e o vendedor é penalizado. Disputas resolvidas a favor do vendedor encerram o escrow e liberam o pagamento.' },
    ]
  },
  'ajuda/compras': {
    title: 'Ajuda com Compras',
    icon: '🛒',
    sections: [
      { title: 'Como comprar no KIYVO', content: 'Encontre o produto desejado usando a busca ou navegando pelas categorias. Clique em "Comprar Agora" para ir ao checkout seguro. Escolha o método de pagamento (PIX, cartão, boleto). Após o pagamento, produtos com entrega automática são liberados em segundos na seção "Minhas Compras". Produtos com entrega manual são entregues pelo vendedor em até 24h.' },
      { title: 'Formas de pagamento', content: 'PIX: pagamento instantâneo, confirmação em segundos. Cartão de crédito: aceitamos Visa, Mastercard, Elo e American Express. Boleto bancário: pagamento em até 3 dias úteis. Saldo KIYVO: use créditos da sua carteira. KD Points: use pontos de recompensa para desconto.' },
      { title: 'Acompanhar pedido', content: 'Acesse Minha Conta → Compras para ver todos os seus pedidos. Cada pedido mostra: status (pago, entregue, em disputa), produto, valor, data e detalhes da entrega. Para produtos digitais com entrega automática, o conteúdo fica disponível imediatamente após a confirmação do pagamento.' },
    ]
  },
  'ajuda/vendas': {
    title: 'Ajuda com Vendas',
    icon: '💰',
    sections: [
      { title: 'Como vender no KIYVO', content: 'Crie sua conta, complete a verificação KYC e configure sua loja. Clique em "Anunciar" para criar um produto. Preencha título, descrição, preço, categoria e faça upload das imagens. Para produtos digitais, faça upload do arquivo no Cofre Digital — a entrega é automática após cada compra.' },
      { title: 'Taxas e comissões', content: 'A comissão do KIYVO varia conforme o plano: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A comissão só é cobrada quando você vende. O plano Diamante inclui destaque nos resultados de busca e suporte prioritário. Você pode trocar de plano a qualquer momento.' },
      { title: 'Recebendo pagamentos', content: 'Após o comprador confirmar o recebimento (ou após 7 dias sem contestação), o valor fica disponível para saque. Solicite saque via PIX — retirada Normal (grátis, até 2 dias úteis) ou Turbo (R$ 3,50, instantânea). O valor mínimo para saque é R$ 20,00.' },
    ]
  },
  'ajuda/retiradas': {
    title: 'Ajuda com Retiradas',
    icon: '🏧',
    sections: [
      { title: 'Como solicitar retirada', content: 'Acesse Minha Conta → Retiradas. O saldo disponível inclui apenas valores já liberados do escrow. Clique em "Solicitar Retirada", escolha o valor e o tipo (Normal ou Turbo). Informe a chave PIX para receber. Retirada Normal: grátis, até 2 dias úteis. Retirada Turbo: R$ 3,50, instantânea.' },
      { title: 'Saldo disponível vs. pendente', content: 'Saldo disponível: valores já liberados do escrow, prontos para saque. Saldo pendente: valores em custódia aguardando confirmação do comprador ou período de disputa. O saldo pendente se torna disponível automaticamente após 7 dias da entrega confirmada.' },
      { title: 'Limites e requisitos', content: 'Valor mínimo de retirada: R$ 20,00. Valor máximo por retirada: R$ 50.000,00. Contas não verificadas têm limite diário de R$ 500,00. Complete a verificação KYC para limites maiores. Retiradas podem ser recusadas por suspeita de fraude ou lavagem de dinheiro.' },
    ]
  },

  // ─── ADMIN ────────────────────────────────────────────────
  'admin/audit-log': {
    title: 'Log de Auditoria',
    icon: '📋',
    sections: [
      { title: 'O que é o Log de Auditoria', content: 'O log de auditoria registra todas as ações realizadas na plataforma: logins, compras, vendas, alterações de configuração, bloqueios e desbloqueios. Cada entrada inclui timestamp, usuário, ação, recurso afetado e endereço IP. Os logs são imutáveis e retidos por 90 dias.' },
      { title: 'Como usar', content: 'Filtre os logs por data, tipo de ação, usuário ou severidade. Logs críticos (chargebacks, fraudes, bloqueios) são marcados em vermelho. Use a busca para encontrar ações específicas. Exporte logs em CSV para análise externa. Logs de ações administrativas são sinalizados com badge "Admin".' },
      { title: 'Severidades', content: 'Info: ações normais (login, compra, venda). Warning: atividades suspeitas (múltiplas tentativas de login, alteração de dados sensíveis). Error: falhas do sistema. Critical: fraudes confirmadas, chargebacks, violações de segurança. Ajuste alertas automáticos para cada severidade em Configurações.' },
    ]
  },
  'admin/configuracoes': {
    title: 'Configurações do Sistema',
    icon: '⚙️',
    sections: [
      { title: 'Configurações gerais', content: 'Nome da plataforma, URL, timezone, moeda padrão, idioma. Configure os dados de contato e links de redes sociais. Ajuste o período de escrow (padrão: 7 dias), taxa de comissão padrão e limites de saque.' },
      { title: 'Segurança', content: 'Configure regras de rate limiting por endpoint. Ative/desative proteção anti-bot. Defina regras de bloqueio automático por IP. Configure CSP headers e CORS. Gerencie lista de IPs bloqueados e permitidos.' },
      { title: 'Notificações', content: 'Configure templates de email para cada tipo de notificação. Ative/desative notificações push. Defina canais de alerta para eventos críticos (fraude, chargeback, sistema down). Configure integração com Slack ou Discord para alertas em tempo real.' },
    ]
  },
  'admin/cupons': {
    title: 'Gerenciar Cupons',
    icon: '🎟️',
    sections: [
      { title: 'Criar cupom', content: 'Clique em "Novo Cupom". Defina o código (ex: KIYVO10), tipo de desconto (percentual ou fixo), valor, validade, uso máximo e restrições de categoria. Cupons podem ser de uso único ou múltiplo. Defina valor mínimo de compra para ativação.' },
      { title: 'Tipos de cupom', content: 'Percentual: desconto de X% no valor total. Fixo: desconto de R$ X no valor total. Frete grátis: isenta taxa de entrega. KD Points: bonifica X pontos na compra. Combo: combina desconto + pontos. Cada tipo tem regras específicas de aplicação e validação.' },
      { title: 'Monitoramento', content: 'Acompanhe uso em tempo real: total de usos, usos restantes, receita gerada, ticket médio. Identifique cupons mais populares e taxas de conversão. Desative cupons com uso abusivo ou que não geram conversão. Exporte relatórios em CSV.' },
    ]
  },
  'admin/afiliados': {
    title: 'Programa de Afiliados',
    icon: '🤝',
    sections: [
      { title: 'Como funciona', content: 'Afiliados recebem um link único (ex: kiyvo.com/?ref=CODIGO). Quando alguém compra através desse link, o afiliado ganha comissão de 5% sobre o valor da venda. A comissão fica pendente por 30 dias (período de disputa) e depois é liberada para saque.' },
      { title: 'Gerenciar afiliados', content: 'Aprove ou rejeite candidaturas de afiliados. Defina comissões personalizadas por afiliado. Monitore conversões, cliques e receita gerada. Identifique afiliados com melhor performance. Bloqueie afiliados que violem as regras (spam, fraude de cliques).' },
      { title: 'Relatórios', content: 'Veja métricas agregadas: total de afiliados ativos, receita gerada, comissões pagas, taxa de conversão média. Filtre por período, categoria de produto ou afiliado específico. Compare performance entre afiliados. Exporte dados para análise.' },
    ]
  },

  // ─── CONTA ────────────────────────────────────────────────
  'conta/anuncios': {
    title: 'Meus Anúncios',
    icon: '📢',
    sections: [
      { title: 'Gerenciar anúncios', content: 'Visualize todos os seus anúncios ativos, pausados e expirados. Edite título, descrição, preço e imagens. Pause ou ative anúncios. Duplique anúncios para criar variações. Monitore visualizações, cliques e vendas de cada anúncio.' },
      { title: 'Dicas para melhores resultados', content: 'Use título descritivo com palavras-chave. Adicione pelo menos 3 imagens de alta qualidade. Descreva o produto detalhadamente — compradores leem a descrição antes de comprar. Preço competitivo: compare com anúncios similares. Mantenha estoque atualizado no Cofre Digital.' },
    ]
  },
  'conta/compras': {
    title: 'Minhas Compras',
    icon: '📦',
    sections: [
      { title: 'Acompanhar compras', content: 'Veja todas as suas compras com status em tempo real: Pendente (aguardando pagamento), Pago (em processamento), Entregue (produto disponível), Em Disputa (problema reportado), Reembolsado (dinheiro devolvido). Para produtos digitais, acesse o conteúdo diretamente pela página da compra.' },
      { title: 'Download de produtos digitais', content: 'Produtos com entrega automática ficam disponíveis imediatamente após confirmação do pagamento. Acesse Minha Conta → Compras → clique no pedido → "Acessar Produto". Você tem acesso vitalício ao produto enquanto ele estiver no KIYVO. Guarde o conteúdo localmente como backup.' },
    ]
  },
  'conta/retiradas': {
    title: 'Minhas Retiradas',
    icon: '🏧',
    sections: [
      { title: 'Histórico de retiradas', content: 'Veja todas as suas retiradas com status: Processando, Concluída, Recusada. Cada retirada mostra valor, taxa, método e data. Retiradas recusadas são revertidas para o saldo disponível com motivo da recusa.' },
      { title: 'Solicitar nova retirada', content: 'Certifique-se de ter saldo disponível (valores já liberados do escrow). Clique em "Nova Retirada", escolha o valor e o tipo (Normal ou Turbo). Informe a chave PIX. Confirme os dados e aguarde o processamento. Retirada Turbo chega em minutos.' },
    ]
  },

  // ─── SEGURANÇA ────────────────────────────────────────────
  'seguranca-centro': {
    title: 'Centro de Segurança',
    icon: '🏰',
    sections: [
      { title: 'Sua segurança é prioridade', content: 'O KIYVO investe pesado em segurança para proteger seus dados e transações. Usamos criptografia de ponta, autenticação de dois fatores, escrow em todas as transações e monitoramento 24/7. Nossa infraestrutura segue as normas OWASP Top 10 e PCI DSS para proteger informações sensíveis.' },
      { title: 'Dicas de segurança', content: '1) Ative o 2FA agora — é a proteção mais eficaz contra invasões. 2) Use senhas fortes e únicas — nunca reuse senhas entre sites. 3) Desconfie de emails suspeitos — o KIYVO nunca pede senha por email. 4) Verifique o URL antes de fazer login — certifique-se de que é kiyvo.com. 5) Não compartilhe códigos de verificação com ninguém.' },
      { title: 'Sessões ativas', content: 'Gerencie dispositivos conectados à sua conta em Minha Conta → Segurança → Sessões. Você pode desconectar qualquer dispositivo remotamente. Se notar atividade suspeita, desconecte todos os dispositivos e altere sua senha imediatamente.' },
    ]
  },

  // ─── VENDEDOR ─────────────────────────────────────────────
  'vendedor/criar-loja': {
    title: 'Criar sua Loja',
    icon: '🏪',
    sections: [
      { title: 'Primeiros passos', content: 'Para criar sua loja, complete a verificação KYC (documento + selfie + comprovante). Após aprovação (até 24h), configure o nome da loja, logo, descrição e banner. Escolha o plano (Prata, Ouro ou Diamante) e configure os dados bancários para recebimento.' },
      { title: 'Personalização', content: 'Adicione logo e banner da loja. Escreva uma descrição atrativa — ela aparece na página do vendedor. Configure horário de atendimento e tempo médio de resposta. Adicione redes sociais. Escolha um slug personalizado para sua URL (ex: kiyvo.com/v/sua-loja).' },
    ]
  },
  'vendedor/gerenciar-produtos': {
    title: 'Gerenciar Produtos',
    icon: '📦',
    sections: [
      { title: 'Criar produto', content: 'Clique em "Novo Produto". Preencha: título (até 200 caracteres), descrição (suporta HTML), preço, categoria, tipo de entrega (automática ou manual), tags. Adicione até 10 imagens. Para entrega automática, faça upload do arquivo digital no Cofre Digital.' },
      { title: 'Cofre Digital', content: 'O Cofre Digital armazena os arquivos digitais de forma segura e criptografada. Quando um comprador efetua o pagamento, o sistema entrega automaticamente o conteúdo. Cada item no cofre pode ser usado apenas uma vez — configure o estoque adequadamente.' },
    ]
  },
  'ajuda/escrow': {
    title: 'Sistema de Escrow',
    icon: '🔒',
    sections: [
      { title: 'O que é Escrow?', content: 'Escrow é um sistema de custódia onde o KIYVO retém o pagamento do comprador até que o produto seja entregue e confirmado. Isso elimina o risco de golpe: o comprador só paga quando tem certeza de que recebeu, e o vendedor só recebe quando a entrega é comprovada. É o mesmo sistema usado por plataformas como eBay e AliExpress.' },
      { title: 'Como funciona', content: '1) Comprador faz o pagamento → dinheiro vai para conta custódia do KIYVO. 2) Vendedor é notificado e entrega o produto. 3) Comprador confirma recebimento → dinheiro é liberado para o vendedor. 4) Se houver problema, o comprador abre disputa → KIYVO intermedeia e decide. O período padrão de auto-confirmação é de 7 dias.' },
      { title: 'Proteção ao comprador', content: 'Se o produto não for entregue, estiver diferente do anunciado ou não funcionar, o comprador recebe reembolso integral. O dinheiro nunca vai direto para o vendedor — sempre passa pelo escrow. Chargebacks no cartão também são protegidos pelo sistema.' },
    ]
  },
  'ajuda/kd-points': {
    title: 'KD Points — Programa de Recompensas',
    icon: '⭐',
    sections: [
      { title: 'O que são KD Points', content: 'KD Points são pontos de recompensa que você acumula a cada compra no KIYVO. Cada R$ 1,00 gasto equivale a 1 KD Point. Os pontos podem ser trocados por descontos em compras futuras, produtos exclusivos ou cashback. Quanto mais você compra, mais pontos ganha — e membros com planos superiores ganham pontos em dobro.' },
      { title: 'Como acumular', content: 'Compras: 1 KD Point por R$ 1 gasto. Avaliações: 10 KD Points por avaliação aprovada. Indicações: 50 KD Points quando seu indicado faz a primeira compra. Desafios: ganhe pontos extras em promoções sazonais. Login diário: 2 KD Points por dia de acesso consecutivo.' },
      { title: 'Como usar', content: 'No checkout, selecione "Usar KD Points" e escolha quantos pontos deseja aplicar. 100 KD Points = R$ 1,00 de desconto. Você pode combinar KD Points com cupons e promoções. Os pontos expiram em 12 meses sem uso — confira seu saldo em Minha Conta → KD Points.' },
    ]
  },
  'ajuda/pagamentos': {
    title: 'Métodos de Pagamento',
    icon: '💳',
    sections: [
      { title: 'Formas aceitas', content: 'PIX: pagamento instantâneo com confirmação em segundos. Ideal para compras urgentes. Cartão de crédito: Visa, Mastercard, Elo, American Express. Parcelamento em até 12x (juros do cartão). Boleto bancário: pagamento em até 3 dias úteis. Confirmado automaticamente. Saldo KIYVO: use créditos da sua carteira digital.' },
      { title: 'Segurança dos pagamentos', content: 'Todos os pagamentos são processados pelo Stripe, certificação PCI DSS Level 1 — o mais alto nível de segurança para transações online. Seus dados de cartão nunca são armazenados no KIYVO. O Stripe tokeniza os dados e processa de forma criptografada. Todas as transações usam HTTPS com TLS 1.3.' },
      { title: 'Problemas com pagamento', content: 'Pagamento recusado? Verifique: saldo disponível, dados do cartão corretos, limite do cartão, se o banco não bloqueou a transação. Para PIX, garanta que o valor e a chave estejam corretos. Boletos podem demorar até 3 dias para compensar. Se o problema persistir, entre em contato com nosso suporte.' },
    ]
  },
  'ajuda/primeira-compra': {
    title: 'Primeira Compra no KIYVO',
    icon: '🛍️',
    sections: [
      { title: 'Guia passo a passo', content: '1) Crie sua conta com email e senha. 2) Navegue pelas categorias ou use a busca. 3) Encontre o produto e clique "Comprar Agora". 4) Escolha o método de pagamento. 5) Complete o checkout seguro via Stripe. 6) Após confirmação, acesse seu produto em Minha Conta → Compras. Produtos digitais com entrega automática ficam disponíveis em segundos!' },
      { title: 'Dicas para iniciantes', content: 'Sempre verifique a reputação do vendedor (estrelas e vendas). Leia a descrição completa antes de comprar. Produtos com badge "Entrega Automática" são liberados instantaneamente. Ative o 2FA para proteger sua conta. Use PIX para pagamentos mais rápidos. Guarde o comprovante de compra.' },
    ]
  },
  'ajuda/primeira-venda': {
    title: 'Primeira Venda no KIYVO',
    icon: '💰',
    sections: [
      { title: 'Como fazer sua primeira venda', content: '1) Complete a verificação KYC (documento + selfie + comprovante). 2) Configure sua loja com nome, logo e descrição. 3) Crie seu primeiro anúncio com título, preço e imagens. 4) Para produtos digitais, faça upload no Cofre Digital. 5) Compartilhe o link do anúncio nas redes sociais. 6) Quando vender, o dinheiro fica em escrow por 7 dias e depois é liberado para saque.' },
      { title: 'Dicas para vender mais', content: 'Use fotos de alta qualidade e título descritivo com palavras-chave. Preço competitivo: pesquise anúncios similares. Responda perguntas rapidamente — vendedores que respondem em menos de 1h vendem 3x mais. Mantenha o estoque atualizado. Peça avaliações aos compradores — boas reviews aumentam a confiança.' },
    ]
  },
  'ajuda/reembolso': {
    title: 'Política de Reembolso',
    icon: '↩️',
    sections: [
      { title: 'Quando tenho direito a reembolso', content: 'Você tem direito a reembolso integral quando: o produto não foi entregue; o produto está diferente do anunciado; a chave/licença não funciona; houve cobrança indevida; o vendedor não responde em 48h. O KIYVO garante reembolso em todos esses casos — sem burocracia.' },
      { title: 'Como solicitar', content: '1) Acesse Minha Conta → Compras. 2) Encontre o pedido e clique "Abrir Disputa". 3) Selecione o motivo e descreva o problema. 4) Anexe evidências (prints, vídeos). 5) Aguarde a mediação. Se a disputa for favorável, o reembolso é processado em até 5 dias úteis no método de pagamento original.' },
      { title: 'Tipos de reembolso', content: 'Reembolso integral: 100% do valor pago volta para o método original (PIX, cartão). Crédito KIYVO: recebe o valor em saldo da carteira (processamento mais rápido). KD Points: recebe pontos equivalentes como cortesia. Em caso de fraude comprovada, o reembolso é processado em até 24h.' },
    ]
  },
  'ajuda/stripe-connect': {
    title: 'Stripe Connect — Recebimentos',
    icon: '🏦',
    sections: [
      { title: 'O que é Stripe Connect', content: 'O Stripe Connect é a infraestrutura de pagamentos do KIYVO. Ele permite que vendedores recebam pagamentos de forma segura e automatizada. Quando um comprador paga, o Stripe processa a transação, retém a comissão do KIYVO e direciona o valor líquido para a conta do vendedor. Tudo em conformidade com regulações financeiras brasileiras.' },
      { title: 'Como configurar', content: '1) Acesse Minha Conta → Vendedor → Configurações Financeiras. 2) Clique em "Configurar Stripe Connect". 3) Você será redirecionado ao onboarding do Stripe. 4) Preencha dados pessoais e bancários. 5) Aguarde a verificação (até 48h). Após aprovado, os recebimentos são automáticos.' },
      { title: 'Recebimentos', content: 'Após a liberação do escrow, o valor líquido é transferido automaticamente para sua conta bancária via PIX em até 2 dias úteis. Você pode acompanhar todas as transferências no dashboard do Stripe. O Stripe emite relatórios fiscais para declaração de imposto de renda.' },
    ]
  },
  'ajuda/denunciar': {
    title: 'Denunciar Anúncio ou Usuário',
    icon: '🚨',
    sections: [
      { title: 'Quando denunciar', content: 'Denuncie quando: o anúncio vende produtos ilegais ou proibidos; o vendedor pede pagamento fora do KIYVO; o produto é claramente falso ou fraudulento; o usuário está fazendo spam ou assédio; há suspeita de lavagem de dinheiro. Denúncias anônimas são aceitas e analisadas em até 24h.' },
      { title: 'Como denunciar', content: 'No anúncio, clique no ícone ⚠️ "Denunciar" e selecione o motivo. Para usuários, acesse o perfil e clique "Denunciar". Descreva o problema detalhadamente e anexe evidências. Você receberá atualizações por email. Denúncias falsas ou abusivas podem resultar em suspensão da conta do denunciante.' },
    ]
  },
  'ajuda/entrega-automatica': {
    title: 'Entrega Automática (Cofre Digital)',
    icon: '⚡',
    sections: [
      { title: 'Como funciona', content: 'A entrega automática é o recurso mais poderoso do KIYVO para vendedores digitais. Você faz upload do arquivo (chave, licença, PDF, ZIP, etc.) no Cofre Digital. Quando um comprador efetua o pagamento, o sistema entrega o conteúdo automaticamente em segundos — sem intervenção manual.' },
      { title: 'Configurar', content: 'Ao criar um produto, selecione "Entrega Automática". Faça upload do arquivo no Cofre Digital (até 500MB). Configure a quantidade em estoque. Cada venda consome um item do estoque. Quando o estoque chegar a zero, o anúncio fica automaticamente indisponível. Recarregue o estoque a qualquer momento.' },
      { title: 'Tipos de arquivo suportados', content: 'Chaves de ativação (texto), PDFs, arquivos ZIP/RAR, imagens, documentos Office, executáveis. Cada item no cofre pode ser um arquivo único ou um código de ativação. O conteúdo é armazenado criptografado e entregue via signed URL temporária (24h de acesso).' },
    ]
  },
  'acordos-juridicos': {
    title: 'Acordos Jurídicos',
    icon: '⚖️',
    sections: [
      { title: 'Termos de Uso', content: 'Os Termos de Uso regulam o acesso e uso da plataforma KIYVO. Ao criar uma conta, você concorda com os termos vigentes. Principais pontos: responsabilidade sobre conteúdos publicados, obrigatoriedade de informações verdadeiras no cadastro, proibição de atividades ilegais e respeito aos direitos autorais. Os termos podem ser atualizados com aviso prévio de 30 dias.' },
      { title: 'Política de Privacidade', content: 'A LGPD (Lei Geral de Proteção de Dados) é a base da nossa política de privacidade. Coletamos apenas dados necessários para operação da plataforma. Seus dados nunca são vendidos a terceiros. Você pode solicitar a qualquer momento: acesso aos seus dados, correção, exclusão ou portabilidade. Contate privacidade@kiyvo.com para exercer seus direitos.' },
      { title: 'Direitos autorais', content: 'O KIYVO respeita a propriedade intelectual. Vendedores declaram ter os direitos sobre os produtos digitais que anunciam. Denúncias de violação de direitos autorais são tratadas com prioridade. Se seu conteúdo foi copiado sem autorização, envie uma notificação DMCA para legal@kiyvo.com com: identificação do conteúdo, localização no KIYVO, e declaração de boa-fé.' },
    ]
  },

  // ─── VENDEDOR ─────────────────────────────────────────────
  'vendedor/promocoes': {
    title: 'Promoções e Cupons do Vendedor',
    icon: '🏷️',
    sections: [
      { title: 'Criar promoções', content: 'Vendedores podem criar cupons exclusivos para sua loja. Acesse Minha Loja → Promoções → Novo Cupom. Defina o código (ex: LOJA10), tipo de desconto (percentual ou fixo), validade e uso máximo. Cupons são uma ótima forma de atrair novos compradores e fidelizar clientes existentes.' },
      { title: 'Estratégias de promoção', content: 'Cupom de boas-vindas: 10% OFF na primeira compra. Compre 2 ganhe desconto: incentive compras maiores. Flash sale: desconto por tempo limitado (urgência). Cupom de avaliação: recompense quem avaliar o produto. KD Points dobrados: atraia compradores com programa de pontos.' },
    ]
  },
  'vendedor/seo': {
    title: 'SEO para Anúncios',
    icon: '🔍',
    sections: [
      { title: 'Otimize seus anúncios para buscas', content: 'Título: use palavras-chave relevantes no início. Ex: "Minecraft Java Edition — Key Original" ao invés de "Vendo key MC". Descrição: inclua termos de busca naturalmente. Tags: adicione todas as tags relevantes. Categoria: escolha a mais específica. Imagens: nomeie os arquivos com palavras-chave (ex: minecraft-java-key.jpg).' },
      { title: 'Dicas avançadas', content: 'Use sinônimos e variações de termos na descrição. Responda perguntas com palavras-chave. Mantenha anúncios atualizados — algoritmo favorece conteúdo recente. Peça avaliações — anúncios com mais reviews aparecem primeiro. Use o plano Diamante para destaque nos resultados.' },
    ]
  },
  'vendedor/retiradas': {
    title: 'Retiradas do Vendedor',
    icon: '🏧',
    sections: [
      { title: 'Como receber', content: 'Após a liberação do escrow, o saldo fica disponível para saque em Minha Conta → Retiradas. Solicite saque via PIX: Normal (grátis, 2 dias úteis) ou Turbo (R$ 3,50, instantâneo). Mínimo: R$ 20,00. Configure dados bancários uma vez e receba automaticamente nas próximas retiradas.' },
      { title: 'Cronograma', content: 'Dia 0: Comprador confirma recebimento → Escrow liberado. Dia 1-2: Saldo disponível para saque. Dia 3-5: Retirada processada e creditada na conta bancária. Domingos e feriados não contam. Planeje seu fluxo de caixa considerando este cronograma.' },
    ]
  },
  'vendedor/duplicar-produto': {
    title: 'Duplicar Produto',
    icon: '📋',
    sections: [
      { title: 'Quando usar', content: 'A duplicação é útil quando você tem produtos similares que diferem em poucos detalhes (ex: versões diferentes de uma licença, pacotes com quantidades diferentes). Em vez de criar cada anúncio do zero, duplique e ajuste apenas o que muda.' },
      { title: 'Como duplicar', content: 'Na lista de produtos, clique nos três pontos → "Duplicar". O sistema cria uma cópia com status de rascunho. Edite título, preço, descrição, estoque e imagens. Revise tudo antes de publicar. Produtos duplicados herdam as imagens e tags do original.' },
    ]
  },
  'vendedor/afiliado-produto': {
    title: 'Afiliar seu Produto',
    icon: '🤝',
    sections: [
      { title: 'Programa de afiliados', content: 'Ative o programa de afiliados para seu produto e deixe outras pessoas venderem para você. Afiliados recebem 5% de comissão sobre cada venda gerada pelo link deles. Você define a comissão (entre 3% e 15%). Quanto mais afiliados, mais alcance seu produto tem.' },
      { title: 'Como ativar', content: 'Na página do produto, vá em Configurações → Afiliados → Ativar. Defina a comissão. O produto aparece na lista pública de afiliados. Afiliados recebem um link exclusivo (ex: kiyvo.com/p/seu-produto?ref=CODIGO). Acompanhe conversões e comissões no dashboard de afiliados.' },
    ]
  },
  'vendedor/badges': {
    title: 'Badges e Certificações',
    icon: '🏅',
    sections: [
      { title: 'Badges disponíveis', content: '🥈 Prata: vendedor verificado com mais de 10 vendas. 🥇 Ouro: mais de 100 vendas e avaliação ≥ 4.5. 💎 Diamante: mais de 500 vendas e avaliação ≥ 4.7. ✅ Verificado: identidade confirmada via KYC. ⚡ Entrega Rápida: 95%+ entregas em menos de 1h. 🛡️ Confiável: zero disputas nos últimos 90 dias.' },
      { title: 'Como conquistar', content: 'Badges são conquistados automaticamente baseado em métricas. Foque em: entregas rápidas (mantenha estoque no Cofre Digital), boa comunicação (responda em menos de 1h), descrições precisas (evite disputas) e volume de vendas. Badges aumentam a confiança do comprador e melhoram o posicionamento nos resultados.' },
    ]
  },
  'vendedor/ferias': {
    title: 'Modo Férias',
    icon: '🏖️',
    sections: [
      { title: 'Ativar modo férias', content: 'Precisa se ausentar? Ative o modo férias em Minha Loja → Configurações. Seus anúncios ficam visíveis mas com badge "Vendedor em férias" e o botão de compra é desabilitado. Quando voltar, desative e os anúncios voltam ao normal. Seus KD Points e avaliações não são afetados.' },
      { title: 'Dicas', content: 'Programe as férias com antecedência. Avise compradores em andamento. Configure mensagem automática de resposta. Produtos com entrega automática podem continuar vendendo mesmo no modo férias — desative apenas se não puder dar suporte.' },
    ]
  },
  'vendedor/respostas-automaticas': {
    title: 'Respostas Automáticas',
    icon: '🤖',
    sections: [
      { title: 'Configure respostas automáticas', content: 'Crie mensagens automáticas para as perguntas mais frequentes. Exemplo: "Obrigado pelo contato! As chaves são enviadas automaticamente após o pagamento. Se tiver problema, abra uma disputa e resolveremos em até 24h." As respostas são enviadas instantaneamente, melhorando seu tempo de resposta.' },
      { title: 'Melhores práticas', content: 'Respostas automáticas são úteis mas não substituem atendimento personalizado. Use para perguntas genéricas (funciona? é original? tem garantia?). Para questões específicas, responda manualmente. Mantenha as respostas atualizadas quando houver mudanças no produto.' },
    ]
  },
  'vendedor/comissoes': {
    title: 'Comissões e Taxas',
    icon: '📊',
    sections: [
      { title: 'Planos de vendedor', content: 'Prata: comissão de 9,99% por venda. Ideal para quem está começando. Ouro: comissão de 11,99% + destaque nos resultados + badge dourado + suporte prioritário. Diamante: comissão de 12,99% + destaque premium + badge diamante + suporte VIP + KD Points em dobro para compradores. Troque de plano a qualquer momento.' },
      { title: 'Taxas adicionais', content: 'Taxa de saque Turbo: R$ 3,50 por retirada instantânea. Taxa de chargeback: R$ 15,00 (se o comprador contestar no cartão). Sem taxas de listagem, mensalidade ou setup. Você só paga quando vende. O valor líquido já desconta a comissão — o que você vê é o que você recebe.' },
    ]
  },
  'vendedor/verificacao': {
    title: 'Verificação de Vendedor',
    icon: '✅',
    sections: [
      { title: 'Processo KYC', content: 'Para vender no KIYVO, complete a verificação de identidade: 1) Documento de identidade com foto (RG ou CNH). 2) Selfie segurando o documento. 3) Comprovante de residência (emitido nos últimos 90 dias). A verificação é processada em até 24h. Contas verificadas ganham badge ✅ e maior confiança dos compradores.' },
      { title: 'Por que verificamos', content: 'A verificação protege todos: compradores sabem que o vendedor é real e identificável; vendedores têm menos risco de chargeback fraudulento; a plataforma pode tomar medidas legais em caso de fraude. É obrigatória para sacar valores acima de R$ 500/mês.' },
    ]
  },
  'vendedor/personalizar-loja': {
    title: 'Personalizar sua Loja',
    icon: '🎨',
    sections: [
      { title: 'Elementos customizáveis', content: 'Logo da loja (quadrado, 200x200px mínimo). Banner da loja (1200x300px). Nome da loja (único na plataforma). Descrição/bio (até 500 caracteres). Cor de destaque (personalize o tema da loja). Redes sociais (Instagram, Twitter, Discord). Slug personalizado (ex: kiyvo.com/v/minha-loja).' },
      { title: 'Dicas de personalização', content: 'Use logo profissional e em alta resolução. Banner deve comunicar o que você vende. Descrição curta e direta. Cor de destaque que combine com seu branding. Redes sociais ativas aumentam credibilidade. Slug fácil de lembrar e compartilhar.' },
    ]
  },
  'vendedor/relatorios': {
    title: 'Relatórios Financeiros',
    icon: '📈',
    sections: [
      { title: 'Dashboard de relatórios', content: 'Acesse relatórios detalhados: vendas por período, receita bruta e líquida, comissões pagas, chargebacks, saques realizados. Filtre por data, categoria ou produto. Exporte em CSV ou PDF para contabilidade. Gráficos interativos mostram tendências e sazonalidade.' },
      { title: 'Relatórios fiscais', content: 'O KIYVO emite relatórios para declaração de imposto de renda. Vendedores pessoa física recebem informe de rendimentos anuais. Pessoa jurídica pode exportar dados para contabilidade. Notas fiscais são emitidas automaticamente para vendas acima de R$ 100,00 (parceiro NFSe).' },
    ]
  },
};

// ─── TEMPLATE DE PÁGINA ──────────────────────────────────────

function generatePage(sectionKey, content) {
  const { title, icon, sections } = content;

  const sectionsJSX = sections.map((s, i) => `
          <FadeInOnScroll delay={${i * 0.1}}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">${s.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">${s.content}</p>
            </div>
          </FadeInOnScroll>`).join('');

  return `'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'

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
            <span className="text-4xl">${icon}</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            ${title}
          </h1>
        </motion.div>

        <div className="space-y-4">${sectionsJSX}
        </div>
      </div>
    </PageTransition>
  )
}
`;
}

// ─── MAIN ────────────────────────────────────────────────────

function main() {
  const appDir = path.join(__dirname, '..', 'src', 'app');
  let updated = 0;

  Object.entries(SECTION_CONTENT).forEach(([sectionKey, content]) => {
    const pagePath = path.join(appDir, sectionKey, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
      console.log(`⚠️  Não encontrado: ${sectionKey}/page.tsx`);
      return;
    }

    const current = fs.readFileSync(pagePath, 'utf8');

    // Verificar se a página ainda tem conteúdo genérico
    if (!current.includes('O que é') && !current.includes('Como funciona?') && !current.includes('Precisa de ajuda?')) {
      console.log(`✅ Já atualizado: ${sectionKey}`);
      return;
    }

    const newContent = generatePage(sectionKey, content);
    fs.writeFileSync(pagePath, newContent);
    updated++;
    console.log(`📝 Atualizado: ${sectionKey}`);
  });

  console.log(`\n✨ ${updated} páginas atualizadas com conteúdo contextual`);
}

main();
