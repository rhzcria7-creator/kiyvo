// Agente CTAMaker — gera botões de call-to-action em vários estilos
export interface CTAInput {
  acao: string
  tom?: 'direto' | 'curioso' | 'beneficio' | 'urgencia' | 'humilde'
  produto?: string
}
export interface CTAVariante { texto: string; primaria: boolean }
export interface CTAResult {
  variantes: CTAVariante[]
  corPrimaria: { bg: string; texto: string }
  dicas: string[]
}

export function gerarCTAs(input: CTAInput): CTAResult {
  const { acao, tom = 'direto', produto = '' } = input
  const a = acao.trim() || 'Começar'
  const prod = produto ? ' ' + produto : ''
  const variantes: CTAVariante[] = []
  function add(texto: string, primaria: boolean) { variantes.push({ texto, primaria }) }
  if (tom === 'direto') {
    add(`${a} agora${prod}`, true)
    add(`Quero ${a.toLowerCase()}${prod}`, true)
    add(`${a.toUpperCase()} →`, true)
    add('Saiba mais', false); add('Ver detalhes', false)
  } else if (tom === 'curioso') {
    add(`Descubra como ${a.toLowerCase()}${prod}`, true)
    add('Ver como funciona', true); add('Quero ver o método', true)
    add('Ver provas', false); add('Ver depoimentos', false)
  } else if (tom === 'beneficio') {
    add(`Quero ${a.toLowerCase()}${prod} com bônus`, true)
    add(`${a}${prod} com garantia de 7 dias`, true)
    add(`Sim, quero ${a.toLowerCase()}${prod}`, true)
    add('Ver tudo incluso', false); add('Só gratuitos', false)
  } else if (tom === 'urgencia') {
    add('GARANTIR MINHA VAGA ANTES QUE ACABE', true)
    add(`Aproveitar desconto HOJE`, true)
    add(`Quero ${a.toLowerCase()}${prod} AGORA`, true)
    add('Talvez depois', false)
  } else {
    add(`Me deixa ver como funciona`, true)
    add(`Ver se isso serve pra mim`, true)
    add(`Quero entender melhor`, true)
    add('Depois eu volto', false)
  }
  add(`⚡ ${a} em 1 clique`, true)
  add(`👉 ${a} agora`, true)
  return {
    variantes: variantes.slice(0, 9),
    corPrimaria: { bg: '#0F172A', texto: '#FFFFFF' },
    dicas: [
      'Use no máximo 4 palavras no CTA principal.',
      'Prefira 1ª pessoa ("Quero garantir") ao invés de 2ª ("Garanta já").',
      'Apenas 1 CTA primário por dobra.',
      'Botão grande (mínimo 48px de altura) e cor contrastante.',
      'Repita CTA a cada 3 seções da página.',
    ],
  }
}
