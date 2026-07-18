import { ChatClient } from '@/components/chat/ChatClient'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/ui/AdvancedAnimations'

// ─────────────────────────────────────────────────────────────
// KIYVO — Chat Page (Server Component)
// Delegou interatividade para ChatClient (use client)
// ─────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Mensagens',
  description: 'Converse com vendedores e compradores em tempo real. Chat seguro e protegido pela Kiyvo.',
}

export default function ChatPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6">
            Mensagens
          </h1>
        </FadeInOnScroll>
        <ChatClient />
      </div>
    </PageTransition>
  )
}
