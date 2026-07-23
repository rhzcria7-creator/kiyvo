// ReviewShield Agent — Moderação automática de conteúdo
// Detecta spam, contatos externos, fraude, texto de IA genérico e conteúdo proibido.
// Substitui a antiga moderateDescriptionText por um motor completo.

export interface ModerationResult {
  aprovado: boolean
  score: number            // 0-100 (0 = seguro, 100 = spam/fraude)
  flags: Array<{
    tipo: 'contato_externo' | 'palavrao' | 'spam' | 'ia_generica' | 'preco_suspeito' | 'link_externo' | 'cpf_vazado' | 'pirated_keywords'
    severidade: 'baixa' | 'media' | 'alta'
    trecho: string
    motivo: string
  }>
  versaoLimpa?: string
  recomendacao: 'aprovar' | 'revisar' | 'rejeitar'
}

const CONTATO_REGEXES = [
  { re: /\b(\d{2}\s?)?9?\d{4}-?\d{4}\b/g, label: 'telefone' },
  { re: /whatsapp|whats\s?app|wpp|zap|telegran?|telegram|discord(\.gg)?/gi, label: 'app de mensagem' },
  { re: /pix\s*[:]?\s*[a-z0-9.@]+/gi, label: 'pix fora da plataforma' },
  { re: /(?:@)[a-z0-9_]{4,}/gi, label: '@usuário' },
]

const LINK_REGEX = /https?:\/\/[^\s<>"']+|bit\.ly\S|tinyurl\S|wa\.me\S|g\.co\S|goo\.gl\S/gi

const PALAVROES = [
  'porra', 'caralho', 'puta', 'puto', 'fdp', 'filho da puta', 'viado', 'bicha', 'buceta',
  'cuzao', 'arrombado', 'cuzão', 'babaca', 'otario', 'otário', 'imbecil', 'idiota',
]

const PIRATED_KEYWORDS = [
  'crackeado', 'crack', 'pirata', 'keygen', 'ativador', 'ativador windows', 'dll crack',
  'patched', 'nulled', ' warez ', ' torrent de', 'baixar gratis', 'download gratis de',
  'full crack', 'ativador office', 'kmspico',
]

const IA_PHRASES = [
  'no mundo atual', 'nos dias de hoje', 'é importante ressaltar',
  'em um mundo cada vez mais', 'é fundamental que', 'a revolução',
  'mergulhe de cabeça', 'desbrave', 'desbloqueie seu potencial',
  'eleve seu nível', 'transforme sua vida', 'chegou a hora de',
  'garanta já o seu', 'não perca tempo', 'a oportunidade de uma vida',
  'prepare-se para', 'é com grande satisfação', 'é indiscutível que',
  'contudo', 'entretanto', 'por conseguinte', 'em virtude dos fatos',
  'demais fatores', 'conforme mencionado anteriormente',
]

function escorePalavras(texto: string, palavras: string[]): { hits: number; trechos: string[] } {
  const low = texto.toLowerCase()
  const trechos: string[] = []
  let hits = 0
  for (const p of palavras) {
    if (low.includes(p)) {
      hits++
      // Extrai trecho com contexto
      const idx = low.indexOf(p)
      trechos.push(texto.slice(Math.max(0, idx - 20), Math.min(texto.length, idx + p.length + 20)))
    }
  }
  return { hits, trechos }
}

export function moderarConteudo(texto: string): ModerationResult {
  const flags: ModerationResult['flags'] = []
  let score = 0
  let versaoLimpa = texto

  // 1. Contatos externos (TENTATIVA DE FUGA DA PLATAFORMA)
  for (const { re, label } of CONTATO_REGEXES) {
    const m = texto.match(re)
    if (m) {
      for (const hit of m) {
        flags.push({
          tipo: 'contato_externo',
          severidade: 'alta',
          trecho: hit,
          motivo: `Contato externo detectado (${label}) — proibido em descrições.`,
        })
        score += 25
        versaoLimpa = versaoLimpa.replace(hit, '[removido]')
      }
    }
  }

  // 2. Links externos
  const links = texto.match(LINK_REGEX)
  if (links) {
    for (const hit of links) {
      // Permite links de redes sociais conhecidas em perfis? Bloqueia por padrão.
      if (/kiyvo\.com\.br/.test(hit)) continue
      flags.push({
        tipo: 'link_externo',
        severidade: 'media',
        trecho: hit,
        motivo: 'Link externo detectado — direciona usuário para fora da KIYVO.',
      })
      score += 15
      versaoLimpa = versaoLimpa.replace(hit, '[link removido]')
    }
  }

  // 3. CPF vazado
  const cpfs = texto.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g)
  if (cpfs) {
    for (const hit of cpfs) {
      flags.push({
        tipo: 'cpf_vazado',
        severidade: 'alta',
        trecho: hit,
        motivo: 'CPF detectado — remova por questões de LGPD.',
      })
      score += 40
      versaoLimpa = versaoLimpa.replace(hit, '[dado pessoal removido]')
    }
  }

  // 4. Palavrões
  const prof = escorePalavras(texto, PALAVROES)
  if (prof.hits > 0) {
    for (const t of prof.trechos.slice(0, 3)) {
      flags.push({
        tipo: 'palavrao',
        severidade: 'baixa',
        trecho: t,
        motivo: 'Linguagem imprópria.',
      })
      score += 5
    }
  }

  // 5. Palavras de pirataria
  const pir = escorePalavras(texto, PIRATED_KEYWORDS)
  if (pir.hits > 0) {
    for (const t of pir.trechos) {
      flags.push({
        tipo: 'pirated_keywords',
        severidade: 'alta',
        trecho: t,
        motivo: 'Termos associados a pirataria/crack — risco de banimento da Stripe.',
      })
      score += 35
    }
  }

  // 6. Texto genérico de IA (muitas frases clichê)
  const ia = escorePalavras(texto, IA_PHRASES)
  if (ia.hits >= 3) {
    flags.push({
      tipo: 'ia_generica',
      severidade: 'baixa',
      trecho: ia.trechos.slice(0, 2).join(' | '),
      motivo: 'Muitas frases genéricas de IA — reescreva com voz autêntica para converter mais.',
    })
    score += 8
  }

  // 7. Spam (CAIXA ALTA, repetição)
  const caixaAlta = (texto.match(/[A-Z0-9\s!]{15,}/g) || []).filter((s) => /[A-Z]{5,}/.test(s)).length
  // Contagem grosseira de emojis (caracteres fora do BMP comum)
  let emojiCount = 0
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i)
    if (code === 0xd83d || code === 0xd83e) emojiCount++
  }
  if (caixaAlta > 3 || emojiCount > 15) {
    flags.push({
      tipo: 'spam',
      severidade: 'baixa',
      trecho: texto.slice(0, 50),
      motivo: 'Muito texto em CAIXA ALTA ou emojis excessivos — reduz conversão.',
    })
    score += 10
  }

  // 8. Preço suspeito mencionado como mais barato que a plataforma
  if (/fora da (plataforma|kiyvo)/i.test(texto) || /mais barato (no|pelo) (whatsapp|privado|zap)/i.test(texto)) {
    flags.push({
      tipo: 'preco_suspeito',
      severidade: 'alta',
      trecho: texto.slice(0, 100),
      motivo: 'Sugere negociação fora da plataforma — golpe/fraude.',
    })
    score += 45
  }

  score = Math.min(100, Math.round(score))

  let recomendacao: ModerationResult['recomendacao'] = 'aprovar'
  let aprovado = true
  if (score >= 60) {
    recomendacao = 'rejeitar'
    aprovado = false
  } else if (score >= 25) {
    recomendacao = 'revisar'
    aprovado = false
  }

  return { aprovado, score, flags, versaoLimpa: versaoLimpa !== texto ? versaoLimpa : undefined, recomendacao }
}
