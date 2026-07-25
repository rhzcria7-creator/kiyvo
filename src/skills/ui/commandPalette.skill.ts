// ─────────────────────────────────────────────────────────────
// CommandPalette Skill v0.0.1 — AG-KIT skill para Cmd+K
// Config: search, quick actions, categories, recent
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'

const actionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(), // lucide icon name
  type: z.enum(['action', 'category', 'recent']),
  shortcut: z.string().optional(),
})

const commandPaletteSchema = z.object({
  placeholder: z.string().default('Buscar produtos, categorias, ações...'),
  items: z.array(actionItemSchema).optional(),
  recentSearches: z.boolean().default(true),
  maxRecent: z.number().default(5),
})

export type CommandPaletteSkillInput = z.infer<typeof commandPaletteSchema>

export async function configureCommandPalette(input: CommandPaletteSkillInput) {
  const validated = commandPaletteSchema.parse(input)
  return {
    component: 'CommandPalette',
    props: validated,
    metadata: {
      itemsCount: validated.items?.length || 0,
      features: ['keyboard_nav', 'recent_searches', 'quick_actions'],
    },
  }
}
