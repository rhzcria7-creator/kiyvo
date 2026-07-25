// ─────────────────────────────────────────────────────────────
// Bento Grid Skill v0.0.1 — AG-KIT skill para grid de 12 cols
// Layout configurável com cards de tamanhos variados
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'

const bentoCardSchema = z.object({
  id: z.string(),
  size: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string(), // JSX or component name
  gradient: z.boolean().default(false),
})

const bentoGridSchema = z.object({
  cards: z.array(bentoCardSchema).min(1).max(20),
  cols: z.number().default(12),
  gap: z.number().default(4),
})

export type BentoGridSkillInput = z.infer<typeof bentoGridSchema>

export async function renderBentoGrid(input: BentoGridSkillInput) {
  const validated = bentoGridSchema.parse(input)
  return {
    component: 'BentoGrid',
    props: {
      cards: validated.cards.map(c => ({
        ...c,
        colSpan: c.size === 'full' ? 12 : c.size === 'xl' ? 8 : c.size === 'lg' ? 6 : c.size === 'md' ? 4 : 3,
        rowSpan: c.size === 'xl' || c.size === '2xl' ? 2 : 1,
      })),
      className: `grid grid-cols-6 md:grid-cols-${validated.cols} gap-${validated.gap}`,
    },
    metadata: {
      cardCount: validated.cards.length,
      layout: validated.cards.map(c => c.size).join('-'),
    },
  }
}
