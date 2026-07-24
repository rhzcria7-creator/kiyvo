// Agente FAQAuto — gera FAQ automaticamente com base em objeções e nicho
export interface AutoFAQInput { nicho: string; produto?: string; preco?: number; objeçõesExtra?: string[] }
export interface AutoFAQPergunta { pergunta: string; resposta: string }
export interface AutoFAQResult { faq: AutoFAQPergunta[]; objeçõesComuns: string[] }

const OBJECAO_PADRAO = ['Isso funciona mesmo?','Tem garantia?','Para quem é?','E se eu não tiver experiência?','Como recebo?','Tem suporte?','Posso cancelar?','Funciona no celular?']
export function gerarAutoFAQ(input: AutoFAQInput): AutoFAQResult {
  const { nicho, produto = 'o produto', preco = 97, objeçõesExtra = [] } = input
  const faq: AutoFAQPergunta[] = [
    { pergunta: 'O que é exatamente?', resposta: `${produto} é um material 100% digital focado em ${nicho} com passo a passo validado. Você recebe acesso imediato após a compra.` },
    { pergunta: 'Funciona mesmo para quem é iniciante?', resposta: `Sim. ${produto} foi desenhado do zero para quem NUNCA teve contato com ${nicho} — basta seguir o passo a passo.` },
    { pergunta: 'Como recebo o acesso?', resposta: 'Assim que o pagamento é aprovado, você recebe no e-mail o acesso instantâneo (em até 1 minuto para PIX/cartão, até 24h para boleto).' },
    { pergunta: 'Tem garantia?', resposta: 'Sim. Você tem 7 dias de garantia incondicional — se não gostar, devolvemos 100% do seu dinheiro sem perguntas.' },
    { pergunta: `Por que R$ ${preco}?`, resposta: `Esse valor foi escolhido para ser acessível enquanto valoriza o conteúdo entregue. Comparado ao resultado, é um investimento que se paga no primeiro resultado.` },
    { pergunta: 'Preciso de alguma ferramenta paga?', resposta: 'Não. Todos os passos podem ser feitos com ferramentas gratuitas mencionadas dentro do material.' },
    { pergunta: 'Tem suporte?', resposta: 'Sim. Suporte por chat/email em português, respondemos em até 24h úteis.' },
    { pergunta: 'Funciona em qual dispositivo?', resposta: 'Funciona em celular, tablet ou computador — 100% online.' },
  ]
  for (const o of objeçõesExtra) faq.push({ pergunta: o, resposta: 'Essa é uma dúvida comum! Nossa resposta é personalizada com base no seu perfil — entre em contato no chat que explicamos.' })
  void OBJECAO_PADRAO
  return { faq, objeçõesComuns: [...OBJECAO_PADRAO, ...objeçõesExtra] }
}
