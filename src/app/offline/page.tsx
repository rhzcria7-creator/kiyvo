import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5"><section className="w-full rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111827]"><WifiOff className="mx-auto h-10 w-10 text-brand-500"/><h1 className="mt-5 text-2xl font-black text-[#0F172A] dark:text-white">Você está sem conexão</h1><p className="mt-3 text-sm leading-6 text-slate-500">Alguns conteúdos salvos continuam disponíveis. Reconecte-se para atualizar pedidos, pagamentos e entregas.</p><Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#0F172A] px-6 py-3 font-black text-white">Tentar novamente</Link></section></main>
}
