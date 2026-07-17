'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard, MorphingBlob, NumberTicker } from '@/components/ui/AdvancedAnimations'

const testimonials = [
  { id: '1', name: 'João Silva', username: '@pixelking', avatar: 'https://picsum.photos/seed/t1/80/80', role: 'Vendedor Diamante', rating: 5, text: 'A Kiyvo transformou minha renda. Vendo templates e licenças e já faturei mais de R$ 50 mil. A plataforma é incrível!', product: 'Templates Canva', earnings: 'R$ 52.000+' },
  { id: '2', name: 'Ana Costa', username: '@anacosta', avatar: 'https://picsum.photos/seed/t2/80/80', role: 'Compradora Verificada', rating: 5, text: 'Comprei Windows 11, Office 365 e um curso de programação. Tudo entregue na hora, preços imbatíveis. Recomendo demais!', product: 'Software & Cursos', earnings: '' },
  { id: '3', name: 'Pedro Santos', username: '@pedrodev', avatar: 'https://picsum.photos/seed/t3/80/80', role: 'Vendedor Ouro', rating: 5, text: 'Vendo cursos de programação na Kiyvo há 2 anos. A verificação de identidade dá credibilidade e os clientes confiam mais.', product: 'Cursos Online', earnings: 'R$ 28.000+' },
  { id: '4', name: 'Marina Oliveira', username: '@marina', avatar: 'https://picsum.photos/seed/t4/80/80', role: 'Vendedora Diamante', rating: 5, text: 'Comecei vendendo e-books e hoje tenho uma loja com 50+ produtos digitais. A Kiyvo é o melhor marketplace do Brasil.', product: 'E-books & PDFs', earnings: 'R$ 35.000+' },
  { id: '5', name: 'Lucas Ferreira', username: '@lucasf', avatar: 'https://picsum.photos/seed/t5/80/80', role: 'Comprador Verificado', rating: 5, text: 'Melhor lugar pra comprar licenças de software. Preço justo, entrega automática e suporte top. Já fiz 30+ compras.', product: 'Software', earnings: '' },
  { id: '6', name: 'Beatriz Lima', username: '@bialima', avatar: 'https://picsum.photos/seed/t6/80/80', role: 'Vendedora Ouro', rating: 4, text: 'Vendo designs e templates. A plataforma é muito fácil de usar e o sistema de KD Points incentiva os clientes a voltar.', product: 'Design & Templates', earnings: 'R$ 18.000+' },
  { id: '7', name: 'Rafael Mendes', username: '@rafamendes', avatar: 'https://picsum.photos/seed/t7/80/80', role: 'Comprador e Vendedor', rating: 5, text: 'Compro e vendo na Kiyvo. Como comprador, me sinto seguro com a garantia. Como vendedor, a plataforma é super profissional.', product: 'Diversos', earnings: 'R$ 12.000+' },
  { id: '8', name: 'Carla Souza', username: '@carlas', avatar: 'https://picsum.photos/seed/t8/80/80', role: 'Vendedora Prata', rating: 5, text: 'Comecei há 3 meses e já vendi mais de 200 e-books. A Kiyvo realmente entrega o que promete.', product: 'E-books', earnings: 'R$ 6.500+' },
]

const stats = [
  { label: 'Vendedores ativos', value: 45000, suffix: '+' },
  { label: 'Avaliação média', value: 4.8, suffix: '/5' },
  { label: 'Satisfação', value: 97, suffix: '%' },
]

export default function DepoimentosPage() {
  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative">
        <FadeInOnScroll className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">
            O que dizem sobre a Kiyvo
          </h1>
          <p className="text-surface-500 mt-3 max-w-lg mx-auto">
            Milhares de vendedores e compradores confiam na Kiyvo todos os dias
          </p>
        </FadeInOnScroll>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          {stats.map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.1} className="text-center">
              <p className="font-display font-extrabold text-3xl text-brand-600">
                <NumberTicker value={stat.value} />{stat.suffix}
              </p>
              <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <TiltCard>
                <div className="card-base p-6 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-100" />
                      <div>
                        <p className="font-display font-bold text-surface-900">{t.name}</p>
                        <p className="text-xs text-surface-400">{t.role}</p>
                      </div>
                    </div>
                    <Quote size={24} className="text-brand-200 shrink-0" />
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-surface-600 leading-relaxed">{t.text}</p>
                  {t.earnings && (
                    <div className="mt-4 pt-3 border-t border-surface-100">
                      <p className="text-xs text-surface-400">Faturamento na Kiyvo</p>
                      <p className="font-display font-extrabold text-emerald-600">{t.earnings}</p>
                    </div>
                  )}
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}
