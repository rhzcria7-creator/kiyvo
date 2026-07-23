// Agente WhatsAppForge — mensagens e sequências de WhatsApp que convertem
export interface WhatsAppInput { tipo: 'vendas'|'saudacao'|'pos_venda'|'abordagem_fria'|'followup'|'recuperacao_carrinho'|'lembrete_live'|'aniversario'|'oferta_relampago'|'pesquisa_satisfacao'; nomeCliente: string; nomeVendedor?: string; produto?: string; preco?: number; link?: string; }
export interface WhatsAppOutput { mensagens: Array<{delay: string; texto: string; tipo: string}>; taxaConversaoEstimada: string; dicas: string[]; naoFazer: string[]; scriptAudio?: string }
export function gerarSequenciaWhatsapp(input: WhatsAppInput): WhatsAppOutput {
  const { tipo, nomeCliente, nomeVendedor = 'Time KIYVO', produto = 'nosso produto', preco, link = 'https://kiyvo.com.br' } = input
  const brl = (v:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
  const msgs: WhatsAppOutput['mensagens'] = []
  switch (tipo) {
    case 'saudacao':
      msgs.push({delay:'0s', texto:`Olá ${nomeCliente}! Tudo bem? 🤙 Sou o(a) ${nomeVendedor} da KIYVO!`, tipo:'saudacao'})
      msgs.push({delay:'10s', texto:`Só passando pra agradecer por estar aqui com a gente 💙`, tipo:'relacionamento'})
      msgs.push({delay:'15s', texto:`Qualquer dúvida sobre ${produto}, é só chamar — eu respondo rapidinho.`, tipo:'ajuda'})
      break
    case 'abordagem_fria':
      msgs.push({delay:'0s', texto:`Oi ${nomeCliente}! Tudo bem? Passando rapidinho 🚀`, tipo:'abertura'})
      msgs.push({delay:'25s', texto:`Vi que você se interessou por ${produto}${preco?` (${brl(preco)})`:''}...`, tipo:'contexto'})
      msgs.push({delay:'30s', texto:`Tem uma dúvida em específico sobre ele que eu possa te responder em 1min? É sério, não vai ser pitch! 😅`, tipo:'pergunta_aberta'})
      break
    case 'followup':
      msgs.push({delay:'0s', texto:`Oi ${nomeCliente}! Como tá? ${nomeVendedor} de novo aqui 😊`, tipo:'reabertura'})
      msgs.push({delay:'15s', texto:`Não sei se viu minha última mensagem sobre ${produto}${preco?` por ${brl(preco)}`:''}... Teve alguma dúvida que posso ajudar?`, tipo:'followup'})
      msgs.push({delay:'30s', texto:`Se quiser, te mando um desconto exclusivo de 10% só pra você, mas é só HOJE 🔥`, tipo:'oferta'})
      break
    case 'recuperacao_carrinho':
      msgs.push({delay:'0s', texto:`${nomeCliente}, você abandonou o carrinho! 😱`, tipo:'alerta'})
      msgs.push({delay:'20s', texto:`Deixa eu te dar um empurrãozinho: usa o cupom VOLTA10 e ganha 10% OFF no ${produto} 🔥`, tipo:'oferta'})
      msgs.push({delay:'15s', texto:`Link direto: ${link}\n\nEsse cupom expira em 2 HORAS, hein?`, tipo:'cta'})
      break
    case 'pos_venda':
      msgs.push({delay:'0s', texto:`${nomeCliente}, MUITO OBRIGADO pela compra! 🎉💙`, tipo:'agradecimento'})
      msgs.push({delay:'20s', texto:`Seu ${produto} já está na sua biblioteca KIYVO, basta acessar: ${link}`, tipo:'entrega'})
      msgs.push({delay:'20s', texto:`Qualquer dúvida, é só responder aqui que a gente te ajuda! E se curtir, deixa uma avaliação depois 🙏`, tipo:'suporte'})
      break
    case 'oferta_relampago':
      msgs.push({delay:'0s', texto:`🚨 OFERTA RELÂMPAGO 🚨`, tipo:'hook'})
      msgs.push({delay:'10s', texto:`${nomeCliente}, corre! ${produto}${preco?` de ${brl(preco*1.5)} por só ${brl(preco)}`:''}`, tipo:'oferta'})
      msgs.push({delay:'10s', texto:`Só pelas próximas 2 horas! Depois volta ao preço normal.`, tipo:'urgencia'})
      msgs.push({delay:'10s', texto:`${link}`, tipo:'link'})
      break
    case 'lembrete_live':
      msgs.push({delay:'0s', texto:`📢 ${nomeCliente}, a live vai começar em 30min!`, tipo:'lembrete'})
      msgs.push({delay:'15s', texto:`Vamos falar sobre ${produto} e ter desconto EXCLUSIVO pra quem estiver ao vivo 🔥`, tipo:'conteudo'})
      msgs.push({delay:'15s', texto:`Já entra aqui pra não perder: ${link}`, tipo:'link'})
      break
    case 'aniversario':
      msgs.push({delay:'0s', texto:`Parabéns, ${nomeCliente}! 🎂🎉`, tipo:'saudacao'})
      msgs.push({delay:'15s', texto:`A KIYVO te dá um PRESENTE: cupom NIVER20 com 20% OFF em QUALQUER produto, válido hoje!`, tipo:'oferta'})
      msgs.push({delay:'10s', texto:`Escolhe aqui: ${link} 💙`, tipo:'cta'})
      break
    case 'pesquisa_satisfacao':
      msgs.push({delay:'0s', texto:`Oi ${nomeCliente}! Tudo bem? 😊`, tipo:'abertura'})
      msgs.push({delay:'15s', texto:`Comprou ${produto} com a gente recentemente — consegue dar uma nota de 0 a 10?`, tipo:'nps'})
      msgs.push({delay:'20s', texto:`Demora 10s e ajuda a gente MUITO! Se tiver algo pra reclamar, pode falar que resolvemos 💙`, tipo:'pedido'})
      break
    case 'vendas':
    default:
      msgs.push({delay:'0s', texto:`Oi ${nomeCliente}! ${nomeVendedor} aqui da KIYVO 🚀`, tipo:'abertura'})
      msgs.push({delay:'20s', texto:`Vi que você olhou ${produto} — quer tirar alguma dúvida antes de comprar?`, tipo:'pergunta'})
      msgs.push({delay:'30s', texto:`${preco?`Por ser direto por aqui, consigo te dar ${brl(preco*0.95)} à vista no Pix! 🔥`:'Te dou um desconto especial se fechar hoje!'}`, tipo:'oferta'})
      msgs.push({delay:'15s', texto:`Link seguro: ${link}`, tipo:'link'})
      break
  }
  return {
    mensagens: msgs,
    taxaConversaoEstimada: tipo==='oferta_relampago'?'8-12%':tipo==='recuperacao_carrinho'?'6-9%':tipo==='pos_venda'?'30%+ satisfação':'3-7%',
    dicas: [
      '📱 SEMPRE quebre em mensagens PEQUENAS (não mureta de texto)',
      '⏰ Use delays de 10-30s entre mensagens — imita uma conversa real',
      '🎯 Perguntas ABERTAS geram resposta. Sim/não mata a conversa.',
      '😊 Emojis moderados, 1-2 por mensagem máxima',
      '🚫 NUNCA mande link na PRIMEIRA mensagem — proíbido pelo WhatsApp',
      '🎙️ Mande áudio curto (<40s) se quiser aumentar resposta em 40%',
    ],
    naoFazer: [
      '❌ NÃO mande mais de 3 mensagens sem resposta',
      '❌ NÃO envie catálogo/PDF na abordagem',
      '❌ NÃO use "Boa tarde senhor(a)" ou formalidade em excesso',
      '❌ NÃO escreva em CAIXA ALTA',
      '❌ NÃO ligue sem permissão',
    ],
    scriptAudio: scriptAudio(tipo, nomeCliente, produto),
  }
}
function scriptAudio(tipo: string, nome: string, produto: string): string {
  const scripts: Record<string,string> = {
    abordagem_fria: `Oi ${nome}, tudo bem? ${nome}? Te liguei rapidinho porque você deu uma olhada no ${produto} lá no site, e queria só saber se teve alguma dúvida? Se não quiser conversar, sem stress também.`,
    followup: `${nome}! Como tá? É [seu nome] da KIYVO, passando só pra lembrar que o desconto que te falei acaba hoje. Qualquer coisa chama!`,
    pos_venda: `${nome}, agradece demais pela compra, queria só confirmar que deu tudo certo com o acesso? Se tiver qualquer problema, é só responder que resolvemos na hora.`,
    vendas: `Oi ${nome}, tudo bem? Passando rapidinho pra te ajudar com a compra do ${produto}. Dúvidas?`,
  }
  return scripts[tipo] || scripts.vendas
}
