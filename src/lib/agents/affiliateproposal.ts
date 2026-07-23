// Agente AffiliateProposal — gera proposta de parceria com afiliados
export interface AffInput { produto: string; preco?: number; comissao?: number; afiliado?: string }
export interface AffResult { mensagemDM: string; propostaCompleta: string; emailConvite: string; lps: string[]; comissaoSugerida: number }

export function gerarPropostaAfiliado(input: AffInput): AffResult {
  const { produto, preco = 97, comissao = Math.round(preco * 0.4), afiliado = 'Criador' } = input
  const dm = `Oi ${afiliado}! Tudo bem? Sou da KIYVO e vejo seu trabalho em ${produto.split(' ')[0]}. Temos um produto "${produto}" de R$ ${preco} com comissão de R$ ${comissao} por venda e conversão acima de 2%. Quer ser nosso parceiro?`
  const propostaCompleta = `Proposta de parceria com afiliado:\n• Produto: ${produto}\n• Preço: R$ ${preco}\n• Comissão por venda: R$ ${comissao} (${Math.round((comissao/preco)*100)}%)\n• Cookie: 30 dias\n• Suporte prioritário\n• Material de divulgação (creatives prontos)\n• Bônus de R$ 500 após 20 vendas.\n\nSe topar, clica em /afiliados.`
  const email = `Assunto: Parceria KIYVO × ${afiliado}\n\nOlá ${afiliado},\n\nAdmiramos seu trabalho e temos uma oportunidade de parceria: ${produto} (comissão ${Math.round((comissao/preco)*100)}% por venda, cookie 30 dias, material pronto).\n\nQuer participar? É só responder este email.\n\nAbs, Equipe KIYVO.`
  return {
    mensagemDM: dm, propostaCompleta, emailConvite: email,
    lps: ['https://kiyvo.com.br/afiliados', 'https://kiyvo.com.br/termos-afiliado'],
    comissaoSugerida: Math.round((comissao/preco)*100),
  }
}
