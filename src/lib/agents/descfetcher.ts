// Agente DescFetcher — analisador de descrição de produto concorrente
// Extrai pontos fortes/fracos, preço, benefícios, objeções e sugere versão melhorada

export interface DescFetcherInput {
  descricaoConcorrente: string
  tituloConcorrente?: string
  precoConcorrente?: number
  nicho?: string
  seuProduto?: string
}

export interface DescFetcherOutput {
  palavrasChave: string[]
  pontosFortes: string[]
  pontosFracos: string[]
  beneficiosMencionados: string[]
  objecoesNaoRespondidas: string[]
  precoSugerido: number
  descricaoMelhorada: string
  titulosAlternativos: string[]
  bulletsMatadores: string[]
  scoreConcorrente: number
}

function extrairPalavrasChave(texto: string): string[] {
  const t = texto.toLowerCase()
  const stop = new Set(['de', 'o', 'a', 'os', 'as', 'e', 'é', 'para', 'com', 'em', 'no', 'na', 'do', 'da', 'que', 'um', 'uma', 'se', 'por', 'mais', 'como', 'ao', 'à', 'seu', 'sua', 'você', 'voce'])
  const freqs: Record<string, number> = {}
  for (const w of t.split(/[\s,.!?;:()\[\]"'\/\\0-9\-]+/)) {
    const word = w.trim()
    if (word.length > 3 && !stop.has(word)) freqs[word] = (freqs[word] || 0) + 1
  }
  return Object.entries(freqs).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w)
}

function detectarPontosFortes(texto: string): string[] {
  const fortes: string[] = []
  const t = texto.toLowerCase()
  const mapas: Array<[RegExp, string]> = [
    [/\b(garantia|devolu[çc][ãa]o|reembolso|dinheiro de volta)\b/, 'Oferece garantia/reembolso'],
    [/\b(entrega|envio) (em|no|r[aá]pido|imediato|24h|hoje)\b/, 'Urgência de entrega mencionada'],
    [/\b(frete|gr[aá]tis|gratuito)\b/, 'Frete grátis é destaque'],
    [/\b(brinde|b[oô]nus|presente|exclusivo|gr[aá]tis)\b/, 'Usa bônus/brinde como gatilho'],
    [/\b(oficial|original|aut[eê]ntico|genu[íi]no)\b/, 'Destaca originalidade'],
    [/\b(certo|garantido|resultado|funciona|comprovado)\b/, 'Promete resultado'],
    [/\b(24h|imediato|autom[aá]tico|na hora)\b/, 'Promete entrega imediata'],
  ]
  for (const [rx, msg] of mapas) if (rx.test(t)) fortes.push(msg)
  if (fortes.length === 0) fortes.push('Descrição simples e direta')
  return fortes
}

function detectarPontosFracos(texto: string): string[] {
  const fracos: string[] = []
  const t = texto.toLowerCase()
  if (texto.length < 150) fracos.push('Descrição muito curta (<150 chars) — baixa persuasão')
  if (texto.length > 1800) fracos.push('Descrição muito longa (>1800 chars) — abandono')
  if (!/\b(voc[êe]|teu|tua|seu|sua)\b/i.test(texto)) fracos.push('Falta falar DIRETAMENTE com o cliente (sem "você")')
  if (!/[!]/.test(texto)) fracos.push('Pouca ênfase — falta exclamação e energia')
  if (!/\b(garantia|reembolso|devolu[çc][ãa]o)\b/i.test(texto)) fracos.push('Não menciona garantia — aumenta objeção de risco')
  if (!/\b(por que|porque|como|por que voc[êe])\b/i.test(texto)) fracos.push('Não responde "por quê?"')
  if (!/(r\$|reais|pre[çc]o|valor)/i.test(texto)) fracos.push('Não justifica valor')
  if (!/⭐|★|\bestrela\b|avalia/i.test(texto)) fracos.push('Sem prova social / avaliações')
  return fracos
}

function detectarBeneficios(texto: string): string[] {
  const ben: string[] = []
  const t = texto.toLowerCase()
  const mapas: Array<[RegExp, string]> = [
    [/\b(f[aá]cil|simples|pr[aá]tico)\b/, 'Facilidade/praticidade'],
    [/\b(r[aá]pido|veloz|instant[aâ]neo|imediato|minuto|segundo)\b/, 'Velocidade'],
    [/\b(economizar|economia|barato|melhor pre[çc]o|mais barato)\b/, 'Economia'],
    [/\b(resultado|funciona|transforma|melhora|aumenta|acaba com|resolve)\b/, 'Resultado/transformação'],
    [/\b(seguro|seguran[çc]a|confi[aá]vel|protege)\b/, 'Segurança'],
    [/\b(ilimitado|vital[ií]cio|para sempre|acesso total)\b/, 'Acesso vitalício/ilimitado'],
    [/\b(passo a passo|tutorial|guia|f[aá]cil de usar)\b/, 'Facilidade de uso'],
  ]
  for (const [rx, msg] of mapas) if (rx.test(t)) ben.push(msg)
  if (ben.length === 0) ben.push('Benefícios implícitos (não declarados)')
  // Remover duplicatas sem usar spread em Set (compatibilidade TS)
  return Array.from(new Set<string>(ben))
}

function detectarObjecoes(texto: string): string[] {
  const obj = [
    'O produto realmente funciona?',
    'Vou ter suporte se der problema?',
    'Posso confiar na entrega?',
  ]
  const t = texto.toLowerCase()
  if (!/garantia/i.test(t)) obj.push('Tem garantia do meu dinheiro de volta?')
  if (!/suporte|atendimento/i.test(t)) obj.push('Tenho suporte humano?')
  if (!/entrega/i.test(t)) obj.push('Quando vou receber?')
  return obj
}

export function analisarDescricaoConcorrente(input: DescFetcherInput): DescFetcherOutput {
  const { descricaoConcorrente: desc, tituloConcorrente, precoConcorrente = 97, seuProduto = 'seu produto' } = input
  const palavrasChave = extrairPalavrasChave(desc)
  const pontosFortes = detectarPontosFortes(desc)
  const pontosFracos = detectarPontosFracos(desc)
  const beneficiosMencionados = detectarBeneficios(desc)
  const objecoesNaoRespondidas = detectarObjecoes(desc)
  const precoSugerido = Math.round(precoConcorrente * 0.95) // 5% abaixo inicialmente

  const titulo = tituloConcorrente || seuProduto
  const descricaoMelhorada = `🔥 ${titulo.toUpperCase()} — A ESCOLHA NÚMERO 1 DOS BRASILEIROS EM 2025 🔥

Chega de frustração. ${seuProduto} foi criado pra você que não quer mais perder tempo com soluções meia-boca.

✅ Por que escolher ${seuProduto}?

${beneficiosMencionados.slice(0, 5).map((b, i) => `${String.fromCodePoint(0x31 + i)}.️⃣ ${b} — e na PRÁTICA, não só no discurso`).join('\n')}
${pontosFracos.slice(0, 3).map(() => '🛡️ Garantia INCONDICIONAL de 7 dias ou seu dinheiro de volta, sem perguntas').join('')}
⚡ Entrega IMEDIATA após o pagamento (download digital em segundos)
💬 Suporte HUMANO em português, de verdade, em até 1 hora
⭐ +5.000 clientes satisfeitos • 4.9/5 estrelas (verificado)

⚠️ Atenção: essa oferta é por tempo limitado. Os próximos 100 compradores ganham BÔNUS EXCLUSIVOS que somem em breve.

👇 Clica em "Comprar agora" e recebe nos próximos 2 minutos.`

  const titulosAlternativos = [
    `🔥 ${seuProduto}: o método que + converte em 2025`,
    `${seuProduto} — funciona em 7 dias ou seu dinheiro de volta`,
    `Cansado(a) de soluções que não funcionam? Tente ${seuProduto}`,
    `${seuProduto} OFICIAL ✅ (cuidado com cópias)`,
    `${seuProduto} + bônus exclusivos — só hoje`,
  ]

  const bulletsMatadores = [
    `⚡ Resultado em 7 dias ou seu dinheiro 100% de volta`,
    `🎁 Bônus exclusivos (R$ 297 em valor) só para os 100 primeiros`,
    `💬 Suporte humano em PT-BR respondendo em até 1h`,
    `📱 Funciona no celular, tablet e computador — 100% online`,
    `🔒 Compra 100% segura com criptografia SSL`,
    `🚀 Acesso IMEDIATO após o pagamento`,
    `🏆 Mais de 5.000 alunos/clientes satisfeitos`,
  ]

  let score = 50
  score += Math.min(pontosFortes.length * 6, 30)
  score -= pontosFracos.length * 5
  score = Math.max(5, Math.min(95, score))

  return {
    palavrasChave,
    pontosFortes,
    pontosFracos,
    beneficiosMencionados,
    objecoesNaoRespondidas,
    precoSugerido,
    descricaoMelhorada,
    titulosAlternativos,
    bulletsMatadores,
    scoreConcorrente: score,
  }
}
