// Agente UrgenciaMaker — gera linhas de urgência/escassez honestas
export interface UrgenciaInput {
  estoque?: number
  promocaoAte?: string // data ISO
  vagas?: number
  bonusExclusivo?: string
  tipo?: 'estoque' | 'tempo' | 'vagas' | 'bonus'
}
export interface UrgenciaResult {
  principal: string
  secundaria: string
  linhas: string[]
  badge: string
  honestidade: string[]
}

export function gerarUrgencia(input: UrgenciaInput): UrgenciaResult {
  const { estoque, promocaoAte, vagas, bonusExclusivo, tipo = 'tempo' } = input
  const linhas: string[] = []
  const honestidade: string[] = ['Use escassez HONESTA — nunca invente estoque ou vagas.']
  let principal = ''
  let badge = ''
  if (tipo === 'estoque' && typeof estoque === 'number') {
    if (estoque <= 5) {
      principal = `🔥 RESTAM APENAS ${estoque} UNIDADES`
      badge = 'Últimas unidades'
      linhas.push(`Corra — só ${estoque} ${estoque === 1 ? 'unidade' : 'unidades'} no estoque.`)
    } else if (estoque <= 20) {
      principal = `⚡ Estoque baixo: ${estoque} unidades restantes`
      badge = 'Estoque baixo'
      linhas.push(`Este lote acaba rápido — ${estoque} disponíveis.`)
    } else {
      principal = `✅ ${estoque} unidades disponíveis`
      badge = 'Em estoque'
      linhas.push(`Produto em estoque, envio imediato.`)
    }
    honestidade.push('Atualize estoque em tempo real, nunca mostre número falso.')
  } else if (tipo === 'vagas' && typeof vagas === 'number') {
    principal = `🎯 ${vagas} ${vagas === 1 ? 'vaga' : 'vagas'} disponíveis`
    badge = 'Vagas limitadas'
    linhas.push(`Turma limitada — só ${vagas} vagas para manter qualidade.`)
    honestidade.push('Mostre o número real de vagas para manter confiança.')
  } else if (tipo === 'bonus' && bonusExclusivo) {
    principal = `🎁 BÔNUS EXCLUSIVO: ${bonusExclusivo} (só HOJE)`
    badge = 'Bônus hoje'
    linhas.push('Bônus disponível apenas nas próximas 24h para compras confirmadas.')
  } else if (promocaoAte) {
    const data = new Date(promocaoAte)
    const agora = new Date()
    const diffMs = data.getTime() - agora.getTime()
    const horas = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
    const dias = Math.floor(horas / 24)
    if (horas <= 0) { principal = '⏰ Promoção encerrada'; badge = 'Encerrado'; linhas.push('Cadastre-se para a próxima.') }
    else if (horas < 24) {
      principal = `⏰ OFERTA ENCERRA EM ${horas}h`
      badge = `${horas}h restantes`
      linhas.push(`Faltam ${horas}h para o preço subir.`)
    } else {
      principal = `⏰ Oferta válida por mais ${dias} dia${dias > 1 ? 's' : ''}`
      badge = `${dias}d restantes`
      linhas.push(`Preço atual garante até ${data.toLocaleDateString('pt-BR')}.`)
    }
    honestidade.push('Timer deve ser real (armazene em servidor, não localStorage).')
  } else {
    principal = '⚡ Aproveite agora'
    badge = 'Oferta'
    linhas.push('Oferta por tempo limitado.')
  }
  const secundaria = '✅ Compra 100% segura · Garantia de 7 dias · Entrega instantânea'
  const unicas = Array.from(new Set(linhas))
  return { principal, secundaria, linhas: unicas, badge, honestidade }
}
