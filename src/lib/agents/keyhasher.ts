// Agente KeyHasher — validador de força de senhas (invisível, usa no signup)
export interface SenhaAnalise { pontuacao: number; forca: 'muito_fraca'|'fraca'|'media'|'forte'|'muito_forte'; problemas: string[]; sugestoes: string[]; entropy: number; tempoQuebra: string }
const CHAR_SETS = [
  { nome: 'lower', regex: /[a-z]/, tamanho: 26 },
  { nome: 'upper', regex: /[A-Z]/, tamanho: 26 },
  { nome: 'num', regex: /[0-9]/, tamanho: 10 },
  { nome: 'special', regex: /[^a-zA-Z0-9]/, tamanho: 33 },
]
export function analisarSenha(senha: string): SenhaAnalise {
  const problemas: string[] = []
  const sugestoes: string[] = []
  let tamanhoAlfabeto = 0
  for (const cs of CHAR_SETS) if (cs.regex.test(senha)) tamanhoAlfabeto += cs.tamanho
  const entropy = senha.length > 0 ? Math.log2(Math.pow(tamanhoAlfabeto || 1, senha.length)) : 0
  let pontuacao = 0
  if (senha.length >= 8) pontuacao += 20; else problemas.push('Menos de 8 caracteres')
  if (senha.length >= 12) pontuacao += 10; else if (senha.length >= 8) sugestoes.push('Use pelo menos 12 caracteres para mais segurança')
  if (/[A-Z]/.test(senha)) pontuacao += 15; else problemas.push('Sem letra maiúscula')
  if (/[a-z]/.test(senha)) pontuacao += 10; else problemas.push('Sem letra minúscula')
  if (/[0-9]/.test(senha)) pontuacao += 15; else problemas.push('Sem números')
  if (/[^a-zA-Z0-9]/.test(senha)) pontuacao += 20; else sugestoes.push('Adicione um caractere especial (!@#$%...)')
  if (!/(.)\1{2,}/.test(senha)) pontuacao += 10; else problemas.push('Caracteres repetidos em sequência')
  if (!/^(123|abc|qwerty|senha|password)/i.test(senha)) pontuacao += 10; else problemas.push('Sequência óbvia (123, abc, qwerty...)')
  const common = ['senha123','123456','password','12345678','qwerty','abc123','12345','iloveyou','admin','welcome']
  if (!common.includes(senha.toLowerCase())) pontuacao += 5; else problemas.push('Senha muito comum (facilmente quebrável)')
  pontuacao = Math.min(100, pontuacao + Math.min(entropy/2, 20))
  let forca: SenhaAnalise['forca'] = 'muito_fraca'
  if (pontuacao >= 85) forca = 'muito_forte'
  else if (pontuacao >= 70) forca = 'forte'
  else if (pontuacao >= 50) forca = 'media'
  else if (pontuacao >= 25) forca = 'fraca'
  const ataquesPorSegundo = 1e10 // cenário ataque offline GPU
  const combinacoes = Math.pow(tamanhoAlfabeto||1, senha.length)
  const segundosQuebra = combinacoes / ataquesPorSegundo
  let tempoQuebra = 'instantâneo'
  if (segundosQuebra < 1) tempoQuebra = 'instantâneo'
  else if (segundosQuebra < 3600) tempoQuebra = `${Math.round(segundosQuebra/60)} minutos`
  else if (segundosQuebra < 86400) tempoQuebra = `${Math.round(segundosQuebra/3600)} horas`
  else if (segundosQuebra < 86400*30) tempoQuebra = `${Math.round(segundosQuebra/86400)} dias`
  else if (segundosQuebra < 86400*365) tempoQuebra = `${Math.round(segundosQuebra/(86400*30))} meses`
  else if (segundosQuebra < 86400*365*100) tempoQuebra = `${Math.round(segundosQuebra/(86400*365))} anos`
  else tempoQuebra = `${Math.round(segundosQuebra/(86400*365))} anos (séculos)`
  if (!sugestoes.length && forca === 'muito_forte') sugestoes.push('Senha excelente!')
  return { pontuacao: Math.round(pontuacao), forca, problemas, sugestoes, entropy: Math.round(entropy), tempoQuebra }
}
export function gerarSenhaKeyHasher(tamanho = 16): { senha: string; analise: SenhaAnalise } {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  let s = ''
  const arr = new Uint32Array(tamanho)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(arr)
  else for (let i = 0; i < tamanho; i++) arr[i] = Math.floor(Math.random()*4294967296)
  for (let i = 0; i < tamanho; i++) s += chars[arr[i] % chars.length]
  return { senha: s, analise: analisarSenha(s) }
}
