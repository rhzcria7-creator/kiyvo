// Agente FAQMaker — gera FAQ inteligente para páginas de produto
// Responde as 12 dúvidas mais comuns e ajuda no SEO
export interface FAQInput { produto: string; nicho: string; preco?: number; beneficios?: string[]; publico?: string }
export interface FAQItem { pergunta: string; resposta: string }
export interface FAQOutput { faqs: FAQItem[]; faqSchemaLd: string; sugestoesPerguntas: string[]; perguntasFrequentes: number }
export function gerarFAQ(input: FAQInput): FAQOutput {
  const { produto, nicho, preco, beneficios = [], publico = 'qualquer pessoa' } = input
  const brl = (v:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
  const benef = beneficios.length ? beneficios.slice(0,3).join(', ') : 'resultados reais'
  const faqs: FAQItem[] = [
    { pergunta: `${produto} realmente funciona?`, resposta: `Sim! ${produto} foi desenvolvido e testado por centenas de ${publico}. Como em qualquer produto, os resultados dependem da sua aplicação, mas nossos clientes relatam ${benef}.` },
    { pergunta: 'Como recebo o produto após o pagamento?', resposta: `Imediatamente! Por ser 100% digital, você recebe o acesso no seu e-mail e na sua biblioteca KIYVO em poucos segundos após a confirmação do pagamento (Pix é instantâneo, cartão em até 1min, boleto em até 24h).` },
    { pergunta: 'Tem garantia?', resposta: `Sim! Oferecemos garantia INCONDICIONAL de 7 dias. Se você não gostar ou não ver resultado, basta solicitar reembolso que devolvemos 100% do seu dinheiro, sem perguntas.` },
    { pergunta: 'Funciona para mim?', resposta: `${produto} foi criado para ${publico}. Se você se encaixa nesse perfil, ele foi feito para você. Em caso de dúvida específica, chame nosso suporte — respondemos em até 1h.` },
    { pergunta: 'Emite nota fiscal?', resposta: `Sim, nota fiscal eletrônica é enviada automaticamente para o seu e-mail após a confirmação do pagamento.` },
    { pergunta: 'Posso parcelar?', resposta: preco ? `Sim! Você pode pagar com Pix à vista (5% OFF direto), cartão de crédito em até 12x, ou boleto. Parcele em até 12x de ${brl(preco/12)} sem juros.` : 'Sim! Parcelamos em até 12x sem juros no cartão, Pix ou boleto.' },
    { pergunta: 'Quanto tempo de acesso terei?', resposta: `Acesso VITALÍCIO. Você paga uma vez e tem acesso para sempre, incluindo atualizações futuras GRATUITAS.` },
    { pergunta: 'Tem suporte?', resposta: `Sim! Suporte humano em português, respondendo em até 1h em dias úteis, diretamente pelo chat dentro da plataforma KIYVO.` },
    { pergunta: 'O produto tem conteúdo atualizado?', resposta: `Sim! Atualizamos constantemente com base nas novidades de ${nicho}. Todas atualizações saem de graça para quem já comprou.` },
    { pergunta: 'Como faço para acessar?', resposta: `Após a compra, basta fazer login na sua conta KIYVO e acessar a aba "Minha Biblioteca" — o produto já estará lá esperando por você.` },
    { pergunta: 'Posso comprar como presente para outra pessoa?', resposta: `Sim! Ao finalizar a compra, você pode inserir o e-mail da pessoa presenteada e ela recebe o acesso diretamente.` },
    { pergunta: 'Tem desconto à vista?', resposta: preco ? `Sim! Pagando via Pix à vista você ganha 5% de desconto, saindo por apenas ${brl(preco*0.95)}.` : 'Sim! Pagamento via Pix tem 5% de desconto.' },
  ]
  const faqSchemaLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  }, null, 2)
  return {
    faqs,
    faqSchemaLd,
    sugestoesPerguntas: [
      `Como usar ${produto}?`,
      `${produto} vale a pena?`,
      `${produto} no Reclame Aqui`,
      `${produto} é confiável?`,
      `Qual o melhor ${nicho}?`,
      `${produto} ou concorrente?`,
    ],
    perguntasFrequentes: faqs.length,
  }
}
