// Agente GeradorCupom — gera códigos de cupom criativos e válidos
export interface CupomInput { tema?: string; desconto?: number; tipo?: 'lancamento' | 'boasvindas' | 'parceiro' | 'recuperacao' | 'aniversario' | 'blackfriday' }
export interface CupomResult { codigo: string; alternativos: string[]; validade: string; descricao: string }

export function gerarValeDesconto(input: CupomInput): CupomResult {
  const { tema = 'KIYVO', desconto = 10, tipo = 'boasvindas' } = input
  const prefixos: Record<string, string[]> = {
    lancamento: ['NOVO','LANCA','PRIMEIROS','EARLYBIRD'],
    boasvindas: ['BEMVINDO','WELCOME','OLA','NOVO2026'],
    parceiro: ['INDICA','PARCEIRO','AMIGO','VIP'],
    recuperacao: ['VOLTA','SENTIMOSFALTA','FALTAVOCE','DEVOLTA'],
    aniversario: ['ANIVERSARIO','NIVER','BDAY','FELIZ'],
    blackfriday: ['BF','BLACKFRIDAY','BLACK','BF26','SEXTOU'],
  }
  const pref = prefixos[tipo][Math.floor(Math.random()*prefixos[tipo].length)]
  const suf = Math.floor(Math.random()*900+100)
  const t = tema.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4)
  const codigo = `${pref}${desconto}${t || ''}`
  const alts = [
    `${pref}${suf}`,
    `${pref}${desconto}OFF`,
    `${tipo.toUpperCase()}${desconto}`,
    `KIYVO${desconto}`,
  ]
  const validade = tipo==='boasvindas'?'3 dias':tipo==='lancamento'?'7 dias':tipo==='blackfriday'?'24h':tipo==='recuperacao'?'48h':'30 dias'
  const descricoes: Record<string,string> = {
    lancamento: `Desconto de ${desconto}% nos primeiros 100 compradores do lançamento.`,
    boasvindas: `Desconto de ${desconto}% no primeiro pedido.`,
    parceiro: `Desconto de ${desconto}% para clientes vindos de parceiro.`,
    recuperacao: `Desconto de ${desconto}% para recuperar sua compra.`,
    aniversario: `Desconto especial de aniversário — ${desconto}% em qualquer produto.`,
    blackfriday: `${desconto}% OFF na Black Friday KIYVO — válido 24h.`,
  }
  return { codigo, alternativos: alts, validade, descricao: descricoes[tipo] }
}
