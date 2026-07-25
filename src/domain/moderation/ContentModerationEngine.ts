// ─────────────────────────────────────────────────────────────
// Content Moderation Engine v0.0.1 — Moderação de conteúdo
// Produtos, reviews, Q&A, blog posts - auto + manual
// ─────────────────────────────────────────────────────────────

export type ModerationAction = 'approve' | 'reject' | 'flag' | 'escalate'
export type ContentType = 'product' | 'review' | 'qa' | 'blog' | 'comment' | 'profile'
export type ModerationRule = 'nsfw' | 'spam' | 'hate_speech' | 'promotional' | 'fake_review' | 'copyright' | 'malware'

export interface ModerationResult { flagged: boolean; rules: ModerationRule[]; score: number; action: ModerationAction; reason?: string }

export class ContentModerationEngine {
  private readonly SPAM_PATTERNS = [/https?:\/\/[^\s]{20,}/gi, /(ganhe|promoção|grátis|sorteio|clique aqui|compre agora){3,}/gi, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}){3,}/gi]
  private readonly NSFW_TERMS = [/sexo/i, /porn/i, /xxx/i, /nude/i, /18\+/i, /maiores/i, /conteúdo adulto/i, /onlyfans/i, /privacy/i]

  scanProduct(name: string, description: string): ModerationResult {
    const triggered: ModerationRule[] = []
    let score = 0

    const combined = `${name} ${description}`
    if (this.NSFW_TERMS.some(t => t.test(combined))) { triggered.push('nsfw'); score += 50 }
    if (this.isSpam(combined)) { triggered.push('spam'); score += 30 }
    if (triggered.length === 0) return { flagged: false, rules: [], score: 0, action: 'approve' }
    if (score >= 50) return { flagged: true, rules: triggered, score, action: 'reject', reason: `Conteúdo viola regras: ${triggered.join(', ')}` }
    return { flagged: true, rules: triggered, score, action: 'flag', reason: 'Revisão necessária' }
  }

  scanReview(text: string, rating: number): ModerationResult {
    const triggered: ModerationRule[] = []
    let score = 0

    if (text.length < 10 && rating === 5) { triggered.push('fake_review'); score += 40 }
    if (this.isSpam(text)) { triggered.push('spam'); score += 25 }
    if (this.NSFW_TERMS.some(t => t.test(text))) { triggered.push('nsfw'); score += 40 }

    if (score >= 40) return { flagged: true, rules: triggered, score, action: 'flag', reason: 'Review suspeita' }
    return { flagged: false, rules: [], score: 0, action: 'approve' }
  }

  private isSpam(text: string): boolean {
    return this.SPAM_PATTERNS.some(p => (text.match(p) || []).length >= 2)
  }
}
export const contentModerationEngine = new ContentModerationEngine()
