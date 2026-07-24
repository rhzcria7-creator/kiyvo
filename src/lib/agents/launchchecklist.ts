// Agente LaunchChecklist — checklist completo de lançamento de produto digital
export interface LaunchChecklistInput {
  tipoLancamento: 'produto_novo' | 'relancamento' | 'blackfriday' | 'evergreen'
  diasAteLancamento?: number
  nicho?: string
  temProduto?: boolean
  temCopy?: boolean
  temPagina?: boolean
  temCheckout?: boolean
}
export interface ChecklistItem {
  tarefa: string
  categoria: string
  dia?: number
  obrigatorio: boolean
  feito?: boolean
  dica: string
}
export interface LaunchChecklistResult {
  titulo: string
  totalTarefas: number
  itensPorFazer: number
  checklist: ChecklistItem[]
  cronograma: Array<{ dia: string; foco: string }>
  metricasAlvo: { visitantes: number; vendas: number; faturamento: number; cpa: number }
  errosComuns: string[]
}

export function gerarChecklistLancamento(input: LaunchChecklistInput): LaunchChecklistResult {
  const { tipoLancamento, diasAteLancamento = 14 } = input
  const itens: ChecklistItem[] = []
  const add = (tarefa: string, categoria: string, obrigatorio: boolean, dica: string, dia?: number) =>
    itens.push({ tarefa, categoria, obrigatorio, dica, dia })
  // Semana -2
  add('Definir persona principal (nome, idade, dor, desejo, objeções)', 'Estratégia', true, 'Seja específico — "Maria, 29 anos, CLT, quer renda extra".', -14)
  add('Validação com 10 pessoas do público-alvo', 'Estratégia', true, 'Mostre a ideia e pergunte: "você pagaria X por isso?".', -13)
  add('Definir preço (teste 3 faixas com pesquisa)', 'Preço', true, 'Use PriceMaster para calcular psicológico.', -12)
  add('Roteiro de conteúdo completo (VSL, página, emails)', 'Copy', true, 'Use CopyMaster + ScriptForge.', -11)
  add('Criar ou finalizar o produto', 'Produto', true, 'Versão mínima viável com bônus definidos.', -10)
  add('Estruturar página de vendas (hero, benefícios, prova, CTA)', 'Página', true, 'Use LandingForge + LandingChecker.', -9)
  add('Configurar checkout e integrações de pagamento', 'Checkout', true, 'PIX, cartão, boleto. Garanta SSL.', -8)
  add('Configurar webhooks, automação de emails, entrega', 'Automação', true, 'Teste fluxo completo do zero.', -7)
  // Semana -1
  add('Teste de compra real (cartão de teste)', 'Checkout', true, 'Confirme entrega automática.', -6)
  add('Gravar VSL e editar thumbnails', 'Mídia', false, 'Use ThumbnailMaker e ScriptShort.', -5)
  add('Criar criativos para redes (feed, stories, reels)', 'Mídia', true, 'Mínimo 10 peças: 5 hooks + 5 fechamentos.', -4)
  add('Sequência de emails pré-launch (aquecimento)', 'Marketing', true, '5 emails: dor, mais dor, revelação, prova, urgência.', -3)
  add('Parcerias e afiliados convidados', 'Parcerias', false, 'Convide 5-10 afiliados relevantes com material pronto.', -2)
  add('Review de compliance/LGPD', 'Legal', true, 'Use ContentAuditor para revisar promessas.', -1)
  add('Teste A/B da página (título vs. título)', 'Otimização', false, 'Use ABTester para comparar 2 headlines.', -1)
  // Dia D
  add('DIA D: Abrir carrinho, postar em TODOS os canais', 'Lançamento', true, 'Esteja online respondendo comentários.', 0)
  add('Monitorar em tempo real (compras, inbox, bugs)', 'Lançamento', true, 'Tenha uma pessoa de suporte no plantão.', 0)
  // Pós
  add('Upsells e order bumps no pós-compra', 'Monetização', true, 'Use OfferStacker.', 1)
  add('Envio de replay da live, caso tenha havido', 'Marketing', false, 'Replay converte 30% das pessoas que não compraram ao vivo.', 2)
  add('Carrinho aberto 3-7 dias com timer', 'Lançamento', true, 'Timer honesto no checkout.', 3)
  add('Radar de feedbacks dos primeiros compradores', 'Atendimento', true, 'Colete depoimentos nas primeiras 48h.', 4)
  add('Pesquisa de não-compradores para ajustar', 'Otimização', false, 'Envie email: "O que te impediu de comprar?"', 5)
  add('Fechar carrinho ou entrar em evergreen', 'Estratégia', true, 'Decida se fica perene ou reabre só em datas.', 7)
  const cronograma = tipoLancamento === 'blackfriday'
    ? [
        { dia: 'D-30', foco: 'Aquecimento pesado + lista de espera' },
        { dia: 'D-7', foco: 'Pre-Black: cupom exclusivo para VIPs' },
        { dia: 'D-3 a D-1', foco: 'Contagem regressiva' },
        { dia: 'D-Day', foco: 'Liberação, plantão, lives' },
        { dia: 'D+3', foco: 'Extensão por mais 48h (last call)' },
      ]
    : [
        { dia: 'D-14 a D-7', foco: 'Produto e página prontos' },
        { dia: 'D-7 a D-1', foco: 'Aquecimento e testes' },
        { dia: 'Dia D', foco: 'Abrir carrinho e atender' },
        { dia: 'D+1 a D+7', foco: 'Conteúdo de prova e urgência' },
      ]
  const metricasAlvo = {
    visitantes: tipoLancamento === 'blackfriday' ? 20000 : 3000,
    vendas: tipoLancamento === 'blackfriday' ? 500 : 80,
    faturamento: tipoLancamento === 'blackfriday' ? 49000 : 4900,
    cpa: tipoLancamento === 'blackfriday' ? 15 : 10,
  }
  const errosComuns = [
    'Não testar o checkout antes do lançamento.',
    'Prometer resultados garantidos (problema legal).',
    'Sumir no dia D e não responder comentários.',
    'Estrutura de prova social insuficiente.',
    'Esquecer de configurar emails pós-compra.',
    'Não ter um plantão de suporte.',
    'Upsell mal colocado (antes da confirmação de compra).',
    'Timer fake ("últimas horas" há 5 dias).',
  ]
  return {
    titulo: `Checklist ${tipoLancamento.replace('_', ' ').toUpperCase()} — ${diasAteLancamento} dias`,
    totalTarefas: itens.length,
    itensPorFazer: itens.filter(i => !i.feito).length,
    checklist: itens,
    cronograma,
    metricasAlvo,
    errosComuns,
  }
}
