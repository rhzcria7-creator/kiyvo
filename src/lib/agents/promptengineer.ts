// Agente PromptEngineer — cria prompts profissionais para ChatGPT, Gemini, Claude, Midjourney, DALL-E, KIYVO Agents
export interface PromptInput {
  ferramenta: 'chatgpt'|'gemini'|'claude'|'midjourney'|'dalle'|'kiyvo'|'copiloto'
  objetivo: string
  contexto?: string
  tom?: 'profissional'|'criativo'|'tecnico'|'vendas'|'infantil'|'jornalistico'
  idioma?: 'pt-BR'|'en'|'es'
  detalhes?: string[]
}
export interface PromptOutput {
  prompt: string
  systemPrompt?: string
  negativo?: string
  variações: string[]
  tecnicas: string[]
  dicasUso: string[]
  scorePrompt: number
}
export function criarPrompt(input: PromptInput): PromptOutput {
  const { ferramenta, objetivo, contexto, tom = 'profissional', idioma = 'pt-BR', detalhes = [] } = input
  let prompt = ''
  let systemPrompt: string | undefined
  let negativo: string | undefined
  const tecnicas: string[] = []
  const dicasUso: string[] = []
  if (ferramenta === 'midjourney' || ferramenta === 'dalle') {
    prompt = `Prompt para ${ferramenta}:\n\n` +
      `${objetivo}` +
      (contexto ? `, ${contexto}` : '') +
      `, style: ${tom === 'criativo' ? 'vibrant, creative, cinematic lighting, 4K' : tom === 'profissional' ? 'professional, studio quality, sharp focus, editorial' : tom === 'infantil' ? 'cute, colorful, whimsical, cartoon style, bright lighting' : 'ultra-realistic, 8K, photorealistic, octane render'}` +
      (detalhes.length ? ', ' + detalhes.join(', ') : '') +
      `\n\nParameters: --ar 16:9 --style raw --v 6.0`
    negativo = 'blurry, low quality, distorted, watermark, text, ugly, deformed'
    tecnicas.push('Comece pelo SUJEITO, depois ESTILO, depois ILUMINAÇÃO, depois PARÂMETROS')
    tecnicas.push('Use referências: "no estilo de..." ou "similar a..."')
    dicasUso.push('Gere 4 variações de uma vez e escolha a melhor')
    dicasUso.push('Use --stylize 750 para mais criatividade, 250 para mais fiel')
  } else {
    const role = {
      profissional: 'Especialista sênior com 10+ anos de experiência',
      criativo: 'Criativo publicitário vencedor de prêmios Cannes',
      tecnico: 'Engenheiro de software sênior com conhecimento profundo',
      vendas: 'Copywriter de alta conversão com ROI comprovado de 8 dígitos',
      infantil: 'Professor(a) divertido(a) que fala como criança mas com conteúdo educativo',
      jornalistico: 'Jornalista investigativo premiado, apuração 100% factual',
    }[tom]
    systemPrompt = `Você é ${role}. Responda SEMPRE em ${idioma}. Seja direto, prático e acionável. NÃO invente dados. Quando não tiver certeza, diga. Formato: estrutura clara com marcadores e exemplos concretos.`
    prompt = `# Objetivo\n${objetivo}\n\n`
    if (contexto) prompt += `# Contexto\n${contexto}\n\n`
    if (detalhes.length) prompt += `# Requisitos específicos\n${detalhes.map(d => `- ${d}`).join('\n')}\n\n`
    prompt += `# Tarefa\nCom base no exposto, ${objetivo}. Entregue em formato estruturado com:\n1. Resumo executivo (3 linhas)\n2. Passo a passo acionável\n3. Exemplos concretos/prontos para usar\n4. Erros comuns a evitar\n\nResponda em ${idioma}, tom ${tom}.`
    tecnicas.push('Use a técnica do "ATO" — Ação, Técnica, Objetivo')
    tecnicas.push('Especifique FORMATO de saída para respostas consistentes')
    tecnicas.push('Adicione restrições negativas ("não use emojis", "evite jargões")')
    tecnicas.push('Few-shot: dê 1-2 exemplos de como quer a resposta')
    dicasUso.push('Use temperaturas baixas (0.2-0.5) para tarefas técnicas/precisas')
    dicasUso.push('Temperaturas altas (0.7-1.0) para criatividade e brainstorms')
    dicasUso.push('Divida tarefas complexas em cadeia (chain-of-thought)')
    dicasUso.push('Peça para a IA "respirar fundo e pensar passo a passo" (melhora acurácia)')
  }
  const score = 75 + Math.min(1, (contexto?1:0)+(detalhes.length>2?1:0)) * 10
  const variações: string[] = [
    prompt.replace('Responda em', 'Responda de forma super concisa em') + '\n\n(versão concisa)',
    prompt + '\n\nPense passo a passo antes de responder. Chain-of-thought ativado.',
    prompt.replace('Formato:', 'Formato: entregue em markdown com tabelas quando apropriado\n\n') + '\n(versão markdown/tabelas)',
  ]
  return { prompt, systemPrompt, negativo, variações, tecnicas, dicasUso, scorePrompt: Math.min(98, score) }
}
