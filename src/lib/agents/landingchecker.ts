// Agente LandingChecker — analisa uma landing page/copy e pontua conversão
export interface LandingCheckerInput {
  titulo?: string
  subtitulo?: string
  url?: string
  heroTitulo?: string
  heroSubtitulo?: string
  temCTA?: boolean
  temDepoimentos?: boolean
  temGarantia?: boolean
  temFAQ?: boolean
  temEscassez?: boolean
  preco?: number
  callToActions?: string[]
  objetivos?: string[]
  publico?: string
}
export interface LandingCheckerResult {
  pontuacao: number
  nota: 'E' | 'D' | 'C' | 'B' | 'A' | 'A+'
  cor: string
  pontosFortes: string[]
  pontosFracos: string[]
  checkLista: Array<{ item: string; ok: boolean; peso: number; dica: string }>
  sugestoesCopy: string[]
}

export function analisarLanding(input: LandingCheckerInput): LandingCheckerResult {
  const ptsFortes: string[] = []
  const ptsFracos: string[] = []
  const checklist: LandingCheckerResult['checkLista'] = []
  let total = 0
  let max = 0
  function addCheck(item: string, ok: boolean, peso: number, dica: string) {
    checklist.push({ item, ok, peso, dica })
    max += peso
    if (ok) total += peso
    else ptsFracos.push(dica)
    if (ok) ptsFortes.push(item)
  }
  const heroT = (input.heroTitulo || input.titulo || '').trim()
  addCheck('Título hero claro (menos de 12 palavras)', heroT.length > 10 && heroT.length < 80 && heroT.split(/\s+/).length <= 12, 10,
    'Reescreva o título hero em até 12 palavras com um benefício claro e específico.')
  addCheck('Hero tem CTA visível acima da dobra', !!input.temCTA, 10, 'Adicione um botão CTA de alta cor contrastante logo abaixo do hero.')
  addCheck('Subtítulo complementa o título em 1-2 frases', !!(input.heroSubtitulo || input.subtitulo), 8, 'Adicione um subtítulo que explique a promessa em linguagem simples.')
  addCheck('Existe prova social (depoimentos) antes da seção de preço', !!input.temDepoimentos, 10, 'Insira 3-5 depoimentos com foto + nome + cargo antes do preço.')
  addCheck('Garantia incondicional (7, 15 ou 30 dias)', !!input.temGarantia, 8, 'Ofereça garantia incondicional — elimina risco do comprador.')
  addCheck('FAQ responde objeções principais', !!input.temFAQ, 7, 'Crie FAQ respondendo TOP 5 objeções (preço, tempo, suporte, garantia, pra quem é).')
  addCheck('Elementos de escassez (vagas, timer, estoque)', !!input.temEscassez, 5, 'Use timer ou limite de vagas honesto — não inventar escassez falsa.')
  addCheck('CTAs repetidos ao longo da página (mínimo 3)', (input.callToActions?.length || 0) >= 3, 7, 'Repita o CTA após cada seção principal (hero, benefícios, depoimentos, faq).')
  addCheck('Clareza de quem é o público alvo', !!input.publico, 8, 'Deixe explícito no hero ou logo após: "Para quem é X e quer Y em Z tempo".')
  addCheck('Preço com preço psicológico (termina em 7/9/97/99)', !!(input.preco && /(7|9|97|99)$/.test(String(Math.round(input.preco)))), 5, 'Use preços psicológicos como 19,97 / 47 / 97 / 197 — convertem mais.')
  addCheck('Lista de benefícios (não features) bullet points', true, 10, 'Cada bullet deve começar com verbo de benefício: "Aprenda...", "Economize...", "Conquiste...".')
  addCheck('Sem jargões ou palavras complicadas', heroT.length > 0 && !/(\s?solução\s|sinergia|holístico|disruptivo)/i.test(heroT + ' ' + (input.heroSubtitulo || '')), 4, 'Remova jargões corporativos — fale como uma pessoa real.')
  addCheck('Mobile-first (fonte legível, botões grandes)', true, 4, 'Botões devem ter pelo menos 48px de altura e fonte ≥ 16px em mobile.')
  addCheck('Velocidade de carregamento <3s', true, 4, 'Comprima imagens e remova scripts desnecessários.')
  const pontuacao = Math.round((total / max) * 100)
  let nota: LandingCheckerResult['nota'] = 'C'
  let cor = '#F59E0B'
  if (pontuacao >= 92) { nota = 'A+'; cor = '#10B981' }
  else if (pontuacao >= 85) { nota = 'A'; cor = '#22C55E' }
  else if (pontuacao >= 70) { nota = 'B'; cor = '#84CC16' }
  else if (pontuacao >= 55) { nota = 'C'; cor = '#F59E0B' }
  else if (pontuacao >= 40) { nota = 'D'; cor = '#F97316' }
  else { nota = 'E'; cor = '#EF4444' }
  const pub = input.publico || 'você'
  const sugestoesCopy = [
    heroT ? ('Teste essa headline alternativa: "Como ' + pub + ' consegue [RESULTADO] em [TEMPO] sem [DOR]"') : 'Crie headline nova com fórmula: "[Resultado] + [Tempo] + sem [dor]".',
    'Reescreva bullets com fórmula: "[Verbo] + [benefício] + [tempo]" (ex: "Elimine barriga em 21 dias sem fazer dieta chata").',
    'Adicione um CTA com texto em 1ª pessoa ("QUERO GARANTIR MEU ACESSO") em vez de "Saiba mais".',
  ]
  return { pontuacao, nota, cor, pontosFortes: ptsFortes.slice(0, 8), pontosFracos: ptsFracos.slice(0, 8), checkLista: checklist, sugestoesCopy }
}
