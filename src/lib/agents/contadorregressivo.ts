// Agente ContadorRegressivo — gera componentes de contador com códigos prontos
export interface RegressivoInput {
  dataAlvo: string // ISO date
  titulo?: string
  estilo?: 'simples' | 'barra' | 'circulo' | 'sale'
  cor?: string
}
export interface RegressivoResult {
  dataAlvo: Date
  dias: number
  horas: number
  minutos: number
  segundos: number
  totalMs: number
  htmlBasico: string
  tailwindExemplo: string
  frases: string[]
}

export function gerarContador(input: RegressivoInput): RegressivoResult {
  const alvo = new Date(input.dataAlvo)
  const agora = new Date()
  const diff = Math.max(0, alvo.getTime() - agora.getTime())
  const dias = Math.floor(diff / 86400000)
  const horas = Math.floor((diff % 86400000) / 3600000)
  const minutos = Math.floor((diff % 3600000) / 60000)
  const segundos = Math.floor((diff % 60000) / 1000)
  const cor = input.cor || '#EF4444'
  const htmlBasico = `<div class="countdown" data-alvo="${input.dataAlvo}" style="background:${cor};color:#fff;padding:12px 20px;border-radius:999px;display:inline-flex;gap:16px;font-weight:900;">
  <div><span id="cd-d">${dias}</span> <small>dias</small></div>
  <div><span id="cd-h">${String(horas).padStart(2,'0')}</span> <small>h</small></div>
  <div><span id="cd-m">${String(minutos).padStart(2,'0')}</span> <small>min</small></div>
  <div><span id="cd-s">${String(segundos).padStart(2,'0')}</span> <small>s</small></div>
</div>`
  const tailwindExemplo = `<div className="inline-flex gap-3 rounded-full bg-red-500 text-white px-5 py-2.5 font-black text-sm">
  <span>${dias}d</span> : <span>${String(horas).padStart(2,'0')}h</span> : <span>${String(minutos).padStart(2,'0')}m</span> : <span>${String(segundos).padStart(2,'0')}s</span>
</div>`
  const frases = [
    `⏰ Oferta encerra em ${dias} dias!`,
    `🔥 Últimas ${horas}h${minutos}m!`,
    `⚡ Faltam ${dias * 24 + horas} horas para o preço subir.`,
    `🎁 Apenas ${dias} dias com preço de lançamento.`,
    `⏳ Essa oferta expira em ${dias}d ${horas}h — depois o preço volta ao normal.`,
  ]
  return { dataAlvo: alvo, dias, horas, minutos, segundos, totalMs: diff, htmlBasico, tailwindExemplo, frases }
}
