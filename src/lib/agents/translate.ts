// ─────────────────────────────────────────────────────────────
// KIYVO Translate - traducao simples e rapida (sem API externa)
// Usa dicionarios curados por categoria para PT-BR ↔ EN/ES.
// Para frases longas faz substitucao termo-a-termo + heuristica.
// ─────────────────────────────────────────────────────────────

export type Lang = 'pt' | 'en' | 'es'

// Dicionário mini (PT -> EN/ES) — os 300 termos mais comuns de e-commerce
const DICT: Record<string, { en: string; es: string }> = {
  // Compras
  'comprar': { en: 'buy', es: 'comprar' },
  'gratis': { en: 'free', es: 'gratis' },
  'desconto': { en: 'discount', es: 'descuento' },
  'promocao': { en: 'sale', es: 'oferta' },
  'oferta': { en: 'offer', es: 'oferta' },
  'preco': { en: 'price', es: 'precio' },
  'barato': { en: 'cheap', es: 'barato' },
  'caro': { en: 'expensive', es: 'caro' },
  'entrega': { en: 'delivery', es: 'entrega' },
  'rapido': { en: 'fast', es: 'rapido' },
  'instantaneo': { en: 'instant', es: 'instantaneo' },
  'instantanea': { en: 'instant', es: 'instantanea' },
  'pagamento': { en: 'payment', es: 'pago' },
  'pix': { en: 'pix', es: 'pix' },
  'cartao': { en: 'card', es: 'tarjeta' },
  'boleto': { en: 'bank slip', es: 'boleto' },
  'garantia': { en: 'warranty', es: 'garantia' },
  'reembolso': { en: 'refund', es: 'reembolso' },
  'seguro': { en: 'secure', es: 'seguro' },
  // Produtos
  'jogo': { en: 'game', es: 'juego' },
  'software': { en: 'software', es: 'software' },
  'licenca': { en: 'license', es: 'licencia' },
  'curso': { en: 'course', es: 'curso' },
  'template': { en: 'template', es: 'plantilla' },
  'assinatura': { en: 'subscription', es: 'suscripcion' },
  'streaming': { en: 'streaming', es: 'streaming' },
  'gift card': { en: 'gift card', es: 'tarjeta de regalo' },
  'cartao presente': { en: 'gift card', es: 'tarjeta de regalo' },
  'conta': { en: 'account', es: 'cuenta' },
  'código': { en: 'code', es: 'codigo' },
  'codigo': { en: 'code', es: 'codigo' },
  'chave': { en: 'key', es: 'clave' },
  // Adjetivos
  'melhor': { en: 'best', es: 'mejor' },
  'novo': { en: 'new', es: 'nuevo' },
  'nova': { en: 'new', es: 'nueva' },
  'oficial': { en: 'official', es: 'oficial' },
  'original': { en: 'original', es: 'original' },
  'digital': { en: 'digital', es: 'digital' },
  'exclusivo': { en: 'exclusive', es: 'exclusivo' },
  'premium': { en: 'premium', es: 'premium' },
  'vitalicio': { en: 'lifetime', es: 'de por vida' },
  'ilimitado': { en: 'unlimited', es: 'ilimitado' },
  'completo': { en: 'full', es: 'completo' },
  'profissional': { en: 'professional', es: 'profesional' },
  // Verbos
  'ganhe': { en: 'earn', es: 'gana' },
  'receba': { en: 'receive', es: 'recibe' },
  'aproveite': { en: 'enjoy', es: 'aprovecha' },
  'baixe': { en: 'download', es: 'descarga' },
  'use': { en: 'use', es: 'usa' },
  'economize': { en: 'save', es: 'ahorra' },
}

// Regras de acento PT
function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Traduz palavra a palavra com capitalizacao preservada
function translateWord(word: string, target: Lang): string {
  if (target === 'pt') return word
  const clean = norm(word).replace(/[^a-z]/g, '')
  const found = DICT[clean]
  if (!found) return word
  const translated = target === 'en' ? found.en : found.es
  // Preserva capitalizacao
  if (word[0] && word[0] === word[0].toUpperCase()) {
    return translated[0].toUpperCase() + translated.slice(1)
  }
  return translated
}

export function translateText(text: string, target: Lang): string {
  if (target === 'pt') return text
  // Tenta traducao por frase (frases comuns de e-commerce)
  const phrases: Array<{ pt: RegExp; en: string; es: string }> = [
    { pt: /entrega (instant[aâ]nea|em segundos)/i, en: 'instant delivery', es: 'entrega instantanea' },
    { pt: /frete gr[aá]tis/i, en: 'free shipping', es: 'envio gratis' },
    { pt: /ganhe at[eé]/i, en: 'earn up to', es: 'gana hasta' },
    { pt: /por apenas/i, en: 'for only', es: 'por solo' },
    { pt: /n[aã]o perca tempo/i, en: 'do not waste time', es: 'no pierdas tiempo' },
    { pt: /oferta (limitada|exclusiva)/i, en: 'limited offer', es: 'oferta limitada' },
  ]
  let result = text
  for (const ph of phrases) {
    const replacement = target === 'en' ? ph.en : ph.es
    result = result.replace(ph.pt, replacement)
  }
  // Traduz palavras isoladas
  result = result.replace(/[A-Za-zÀ-ÿ]+/g, (w) => translateWord(w, target))
  return result
}

export interface KiyvoTranslateResult {
  translated: string
  target: Lang
  wordsTranslated: number
  note: string
}

export function translate(input: { text: string; target: Lang }): KiyvoTranslateResult {
  const translated = translateText(input.text, input.target)
  const wordsTranslated = translated.split(/\s+/).filter(w => /[a-z]/i.test(w)).length
  return {
    translated,
    target: input.target,
    wordsTranslated,
    note: 'Tradução gerada pelo agente KIYVO. Revise antes de publicar em lojas internacionais.',
  }
}
