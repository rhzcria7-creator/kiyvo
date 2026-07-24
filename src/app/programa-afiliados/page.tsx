import type { Metadata } from 'next'
import ProgramaAfiliadosClient from './ProgramaAfiliadosClient'

export const metadata: Metadata = {
  title: 'Programa de Afiliados KIYVO — até 70% de comissão | KIYVO',
  description: 'Seja afiliado KIYVO: ganhe até 70% de comissão por cada venda, saque em 1 dia útil via PIX.',
  keywords: ['afiliado', 'programa de afiliados', 'kiyvo afiliado'],
  alternates: { canonical: 'https://kiyvo.com.br/programa-afiliados' },
}

export default function Page() { return <ProgramaAfiliadosClient /> }
