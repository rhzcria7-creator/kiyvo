// CarrinhoAbandonado — Sequência de e-mail/WhatsApp para recuperar vendas perdidas
import { AgentContext, AgentResult } from './types'

export interface CarrinhoInput {
  produtoNome: string
  preco: number
  publico?: string
  linkCheckout: string
  cupomDesconto?: number
}

export async function runCarrinhoAbandonado(input: CarrinhoInput, _ctx?: AgentContext): Promise<AgentResult> {
  const { produtoNome, preco, publico = 'cliente', linkCheckout, cupomDesconto = 10 } = input
  if (!produtoNome || !linkCheckout) return { ok: false, error: 'Informe produto e link de checkout.' }
  const precoCupom = (preco * (100 - cupomDesconto)) / 100

  return {
    ok: true,
    data: {
      sequencia: [
        {
          hora: '15 minutos após abandono',
          assunto: 'Esqueceu algo? 🛒',
          texto: `Olá ${publico}! Percebi que você olhou o ${produtoNome} mas não finalizou. Ainda está lá esperando por você: ${linkCheckout}\n\nSe precisar de ajuda é só responder.`,
          canal: 'email + whatsapp',
        },
        {
          hora: '4 horas após abandono',
          assunto: `${produtoNome}: tirei uma dúvida que você talvez tenha`,
          texto: `Oi! Passando só pra te lembrar que o ${produtoNome} entrega acesso imediato após pagamento, e você tem 7 dias de garantia incondicional. Ainda vale a pena: ${linkCheckout}`,
          canal: 'email',
        },
        {
          hora: '24 horas após abandono',
          assunto: `Seu cupom de ${cupomDesconto}% expira em 2h ⏰`,
          texto: `Oi! Separei um cupom exclusivo de ${cupomDesconto}% pra você finalizar agora. De R$${preco.toFixed(2)} por R$${precoCupom.toFixed(2)}. Use VOLTA${cupomDesconto} no checkout: ${linkCheckout}\n\nVence em 2 horas.`,
          canal: 'email + whatsapp',
        },
        {
          hora: '48 horas após abandono',
          assunto: 'Última chance',
          texto: `Essa é a última mensagem. O cupom expirou e o ${produtoNome} pode sair do ar a qualquer momento. Se ainda quiser: ${linkCheckout}\n\nBoa sorte!`,
          canal: 'email',
        },
      ],
      cupomSugerido: {
        codigo: `VOLTA${cupomDesconto}`,
        descontoPercent: cupomDesconto,
        validadeHoras: 2,
      },
      statsEsperados: {
        taxaRecuperacao: '8-15%',
        receitaExtraPor100: round2(preco * 10),
        melhorCanal: 'whatsapp tem 2x mais conversão que email',
      },
    },
  }
}
function round2(n: number) { return Math.round(n * 100) / 100 }
