// Agente ValidatorBR — valida e formata CPF, CNPJ, telefone, CEP, email, cartão
export interface ValidadorInput {
  tipo: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'cep' | 'cartao' | 'pix'
  valor: string
}
export interface ValidadorResult {
  valido: boolean
  tipo: string
  valorOriginal: string
  valorFormatado?: string
  valorLimpo?: string
  regiao?: string
  bandeira?: string
  erros: string[]
  sugestao?: string
}

function digits(s: string): string { return s.replace(/\D/g, '') }

function validarCPF(cpf: string): boolean {
  const d = digits(cpf)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let s1 = 0, s2 = 0
  for (let i = 0; i < 9; i++) { s1 += Number(d[i]) * (10 - i); s2 += Number(d[i]) * (11 - i) }
  const d1 = (s1 * 10) % 11 % 10
  s2 += d1 * 2
  const d2 = (s2 * 10) % 11 % 10
  return d[9] === String(d1) && d[10] === String(d2)
}

function validarCNPJ(cnpj: string): boolean {
  const d = digits(cnpj)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  let s1 = 0, s2 = 0
  for (let i = 0; i < 12; i++) s1 += Number(d[i]) * w1[i]
  const dv1 = s1 % 11 < 2 ? 0 : 11 - (s1 % 11)
  for (let i = 0; i < 12; i++) s2 += Number(d[i]) * w2[i]
  s2 += dv1 * w2[12]
  const dv2 = s2 % 11 < 2 ? 0 : 11 - (s2 % 11)
  return d[12] === String(dv1) && d[13] === String(dv2)
}

function formatarCPF(cpf: string): string {
  const d = digits(cpf)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatarCNPJ(c: string): string {
  const d = digits(c)
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}
function formatarTel(t: string): string {
  const d = digits(t)
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return d
}
function formatarCEP(c: string): string { return digits(c).replace(/(\d{5})(\d{3})/, '$1-$2') }

export function validarBR(input: ValidadorInput): ValidadorResult {
  const { tipo, valor } = input
  const erros: string[] = []
  const limpo = digits(valor)
  let valido = false
  let formatado: string | undefined
  let regiao: string | undefined
  let bandeira: string | undefined
  if (tipo === 'cpf') {
    valido = validarCPF(valor)
    if (valido) formatado = formatarCPF(valor)
    else erros.push('CPF inválido (dígitos verificadores não batem).')
    const ddd = limpo.slice(0, 2)
    // Aproximação grosseira por DDD
    if (['11','12','13','14','15','16','17','18','19'].includes(ddd)) regiao = 'SP'
    else if (['21','22','24'].includes(ddd)) regiao = 'RJ'
    else if (['31','32','33','34','35','37','38'].includes(ddd)) regiao = 'MG'
  } else if (tipo === 'cnpj') {
    valido = validarCNPJ(valor)
    if (valido) formatado = formatarCNPJ(valor)
    else erros.push('CNPJ inválido.')
  } else if (tipo === 'telefone') {
    const d = limpo
    valido = (d.length === 10 || d.length === 11)
    if (valido) formatado = formatarTel(valor)
    else erros.push('Telefone precisa ter 10 ou 11 dígitos com DDD.')
  } else if (tipo === 'cep') {
    valido = limpo.length === 8
    if (valido) formatado = formatarCEP(valor)
    else erros.push('CEP precisa de 8 dígitos.')
  } else if (tipo === 'email') {
    valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())
    if (!valido) erros.push('Email inválido.')
    formatado = valor.trim().toLowerCase()
  } else if (tipo === 'cartao') {
    const d = limpo
    // Luhn
    let sum = 0; let alt = false
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d[i])
      if (alt) { n *= 2; if (n > 9) n -= 9 }
      sum += n; alt = !alt
    }
    valido = d.length >= 13 && d.length <= 19 && sum % 10 === 0
    if (/^4/.test(d)) bandeira = 'Visa'
    else if (/^(5[1-5]|2[2-7])/.test(d)) bandeira = 'Mastercard'
    else if (/^3[47]/.test(d)) bandeira = 'Amex'
    else if (/^6/.test(d)) bandeira = 'Elo/Hipercard'
    else bandeira = 'Desconhecida'
    if (!valido) erros.push('Número de cartão inválido (Luhn falhou).')
  } else if (tipo === 'pix') {
    const v = valor.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
    const isCPF = validarCPF(v)
    const isCNPJ = validarCNPJ(v)
    const isCelular = digits(v).length === 11 && digits(v).startsWith('1') || digits(v).length === 11
    const isChave = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    valido = isEmail || isCPF || isCNPJ || isCelular || isChave
    if (!valido) erros.push('Chave PIX inválida (use CPF/CNPJ, email, celular ou chave aleatória).')
    if (isCPF) formatado = formatarCPF(v)
    else if (isCNPJ) formatado = formatarCNPJ(v)
    else if (isCelular) formatado = formatarTel(v)
    else formatado = v
  }
  return {
    valido, tipo, valorOriginal: valor, valorFormatado: formatado, valorLimpo: limpo || valor,
    regiao, bandeira, erros,
    sugestao: valido ? undefined : 'Verifique os dígitos e tente novamente. Não compartilhe esses dados em canais públicos.'
  }
}
