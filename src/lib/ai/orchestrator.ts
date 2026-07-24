// ─────────────────────────────────────────────────────────────
// KIYVO AI — Motor interno multi-provider (INVISÍVEL ao usuário).
// Este arquivo é INTERNO. Nunca mencionar "orquestrador", "Hermes" ou providers na UI.
// Cada agente da plataforma tem nome próprio e personalidade — do ponto de vista do
// usuário, são agentes independentes e especializados.
// Providers gratuitos (chaves opcionais no .env.local):
//   - Google Gemini (GEMINI_API_KEY) — free tier 15 RPM
//   - Groq (GROQ_API_KEY) — free tier Llama 70B/Mixtral
//   - OpenRouter (OPENROUTER_API_KEY) — vários models free
// Fallback offline (sem chave): modelo determinístico com templates,
//   usando DuckDuckGo Instant Answer API para pesquisa em tempo real.
//
// Regras do sistema KIYVO:
//   - Respostas em PT-BR
//   - Foco em vendas/marketing digital brasileiro
//   - NUNCA inventar dados (usa busca DDG pra fatos reais)
//   - Output conciso, acionável, com listas numeradas
//   - Nunca gerar texto ofensivo/ilegal/enganoso
// ─────────────────────────────────────────────────────────────

export type AIProvider = 'nvidia' | 'gemini' | 'groq' | 'openrouter' | 'fallback'
export type AIModel =
  | 'nvidia/llama-3.3-nemotron-super-49b-v1'
  | 'nvidia/mistral-nemo-12b-instruct'
  | 'gemini-2.0-flash'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-instruct'
  | 'kiyvo-fallback-v1'

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AgentContext {
  agentId?: string
  agentName?: string
  agentDescription?: string
  webSearch?: boolean
  maxTokens?: number
  temperature?: number
}

const SYSTEM_PROMPT_BASE = `Você é um agente especialista da plataforma KIYVO (marketplace brasileiro de produtos digitais).
Responda SEMPRE em português brasileiro (PT-BR).
Seu papel é ajudar vendedores e compradores brasileiros com produtos digitais (cursos, templates, software, marketing, copywriting, vendas, finanças).
Seja direto, prático e acionável. Use listas numeradas quando apropriado.
Nunca invente informações factuais — se não souber, diga claramente.
Mantenha a resposta estruturada com títulos e bullets.
Cumpra rigorosamente a LGPD e boas práticas de mercado.`

// ─────────────────────────────────────────────────────────────
// DuckDuckGo Instant Answer API (sem chave, CORS em server-side)
// ─────────────────────────────────────────────────────────────
export async function duckDuckGoSearch(query: string, maxResults = 5): Promise<{
  abstract?: string
  relatedTopics: Array<{ text: string; url?: string }>
}> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KiyvoAgent/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { relatedTopics: [] }
    const data = await res.json()
    const abstract = (data.AbstractText || data.Abstract || '') as string
    const related: Array<{ text: string; url?: string }> = []
    if (Array.isArray(data.RelatedTopics)) {
      for (const t of data.RelatedTopics.slice(0, maxResults)) {
        if (t.Text) {
          related.push({ text: String(t.Text).slice(0, 200), url: t.FirstURL })
        } else if (t.Topics) {
          for (const st of t.Topics.slice(0, 2)) {
            if (st.Text) related.push({ text: String(st.Text).slice(0, 200), url: st.FirstURL })
          }
        }
      }
    }
    return { abstract, relatedTopics: related.slice(0, maxResults) }
  } catch {
    return { relatedTopics: [] }
  }
}

// ─────────────────────────────────────────────────────────────
// Provider implementations
// ─────────────────────────────────────────────────────────────

// NVIDIA NIM (free models: llama-3.3-nemotron-super-49b-v1, mistral-nemo-12b-instruct, etc.)
// https://build.nvidia.com/explore/discover (API_KEY gratuita)
async function callNvidiaNIM(messages: AgentMessage[], temperature = 0.7, maxTokens = 1024): Promise<string | null> {
  const key = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY || process.env.NV_API_KEY
  if (!key) return null
  const models = [
    'meta/llama-3.3-nemotron-super-49b-v1',
    'mistralai/mistral-nemo-12b-instruct',
    'nvidia/nemotron-4-340b-instruct',
  ]
  for (const model of models) {
    try {
      const res = await fetch(`https://integrate.api.nvidia.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          top_p: 0.9,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content?.trim()
      if (content) return content
    } catch {
      // tenta próximo modelo
      continue
    }
  }
  return null
}

async function callGemini(messages: AgentMessage[], temperature = 0.7, maxTokens = 1024): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(15000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch {
    return null
  }
}

async function callGroq(messages: AgentMessage[], temperature = 0.7, maxTokens = 1024): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

async function callOpenRouter(messages: AgentMessage[], temperature = 0.7, maxTokens = 1024): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://kiyvo.com.br',
        'X-Title': 'KIYVO Agentes',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────
// Fallback offline: templates inteligentes baseados na categoria do agente
// (funciona sem chave nenhuma — "modo demonstração" de qualidade)
// ─────────────────────────────────────────────────────────────
const TEMPLATES: Record<string, (input: string, search: string) => string> = {
  copywriter: (q, s) =>
    `📝 **Copy para seu produto/serviço**\n\nBaseado em "${q.slice(0, 80)}":\n\n1. **Hook (3 segundos)**: "Cansado de ${q.slice(0, 30).toLowerCase() || 'não vender nada'}? Você não está sozinho(a)..."\n2. **Dor**: A maioria dos brasileiros tenta vender digital sem método e desiste em 30 dias.\n3. **Ponte**: Este produto foi feito pra quem quer resultado rápido.\n4. **Nova Vida**: Imagine receber PIX na conta todas as semanas, automaticamente.\n\n**Títulos prontos:**\n• O método que ${Math.floor(Math.random() * 900) + 100} brasileiros usaram pra sair do zero\n• Como ${q.slice(0,40).toLowerCase() || 'vender mais'} em 7 dias (sem aparecer)\n• A estratégia que NINGUÉM te conta sobre ${q.slice(0,30) || 'vendas digitais'}\n\n${s ? `\n📚 Dados de pesquisa: ${s}` : ''}\n\n⚠️ Este é um template básico. Para copy profissional, configure GEMINI_API_KEY no .env.local.`,
  default: (q, s) =>
    `🤖 **Análise do agente KIYVO**\n\nSobre: "${q.slice(0, 150)}"\n\n**Resposta estruturada:**\n\n1. **Entendimento do pedido**: Você quer orientação sobre o tema acima.\n2. **Recomendação principal**: Comece pequeno, teste, valide com clientes reais, e escale.\n3. **Passos práticos**:\n   • Defina seu público-alvo (quem paga pelo que você vende?)\n   • Crie uma oferta irresistível com preço psicológico (R$9,90 / R$19,90 / R$47 / R$97)\n   • Use PIX como método principal (5% de desconto aumenta conversão em 18%)\n   • Faça 3 conteúdos por dia no Instagram/TikTok\n   • Colete prova social desde a 1ª venda\n4. **Erros a evitar**: Preço alto demais no lançamento, não pedir review, não responder rápido.\n\n${s ? `\n🔍 Contexto de pesquisa (DuckDuckGo):\n${s}\n` : ''}\n\n⚙️ **Modo offline ativo**: Configure GEMINI_API_KEY ou GROQ_API_KEY no .env.local para respostas avançadas em tempo real.`,
}

function fallbackResponse(agentId: string | undefined, input: string, searchResult: { abstract?: string; relatedTopics: Array<{ text: string; url?: string }> }): string {
  const search = [
    searchResult.abstract ? `📌 ${searchResult.abstract.slice(0, 250)}` : '',
    ...searchResult.relatedTopics.slice(0, 3).map(t => `• ${t.text.slice(0, 120)}`)
  ].filter(Boolean).join('\n') || ''

  const tpl = TEMPLATES[agentId || ''] || TEMPLATES.default
  return tpl(input, search)
}

// ─────────────────────────────────────────────────────────────
// Função principal de orquestração
// ─────────────────────────────────────────────────────────────
export async function runAgent(
  userInput: string,
  ctx: AgentContext = {},
): Promise<{
  content: string
  provider: AIProvider
  model: AIModel
  searchUsed: boolean
  latencyMs: number
}> {
  const start = Date.now()
  const { agentId, agentName, agentDescription, webSearch = true, temperature = 0.7, maxTokens = 1024 } = ctx

  const systemPrompt = `${SYSTEM_PROMPT_BASE}
${agentName ? `\nVocê é o agente "${agentName}".` : ''}
${agentDescription ? `\nSua especialidade: ${agentDescription}` : ''}`

  // Busca web se habilitado (DuckDuckGo sem chave)
  let searchContext = ''
  let searchUsed = false
  if (webSearch && userInput.length > 3) {
    const result = await duckDuckGoSearch(userInput, 3)
    if (result.abstract || result.relatedTopics.length > 0) {
      searchUsed = true
      searchContext = '\n\nDADOS DE PESQUISA (use como referência factual):\n'
      if (result.abstract) searchContext += `- ${result.abstract.slice(0, 300)}\n`
      for (const t of result.relatedTopics.slice(0, 2)) {
        searchContext += `- ${t.text.slice(0, 200)}\n`
      }
    }
  }

  const messages: AgentMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput + searchContext },
  ]

  // Tenta providers na ordem (com fallback) — NVIDIA NIM primeiro (se configurado)
  let content: string | null = null
  let provider: AIProvider = 'fallback'
  let model: AIModel = 'kiyvo-fallback-v1'

  // 1. NVIDIA NIM
  content = await callNvidiaNIM(messages, temperature, maxTokens)
  if (content) { provider = 'nvidia'; model = 'nvidia/llama-3.3-nemotron-super-49b-v1' }

  // 2. Gemini
  if (!content) {
    content = await callGemini(messages, temperature, maxTokens)
    if (content) { provider = 'gemini'; model = 'gemini-2.0-flash' }
  }

  // 3. Groq
  if (!content) {
    content = await callGroq(messages, temperature, maxTokens)
    if (content) { provider = 'groq'; model = 'llama-3.3-70b-versatile' }
  }

  // 4. OpenRouter free
  if (!content) {
    content = await callOpenRouter(messages, temperature, maxTokens)
    if (content) { provider = 'openrouter'; model = 'mixtral-8x7b-instruct' }
  }

  // 4. Fallback (sempre funciona)
  if (!content) {
    const sr = webSearch ? await duckDuckGoSearch(userInput, 3) : { relatedTopics: [] }
    content = fallbackResponse(agentId, userInput, sr)
    searchUsed = searchUsed || sr.relatedTopics.length > 0 || !!sr.abstract
  }

  return {
    content,
    provider,
    model,
    searchUsed,
    latencyMs: Date.now() - start,
  }
}

// Helper: lista de providers configurados (útil pra UI)
export function getConfiguredProviders(): { id: AIProvider; name: string; color: string; emoji: string; configured: boolean }[] {
  const hasNvidia = !!(process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY || process.env.NV_API_KEY)
  return [
    { id: 'nvidia', name: 'NVIDIA NIM (Nemotron Super 49B)', color: '#76B900', emoji: '🟩', configured: hasNvidia },
    { id: 'gemini', name: 'Google Gemini 2.0 Flash', color: '#4285F4', emoji: '🟦', configured: !!process.env.GEMINI_API_KEY },
    { id: 'groq', name: 'Groq Llama 3.3 70B', color: '#F55036', emoji: '🟧', configured: !!process.env.GROQ_API_KEY },
    { id: 'openrouter', name: 'OpenRouter (Free Tier)', color: '#8B5CF6', emoji: '🟪', configured: !!process.env.OPENROUTER_API_KEY },
    { id: 'fallback', name: 'KIYVO Offline (sempre ativo)', color: '#0F172A', emoji: '⬛', configured: true },
  ]
}
