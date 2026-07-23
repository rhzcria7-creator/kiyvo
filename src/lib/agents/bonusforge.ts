// Agente BonusForge — gera pacotes de bônus irresistíveis para ofertas
// Bônus bem escolhidos aumentam o valor percebido em até 4x sem custo marginal

export interface BonusForgeInput {
  produto: string
  preco: number
  nicho: string
  publico?: string
  tipoProduto?: 'curso' | 'ferramenta' | 'template' | 'ebook' | 'servico' | 'fisico' | 'combo'
}

export interface Bonus {
  nome: string
  descricao: string
  tipo: 'pdf' | 'video' | 'template' | 'checklist' | 'planilha' | 'swipe_file' | 'mentoria' | 'grupo' | 'desconto'
  valor: number
  icone: string
  entrega: string
}

export interface BonusForgeOutput {
  bonus: Bonus[]
  valorTotalBonus: number
  valorPercebido: number
  tituloPacote: string
  ordem: string[]
  scriptAnuncioBonus: string
}

function brl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function gerarBonus(input: BonusForgeInput): BonusForgeOutput {
  const { produto, preco, nicho, publico = 'seus alunos', tipoProduto = 'curso' } = input
  const valorBase = Math.max(preco * 0.3, 27)
  const bonus: Bonus[] = []

  const p = produto

  // Bônus 1: Checklist rápido (impresso em 1 página)
  bonus.push({
    nome: `Checklist de Implementação de ${p}`,
    descricao: `O checklist passo a passo de 1 página pra você não se perder. Imprima e risque cada item.`,
    tipo: 'checklist',
    valor: valorBase,
    icone: '✅',
    entrega: 'PDF imediato',
  })

  // Bônus 2: Swipe file / templates
  if (tipoProduto === 'curso' || tipoProduto === 'template') {
    bonus.push({
      nome: `Swipe File com 50 Exemplos Prontos de ${p}`,
      descricao: `50 exemplos REAIS que funcionaram em 2025 no Brasil. Copie, cole e adapte pro seu negócio.`,
      tipo: 'swipe_file',
      valor: valorBase * 2,
      icone: '📋',
      entrega: 'PDF + Canva editável',
    })
  } else {
    bonus.push({
      nome: `Templates Editáveis de ${p}`,
      descricao: `Templates em Canva/Notion 100% editáveis pra você acelerar seus resultados.`,
      tipo: 'template',
      valor: valorBase * 2,
      icone: '🎨',
      entrega: 'Download imediato',
    })
  }

  // Bônus 3: Planilha
  bonus.push({
    nome: `Planilha de Controle e Acompanhamento`,
    descricao: `Planilha automática em Google Sheets pra você medir resultado do primeiro mês usando ${p}.`,
    tipo: 'planilha',
    valor: valorBase,
    icone: '📊',
    entrega: 'Link Google Sheets',
  })

  // Bônus 4: Grupo VIP
  if (preco >= 97) {
    bonus.push({
      nome: `Grupo VIP exclusivo no Telegram/Discord`,
      descricao: `Comunidade de ${publico} aplicando ${p} — networking, dúvidas, atualizações gratuitas por 12 meses.`,
      tipo: 'grupo',
      valor: preco,
      icone: '👥',
      entrega: 'Convite após compra',
    })
  }

  // Bônus 5: Surpresa atualizações
  bonus.push({
    nome: `Atualizações GRATUITAS vitalícias`,
    descricao: `Sempre que ${p} for atualizado, você recebe a nova versão SEM PAGAR NADA.`,
    tipo: 'desconto',
    valor: preco * 2,
    icone: '🔄',
    entrega: 'Automática',
  })

  // Bônus 6: Mentoria rápida
  if (preco >= 197) {
    bonus.push({
      nome: `Sessão de Diagnóstico 1:1 de 20min`,
      descricao: `Uma call particular comigo (ou time) pra destravar seu caso específico. Vagas limitadas.`,
      tipo: 'mentoria',
      valor: preco * 2.5,
      icone: '🎯',
      entrega: 'Agenda após compra',
    })
  }

  // Bônus 7: PDF extra
  bonus.push({
    nome: `Guia Secreto: ${nicho} em 2026`,
    descricao: `Meu guia de 20 páginas com as tendências de ${nicho} para o próximo ano, que ainda NINGUÉM está falando.`,
    tipo: 'pdf',
    valor: valorBase * 1.5,
    icone: '📘',
    entrega: 'PDF imediato',
  })

  const valorTotalBonus = bonus.reduce((acc, b) => acc + b.valor, 0)
  const valorPercebido = valorTotalBonus * 0.7 // desconto comportamental

  const tituloPacote = `Pacote ${p} + ${bonus.length} Super Bônus`

  const scriptAnuncioBonus = `🚨 SÓ HOJE 🚨

Ao pegar ${p} hoje, você leva TUDO isso:

${bonus.map((b, i) => `${i + 1}️⃣ ${b.nome} (de ${brl(b.valor)}) ✅`).join('\n')}

👉 Valor TOTAL dos bônus: ${brl(valorTotalBonus)}
👉 Seu investimento hoje: só ${brl(preco)}
🚚 Entrega: IMEDIATA, digital
🛡️ Garantia de 7 dias incondicional

Clica em "Garantir agora" antes que os bônus sejam retirados.
Essa oferta some em breve. ⚡`

  const ordem = bonus.map((b) => b.nome)

  return { bonus, valorTotalBonus, valorPercebido, tituloPacote, ordem, scriptAnuncioBonus }
}
