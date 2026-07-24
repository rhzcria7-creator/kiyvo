// Agente SenhaForge — gera senhas seguras e valida força
export interface SenhaInput {
  tamanho?: number
  comMaiusculas?: boolean
  comNumeros?: boolean
  comSimbolos?: boolean
  excluirAmbiguos?: boolean
}
export interface SenhaResult {
  senha: string
  forca: 'muito_fraca' | 'fraca' | 'media' | 'forte' | 'muito_forte'
  pontuacao: number
  entropyBits: number
  sugestoes: string[]
  tempoQuebra: string
}

export function gerarSenhaForte(input: SenhaInput): SenhaResult {
  const { tamanho = 16, comMaiusculas = true, comNumeros = true, comSimbolos = true, excluirAmbiguos = true } = input
  let chars = 'abcdefghijklmnopqrstuvwxyz'
  if (comMaiusculas) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (comNumeros) chars += '0123456789'
  if (comSimbolos) chars += '!@#$%^&*()-_=+[]{};:,.?'
  if (excluirAmbiguos) chars = chars.replace(/[Il1O0o]/g, '')
  // Garantir pelo menos 1 de cada classe escolhida
  const arr = new Uint32Array(tamanho)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(arr)
  else for (let i = 0; i < tamanho; i++) arr[i] = Math.floor(Math.random() * 0xFFFFFFFF)
  let senha = ''
  for (let i = 0; i < tamanho; i++) senha += chars[arr[i] % chars.length]
  // Calcular força
  let poolSize = 26
  if (comMaiusculas) poolSize += 26
  if (comNumeros) poolSize += 10
  if (comSimbolos) poolSize += 22
  const entropyBits = Math.round(tamanho * Math.log2(poolSize))
  let pontuacao = Math.min(100, Math.round((entropyBits / 80) * 100))
  let forca: SenhaResult['forca'] = 'muito_fraca'
  if (entropyBits < 28) forca = 'muito_fraca'
  else if (entropyBits < 40) forca = 'fraca'
  else if (entropyBits < 60) forca = 'media'
  else if (entropyBits < 80) forca = 'forte'
  else forca = 'muito_forte'
  let tempoQuebra = 'instantâneo'
  const guesses = Math.pow(2, entropyBits) / 1e10 // 10 bilhões/seg
  if (guesses < 1) tempoQuebra = '<1 segundo'
  else if (guesses < 60) tempoQuebra = `${Math.round(guesses)} segundos`
  else if (guesses < 3600) tempoQuebra = `${Math.round(guesses/60)} minutos`
  else if (guesses < 86400) tempoQuebra = `${Math.round(guesses/3600)} horas`
  else if (guesses < 2592000) tempoQuebra = `${Math.round(guesses/86400)} dias`
  else if (guesses < 31536000) tempoQuebra = `${Math.round(guesses/2592000)} meses`
  else tempoQuebra = `${Math.round(guesses/31536000)} anos`
  const sugestoes = [
    'Use no mínimo 12 caracteres (recomendado: 16+).',
    'Combine maiúsculas, minúsculas, números e símbolos.',
    'Não use dados pessoais (nome, data de nascimento, CPF).',
    'Use gerenciador de senhas (Bitwarden, 1Password).',
    'Ative 2FA em todas as contas importantes.',
    'Não reuse senhas entre plataformas.',
  ]
  return { senha, forca, pontuacao, entropyBits, sugestoes, tempoQuebra }
}
