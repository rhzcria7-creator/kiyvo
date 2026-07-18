// ─────────────────────────────────────────────────────────────
// FAQ Page — Server Component com data fetching
// Busca FAQs do Supabase no servidor, fallback estático
// A parte interativa (accordion + filtro) é client component
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { FAQClient } from '@/components/faq/FAQClient'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

// Fallback estático para quando o Supabase não tem FAQs
const fallbackFAQ: FAQItem[] = [
  { id: 'f1', category: 'Kiyvo', question: 'A Kiyvo é confiável?', answer: 'Com certeza. Somos o marketplace líder em produtos digitais. Intermediamos todas as transações para garantir que o comprador receba o produto e o vendedor receba o pagamento. Seu dinheiro fica em escrow até a confirmação de entrega.' },
  { id: 'f2', category: 'Kiyvo', question: 'O que posso comprar e vender?', answer: 'Tudo que é digital! Jogos, contas, keys, software, licenças, cursos online, e-books, templates, gift cards, domínios, APIs, serviços freelance e muito mais.' },
  { id: 'f3', category: 'Comprador', question: 'Como comprar um produto?', answer: 'Basta acessar o anúncio e clicar em "Comprar". Você será direcionado ao checkout seguro via Stripe, onde pode pagar com PIX, cartão ou boleto.' },
  { id: 'f4', category: 'Comprador', question: 'E se eu não receber o produto?', answer: 'O pagamento fica em Escrow — só é liberado ao vendedor após sua confirmação. Se não receber, abra uma disputa e receberá reembolso integral.' },
  { id: 'f5', category: 'Pagamento', question: 'Quais formas de pagamento são aceitas?', answer: 'PIX (instantâneo), cartão de crédito, boleto bancário e saldo Kiyvo. Todos processados com segurança via Stripe.' },
  { id: 'f6', category: 'Pagamento', question: 'O pagamento é seguro?', answer: 'Sim. A Kiyvo segura o pagamento em Escrow e só repassa ao vendedor após a confirmação de entrega. Seus dados de pagamento são processados pelo Stripe (PCI DSS Level 1).' },
  { id: 'f7', category: 'Vendedor', question: 'Como anunciar meu produto?', answer: 'Crie sua conta, complete a verificação KYC e clique em "Anunciar". Preencha as informações e faça upload do produto digital no Cofre Digital. A entrega é automática!' },
  { id: 'f8', category: 'Vendedor', question: 'Quais são as taxas?', answer: 'A taxa varia pelo plano do vendedor: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A taxa só é cobrada quando você vende — cadastro é grátis.' },
  { id: 'f9', category: 'Retiradas', question: 'Como retirar meu dinheiro?', answer: 'Após o comprador confirmar o recebimento, o valor fica disponível para saque via PIX. Retirada Normal: grátis, até 2 dias úteis. Retirada Turbo: R$ 3,50, instantânea.' },
  { id: 'f10', category: 'Recompensas', question: 'O que são KD Points?', answer: 'KD Points é nosso programa de recompensas. Cada R$1 gasto = 1 KD Point. Acumule e troque por descontos em futuras compras.' },
]

export default async function FAQPage() {
  let faqs: FAQItem[] = fallbackFAQ

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from('faq_entries')
      .select('id, category, question, answer')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) {
      faqs = data.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        category: String(item.category || 'Geral'),
        question: String(item.question || ''),
        answer: String(item.answer || ''),
      }))
    }
  } catch {
    // Usa fallback estático se Supabase não estiver disponível
  }

  return <FAQClient faqs={faqs} />
}
