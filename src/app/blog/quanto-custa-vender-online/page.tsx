import type { Metadata } from 'next'
import Link from 'next/link'
import { BlogPost } from '@/components/blog/BlogPost'
import { JsonLdArticle } from '@/components/blog/JsonLdArticle'

export const metadata: Metadata = {
  title: 'Quanto Custa Vender Produtos Digitais em 2026? (todos os custos) | KIYVO',
  description: 'Custos reais para vender cursos online em 2026: plataforma, gateway, anúncios, ferramentas e impostos. Simulação com lucro líquido.',
  keywords: ['custo venda online', 'quanto custa hotmart', 'taxas plataforma digital'],
  alternates: { canonical: 'https://kiyvo.com.br/blog/quanto-custa-vender-online' },
}

export default function Post() {
  return (
    <>
      <JsonLdArticle
        titulo="Quanto custa vender produtos digitais em 2026? Todos os custos revelados"
        descricao="Da taxa de plataforma ao imposto, quanto REALMENTE sobra de lucro em cada venda."
        autor="Equipe KIYVO"
        data="2026-07-21"
        url="https://kiyvo.com.br/blog/quanto-custa-vender-online"
      />
      <BlogPost
        titulo="Quanto custa vender produtos digitais em 2026? Todos os custos revelados"
        subtitulo="Da taxa de plataforma ao imposto de renda: quanto REALMENTE sobra de lucro em cada venda de R$97, R$297 e R$997?"
        autor="Equipe KIYVO"
        data="21 de julho de 2026"
        tempoLeitura="8 min"
        categoria="Monetização"
        tags={['custos', 'taxas', 'lucro real', 'precificação']}
      >
        <p>Vender produtos digitais no Brasil em 2026 é barato comparado a loja física, mas existem custos escondidos que podem comer metade do seu faturamento.</p>
        <h2>1. Taxa da plataforma</h2>
        <ul>
          <li><strong>Hotmart:</strong> 10,99% + R$1,00</li>
          <li><strong>Monetizze:</strong> 9,9% + R$1,00</li>
          <li><strong>Eduzz:</strong> 9,9% + R$1,00</li>
          <li><strong>Kiwify:</strong> 12% + R$1,00</li>
          <li><strong>KIYVO:</strong> 8% + R$0,50 com teto de R$50</li>
        </ul>
        <p>Em um produto de <strong>R$97</strong>, KIYVO cobra R$8,26 contra R$12,64 da Kiwify. Em <strong>R$997</strong>, KIYVO cobra R$50 e Hotmart R$110,57.</p>
        <h2>2. Taxa do gateway (Stripe/Pagar.me)</h2>
        <ul><li>PIX: 0-1%</li><li>Cartão à vista: 3,5-5%</li><li>Cartão parcelado: +1,5-2% ao mês</li></ul>
        <h2>3. Imposto</h2>
        <p>Reserve <strong>10% do faturamento</strong> para IRPF ou Simples Nacional.</p>
        <h2>4. Tráfego pago (CPA)</h2>
        <p>Em nichos de marketing digital, CPA de R$15-R$40 é comum.</p>
        <h2>Simulação real de lucro (R$97, cartão, KIYVO, CPA R$15)</h2>
        <ul>
          <li>Preço: R$97,00</li>
          <li>(-) Taxa KIYVO: R$8,26</li>
          <li>(-) Stripe: R$4,26</li>
          <li>(-) Imposto 10%: R$9,70</li>
          <li>(-) CPA: R$15,00</li>
          <li><strong>Lucro líquido: R$59,78 (61,6%)</strong></li>
        </ul>
        <h2>Calcule de graça</h2>
        <p>Use nossa <Link href="/calcular-taxas">calculadora de lucro real</Link> que calcula tudo automaticamente.</p>
        <h2>Conclusão</h2>
        <p>Vender online é lucrativo (40-65% margem líquida), mas a soma de taxas pequenas importa. <Link href="/cadastro">Cadastre-se na KIYVO</Link> e pague só 8%.</p>
      </BlogPost>
    </>
  )
}
