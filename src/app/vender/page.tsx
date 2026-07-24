'use client'
// /vender — Formulário PROFISSIONAL de publicar produto (v10.6)
// Suporta: emoji, até 5 categorias, capa, banner, galeria de fotos, vídeo, arquivos download,
// tags, nível de IA, predominância (Brasil/Mundo), descrição até 65.000 caracteres, preços, descontos.
// GATE: login OBRIGATÓRIO + KYC aprovado.
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket, Tag, Sparkles, Package, DollarSign, FileText,
  ArrowRight, CheckCircle2, Type as TypeIcon, Palette,
  ShieldCheck, User as UserIcon, Image as ImageIcon,
  Video, Paperclip, X, UploadCloud, Hash, Globe,
  Bot, User as UserLucide, Atom, Zap, Info, Eye,
  Save, Trash2, Plus, ChevronDown, FileDigit, Download,
  ToggleLeft, ToggleRight, Ticket, Percent, Gift,
} from 'lucide-react'
import { useUserProducts, CATEGORIAS_VALIDAS, type IALevel, type ProdutoMidia, type ProdutoArquivo } from '@/lib/userProducts/store'
import { useAuth } from '@/lib/auth/context'
import { useKYC } from '@/lib/kyc/store'
import { useSellerCoupons } from '@/lib/coupons/store'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const CATS: { id: string; nome: string; emoji: string }[] = [
  { id: 'marketing', nome: 'Marketing', emoji: '📣' },
  { id: 'curso', nome: 'Curso', emoji: '🎓' },
  { id: 'copywriting', nome: 'Copywriting', emoji: '✍️' },
  { id: 'templates', nome: 'Templates', emoji: '🎨' },
  { id: 'ebook', nome: 'E-book', emoji: '📖' },
  { id: 'software', nome: 'Software/Licença', emoji: '💻' },
  { id: 'planilhas', nome: 'Planilhas', emoji: '📊' },
  { id: 'design', nome: 'Design', emoji: '🖼️' },
  { id: 'social', nome: 'Redes Sociais', emoji: '📱' },
  { id: 'saude', nome: 'Saúde/Fitness', emoji: '💪' },
  { id: 'financas', nome: 'Finanças', emoji: '💹' },
  { id: 'beleza', nome: 'Beleza', emoji: '💄' },
  { id: 'gastronomia', nome: 'Gastronomia', emoji: '🍳' },
  { id: 'produtividade', nome: 'Produtividade', emoji: '⏰' },
  { id: 'prompts', nome: 'Prompts IA', emoji: '💬' },
  { id: 'video', nome: 'Vídeo', emoji: '🎥' },
  { id: 'pack', nome: 'Pack/Bundle', emoji: '📦' },
  { id: 'juridico', nome: 'Jurídico', emoji: '⚖️' },
  { id: 'outro', nome: 'Outro', emoji: '✨' },
]

const EMOJIS_POPULARES = ['🚀','💎','🔥','⭐','💰','📈','🎯','🎨','✨','📚','🎮','⚡','🌟','💡','🎁','🎬','📊','💻','📱','🎵','🏆','🔒','🎓','🛒','🤖','🧠','📸','🎨','🎤','🏅']

const IA_OPTIONS: { id: IALevel; nome: string; desc: string; icon: any }[] = [
  { id: 'sem_ia', nome: 'Sem IA', desc: 'Feito 100% por humanos', icon: UserLucide },
  { id: 'ajudou_ia', nome: 'IA ajudou', desc: 'Usei IA como assistente', icon: Zap },
  { id: 'feito_com_ia', nome: 'Feito com IA', desc: 'Criado majoritariamente com IA e revisado', icon: Bot },
  { id: '100_ia', nome: '100% IA', desc: 'Totalmente gerado por IA', icon: Atom },
]

function compressImage(file: File, maxDim = 1400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim/width, maxDim/height)
          width = Math.round(width*ratio); height = Math.round(height*ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AnunciarPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { init, create, loaded } = useUserProducts()
  const { isVerified, data: kycData } = useKYC()
  const { init: initCoupons, create: createCoupon, validatePercent } = useSellerCoupons()
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)

  // Novos estados: entrega do produto, tipo de anúncio, cupom obrigatório
  const [tipoAnuncio, setTipoAnuncio] = useState<'unico' | 'dinamico'>('unico')
  const [entregaAutomatica, setEntregaAutomatica] = useState(true)
  const [produtoArquivos, setProdutoArquivos] = useState<ProdutoArquivo[]>([])
  const [chavesList, setChavesList] = useState('') // para anúncio dinâmico (keys/assinaturas)
  const [cupomCode, setCupomCode] = useState('')
  const [cupomPercent, setCupomPercent] = useState('10')
  const produtoArquivosRef = useRef<HTMLInputElement>(null)
  const chavesRef = useRef<HTMLTextAreaElement>(null)

  // Dados do formulário
  const [titulo, setTitulo] = useState('')
  const [descricaoCurta, setDescricaoCurta] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [precoDe, setPrecoDe] = useState('')
  const [categorias, setCategorias] = useState<string[]>(['marketing'])
  const [emoji, setEmoji] = useState('🚀')
  const [tags, setTags] = useState('')
  const [iaLevel, setIaLevel] = useState<IALevel>('sem_ia')
  const [predominancia, setPredominancia] = useState<'brasil' | 'internacional' | ''>('')
  const [midia, setMidia] = useState<ProdutoMidia>({ fotos: [], arquivos: [] })
  const [videoUrl, setVideoUrl] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  // Refs dos inputs de arquivo
  const capaRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const fotosRef = useRef<HTMLInputElement>(null)
  const arquivosRef = useRef<HTMLInputElement>(null)

  useEffect(() => { init(); initCoupons() }, [init, initCoupons])

  const catPrincipal = categorias[0] || 'outro'
  const descLength = descricao.length
  const precoNum = parseFloat(preco.replace(',', '.')) || 0
  const precoDeNum = precoDe.trim() ? parseFloat(precoDe.replace(',', '.')) : null
  const desconto = precoDeNum && precoDeNum > precoNum ? Math.round((1 - precoNum / precoDeNum) * 100) : 0
  const tagsList = tags.split(/[,;\n]/).map(t => t.trim()).filter(Boolean).slice(0, 10)

  function toggleCategoria(id: string) {
    setCategorias(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev // mantém pelo menos 1
        return prev.filter(c => c !== id)
      }
      if (prev.length >= 5) { toast.error('Máximo de 5 categorias'); return prev }
      return [...prev, id]
    })
  }

  async function handleCapa(f?: File) {
    if (!f) return
    try {
      const dataUrl = await compressImage(f, 1600, 0.82)
      setMidia(m => ({ ...m, capa: dataUrl }))
      toast.success('Capa enviada!')
    } catch { toast.error('Erro na imagem') }
  }

  async function handleBanner(f?: File) {
    if (!f) return
    try {
      const dataUrl = await compressImage(f, 1920, 0.78)
      setMidia(m => ({ ...m, banner: dataUrl }))
      toast.success('Banner enviado!')
    } catch { toast.error('Erro no banner') }
  }

  async function handleFotos(files: FileList | null) {
    if (!files) return
    const room = 8 - midia.fotos.length
    const toAdd = Array.from(files).slice(0, room)
    if (toAdd.length === 0) { toast.error('Máximo de 8 fotos'); return }
    for (const f of toAdd) {
      try {
        const d = await compressImage(f, 1400, 0.78)
        setMidia(m => ({ ...m, fotos: [...m.fotos, d] }))
      } catch { /* skip */ }
    }
    toast.success(`${toAdd.length} foto(s) adicionada(s)!`)
  }

  function removeFoto(idx: number) {
    setMidia(m => ({ ...m, fotos: m.fotos.filter((_, i) => i !== idx) }))
  }

  async function handleArquivos(files: FileList | null) {
    if (!files) return
    const room = 5 - midia.arquivos.length
    const toAdd = Array.from(files).slice(0, room)
    if (toAdd.length === 0) { toast.error('Máximo 5 arquivos'); return }
    for (const f of toAdd) {
      if (f.size > 25 * 1024 * 1024) { toast.error(`${f.name} é maior que 25MB`); continue }
      const reader = new FileReader()
      reader.onload = () => {
        setMidia(m => ({
          ...m,
          arquivos: [...m.arquivos, {
            nome: f.name,
            tipo: f.type || 'application/octet-stream',
            sizeKb: Math.round(f.size / 1024),
            dataUrl: reader.result as string,
          }],
        }))
      }
      reader.readAsDataURL(f)
    }
    toast.success(`${toAdd.length} arquivo(s) adicionado(s)!`)
  }

  function removeArquivo(idx: number) {
    setMidia(m => ({ ...m, arquivos: m.arquivos.filter((_, i) => i !== idx) }))
  }

  async function handleProdutoArquivos(files: FileList | null) {
    if (!files) return
    if (tipoAnuncio === 'dinamico') {
      // Anúncio dinâmico: ler lista de chaves (arquivo .txt/.csv) ou texto direto
      const first = files[0]
      if (first) {
        const text = await first.text()
        setChavesList(prev => (prev ? prev + '\n' : '') + text)
        toast.success('Chaves carregadas!')
      }
      return
    }
    const room = 10 - produtoArquivos.length
    const toAdd = Array.from(files).slice(0, room)
    if (toAdd.length === 0) { toast.error('Máximo 10 arquivos por produto'); return }
    for (const f of toAdd) {
      if (f.size > 100 * 1024 * 1024) { toast.error(`${f.name} é maior que 100MB`); continue }
      const reader = new FileReader()
      reader.onload = () => {
        setProdutoArquivos(prev => [...prev, {
          nome: f.name,
          tipo: f.type || 'application/octet-stream',
          sizeKb: Math.round(f.size / 1024),
          dataUrl: reader.result as string,
        }])
      }
      reader.readAsDataURL(f)
    }
    toast.success(`${toAdd.length} arquivo(s) do produto adicionado(s)!`)
  }

  function removeProdutoArquivo(idx: number) {
    setProdutoArquivos(prev => prev.filter((_, i) => i !== idx))
  }

  function validar(): string | null {
    if (titulo.trim().length < 8) return 'Título deve ter pelo menos 8 caracteres'
    if (titulo.trim().length > 120) return 'Título muito longo (máx 120)'
    if (descricao.trim().length < 30) return 'Descrição deve ter pelo menos 30 caracteres'
    if (descricao.length > 65000) return 'Descrição muito longa (máx 65.000 caracteres)'
    if (isNaN(precoNum) || precoNum < 1 || precoNum > 99999) return 'Preço entre R$1 e R$99.999'
    if (precoDeNum && precoDeNum <= precoNum) return 'Preço "de" deve ser MAIOR que o preço atual'
    if (!categorias.length) return 'Selecione ao menos 1 categoria'
    if (tipoAnuncio === 'unico' && produtoArquivos.length === 0) return 'Adicione pelo menos 1 arquivo do produto que o comprador irá baixar'
    if (tipoAnuncio === 'dinamico') {
      const chaves = chavesList.split(/\n+/).map(s => s.trim()).filter(Boolean)
      if (chaves.length < 1) return 'Para anúncio dinâmico, adicione pelo menos 1 chave/ativação (uma por linha)'
    }
    // Cupom obrigatório: 2% a 70%
    const pct = parseFloat(cupomPercent.replace(',', '.'))
    const v = validatePercent(pct)
    if (!v.ok) return `Cupom obrigatório: ${v.error}`
    if (cupomCode.trim().length < 3) return 'Cupom obrigatório: informe um código com pelo menos 3 caracteres'
    return null
  }

  function publicar() {
    const err = validar()
    if (err) { toast.error(err); return }
    setEnviando(true)
    setTimeout(() => {
      try {
        const sellerName = kycData?.full_name || user?.email?.split('@')[0] || 'Você'
        // Merge de arquivos de galeria com o arquivo do produto (que o comprador recebe)
        const mergedArquivos = [...midia.arquivos]
        if (tipoAnuncio === 'unico') {
          for (const arq of produtoArquivos) {
            mergedArquivos.push({ ...arq, nome: `[ENTREGA] ${arq.nome}` })
          }
        } else if (tipoAnuncio === 'dinamico') {
          // Salva chaves como um arquivo .txt virtual
          const chaves = chavesList.split(/\n+/).map(s => s.trim()).filter(Boolean)
          const blob = new Blob([chaves.join('\n')], { type: 'text/plain' })
          // Salva também no store via atributos extras (descricao)
          mergedArquivos.push({
            nome: `[CHAVES] ${chaves.length} licencas.txt`,
            tipo: 'text/plain',
            sizeKb: Math.round(chaves.join('\n').length / 1024),
            dataUrl: 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(chaves.join('\n')))),
          })
        }
        const novo = create({
          titulo: titulo.trim(),
          descricao_curta: descricaoCurta.trim().slice(0, 180) || descricao.slice(0, 180),
          descricao: descricao.trim(),
          preco: precoNum,
          preco_de: precoDeNum,
          categoria: catPrincipal,
          categorias,
          vendedor_nome: sellerName,
          emoji,
          ia_level: iaLevel,
          predominancia: predominancia || null,
          tags: tagsList,
          midia: { ...midia, arquivos: mergedArquivos, videoUrl: videoUrl.trim() || undefined },
          estado: 'ativo',
        })
        // Cria cupom obrigatório
        try {
          createCoupon({
            code: cupomCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16),
            percent: parseFloat(cupomPercent.replace(',', '.')),
            productId: novo.id,
            sellerName,
            maxUses: 100,
          })
          toast.success('🎫 Cupom criado: ' + cupomCode.toUpperCase())
        } catch (ce: any) {
          toast.error('Cupom: ' + (ce?.message || 'inválido'))
        }
        setSucesso(novo.slug)
        toast.success('🚀 Produto publicado com sucesso!')
      } catch (e) {
        toast.error('Erro ao publicar. Tente novamente.')
      } finally {
        setEnviando(false)
      }
    }, 600)
  }

  // ── GATES ──
  if (!loaded) return null

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 sm:p-10 border border-brand-200 dark:border-brand-800 text-center max-w-md w-full shadow-xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/30">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Faça login para vender</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Para publicar produtos na Kiyvo você precisa estar logado e com identidade verificada (KYC).</p>
            <Link href="/login?redirect=/verificacao"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-7 py-4 font-black hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition shadow-lg pulse-glow">
              <UserIcon className="w-5 h-5" /> Entrar ou criar conta <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isVerified()) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 sm:p-10 border border-amber-200 dark:border-amber-800 text-center max-w-md w-full shadow-xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500 flex items-center justify-center mb-5">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Verificação de identidade</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Para vender na KIYVO você precisa completar a verificação KYC (CPF/CNPJ, selfie com documento, etc.)</p>
            <div className="text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 mb-6">
              <p className="flex gap-2">✅ <span>Nome completo + CPF/CNPJ válido</span></p>
              <p className="flex gap-2">✅ <span>Data nascimento (18+), nome da mãe + pai</span></p>
              <p className="flex gap-2">✅ <span>Endereço completo + CEP</span></p>
              <p className="flex gap-2">✅ <span>Selfie + documento + comprovante</span></p>
              <p className="flex gap-2">✅ <span>Aceite dos termos legais</span></p>
            </div>
            <Link href="/verificacao?next=/vender"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-7 py-4 font-black hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition shadow-lg pulse-glow">
              <ShieldCheck className="w-5 h-5" /> Fazer verificação agora <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-4">
              <Rocket className="w-3.5 h-3.5" /> Publicar produto
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Vender na KIYVO</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Preencha tudo com capricho — produtos com capa, galeria e descrição rica vendem <b>até 8x mais</b>.
            </p>
          </motion.div>

          {sucesso ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 sm:p-12 border-2 border-emerald-300 dark:border-emerald-700 text-center shadow-xl">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 15 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/40">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Publicado com sucesso! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Seu produto já está no catálogo com <b>boost</b> nas primeiras horas.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/p/${sucesso}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3 font-black shadow-lg">
                  <Eye className="w-4 h-4" /> Ver produto
                </Link>
                <button onClick={() => { setSucesso(null); setTitulo(''); setDescricao(''); setDescricaoCurta(''); setPreco(''); setPrecoDe(''); setCategorias(['marketing']); setTags(''); setMidia({ fotos: [], arquivos: [] }); setVideoUrl(''); }}
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/20 text-[#0F172A] dark:text-white rounded-full px-6 py-3 font-black">
                  <Plus className="w-4 h-4" /> Publicar outro
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {/* 1. Título */}
              <Card title="Título e descrição" icon={TypeIcon} num={1}>
                <div className="space-y-4">
                  <Field label="Título" hint={`${titulo.length}/120 caracteres`}>
                    <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={120}
                      placeholder="Ex: Pack 300 Templates Canva Premium para Instagram"
                      className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-2xl px-4 py-3.5 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-white/5 outline-none font-bold text-lg text-[#0F172A] dark:text-white transition" />
                  </Field>

                  <Field label="Descrição curta (opcional, linha fina)">
                    <input value={descricaoCurta} onChange={e => setDescricaoCurta(e.target.value)} maxLength={180}
                      placeholder="Uma frase que vende o produto em 2 segundos..."
                      className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 outline-none text-sm text-slate-700 dark:text-slate-300" />
                  </Field>

                  <Field label="Descrição completa" hint={`${descLength.toLocaleString('pt-BR')} / 65.000 caracteres`} error={descLength > 65000 ? 'Limite de 65.000 caracteres' : undefined}>
                    <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={10}
                      placeholder="Descreva seu produto detalhadamente: o que é, para quem serve, o que está incluído, como receberá, diferenciais, bônus, garantia..."
                      className={`w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border resize-y min-h-[200px] focus:bg-white dark:focus:bg-white/5 outline-none text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${descLength > 65000 ? 'border-red-400' : 'border-transparent focus:border-brand-500'}`} />
                  </Field>
                </div>
              </Card>

              {/* 2. Preço */}
              <Card title="Preço" icon={DollarSign} num={2}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preço" hint="R$1 – R$99.999" suffix="R$">
                    <input type="text" inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="29,90" className={inputCls} />
                  </Field>
                  <Field label="Preço DE (opcional)" hint="riscado, maior">
                    <input type="text" inputMode="decimal" value={precoDe} onChange={e => setPrecoDe(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="59,90" className={inputCls} />
                  </Field>
                </div>
                {desconto > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-black">
                    <Tag className="w-3.5 h-3.5" /> Desconto de {desconto}% aplicado
                  </motion.div>
                )}
                <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Taxas: 8% + R$0,50 por venda no plano Free. Seus recebíveis: <b>R$ {(Math.max(0, precoNum * 0.92 - 0.5)).toFixed(2).replace('.', ',')}</b> por unidade.
                </p>
              </Card>

              {/* 3. Identidade visual: emoji + capa */}
              <Card title="Identidade visual" icon={Palette} num={3}>
                <Field label="Emoji/ícone do produto">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {EMOJIS_POPULARES.map((e) => (
                      <button key={e} type="button" onClick={() => setEmoji(e)}
                        className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition ${emoji === e ? 'bg-brand-500 text-white shadow-lg scale-110' : 'bg-[#FAFAFA] dark:bg-[#0B0F1A] hover:bg-brand-50 dark:hover:bg-brand-500/10'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl">{emoji}</div>
                    <input value={emoji} onChange={e => setEmoji(e.target.value.slice(0, 4))} maxLength={4}
                      className="w-20 text-center bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-2 py-3 border border-transparent focus:border-brand-500 outline-none text-2xl" />
                    <span className="text-xs text-slate-400">ou digite um emoji</span>
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {/* CAPA */}
                  <MediaSlot label="Capa (proporção 1:1 ou 4:3)" hint="Obrigatória para destaque"
                    value={midia.capa} onClear={() => setMidia(m => ({ ...m, capa: undefined }))}
                    onPick={() => capaRef.current?.click()} ratio="aspect-square">
                    {!midia.capa && <ImageIcon className="w-8 h-8 text-slate-400" />}
                  </MediaSlot>
                  {/* BANNER */}
                  <MediaSlot label="Banner (destaque da página)" hint="Proporção 16:5"
                    value={midia.banner} onClear={() => setMidia(m => ({ ...m, banner: undefined }))}
                    onPick={() => bannerRef.current?.click()} ratio="aspect-[16/5]">
                    {!midia.banner && <ImageIcon className="w-8 h-8 text-slate-400" />}
                  </MediaSlot>
                </div>
                <input ref={capaRef} type="file" accept="image/*" onChange={e => handleCapa(e.target.files?.[0])} className="sr-only" />
                <input ref={bannerRef} type="file" accept="image/*" onChange={e => handleBanner(e.target.files?.[0])} className="sr-only" />
              </Card>

              {/* 4. Galeria de fotos */}
              <Card title="Galeria de fotos" icon={ImageIcon} num={4} hint="até 8 imagens">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {midia.fotos.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeFoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-brand-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">CAPA</span>}
                    </div>
                  ))}
                  {midia.fotos.length < 8 && (
                    <button type="button" onClick={() => fotosRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-brand-500 hover:text-brand-500 transition">
                      <UploadCloud className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Add foto</span>
                    </button>
                  )}
                </div>
                <input ref={fotosRef} type="file" accept="image/*" multiple onChange={e => handleFotos(e.target.files)} className="sr-only" />
              </Card>

              {/* 5. Vídeo + Arquivos */}
              <Card title="Vídeo e arquivos" icon={Package} num={5}>
                <Field label="URL do vídeo (YouTube, Vimeo ou link MP4)" hint="Opcional — aumenta conversão">
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl border border-transparent focus:border-brand-500 outline-none text-sm" />
                  </div>
                </Field>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    <Paperclip className="w-3.5 h-3.5" /> Arquivos para download ({midia.arquivos.length}/5)
                  </label>
                  {midia.arquivos.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {midia.arquivos.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl">
                          <Package className="w-5 h-5 text-brand-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{a.nome}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{a.sizeKb} KB • {a.tipo.split('/')[1] || a.tipo}</p>
                          </div>
                          <button onClick={() => removeArquivo(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {midia.arquivos.length < 5 && (
                    <button type="button" onClick={() => arquivosRef.current?.click()}
                      className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-1 text-slate-400 hover:border-brand-500 hover:text-brand-500 transition">
                      <UploadCloud className="w-7 h-7" />
                      <span className="text-xs font-black uppercase tracking-wider">Enviar arquivos</span>
                      <span className="text-[10px] text-slate-400">ZIP, PDF, MP4, etc. — máx 25MB/arquivo</span>
                    </button>
                  )}
                  <input ref={arquivosRef} type="file" multiple onChange={e => handleArquivos(e.target.files)} className="sr-only" />
                </div>
              </Card>

              {/* 6. Categorias (até 5) */}
              <Card title="Categorias" icon={Tag} num={6} hint={`${categorias.length}/5 selecionadas — toque para selecionar`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATS.map(c => {
                    const sel = categorias.includes(c.id)
                    const principal = categorias[0] === c.id
                    return (
                      <motion.button key={c.id} type="button" whileTap={{ scale: 0.96 }} onClick={() => toggleCategoria(c.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition border-2 ${
                          sel
                            ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                            : 'bg-white dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-300'
                        }`}>
                        <span className="text-lg">{c.emoji}</span>
                        <span className="flex-1 text-left text-xs">{c.nome}</span>
                        {principal && <span className="text-[8px] font-black bg-white/25 px-1 py-0.5 rounded">PRINC</span>}
                        {sel && !principal && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">A primeira categoria é a principal e onde seu produto vai aparecer mais.</p>
              </Card>

              {/* 7. Tags + IA + Predominância */}
              <Card title="Extras" icon={Sparkles} num={7}>
                <Field label="Tags (separadas por vírgula)" hint={`${tagsList.length}/10`}>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={tags} onChange={e => setTags(e.target.value)}
                      placeholder="ex: canva, instagram, templates, marketing, empreendedorismo"
                      className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl border border-transparent focus:border-brand-500 outline-none text-sm" />
                  </div>
                </Field>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsList.map((t, i) => <span key={i} className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">#{t}</span>)}
                  </div>
                )}

                <div className="mt-5">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    <Bot className="w-3.5 h-3.5" /> Nível de uso de IA
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {IA_OPTIONS.map(opt => {
                      const sel = iaLevel === opt.id
                      return (
                        <button key={opt.id} type="button" onClick={() => setIaLevel(opt.id)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition ${sel ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                          <opt.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${sel ? 'text-brand-500' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <p className={`text-xs font-black leading-tight ${sel ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.nome}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    <Globe className="w-3.5 h-3.5" /> Predominância / mercado-alvo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPredominancia('brasil')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-black text-sm transition ${predominancia === 'brasil' ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      🇧🇷 Brasil (PT-BR)
                    </button>
                    <button type="button" onClick={() => setPredominancia('internacional')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-black text-sm transition ${predominancia === 'internacional' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      🌍 Internacional
                    </button>
                  </div>
                </div>
              </Card>

              {/* 8. Tipo de anúncio + Arquivo do produto + Entrega */}
              <Card title="Entrega do produto" icon={Package} num={8} hint="obrigatório">
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    <FileDigit className="w-3.5 h-3.5" /> Tipo de anúncio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setTipoAnuncio('unico')}
                      className={`p-4 rounded-xl border-2 text-left transition ${tipoAnuncio === 'unico' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                      <div className={`text-lg mb-1 ${tipoAnuncio === 'unico' ? '' : 'opacity-60'}`}>📄</div>
                      <p className={`text-xs font-black ${tipoAnuncio === 'unico' ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>Anúncio Único</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Um ou mais arquivos entregues no momento da compra (ex: curso, pack, template).</p>
                    </button>
                    <button type="button" onClick={() => setTipoAnuncio('dinamico')}
                      className={`p-4 rounded-xl border-2 text-left transition ${tipoAnuncio === 'dinamico' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                      <div className={`text-lg mb-1 ${tipoAnuncio === 'dinamico' ? '' : 'opacity-60'}`}>🔑</div>
                      <p className={`text-xs font-black ${tipoAnuncio === 'dinamico' ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>Anúncio Dinâmico</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Chaves/licenças/assinaturas individuais — uma entrega por compra.</p>
                    </button>
                  </div>
                </div>

                {tipoAnuncio === 'unico' ? (
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <Download className="w-3.5 h-3.5" /> Arquivo(s) do produto (entregues ao comprador)
                    </label>
                    <button type="button" onClick={() => produtoArquivosRef.current?.click()}
                      className="w-full border-2 border-dashed border-brand-300 dark:border-brand-700 rounded-xl py-7 flex flex-col items-center gap-2 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition">
                      <UploadCloud className="w-7 h-7 text-brand-500" />
                      <p className="text-xs font-black text-brand-700 dark:text-brand-300">Enviar arquivo do produto</p>
                      <p className="text-[10px] text-slate-500">ZIP, PDF, MP4, MP3, PSD, etc — até 100MB cada, máximo 10 arquivos</p>
                    </button>
                    <input ref={produtoArquivosRef} type="file" multiple
                      onChange={e => handleProdutoArquivos(e.target.files)} className="sr-only" />
                    {produtoArquivos.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {produtoArquivos.map((a, i) => (
                          <li key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-lg p-2.5 text-xs">
                            <Package className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <span className="flex-1 truncate font-semibold text-slate-700 dark:text-slate-300">{a.nome}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{a.sizeKb}KB</span>
                            <button type="button" onClick={() => removeProdutoArquivo(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded p-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <FileDigit className="w-3.5 h-3.5" /> Chaves / licenças (uma por linha)
                    </label>
                    <textarea ref={chavesRef} value={chavesList} onChange={e => setChavesList(e.target.value)}
                      rows={6} placeholder={`ABCD-1234-EFGH-5678\nXXXX-YYYY-ZZZZ-1111\nWXYZ-9876-ABCD-4321\n...`}
                      className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 outline-none text-sm font-mono" />
                    <p className="text-[10px] text-slate-500 mt-2">
                      Estoque atual: <b className="text-slate-700 dark:text-slate-300">{chavesList.split(/\n+/).map(s => s.trim()).filter(Boolean).length}</b> chaves. Você pode subir um .txt/.csv também.
                    </p>
                    <button type="button" onClick={() => produtoArquivosRef.current?.click()}
                      className="mt-2 text-xs font-black text-brand-600 dark:text-brand-400 hover:underline">
                      📎 Importar de arquivo .txt/.csv
                    </button>
                    <input ref={produtoArquivosRef} type="file" accept=".txt,.csv"
                      onChange={e => handleProdutoArquivos(e.target.files)} className="sr-only" />
                  </div>
                )}

                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setEntregaAutomatica(v => !v)}
                    className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 text-left">
                      {entregaAutomatica ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">Entrega automática</p>
                        <p className="text-[10px] text-slate-500">O comprador recebe o download/chave imediatamente após aprovação do pagamento.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </Card>

              {/* 9. Cupom obrigatório */}
              <Card title="Cupom de desconto (obrigatório)" icon={Ticket} num={9} hint="2% a 70%">
                <p className="text-xs text-slate-500 mb-4 flex items-start gap-1.5">
                  <Gift className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-500" />
                  Para atrair mais clientes, todo produto deve ter um cupom de desconto entre <b>2% e 70%</b>. Ele será oferecido automaticamente na página do produto.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Field label="Código do cupom" hint="ex: BLACK10">
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={cupomCode} onChange={e => setCupomCode(e.target.value.toUpperCase())} maxLength={16}
                          placeholder="BLACK10"
                          className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl border border-transparent focus:border-brand-500 outline-none font-black uppercase tracking-wider text-lg" />
                      </div>
                    </Field>
                  </div>
                  <Field label="% desconto" hint="2 a 70">
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" min={2} max={70} value={cupomPercent} onChange={e => setCupomPercent(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl border border-transparent focus:border-brand-500 outline-none font-black text-lg" />
                    </div>
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[5, 10, 15, 20, 30, 50].map(v => (
                    <button type="button" key={v} onClick={() => setCupomPercent(String(v))}
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 transition ${cupomPercent === String(v) ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'}`}>
                      {v}%
                    </button>
                  ))}
                  <button type="button" onClick={() => setCupomCode('KIYVO' + Math.floor(Math.random() * 900 + 100))}
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-dashed border-brand-300 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20">
                    🎲 Gerar código
                  </button>
                </div>
              </Card>

              {/* Botão publicar */}
              <div className="pt-4">
                <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 p-[2px]">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    disabled={enviando} onClick={publicar}
                    className="w-full bg-[#0F172A] rounded-[14px] py-4.5 px-6 py-4 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                    {enviando ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" /> Publicando...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" /> Publicar produto agora
                      </>
                    )}
                  </motion.button>
                </div>
                <button type="button" onClick={() => setPreviewOpen(true)} className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-2">
                  <Eye className="w-3.5 h-3.5" /> Visualizar prévia
                </button>
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-3">
                  Ao publicar você concorda com os Termos de Uso e Política de Vendedor
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Modal prévia */}
      <AnimatePresence>
        {previewOpen && (
          <PreviewModal onClose={() => setPreviewOpen(false)} titulo={titulo} descricao={descricao} preco={precoNum} emoji={emoji} capa={midia.capa} desconto={desconto} />
        )}
      </AnimatePresence>
    </>
  )
}

const inputCls = 'w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-white/5 outline-none font-bold text-lg text-[#0F172A] dark:text-white transition'

function Card({ title, icon: Icon, num, hint, children }: { title: string; icon: any; num: number; hint?: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: num * 0.04 }}
      className="bg-white dark:bg-[#0F172A] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-black flex items-center justify-center">{num}</span>
        <Icon className="w-4 h-4 text-brand-500" />
        <h3 className="font-black text-[#0F172A] dark:text-white uppercase tracking-widest text-[11px]">{title}</h3>
        {hint && <span className="ml-auto text-[10px] text-slate-400 font-bold tracking-wider">{hint}</span>}
      </div>
      {children}
    </motion.div>
  )
}

function Field({ label, hint, error, suffix, children }: { label: string; hint?: string; error?: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
        {hint && <span className="text-[10px] text-slate-400 font-medium">{hint}</span>}
      </label>
      <div className="relative">
        {suffix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">{suffix}</span>}
        {suffix ? <div className="[&>input]:!pl-11">{children}</div> : children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  )
}

function MediaSlot({ label, hint, value, onPick, onClear, ratio, children }: { label: string; hint: string; value?: string; onPick: () => void; onClear: () => void; ratio: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      <button type="button" onClick={onPick}
        className={`relative w-full ${ratio} rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 transition flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A]`}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <span onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
              <X className="w-4 h-4" />
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            {children}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{hint}</span>
          </div>
        )}
      </button>
    </div>
  )
}

function PreviewModal({ onClose, titulo, descricao, preco, emoji, capa, desconto }: { onClose: () => void; titulo: string; descricao: string; preco: number; emoji: string; capa?: string; desconto: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#0F172A] rounded-[2rem] max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`aspect-[4/3] bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center relative`}>
          {capa ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capa} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">{emoji}</span>
          )}
          {desconto > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full">-{desconto}%</span>}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-black text-[#0F172A] dark:text-white mb-2">{titulo || 'Seu título aparecerá aqui'}</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-emerald-600">R$ {(preco * 0.95).toFixed(2).replace('.', ',')}</span>
            <span className="text-xs text-slate-400">no PIX</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">{descricao || 'A descrição do seu produto aparecerá aqui...'}</p>
          <div className="mt-5 flex gap-2">
            <button disabled className="flex-1 bg-slate-900 text-white rounded-full py-3 font-black text-sm">Comprar agora</button>
            <button disabled className="flex-1 border-2 border-slate-200 dark:border-slate-700 rounded-full py-3 font-black text-sm text-slate-600 dark:text-slate-300">Carrinho</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
