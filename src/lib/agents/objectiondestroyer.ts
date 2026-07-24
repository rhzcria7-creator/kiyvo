// Agente ObjectionDestroyer — respostas para as 10 objeções mais comuns do cliente
export interface ObjectionInput { produto: string; preco: number; nicho: string; publico?: string; objecoes?: string[] }
export interface ObjectionResposta { objecao: string; resposta: string; scriptWhatsapp: string; abordagem: 'empatia'|'logica'|'prova'|'urgencia' }
export interface ObjectionOutput { respostas: ObjectionResposta[]; objecoesMaisComuns: string[]; scriptLigacao: string; checklist: string[] }
const OBJECAO_PADRAO = [
  'Está caro',
  'Vou pensar',
  'Preciso falar com o marido/esposa/sócio',
  'Não tenho dinheiro agora',
  'Já tentei outro e não funcionou',
  'Tenho medo de ser golpe',
  'Vou esperar uma promoção',
  'Isso não funciona pra mim',
  'Não tenho tempo',
  'Achei mais barato em outro lugar',
]
export function destruirObjecoes(input: ObjectionInput): ObjectionOutput {
  const { produto, preco, nicho, publico = 'o cliente' } = input
  const brl = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(preco)
  const respostas: ObjectionResposta[] = [
    { objecao: 'Está caro', abordagem: 'logica',
      resposta: `Entendo perfeitamente. E se eu te mostrar que ${produto} custa menos de R$ ${(preco/30).toFixed(2).replace('.',',')} por dia, e entrega R$ ${preco*5} de valor? É um investimento, não um gasto.`,
      scriptWhatsapp: `Entendo ${publico}! E se eu te mostrar que ${produto} sai por menos de um cafezinho por dia (R$ ${(preco/30).toFixed(2).replace('.',',')}) e te devolve ${preco*3}x esse valor em economia/resultados? Você vê como um investimento ou só olha o preço? 😊` },
    { objecao: 'Vou pensar', abordagem: 'urgencia',
      resposta: `Claro, faz sentido pensar. Mas te faço uma pergunta: o que exatamente você precisa pensar? Se for sobre o resultado, temos 7 dias de garantia. Se for preço, essa oferta acaba em 48h.`,
      scriptWhatsapp: `Claro! É importante pensar mesmo 🤔 Mas me ajuda: o que especificamente você ainda tem dúvida? Resultado? Preço? Confiança? Se eu puder esclarecer qualquer um deles agora, te respondo em 1 minuto. E lembra: a garantia de 7 dias é incondicional.` },
    { objecao: 'Preciso falar com o marido/esposa/sócio', abordagem: 'empatia',
      resposta: `Super entendo, é uma decisão a dois/do time. Me coloco à disposição para conversar com os dois se quiser. Enquanto isso, posso enviar o link com todas informações para você apresentar?`,
      scriptWhatsapp: `Super entendo! Essa decisão é importante mesmo 👥 Me coloco à disposição para conversar com vocês dois também. Posso te enviar um resumo objetivo de 1 página com todos os pontos para você mostrar? Vai ajudar muito na conversa 😊` },
    { objecao: 'Não tenho dinheiro agora', abordagem: 'logica',
      resposta: `Entendo, e quero te ajudar. Temos Pix parcelado em até 12x sem juros. Se o problema é orçamento, R$ ${(preco/12).toFixed(2).replace('.',',')}/mês é menos que um delivery por semana.`,
      scriptWhatsapp: `Entendo perfeitamente ${publico}, e é exatamente por isso que quero te mostrar uma coisa 💙 Você pode dividir em até 12x de R$ ${(preco/12).toFixed(2).replace('.',',')} sem juros. Isso dá menos de R$ 1/dia no cartão. Faz sentido ou tá apertado mesmo?` },
    { objecao: 'Já tentei outro e não funcionou', abordagem: 'prova',
      resposta: `Essa é a objeção que eu mais respeito — prova que você é alguém que AGIU. O que faltou no outro? Porque ${produto} é diferente exatamente por [X, Y, Z]. E temos 7 dias pra você testar sem risco.`,
      scriptWhatsapp: `Eu OUVI ISSO, essa é a objeção que eu mais respeito. Prova que você tentou, é alguém de ação 🚀 Me responde só uma coisa: o que exatamente não funcionou no outro? Quero te explicar POR QUE esse é diferente (e se não for diferente, eu mesmo te digo pra não comprar).` },
    { objecao: 'Tenho medo de ser golpe', abordagem: 'prova',
      resposta: `Razoável. Veja nossas avaliações (todas verificadas), garantia de 7 dias e a KIYVO é uma plataforma com mais de 100 mil vendas. Se não receber ou não funcionar, devolvemos 100% do dinheiro.`,
      scriptWhatsapp: `Medo de golpe é super válido (tem cada coisa na internet, né? 😅) Por isso: 1) todas avaliações são VERIFICADAS (só quem comprou pode opinar), 2) a KIYVO é a plataforma que processa o pagamento, 3) garantia de 7 dias incondicional: se não gostar, devolvemos 100%.` },
    { objecao: 'Vou esperar uma promoção', abordagem: 'urgencia',
      resposta: `Essa JÁ é a promoção. Hoje você ganha ${Math.round(preco*1.5/50)*50} em bônus que serão retirados no próximo reajuste. Quem espera promoção sempre paga mais caro no final.`,
      scriptWhatsapp: `Olha, sinceramente? Essa JÁ é a melhor oferta que já tivemos 🔥\n\nHoje você leva ${Math.round(preco*1.5/50)*50} em bônus que saem do ar no próximo lote. E quando entra promoção oficial, sempre volta mais caro. Melhor garantir AGORA com garantia de 7 dias do que esperar.` },
    { objecao: 'Isso não funciona pra mim', abordagem: 'empatia',
      resposta: `Entendo o receio. O que te faz pensar isso? Se puder me contar rapidinho, eu te digo sinceramente se ${produto} é pra você — mesmo que isso signifique te dizer pra NÃO comprar.`,
      scriptWhatsapp: `Sério? Me conta mais! 🤔 Pra eu não te fazer perder tempo, me fala:\n- qual a sua situação atual?\n- o que você já tentou antes?\n\nEu te digo na lata se esse ${produto} é pra você ou não. Mesmo que eu te diga pra NÃO comprar.` },
    { objecao: 'Não tenho tempo', abordagem: 'logica',
      resposta: `Justamente por isso você precisa. ${produto} foi criado para quem TEM POUCO tempo — ele automatiza/resolve em 15min o que demoraria horas. Pessoas sem tempo são as que mais economizam com isso.`,
      scriptWhatsapp: `Entendo TANTO. E é exatamente pra você, que tem pouco tempo, que isso foi criado ⚡\n\nO produto é pensado para ser aplicado em 15min/dia e resolve o que te tomaria HORAS. Se demorar mais de 1h pra ver resultado na primeira semana, eu mesmo peço o reembolso.` },
    { objecao: 'Achei mais barato em outro lugar', abordagem: 'logica',
      resposta: `Você tem razão, existem mais baratos. Existem também mais caros. Pergunta: o "outro" tem garantia de 7 dias? Suporte em PT-BR? Bônus de R$ ${Math.round(preco*1.5/50)*50}? Atualizações grátis? Se tiver, me manda que eu quero comprar também 😄`,
      scriptWhatsapp: `Existem sempre mais baratos, eu concordo! E existem mais caros também 🧐 Me responde uma coisa só: esse mais barato tem:\n✅ Garantia incondicional de 7 dias?\n✅ Suporte em PT-BR humano em 1h?\n✅ Bônus de R$ ${Math.round(preco*1.5/50)*50}?\n✅ Atualizações gratuitas vitalícias?\n\nSe tiver, ME MANDA que eu também quero comprar 😂` },
  ]
  // Último item vazio removido, array fica com 10 entradas
  const scriptLigacao = `
Roteiro de ligação (3 minutos):
1. (0-30s) Conexão: "Tudo bem? É [NOME] da KIYVO, liguei rapidinho porque vi seu interesse em ${produto}."
2. (30s-1m30) Perguntas: "O que mais te atraiu no produto?" (OUVE, não vende nada)
3. (1m30-2m30) Validação: "Entendi. Olha, pensando no que você disse, o ponto X é o que mais vai te ajudar por causa Y."
4. (2m30-3m) CTA: "Posso te enviar o link de checkout agora mesmo com um cupom exclusivo de +5% OFF, válido pelos próximos 15 minutos?"`
  const checklist = [
    '✅ NUNCA discuta da objeção — valide primeiro ("entendo perfeitamente")',
    '✅ Faça perguntas para entender o REAL motivo',
    '✅ Use prova social (depoimentos, números) ao invés de "confia em mim"',
    '✅ Ofereça garantia incondicional como segurança',
    '✅ Crie urgência GENUÍNA (expiração de bônus, não fake)',
    '✅ Se a pessoa não comprar, trate bem — 60% voltam em 30 dias',
  ]
  return { respostas, objecoesMaisComuns: OBJECAO_PADRAO, scriptLigacao, checklist }
}
