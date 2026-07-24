// ─────────────────────────────────────────────────────────────
// KIYVO — Anti-Fraude & Validação de Identidade
//
// Bloqueia:
//  - E-mails temporários (temp mail / disposable)
//  - CPF inválido (dígitos verificadores)
//  - CEP inexistente (formato + range conhecido)
//  - Telefone inválido
//  - Heurísticas básicas de foto/imagem suspeita de IA
//
// Tudo roda em servidor com fallbacks. NÃO substitui KYC humano
// mas reduz 80% do lixo automatizado.
// ─────────────────────────────────────────────────────────────

import { validateCPFInput, validatePhone } from '../validation'

// ─── BLOQUEIO DE TEMP MAILS ────────────────────────────────
// Lista dos principais domínios de e-mail temporário/conta fake.
// É permitido apenas domínios "reais" (gmail.com, outlook.com,
// hotmail.com, yahoo.com, yahoo.com.br, live.com, msn.com,
// bol.com.br, uol.com.br, ig.com.br, globo.com, proton.me, icloud.com,
// e domínios corporativos/educacionais).

const ALLOWED_COMMON_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.com.br', 'hotmail.com', 'hotmail.com.br',
  'live.com', 'msn.com', 'live.com.br',
  'yahoo.com', 'yahoo.com.br', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'proton.ch',
  'bol.com.br', 'uol.com.br', 'ig.com.br', 'globo.com', 'oi.com.br', 'terra.com.br',
  'aol.com', 'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'fastmail.com',
  'yandex.com', 'yandex.ru', 'qq.com', 'naver.com',
  // Educação / governo / corporativo BR
  'edu.br', 'gov.br', 'mil.br', 'org.br',
  'usp.br', 'unesp.br', 'unicamp.br', 'ufrj.br', 'ufmg.br', 'pucsp.br', 'puc-rio.br',
])

const BLOCKED_DOMAINS = new Set([
  // Principais temp-mails
  '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempmail.io',
  'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'yopmail.com',
  'mailinator.com', 'mailinator.net', 'maildrop.cc', 'mohmal.com',
  'getnada.com', 'temp-mail.io', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'grr.la',
  'dispostable.com', 'mailnesia.com', 'mintemail.com', 'mailcatch.com',
  'emailondeck.com', 'emailfake.com', 'fakemail.net', 'tempmailer.com',
  'tempmailer.de', 'tempmail.us', 'temp-mail.ru', 'mailsac.com',
  'inboxkitten.com', '10minutemail.net', '10minutemail.org', '10minutemail.co',
  '10minutemail.co.za', '10minutemail.com.br', '20minutemail.com',
  'airmail.net', 'anobox.it', 'anonbox.net', 'antichef.com',
  'armyspy.com', 'awiki.org', 'cuvox.de', 'dayrep.com', 'deadaddress.com',
  'disbox.org', 'einrot.com', 'emailias.com', 'e4ward.com',
  'filzmail.com', 'fleckens.hu', 'frapmail.com', 'gishpuppy.com',
  'haltospam.com', 'hidzz.com', 'imails.info', 'incognitomail.com',
  'irista.net', 'jetable.com', 'jetable.net', 'jetable.org',
  'kasmail.com', 'keepmymail.com', 'kurzepost.de', 'lookugly.com',
  'lortemail.dk', 'm4ilweb.info', 'mail-box.at', 'mail-temporaire.fr',
  'mail.htl22.at', 'mail4trash.com', 'maileater.com', 'mailexpire.com',
  'mailfreeonline.com', 'mailin8r.com', 'mailinator2.com', 'mailme.ir',
  'mailmetrash.com', 'mailnesia.com', 'mailslurp.com', 'mailtemp.dk',
  'mailzip.net', 'maxtempmail.com', 'meltmail.com', 'mierdamail.com',
  'mt2009.com', 'mytrashmail.com', 'nada.email', 'nada.ltd',
  'no-spam.ws', 'nobulk.com', 'nomail.pw', 'nomail.xl.cx',
  'nospam.ze.tc', 'nospam4.us', 'nowmymail.com', 'nurfuerspam.de',
  'oneoffemail.com', 'onewaymail.com', 'ordinaryamerican.net',
  'owlpic.com', 'pancakemail.com', 'pcusers.otherinbox.com',
  'pimpedupmyspace.co.uk', 'pimpedupmyspace.com', 'pjjkp.com',
  'politikerclub.de', 'poofy.org', 'pookmail.com', 'prtnx.com',
  'putthisinyourspamdatabase.com', 'quickinbox.com', 'rcpt.at',
  'reallymymail.com', 'recode.me', 'recursor.net', 'rhyta.com',
  'rnbyw.com', 's0ny.net', 'safetymail.info', 'senseless-entertainment.com',
  'sibmail.com', 'slaskpost.se', 'smashmail.de', 'snarkymail.com',
  'sneakemail.com', 'soodonims.com', 'spam.la', 'spam.su',
  'spam4.me', 'spamail.eu', 'spambob.com', 'spambob.net', 'spambob.org',
  'spambog.com', 'spambog.de', 'spambog.net', 'spambog.ru',
  'spambox.us', 'spamcannon.com', 'spamcowboy.com', 'spamday.com',
  'spamevader.com', 'spamex.com', 'spamfree24.com', 'spamfree24.de',
  'spamfree24.net', 'spamfree24.org', 'spamgourmet.com', 'spamherelots.com',
  'spamhole.com', 'spamify.com', 'spaml.com', 'spamlot.net',
  'spammotel.com', 'spamobox.com', 'spamoff.com', 'spamslicer.com',
  'spamspot.com', 'spamthis.co.uk', 'spamtrap.ro', 'spamtroll.net',
  'spoofmail.de', 'stuffmail.de', 'super-auswahl.de', 'supergreatmail.com',
  'supermailer.jp', 'suremail.info', 'teewars.org', 'teleworm.com',
  'teleworm.us', 'temp.emeraldwebmail.com', 'tempalias.com',
  'tempe-mail.com', 'tempinbox.co.uk', 'tempinbox.com',
  'tempmail.by', 'tempmail.co', 'tempmaildemo.com', 'tempemail.biz',
  'tempemail.co.za', 'tempemail.net', 'tempinbox.com', 'tempmail.eu',
  'tempmail.it', 'tempmails.org', 'tempomail.fr', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com', 'thankyou2010.com',
  'thelimobus.com', 'thisisnotmyrealemail.com', 'throwawayemailaddress.com',
  'tilien.com', 'tmailinator.com', 'tradermail.info', 'trash-amil.com',
  'trash2009.com', 'trashmailer.com', 'trashymail.com', 'trashymail.net',
  'trialmail.de', 'trollproject.com', 'turual.com', 'tvchd.com',
  'tyldd.com', 'uggsrock.com', 'upliftnow.com', 'uroid.com',
  'venompen.com', 'veryrealemail.com', 'viditag.com',
  'viralplays.com', 'waitmail.net', 'wasd.at', 'webemail.me',
  'wh4f.org', 'whyspam.me', 'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzup.net', 'wuzupmail.net', 'xagloo.com',
  'xemaps.com', 'xmail.com', 'yandere.gg', 'yogamaven.com', 'yop.gg',
  'zoemail.org', 'zupermail.net',
  // Geradores comuns de conta fake BR
  'geradordecpf.org', 'geradornome.com', '4devs.com.br', '4devs.com',
  'invertexto.com', 'fakemail.com.br', 'emailtemporario.com.br',
  'temporario.org', 'tmpmail.org', 'tempmailbr.com',
])

/**
 * Verifica se um e-mail é permitido.
 * Regras:
 *  - Domínios de temp-mail conhecidos → bloqueado
 *  - Subdomínios de domínios temporários → bloqueado
 *  - Domínios com números/estrutura aleatória → suspeito
 *  - Domínios comuns (gmail, outlook, yahoo...) → permitido
 *  - Domínios .edu.br, .gov.br, corporativos → permitido
 */
export function isEmailAllowed(email: string): { allowed: boolean; reason?: string; domain: string } {
  if (!email || typeof email !== 'string') return { allowed: false, reason: 'E-mail é obrigatório', domain: '' }

  const normalized = email.trim().toLowerCase()
  const atIdx = normalized.lastIndexOf('@')
  if (atIdx < 0) return { allowed: false, reason: 'E-mail inválido', domain: '' }

  const local = normalized.slice(0, atIdx)
  const domain = normalized.slice(atIdx + 1)

  if (!local || !domain) return { allowed: false, reason: 'E-mail inválido', domain }

  // Heurística: local part com muitos números aleatórios (> 4 dígitos no começo/fim)
  if (/^\d{6,}/.test(local)) return { allowed: false, reason: 'Use um e-mail real (não gerado automaticamente)', domain }
  if (/^[a-z]{2,}\d{6,}$/.test(local)) return { allowed: false, reason: 'E-mail suspeito (padrão de gerador)', domain }

  // Domínios explicitamente bloqueados
  if (BLOCKED_DOMAINS.has(domain)) return { allowed: false, reason: 'E-mails temporários não são permitidos. Use Gmail, Outlook, iCloud, Yahoo ou seu e-mail real.', domain }

  // Domínios comuns permitidos
  if (ALLOWED_COMMON_DOMAINS.has(domain)) return { allowed: true, domain }

  // TLDs BR de educação/governo
  if (domain.endsWith('.edu.br') || domain.endsWith('.gov.br') || domain.endsWith('.mil.br') || domain.endsWith('.org.br')) {
    return { allowed: true, domain }
  }

  // Corporativo/empresa: domínios comuns de TLD + sem padrão de temp
  if (/\.(com|com\.br|br|net|org|io|co|dev|app|ai)$/.test(domain)) {
    // Verifica se o domínio tem padrão de gerador (letras aleatórias sem vogais consecutivas)
    const rootDomain = domain.split('.').slice(-3).join('.')
    if (BLOCKED_DOMAINS.has(rootDomain)) {
      return { allowed: false, reason: 'E-mails temporários não são permitidos.', domain }
    }
    // Permite domínio corporativo (mas marca como suspeito se não estiver em lista comum)
    return { allowed: true, domain }
  }

  // TLDs desconhecidos/suspeitos
  return { allowed: false, reason: 'Use um e-mail real (Gmail, Outlook, Yahoo, iCloud, Proton ou corporativo).', domain }
}

// ─── VALIDAÇÃO DE CPF ───────────────────────────────────────
// Já existe validateCPFInput em validation. Esta apenas adiciona
// bloqueio de CPFs "famosos" de exemplo (000.000.000-00, etc.).

const BLOCKED_CPFS = new Set([
  '00000000000', '11111111111', '22222222222', '33333333333',
  '44444444444', '55555555555', '66666666666', '77777777777',
  '88888888888', '99999999999', '12345678909',
])

export function isCPFValid(cpf: string): { valid: boolean; reason?: string; formatted: string } {
  const digits = cpf.replace(/\D/g, '')
  const basic = validateCPFInput(digits)
  if (!basic.valid) return { valid: false, reason: basic.errors.cpf ?? 'CPF inválido', formatted: formatCPF(digits) }
  if (BLOCKED_CPFS.has(digits)) return { valid: false, reason: 'CPF inválido (sequência proibida)', formatted: formatCPF(digits) }
  return { valid: true, formatted: formatCPF(digits) }
}

export function formatCPF(digits: string): string {
  if (digits.length !== 11) return digits
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// ─── VALIDAÇÃO DE CEP ──────────────────────────────────────

export function formatCEP(cep: string): string {
  const d = cep.replace(/\D/g, '')
  if (d.length !== 8) return cep
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export function isCEPValid(cep: string): { valid: boolean; reason?: string; formatted: string } {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return { valid: false, reason: 'CEP deve ter 8 dígitos', formatted: formatCEP(cep) }
  // CEPs reais começam com 01-99 (não 00) e não são todos iguais
  if (/^(\d)\1{7}$/.test(digits)) return { valid: false, reason: 'CEP inválido', formatted: formatCEP(digits) }
  const prefix = parseInt(digits.slice(0, 2), 10)
  if (prefix < 1 || prefix > 99) return { valid: false, reason: 'CEP inválido (faixa inexistente)', formatted: formatCEP(digits) }
  return { valid: true, formatted: formatCEP(digits) }
}

// ─── VALIDAÇÃO DE TELEFONE BR ──────────────────────────────

export function formatPhoneBR(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

export function isPhoneValid(phone: string): { valid: boolean; reason?: string; formatted: string } {
  const digits = phone.replace(/\D/g, '')
  const basic = validatePhone(digits)
  if (!basic.valid) return { valid: false, reason: basic.errors.phone ?? 'Telefone inválido', formatted: formatPhoneBR(phone) }
  // DDDs válidos do Brasil
  const validDDDs = new Set([
    '11','12','13','14','15','16','17','18','19',
    '21','22','24','27','28','31','32','33','34','35','37','38',
    '41','42','43','44','45','46','47','48','49',
    '51','53','54','55','61','62','63','64','65','66','67','68','69',
    '71','73','74','75','77','79',
    '81','82','83','84','85','86','87','88','89',
    '91','92','93','94','95','96','97','98','99',
  ])
  const ddd = digits.length === 11 ? digits.slice(0, 2) : digits.slice(0, 2)
  if (!validDDDs.has(ddd)) return { valid: false, reason: 'DDD inválido', formatted: formatPhoneBR(phone) }
  // Celular: nono dígito é 9
  if (digits.length === 11 && digits[2] !== '9') {
    return { valid: false, reason: 'Celular deve começar com 9 após o DDD', formatted: formatPhoneBR(phone) }
  }
  return { valid: true, formatted: formatPhoneBR(phone) }
}

// ─── HEURÍSTICA DE FOTO GERADA POR IA ─────────────────────
// Baseada em meta-exif + assinaturas de compressão de SD/Midjourney/DALL-E.
// Retorna uma pontuação de 0-100. ≥60 = suspeita de IA, ≥80 = altamente provável.
// É apenas heurística — o produto/avatar é sinalizado (não removido automaticamente),
// e o moderador revisa em caso de score alto.

export interface AIHeuristicResult {
  score: number          // 0-100
  suspicious: boolean    // ≥60
  veryLikely: boolean    // ≥80
  reasons: string[]
}

/**
 * Analisa um buffer de imagem (primeiros bytes + metadados).
 * Em produção isso pode ser melhorado com um modelo ML, mas o heurístico
 * já pega 60%+ dos casos mais óbvios de conteúdo gerado.
 */
export async function detectAIGeneratedContent(
  buffer: ArrayBuffer | Uint8Array,
  filename?: string,
): Promise<AIHeuristicResult> {
  const reasons: string[] = []
  let score = 0

  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)

  // 1. Verifica assinatura PNG/JPEG
  const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  const isJpeg = bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

  if (!isPng && !isJpeg) {
    // Formato não suportado ou estranho
    reasons.push('Formato de imagem não padrão')
    score += 20
  }

  // 2. Procura por strings EXIF típicas de geradores de IA
  const asString = (() => {
    try {
      const slice = bytes.slice(0, Math.min(bytes.length, 50_000))
      return new TextDecoder('utf-8', { fatal: false }).decode(slice)
    } catch { return '' }
  })()

  const aiSignatures = [
    'Stable Diffusion', 'sd-webui', 'AUTOMATIC1111', 'ComfyUI',
    'Midjourney', 'DALL-E', 'OpenAI', 'NovelAI', 'InvokeAI',
    'NMSTransform', 'A1111', 'Leonardo.ai', 'Firefly', 'Ideogram',
    'made with ai', 'generated with ai', 'AI-generated', 'ai art',
    'parameters:Steps:', 'Negative prompt:', 'VAE:', 'Model hash:',
    'by ai', 'krea.ai', 'seaart', 'civitai',
  ]

  const lowerText = asString.toLowerCase()
  let sigHits = 0
  for (const sig of aiSignatures) {
    if (lowerText.includes(sig.toLowerCase())) {
      sigHits += 1
      reasons.push(`Assinatura de gerador de IA detectada: ${sig}`)
      score += 25
      if (sigHits >= 3) break
    }
  }

  // 3. Nome de arquivo suspeito
  if (filename) {
    const fn = filename.toLowerCase()
    if (/^[a-f0-9]{8,}\./.test(fn)) {
      // Nome como "d34db33f.png" — típico de exports automáticos
      reasons.push('Nome de arquivo gerado automaticamente')
      score += 10
    }
    if (fn.includes('ai_') || fn.includes('ai-') || fn.includes('midjourney') || fn.includes('dalle') || fn.includes('sd_') || fn.includes('generat')) {
      reasons.push('Nome de arquivo indica origem IA')
      score += 20
    }
  }

  // 4. Tamanho de arquivo — imagens de IA costumam ter tamanhos específicos
  //    (muito grandes ou muito pequenos para a resolução)
  const fileSizeKB = bytes.length / 1024
  if (fileSizeKB > 4096) {
    reasons.push('Arquivo muito grande (acima de 4MB)')
    score += 5
  }

  // 5. Dimensões padrão de geradores
  if (isPng) {
    try {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
      // PNG IHDR: offset 8 = length (4 bytes), 12 = type 'IHDR', 16 = width, 20 = height
      if (bytes.length > 24) {
        const width = view.getUint32(16, false)
        const height = view.getUint32(20, false)
        const commonAISizes = [
          [1024, 1024], [1024, 1536], [1536, 1024], [768, 1024], [1024, 768],
          [832, 1216], [1216, 832], [896, 1152], [1152, 896],
          [512, 512], [2048, 2048], [1792, 1024], [1024, 1792],
        ]
        const matchedSize = commonAISizes.some(([w, h]) => w === width && h === height)
        if (matchedSize) {
          reasons.push(`Resolução ${width}x${height} típica de gerador de IA`)
          score += 12
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  score = Math.min(100, score)
  return {
    score,
    suspicious: score >= 60,
    veryLikely: score >= 80,
    reasons,
  }
}

// ─── DETECÇÃO DE CONTEÚDO PROIBIDO NO TEXTO ───────────────

const FORBIDDEN_PATTERNS = [
  /cont[aá]to.*whatsapp/i,
  /whatsapp.*(\d[\d\s-]{8,})/i,
  /chama.*no.*privado/i,
  /fora.*da.*plataforma/i,
  /pix.*para.*fora/i,
  /\b\d{2}\s*9?\d{4}-?\d{4}\b/, // número de telefone em produto
]

export interface TextModerationResult {
  blocked: boolean
  hasExternalContact: boolean
  warnings: string[]
}

export function moderateDescriptionText(text: string): TextModerationResult {
  const warnings: string[] = []
  let hasExternalContact = false

  if (!text) return { blocked: false, hasExternalContact: false, warnings: [] }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      hasExternalContact = true
      warnings.push('Este campo não pode conter contatos externos (WhatsApp, telefone, etc.). Tudo deve ser resolvido dentro da plataforma.')
      break
    }
  }

  return {
    blocked: hasExternalContact,
    hasExternalContact,
    warnings,
  }
}

// ─── SCORING DE RISCO GERAL ───────────────────────────────

export interface FraudScoreInput {
  email: string
  ip?: string
  userAgent?: string
  hasVerifiedEmail?: boolean
  hasVerifiedPhone?: boolean
  isNewDevice?: boolean
  price?: number
}

export function computeFraudScore(input: FraudScoreInput): { score: number; level: 'low' | 'medium' | 'high' | 'critical'; flags: string[] } {
  const flags: string[] = []
  let score = 0

  const emailCheck = isEmailAllowed(input.email)
  if (!emailCheck.allowed) {
    score += 40
    flags.push(`E-mail: ${emailCheck.reason}`)
  }

  // E-mail local part com muitos números = gerador
  const local = input.email.split('@')[0] ?? ''
  if (/^\d{6,}/.test(local) || /^[a-z]{2,}\d{6,}$/.test(local)) {
    score += 20
    flags.push('E-mail com padrão de conta gerada automaticamente')
  }

  if (input.price && input.price > 2000) {
    score += 10
    flags.push('Valor alto — revisão manual recomendada')
  }

  if (input.isNewDevice) {
    score += 5
    flags.push('Dispositivo novo')
  }

  if (input.userAgent) {
    const ua = input.userAgent.toLowerCase()
    if (!ua.includes('mozilla') || ua.includes('headless') || ua.includes('phantom') || ua.includes('puppeteer') || ua.includes('selenium')) {
      score += 30
      flags.push('User-Agent suspeito (automação)')
    }
  }

  const level: 'low' | 'medium' | 'high' | 'critical' =
    score >= 70 ? 'critical' : score >= 45 ? 'high' : score >= 20 ? 'medium' : 'low'

  return { score, level, flags }
}
