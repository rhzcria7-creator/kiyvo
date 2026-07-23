// Script para gerar em massa os agentes v9.0 (salvo com write_file, sem conflitos de shell)
const fs = require('fs');
const path = require('path');

// Definições dos agentes (data only)
const agents = [
  {
    file: 'checkoutmax',
    name: 'CheckoutMax',
    desc: 'Otimiza a página de checkout com scripts e gatilhos psicológicos',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Nome do Produto' },
      { name: 'preco', type: 'number', label: 'Preco (R$)' },
      { name: 'nicho', type: 'text', label: 'Nicho' },
    ],
    run: `(i) => {
      const compradores = Math.floor(Math.random()*200+150);
      return {
        gatilhos: [
          { posicao: 'Topo', elemento: '⏰ Oferta por tempo limitado — esta pagina expira em 10 minutos' },
          { posicao: 'Ao lado do preco', elemento: 'De <s>R$' + (i.preco*1.8).toFixed(2).replace('.',',') + '</s> por apenas <b>R$' + i.preco.toFixed(2).replace('.',',') + '</b>' },
          { posicao: 'Abaixo do botao', elemento: '🔒 Compra 100% segura — SSL + Garantia de 7 dias' },
          { posicao: 'Antes dos campos', elemento: '✅ Acesso imediato\\n✅ Suporte\\n✅ Atualizacoes gratis' },
          { posicao: 'Rodape', elemento: 'Mais de ' + compradores + ' pessoas compraram hoje' },
        ],
        scripts: [
          'Contador regressivo de 10 min',
          'Pop-up de prova social a cada 45s',
          'Badge "Restam 7 vagas"',
          'PIX com 5% OFF a vista',
          'Selo "+2.000 clientes"',
        ],
        taxaConversaoEstimada: 'Checkout otimizado pode converter 3-5x mais'
      };
    }`,
  },
  {
    file: 'scarcitypro',
    name: 'ScarcityPro',
    desc: 'Cria escassez REAL sem fake (urgencia etica)',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Nome do produto' },
      { name: 'estoque', type: 'number', label: 'Vagas/Estoque real' },
      { name: 'preco', type: 'number', label: 'Preco atual' },
    ],
    run: `(i) => {
      const vagas = i.estoque || 17;
      const precoAlvo = ((i.preco||97)*1.3).toFixed(2).replace('.',',');
      return {
        escassezEtica: [
          { tipo: 'vagas', texto: 'Restam ' + vagas + ' vagas neste preco — quando fechar, o preco sobe.' },
          { tipo: 'tempo', texto: 'Esta oferta termina hoje as 23:59.' },
          { tipo: 'bonus', texto: 'Os primeiros 20 compradores ganham bonus exclusivo.' },
          { tipo: 'lote', texto: 'Este e o Lote 1. Proximo lote sera R$' + precoAlvo + '.' },
        ],
        regrasEticas: [
          'NUNCA mentir sobre estoque',
          'NUNCA usar contador regressivo falso',
          'Escassez baseada em sua capacidade real',
          'Explique o PORQUE da escassez',
        ],
        exemplos: {
          topoProduto: '⚡ Restam ' + vagas + ' vagas',
          botaoCta: 'QUERO GARANTIR MINHA VAGA',
        }
      };
    }`,
  },
  {
    file: 'provaosocialpro',
    name: 'ProvaSocialPro',
    desc: 'Depoimentos e prova social que convencem',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'tipo', type: 'text', label: 'Tipo' },
    ],
    run: `(i) => ({
      templates: [
        { padrao: 'Antes x Depois', texto: '"Eu estava travado ha meses, em 2 semanas consegui [resultado]. Recomendo!" — Joao, SP' },
        { padrao: 'Cetico convertido', texto: '"Comprei desconfiado, mas o ' + i.produtoNome + ' me surpreendeu." — Mariana, RJ' },
        { padrao: 'Resultado rapido', texto: '"Em menos de 7 dias ja vi resultado." — Pedro, BH' },
      ],
      antiFake: [
        'Nao invente depoimentos (ilegal)',
        'Use prints reais',
        'Peca autorizacao por escrito',
      ]
    })`,
  },
  {
    file: 'emailboasvindas',
    name: 'EmailBoasVindas',
    desc: 'Sequencia de boas-vindas pos-compra que engaja e reduz refund',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
    ],
    run: `(i) => ({
      sequencia: [
        { dia: 0, assunto: 'Seu acesso a ' + i.produtoNome + ' chegou! 🎉' },
        { dia: 1, assunto: 'O primeiro passo de muitos' },
        { dia: 3, assunto: 'Tirando duvidas' },
        { dia: 5, assunto: 'Bonus antecipado' },
        { dia: 7, assunto: 'Ainda tem tempo de desistir' },
      ],
      taxaRefundEsperada: '-30 a -50% nos refunds'
    })`,
  },
  {
    file: 'leadmagnet',
    name: 'LeadMagnet',
    desc: 'Iscas digitais eticas que qualificam leads',
    fields: [
      { name: 'nicho', type: 'text', label: 'Nicho' },
      { name: 'publico', type: 'text', label: 'Publico alvo' },
    ],
    run: `(i) => ({
      nicho: i.nicho,
      publico: i.publico,
      ideias: [
        { tipo: 'Checklist PDF', nome: 'Checklist de 15 pontos para ' + i.nicho, taxaConversao: '15-25%' },
        { tipo: 'Planilha', nome: 'Planilha pronta de ' + i.nicho, taxaConversao: '20-30%' },
        { tipo: 'Mini-curso', nome: '3 dias intensivos em ' + i.nicho, taxaConversao: '10-20%' },
        { tipo: 'Calculadora', nome: 'Calculadora de ' + i.nicho, taxaConversao: '25-40%' },
        { tipo: 'Quiz', nome: 'Quiz: qual seu perfil de ' + i.nicho + '?', taxaConversao: '30-50%' },
      ],
      regras: ['Entregar valor REAL','Problema ESPECIFICO','Consumivel em 5-15min','Deixar querendo MAIS']
    })`,
  },
  {
    file: 'whatsappvendas',
    name: 'WhatsAppVendas',
    desc: 'Scripts de WhatsApp para fecharem no direct',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'preco', type: 'number', label: 'Preco' },
    ],
    run: `(i) => {
      const preco = (i.preco||97).toFixed(2).replace('.',',');
      return {
        saudacao: 'Ola! Vi que voce olhou o ' + i.produtoNome + '. Posso ajudar?',
        quandoPerguntaPreco: 'Claro! Custa R$' + preco + ' no PIX ou 12x. Quer link?',
        quandoEstaCaro: 'Entendo! Posso te dar 10% OFF no PIX + bonus de R$47 se fechar hoje.',
        quandoVaiPensar: 'Tudo bem! Se fechar em 30min tenho cupom de 15% exclusivo.',
        objecoes: [
          { o: 'Vou pensar', r: 'Sem problemas! A garantia de 7 dias cobre arrependimento.' },
          { o: 'E confiavel?', r: 'Total! Pagamento oficial + SSL + garantia.' },
        ]
      };
    }`,
  },
  {
    file: 'ofertarelampago',
    name: 'OfertaRelampago',
    desc: 'Constroi oferta relampago de 24h completa',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'precoNormal', type: 'number', label: 'Preco normal' },
      { name: 'desconto', type: 'number', label: 'Desconto %' },
    ],
    run: `(i) => {
      const desc = i.desconto || 50;
      const precoPromo = Math.round(i.precoNormal*(100-desc))/100;
      return {
        precoOriginal: i.precoNormal,
        precoPromo,
        titulos: ['SO HOJE: ' + desc + '% OFF','24H: R$' + precoPromo],
        checkpoints: ['Contador visivel','Preco antigo riscado','Prova social','NUNCA estender a oferta']
      };
    }`,
  },
  {
    file: 'bundlecriador',
    name: 'BundleCriador',
    desc: 'Combos de produtos que aumentam ticket medio',
    fields: [
      { name: 'produto1', type: 'text', label: 'Produto principal' },
      { name: 'preco1', type: 'number', label: 'Preco principal' },
      { name: 'produto2', type: 'text', label: 'Complementar 1' },
      { name: 'preco2', type: 'number', label: 'Preco complementar' },
    ],
    run: `(i) => {
      const soma = i.preco1 + i.preco2;
      return {
        somaIndividual: soma,
        bundles: [
          { nome: 'Starter', produtos: [i.produto1], preco: i.preco1, desconto: 0 },
          { nome: 'Pro (Recomendado)', produtos: [i.produto1, i.produto2], preco: Math.round((i.preco1+i.preco2)*0.82*100)/100, desconto: 18, destaque: true },
          { nome: 'VIP', produtos: [i.produto1, i.produto2], preco: Math.round(soma*0.65*100)/100, desconto: 35 },
        ],
      };
    }`,
  },
  {
    file: 'faqobjetor',
    name: 'FAQObjetor',
    desc: 'Transforma objecoes em FAQ que anteve duvidas no checkout',
    fields: [{ name: 'produtoNome', type: 'text', label: 'Produto' }],
    run: `(i) => ({
      faqs: [
        { p: 'Como recebo?', r: 'Acesso IMEDIATO apos pagamento, no seu email, em ate 2 min.' },
        { p: 'Tem garantia?', r: 'Sim, 7 dias incondicionais.' },
        { p: 'Pagamento?', r: 'PIX (imediato), cartao 12x, boleto. 100% seguro.' },
        { p: 'E mensalidade?', r: 'Nao! Pagamento unico. Acesso vitalicio.' },
      ],
      regras: ['Resposta DIRETA','Coloque FAQ no CHECKOUT','Se duvida aparece 2x, vire FAQ']
    })`,
  },
  {
    file: 'quizvendas',
    name: 'QuizVendas',
    desc: 'Quiz de segmentacao que converte 3x mais',
    fields: [
      { name: 'nicho', type: 'text', label: 'Nicho' },
      { name: 'produtoNome', type: 'text', label: 'Produto final' },
    ],
    run: `(i) => ({
      perguntas: [
        'Qual seu nivel atual em ' + i.nicho + '?',
        'Qual sua maior dificuldade?',
        'Quanto tempo por dia voce tem?',
        'Qual seu orcamento?',
      ],
      paginaResultado: 'Com base nas respostas, o melhor caminho e ' + i.produtoNome,
      taxaConversaoTipica: '25-40% completam, 8-15% compram'
    })`,
  },
  {
    file: 'captionvendas',
    name: 'CaptionVendas',
    desc: 'Legendas de Reels/TikTok que VENDEM',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'nicho', type: 'text', label: 'Nicho' },
    ],
    run: `(i) => ({
      estruturaPAS: {
        Problema: 'Voce esta tentando ' + i.nicho + ' mas nao consegue?',
        Agitacao: 'Pior e ver todo mundo conseguindo enquanto voce trava.',
        Solucao: 'Criei o ' + i.produtoNome + ' pra resolver isso. Link na bio.'
      },
      hookAberturas: ['Para TUDO e me le 30s.','Verdade que ninguem te conta sobre ' + i.nicho],
      ctas: ['Comenta "EU"','Salva o post','Link na bio']
    })`,
  },
  {
    file: 'refundminimizer',
    name: 'RefundMinimizer',
    desc: 'Reduz reembolsos sem bloquear consumidor',
    fields: [{ name: 'produtoNome', type: 'text', label: 'Produto' }],
    run: `(i) => ({
      estrategias: [
        { t: 'Onboarding imediato', d: 'Video de boas-vindas logo apos comprar (-30% refund)' },
        { t: 'Sequencia de engajamento', d: '7 emails com uma tarefa POR DIA' },
        { t: 'Expectativa realista', d: 'Nao prometa milagres' },
        { t: 'Suporte ativo no dia 3', d: 'Email perguntando "ta dando tudo certo?"' },
      ],
      script: 'Antes de pedir reembolso, posso te ajudar a aplicar?',
      quandoAceitar: 'Se insistir, aceite SEM RESISTENCIA.'
    })`,
  },
  {
    file: 'afiliadorpro',
    name: 'AfiliadorPro',
    desc: 'Programa de afiliados que atrai bons divulgadores',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'preco', type: 'number', label: 'Preco' },
      { name: 'comissao', type: 'number', label: 'Comissao %' },
    ],
    run: `(i) => {
      const c = i.comissao || 50;
      const valor = Math.round(i.preco*c)/100;
      return {
        comissaoPercent: c,
        comissaoValor: valor,
        carta: 'Quer ganhar R$' + valor + ' por venda de ' + i.produtoNome + '? Cadastre-se.',
        materiais: ['Swipes de email','Legendas prontas','Banners','Criativos WhatsApp'],
        regras: ['Nao afiliado comprando pelo proprio link','Pague em 30 dias','Atribuicao ultimo clique 30 dias']
      };
    }`,
  },
  {
    file: 'metodohero',
    name: 'MetodoHero',
    desc: 'Cria nome e promessa de metodo/curso proprio',
    fields: [
      { name: 'nicho', type: 'text', label: 'Nicho' },
      { name: 'resultado', type: 'text', label: 'Resultado' },
      { name: 'dias', type: 'number', label: 'Dias' },
    ],
    run: `(i) => {
      const sufixos = ['Metodo','Sistema','Formula','Protocolo','Playbook'];
      const adjetivos = ['Secreto','Definitivo','Pro','Turbo','Brasileiro'];
      const combos = [];
      for (const s of sufixos) for (const a of adjetivos) combos.push(s + ' ' + a);
      return {
        nomes: combos,
        nomeIdeal: combos[0] + ' ' + i.nicho,
        promessas: [
          i.resultado + ' em ' + (i.dias||21) + ' dias',
          'Sem aparecer, se quiser',
          'Sem investir em anuncio',
          'Comecando do zero'
        ]
      };
    }`,
  },
  {
    file: 'nomesdominio',
    name: 'NomesDominio',
    desc: 'Sugere nomes de produto/marca',
    fields: [{ name: 'nicho', type: 'text', label: 'Nicho' }],
    run: `(i) => {
      const raizes = ['hub','ly','lab','pro','up','br','x','io'];
      const prefixos = ['go','my','get','try','neo','o'];
      const palavras = i.nicho.toLowerCase().split(/\\s+/).filter(w=>w.length>3).slice(0,3);
      const sugs = [];
      for (const p of prefixos) for (const pl of palavras) sugs.push(p+pl);
      for (const pl of palavras) for (const r of raizes) sugs.push(pl+r);
      return {
        sugestoes: Array.from(new Set(sugs)).slice(0,18),
        regras: ['Max 7 letras','Facil de falar','Sem hifen/numeros','Verifique .com.br e @redes']
      };
    }`,
  },
  {
    file: 'checklistvp',
    name: 'ChecklistPaginaVendas',
    desc: 'Checklist completo de pagina de vendas que CONVERTE',
    fields: [],
    run: `() => ({
      checklist: [
        'Headline acima da dobra',
        'Subhead explicando pra quem',
        'Video/imagem do produto',
        'Preco com comparacao visual',
        'Botao de compra acima da dobra',
        'Selo de garantia visivel',
        'Selo de seguranca',
        'Beneficios (nao funcionalidades)',
        'Depoimentos REAIS',
        'Sobre o autor',
        'FAQs',
        'Bonus com valor separado',
        'Urgencia/escassez',
        'Reembolso claro',
        'CNPJ/legal no rodape'
      ],
      conversaoIdeal: '3-5% otimizado. Abaixo de 1% = quebrada.'
    })`,
  },
  {
    file: 'clientepravida',
    name: 'ClientePraVida',
    desc: 'Estrategia de retencao e LTV alto',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'ticketMedio', type: 'number', label: 'Ticket medio' },
    ],
    run: `(i) => ({
      estrategias: [
        { t: 'Onboarding 7d', d: 'Faz cliente usar e ver valor rapido' },
        { t: 'Upsell 7-14 dias depois', d: 'Complementar 20-30% do valor' },
        { t: 'Newsletter semanal', d: 'Conteudo + 1 oferta por semana' },
        { t: 'Indicacao', d: 'Indique e ganhe' },
        { t: 'Comunidade', d: 'Grupo VIP pra criar laco' }
      ],
      regra: 'LTV deve ser pelo menos 3x o CAC.'
    })`,
  },
  {
    file: 'scriptbotresposta',
    name: 'ScriptBotResposta',
    desc: 'Scripts de respostas automaticas de bot',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'preco', type: 'number', label: 'Preco' },
    ],
    run: `(i) => ({
      fluxos: [
        { gatilho: ['oi','ola'], resposta: 'Ola! Posso te ajudar? 1) Preco 2) Como funciona 3) Comprar 4) Humano' },
        { gatilho: ['preco','valor'], resposta: 'O ' + i.produtoNome + ' custa R$' + (i.preco||97) + '. Quer link?' },
      ],
      aviso: 'SEMPRE deixe opcao de falar com humano.'
    })`,
  },
  {
    file: 'viralloop',
    name: 'ViralLoop',
    desc: 'Mecanica viral indicou-ganhou',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'recompensa', type: 'text', label: 'Recompensa' },
    ],
    run: `(i) => ({
      mecanica: 'Indique um amigo. Quando ele comprar, voce ganha ' + (i.recompensa||'R$50 em credito') + ' e ele 10% OFF.',
      comoFunciona: ['Pega link unico','Compartilha','Amigo compra → voce ganha','Saque pra conta'],
      regra: 'Nao obrigue indicacao pra receber prometido. Nao piramide.'
    })`,
  },
  {
    file: 'kdcalculator',
    name: 'KDCalculator',
    desc: 'Calcula KD Points e cashback',
    fields: [
      { name: 'valorCompra', type: 'number', label: 'Valor da compra' },
      { name: 'plano', type: 'text', label: 'Plano' },
    ],
    run: `(i) => {
      const taxas = { free: 1, plus: 2, pro: 3, vendor_pro: 5 };
      const pct = taxas[i.plano] || 1;
      const kd = Math.floor(i.valorCompra * pct);
      return {
        cashbackPct: pct,
        kdPoints: kd,
        valorEmDinheiro: 'R$' + (kd/100).toFixed(2),
        maxDesconto: 'R$' + (i.valorCompra*0.5).toFixed(2),
        explicacao: '100 KD = R$1. Uso max 50% do valor.'
      };
    }`,
  },
  {
    file: 'abtestideas',
    name: 'ABTestIdeas',
    desc: 'Testes A/B com maior impacto',
    fields: [{ name: 'pagina', type: 'text', label: 'Pagina' }],
    run: `(i) => {
      const testes = {
        checkout: [
          { h: 'Botao PIX primeiro aumenta conversao', a: 'Cartao primeiro', b: 'PIX primeiro' },
          { h: 'Garantia perto do botao ajuda', a: 'Garantia no rodape', b: 'Garantia acima do botao' },
        ],
        landing: [
          { h: 'Headline direta vs curiosa', a: 'Promessa', b: 'Curiosidade' },
          { h: 'Video vs imagem', a: 'Video', b: 'Imagem' },
        ]
      };
      return { testes: testes[i.pagina] || testes.landing, amostra: '300 por variavel' };
    }`,
  },
  {
    file: 'socialcopy',
    name: 'SocialCopy',
    desc: 'Posts prontos para Twitter/X, Instagram, LinkedIn',
    fields: [{ name: 'tema', type: 'text', label: 'Tema' }],
    run: `(i) => ({
      twitter: [
        i.tema + '. Ninguem fala sobre isso porque nao da engajamento. Mas e a verdade.',
        'Errei muito em ' + i.tema + ' ate descobrir que o basico ainda funciona.'
      ],
      instagram: ['Arrasta pro lado. 3 verdades que ninguem te conta sobre ' + i.tema],
      linkedin: ['Reflexao: ' + i.tema + '. Depois de anos percebi...']
    })`,
  },
  {
    file: 'cancelasaver',
    name: 'CancelaSaver',
    desc: 'Fluxo para reter quem cancela assinatura',
    fields: [
      { name: 'plano', type: 'text', label: 'Plano' },
      { name: 'preco', type: 'number', label: 'Preco mensal' },
    ],
    run: `(i) => ({
      fluxo: [
        { tela: 1, pergunta: 'Motivo do cancelamento?', opcoes: ['Muito caro','Nao usei','Sem resultado','Concorrente','Outro'] },
        { motivo: 'muito caro', oferta: 'Posso dar 30% OFF por 2 meses (R$' + (i.preco*0.7).toFixed(2) + ')?' },
        { motivo: 'nao usei', oferta: 'Podemos pausar por 60 dias?' },
        { motivo: 'sem resultado', oferta: 'Sessao 15min gratuita com nosso time?' },
      ],
      retencao: '15-25% dos cancelamentos podem ser revertidos'
    })`,
  },
  {
    file: 'seotags',
    name: 'SEOTags',
    desc: 'Title e meta description otimizados para Google/KIYVO',
    fields: [
      { name: 'produtoNome', type: 'text', label: 'Produto' },
      { name: 'categoria', type: 'text', label: 'Categoria' },
    ],
    run: `(i) => ({
      titulos: [
        i.produtoNome + ' ' + i.categoria + ' | Compra Online | KIYVO',
        'Comprar ' + i.produtoNome + ' | Download Imediato'
      ],
      metaDescription: i.produtoNome + ' a venda na KIYVO. Download imediato, garantia 7 dias, preco justo.',
      boasPraticas: ['Title 50-60 chars','Meta 150-160 chars','URL curta','Alt em imagens']
    })`,
  },
  {
    file: 'precoguerra',
    name: 'PrecoGuerra',
    desc: 'Define precificacao agressiva mas lucrativa para black friday',
    fields: [
      { name: 'precoNormal', type: 'number', label: 'Preco normal' },
      { name: 'custo', type: 'number', label: 'Custo' },
    ],
    run: `(i) => {
      const limiar = i.custo / (1 - 0.08 - 0.065); // taxas + impostos
      return {
        precoNormal: i.precoNormal,
        faixas: [
          { tipo: 'Black Fraude', preco: i.precoNormal, desconto: 0, aviso: 'Mesmo preco com etiqueta falsa — NAO faca' },
          { tipo: '15% OFF real', preco: Math.round(i.precoNormal*0.85*100)/100, lucro: Math.round(i.precoNormal*0.85*100)/100 - limiar },
          { tipo: '25% OFF agressivo', preco: Math.round(i.precoNormal*0.75*100)/100, lucro: Math.round(i.precoNormal*0.75*100)/100 - limiar },
          { tipo: '30% OFA (queima)', preco: Math.round(i.precoNormal*0.70*100)/100, lucro: Math.round(i.precoNormal*0.70*100)/100 - limiar },
        ],
        precoMinimoSemPrejuizo: Math.round(limiar*100)/100,
        regra: 'Se o desconto nao for real, nao faca. Cliente sabe e processa'
      };
    }`,
  },
];

const outDir = path.join(__dirname, '..', 'src', 'lib', 'agents');

for (const ag of agents) {
  // Build types from fields
  const fieldsTs = ag.fields.map(f => {
    const type = f.type === 'number' ? 'number' : 'string';
    return `  ${f.name}: ${type};`;
  }).join('\n');

  const validations = ag.fields.map(f => {
    return `  if (i.${f.name} === undefined || i.${f.name} === null || i.${f.name} === '') return 'Preencha: ${f.label}';`;
  }).join('\n');

  // Generate runFn — evaluate at runtime to confirm it parses
  let runFn;
  try {
    runFn = eval('(' + ag.run + ')');
  } catch (e) {
    console.log('Erro ao parsear run de', ag.file, e.message);
    continue;
  }
  // Sanity check
  try {
    const fake = {};
    for (const f of ag.fields) fake[f.name] = f.type === 'number' ? 97 : 'Exemplo ' + f.name;
    const result = runFn(fake);
    if (!result) throw new Error('sem retorno');
  } catch (e) {
    console.log('Erro no teste de', ag.file, e.message);
  }

  const src = `// ${ag.name} — ${ag.desc}
// Agente IA da KIYVO v9.0
import { AgentContext, AgentResult } from './types'

export interface ${ag.name}Input {
${fieldsTs}
}

export async function run${ag.name}(input: ${ag.name}Input, _ctx?: AgentContext): Promise<AgentResult> {
  const err = validar(input);
  if (err) return { ok: false, error: err };
  try {
    return { ok: true, data: runInternal(input) };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro interno' };
  }
}

function validar(i: ${ag.name}Input): string | null {
${validations}
  return null;
}

function runInternal(i: ${ag.name}Input): any {
  const fn: any = ${ag.run};
  return fn(i);
}
`;
  fs.writeFileSync(path.join(outDir, ag.file + '.ts'), src);
  console.log('✅', ag.file + '.ts');
}

// Atualizar index.ts
const indexPath = path.join(outDir, 'index.ts');
let idx = fs.readFileSync(indexPath, 'utf8');
const marker = "export * from './routeHelper'";
const newExports = agents.map(a => `export * from './${a.file}'`).join('\n');
if (!idx.includes(`./${agents[0].file}`)) {
  idx = idx.replace(marker, marker + '\n// v9.0 JUSTO & LUCRATIVO — agentes de monetizacao, vendas e etica\n' + newExports);
  fs.writeFileSync(indexPath, idx);
  console.log('\n✅ index.ts atualizado com', agents.length, 'novos agentes');
}
