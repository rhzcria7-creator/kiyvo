// UpsellMax — Cria ofertas de upsell/cross-sell irresistíveis para aumentar ticket médio
import { AgentContext, AgentResult } from './types'

export interface UpsellMaxInput {
  produtoNome: string
  preco: number
  nicho: string
  publico?: string
  precoUpsell?: number
}

export async function runUpsellMax(input: UpsellMaxInput, _ctx?: AgentContext): Promise<AgentResult> {
  const { produtoNome, preco, nicho, publico = 'público geral', precoUpsell } = input
  if (!produtoNome || !preco) return { ok: false, error: 'Informe nome e preço do produto.' }
  const precoUp = precoUpsell || Math.round(preco * 1.97)
  const precoDownsell = Math.round(preco * 0.57)
  const precoBump = Math.round(preco * 0.27)

  return {
    ok: true,
    data: {
      produto: produtoNome,
      precoBase: preco,
      estrategia: 'Funil OTO + Downsell + Bump',
      upsells: [
        {
          tipo: 'Order Bump (checkbox)',
          nome: `${produtoNome} — Versão PRO com templates/editáveis`,
          preco: precoBump,
          desconto: 'sem desconto',
          script: `✅ QUERO LEVAR TAMBÉM: Versão PRO do ${produtoNome} com +30 templates prontos por apenas R$${precoBump} à vista. (Economia de R$${Math.round(precoBump * 1.2)})`,
        },
        {
          tipo: 'One-Time Offer (Upsell 1)',
          nome: `Pacote COMPLETO ${produtoNome} + Mentoria 1:1`,
          preco: precoUp,
          script: `OFERTA ÚNICA: Leve agora o pacote premium completo de ${produtoNome} + 1 sessão de mentoria 1:1 individual de 30 minutos. De R$${Math.round(precoUp * 1.8)} por apenas R$${precoUp} — só agora, nessa página.`,
          scriptNao: 'Não, prefiro recusar e perder essa oferta exclusiva.',
        },
        {
          tipo: 'Downsell (se recusar upsell)',
          nome: `${produtoNome} Avançado — sem mentoria`,
          preco: precoDownsell,
          script: `Sem problema! Se a mentoria 1:1 não é o que você precisa agora, que tal levar a versão avançada do ${produtoNome} (sem mentoria) por R$${precoDownsell}? Ainda economiza R$${Math.round(preco * 0.4)}.`,
        },
      ],
      crossSells: [
        `${produtoNome} + Suporte Estendido 30 dias`,
        `${produtoNome} + Pacote de atualizações vitalícias`,
        `${produtoNome} + Grupo VIP exclusivo`,
      ],
      titulosCheckout: [
        'Espera! Tem uma oferta especial só para você agora...',
        'Parabéns pela compra! Antes de continuar...',
        'Você acabou de tomar uma ótima decisão! Veja isso:',
      ],
      dicas: [
        'Mostre o upsell DEPOIS do pagamento, não antes — conversão 3x maior.',
        'Use contador regressivo de 10 minutos no upsell (urgência real).',
        'Nunca repita a mesma oferta se o cliente recusar 2x.',
        'O bump ideal é 20-30% do preço principal.',
        `Nichos: ${nicho} — ajuste o tom para ${publico}.`,
      ],
      ganhoEstimadoPor100: round2(precoBump * 0.25 + precoUp * 0.08 + precoDownsell * 0.12),
    },
  }
}
function round2(n: number) { return Math.round(n * 100) / 100 }
