// ─────────────────────────────────────────────────────────────
// Review Q&A Engine v0.0.1 — Perguntas e respostas por produto
// Compradores verificados podem responder, reputação do vendedor
// ─────────────────────────────────────────────────────────────

export type QAStatus = 'pending' | 'answered' | 'closed' | 'flagged'
export interface QAQuestion { id: string; productId: string; userId: string; userName: string; question: string; status: QAStatus; answer: QAAnswer | null; upvotes: number; createdAt: string }
export interface QAAnswer { id: string; questionId: string; userId: string; userName: string; userRole: 'buyer' | 'seller' | 'admin'; answer: string; isVerifiedPurchase: boolean; helpful: number; createdAt: string }

export class ReviewQAEngine {
  createQuestion(params: { productId: string; userId: string; userName: string; question: string }): QAQuestion {
    return { id: `qa_${Date.now()}`, ...params, status: 'pending', answer: null, upvotes: 0, createdAt: new Date().toISOString() }
  }
  answerQuestion(question: QAQuestion, params: { userId: string; userName: string; userRole: QAAnswer['userRole']; answer: string; isVerifiedPurchase: boolean }): QAQuestion {
    const answer: QAAnswer = { id: `ans_${Date.now()}`, questionId: question.id, ...params, helpful: 0, createdAt: new Date().toISOString() }
    return { ...question, answer, status: 'answered' }
  }
  upvoteAnswer(answer: QAAnswer): QAAnswer { return { ...answer, helpful: answer.helpful + 1 } }
  searchQuestions(questions: QAQuestion[], query: string): QAQuestion[] {
    const q = query.toLowerCase()
    return questions.filter(x => x.question.toLowerCase().includes(q) || x.answer?.answer.toLowerCase().includes(q))
  }
}
export const reviewQAEngine = new ReviewQAEngine()
