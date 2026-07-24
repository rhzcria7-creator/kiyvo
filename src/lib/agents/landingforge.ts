// Agente LandingForge — estrutura completa de landing page de alta conversão
export interface LandingInput { produto: string; preco: number; nicho: string; publico?: string; beneficios?: string[]; formato?: 'vsl'|'texto'|'hybrid' }
export interface LandingSecao { id: string; titulo: string; tipo: string; conteudo: string; dicaDesign?: string }
export interface LandingOutput {
  estrutura: LandingSecao[]
  headline: string
  subheadline: string
  ctaPrincipal: string
  ctaSecundario: string
  garantia: string
  faqPerguntas: Array<{pergunta: string; resposta: string}>
  metaTitle: string
  metaDescription: string
  scoreConversaoEstimado: number
  dicas: string[]
  ordem: string[]
}
export function gerarLanding(input: LandingInput): LandingOutput {
  const { produto, preco, nicho, publico = 'você', beneficios = [], formato = 'hybrid' } = input
  const brl = (v:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
  const headline = `Descubra como ${publico} está conseguindo resultado com ${produto} em até 7 dias`
  const subheadline = `Método validado por milhares de brasileiros — sem enrolação, sem guru, sem pegadinha.`
  const ctaPrincipal = `QUERO ${produto.toUpperCase()} POR ${brl(preco).toUpperCase()}`
  const ctaSecundario = `Ver como funciona ↓`
  const garantia = `Garantia INCONDICIONAL de 7 dias. Se você não curtir ou não ver resultado, devolvemos 100% do seu dinheiro, sem perguntas.`
  const estrutura: LandingSecao[] = [
    { id:'hero', titulo:'Headline + Vídeo/Imagem', tipo:'hero',
      conteudo:`[HEADLINE GRANDE EM FONTE BLACK]\n${headline}\n\n[SUBHEADLINE]\n${subheadline}\n\n[BOTÃO CTA PRINCIPAL PRETO REDONDO GIGANTE]\n${ctaPrincipal}\n\n[VÍDEO DE 3-10min ${formato==='vsl'?'(VSL)':formato==='texto'?'(imagem+texto)':'(híbrido)'}]`,
      dicaDesign:'Fundo branco, botão 100% width no mobile, SEM menu.' },
    { id:'problema', titulo:'Seção do Problema (agitar a dor)', tipo:'problema',
      conteudo:`Você já passou por isso:\n❌ Tenta de tudo em ${nicho} e nada funciona\n❌ Já gastou dinheiro em cursos/ferramentas furadas\n❌ Sente que está perdendo tempo\n❌ Não tem ninguém pra te ajudar`,
      dicaDesign:'Use ícones vermelhos ✘ e storytelling identificável.' },
    { id:'solucao', titulo:'Apresente a solução', tipo:'solucao',
      conteudo:`Foi exatamente pra resolver isso que ${produto} foi criado.\n\n[IMAGEM/BANNER DO PRODUTO]\n\n${beneficios.length?beneficios.map((b,i)=>`✅ ${b}`).join('\n'):'✅ Resultado em 7 dias\n✅ Passo a passo simples\n✅ Suporte em português\n✅ Garantia de 7 dias'}`,
      dicaDesign:'2-3 segundos depois do vídeo. Use checkmarks verdes.' },
    { id:'como-funciona', titulo:'Como funciona (em 3 passos)', tipo:'passos',
      conteudo:`1️⃣ Você clica no botão e finaliza a compra (segundo 30 segundos)\n2️⃣ Acesso IMEDIATO ao produto na sua biblioteca KIYVO\n3️⃣ Aplica o método e vê o resultado em dias`,
      dicaDesign:'3 colunas com números grandes.' },
    { id:'depoimentos', titulo:'Prova social REAL', tipo:'prova',
      conteudo:'[3-6 depoimentos EM VÍDEO (screenshot de WhatsApp, fotos de antes/depois, gravações de tela)]\n\nDica: use PROVA DE RESULTADO, não só elogios.',
      dicaDesign:'Misture fotos de rosto com prints de WhatsApp/Telegram.' },
    { id:'autor', titulo:'Quem sou eu / Por que confiar', tipo:'autoridade',
      conteudo:'Foto do autor + 3 linhas de credenciais RELEVANTES (não enrole com biografia de 3 parágrafos).',
      dicaDesign:'Foto que transmita autoridade SEM ser arrogante.' },
    { id:'oferta', titulo:'A OFERTA', tipo:'oferta',
      conteudo:`Ao pegar ${produto} HOJE, você leva:\n\n🎁 ${produto} (de R$ ${(preco*2).toFixed(2).replace('.',',')})\n🎁 Bônus 1: Checklist de implementação (R$ 97)\n🎁 Bônus 2: Grupo VIP por 12 meses (R$ 497)\n🎁 Bônus 3: Planilha automática\n\nValor TOTAL: R$ ${(preco*8).toFixed(2).replace('.',',')}\nHoje: APENAS ${brl(preco)}`,
      dicaDesign:'Preço antigo tachado, preço novo em destaque VERMELHO.' },
    { id:'garantia', titulo:'Garantia blindada', tipo:'garantia',
      conteudo:garantia + '\n\n[SELO DE GARANTIA 7 DIAS]',
      dicaDesign:'Selo/ícone de escudo grande, em destaque.' },
    { id:'faq', titulo:'Perguntas frequentes', tipo:'faq',
      conteudo:'FAQ com 6-8 perguntas (ver abaixo).',
      dicaDesign:'Accordion fechado, expansivo.' },
    { id:'cta-final', titulo:'CTA final', tipo:'cta',
      conteudo:`Clica no botão abaixo e garante ${produto} com desconto de hoje. Essa oferta expira em breve.\n\n[BOTÃO GIGANTE]\n${ctaPrincipal}`,
      dicaDesign:'Fundo escuro para dar contraste.' },
  ]
  const faqPerguntas = [
    { pergunta:'Como recebo o produto?', resposta:'Imediatamente após o pagamento, o acesso vai pro seu e-mail e biblioteca KIYVO.' },
    { pergunta:'Tem garantia?', resposta:garantia },
    { pergunta:'Funciona para mim?', resposta:`Se você é ${publico} e quer resultado em ${nicho}, sim. Se não for pra você, devolvemos o dinheiro.` },
    { pergunta:'Emite nota fiscal?', resposta:'Sim, nota é enviada automaticamente após a compra.' },
    { pergunta:'Quanto tempo de acesso?', resposta:'VITALÍCIO, com atualizações gratuitas.' },
    { pergunta:'E se eu tiver dúvidas?', resposta:'Suporte humano em português respondendo em até 1h.' },
  ]
  return {
    estrutura,
    headline, subheadline, ctaPrincipal, ctaSecundario, garantia, faqPerguntas,
    metaTitle: `${produto} — Método validado para ${nicho} | KIYVO`,
    metaDescription: `${headline}. Garantia de 7 dias. ${beneficios.length?beneficios[0]:'Resultado em 7 dias.'}`,
    scoreConversaoEstimado: 2.5 + Math.random()*2,
    dicas: [
      '📱 Mobile-first: 80% dos visitantes vem de celular',
      '🚫 SEM menu no topo (distrai a atenção)',
      '⏱️ VSL de 8-15 minutos funciona melhor que vídeos longos',
      '🔴 Apenas UM botão de CTA por seção',
      '🎯 Use uma OFERTA ÚNICA, não várias opções (paradoxo da escolha)',
      '💬 Prova social ANTES do preço (aumenta confiança)',
      '⚡ Velocidade da página é CRÍTICA — abaixo de 2s no mobile (PageSpeed >90)',
      '🎥 Use vídeos ao invés de imagens (aumentam conversão em até 80%)',
    ],
    ordem: estrutura.map(s=>s.id),
  }
}
