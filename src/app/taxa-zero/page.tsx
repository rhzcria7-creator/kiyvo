import type { Metadata } from 'next'
import TaxaZeroClient from './TaxaZeroClient'

export const metadata: Metadata = {
  title: 'Taxa Zero KIYVO: até 5.000 primeiras vendas isentas | KIYVO',
  description: 'Novos vendedores: até 5.000 primeiras vendas com taxa ZERO de plataforma (só cobramos custo do gateway).',
  alternates: { canonical: 'https://kiyvo.com.br/taxa-zero' },
}

export default function TaxaZeroPage() {
  return <TaxaZeroClient />
}
