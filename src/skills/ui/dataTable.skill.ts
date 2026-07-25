// ─────────────────────────────────────────────────────────────
// DataTable Skill v0.0.1 — AG-KIT skill para data tables
// Config: sorting, filtering, pagination, row selection
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'

const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
  sortable: z.boolean().default(true),
  filterable: z.boolean().default(false),
  width: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).default('left'),
})

const dataTableSchema = z.object({
  columns: z.array(columnSchema).min(1),
  pageSize: z.number().default(20),
  selectable: z.boolean().default(false),
  searchable: z.boolean().default(true),
  emptyMessage: z.string().default('Nenhum registro encontrado'),
})

export type DataTableSkillInput = z.infer<typeof dataTableSchema>

export async function configureDataTable(input: DataTableSkillInput) {
  const validated = dataTableSchema.parse(input)
  return {
    component: 'DataTable',
    props: validated,
    metadata: {
      columns: validated.columns.length,
      pageSize: validated.pageSize,
      features: {
        sorting: validated.columns.some(c => c.sortable),
        filtering: validated.columns.some(c => c.filterable),
        selection: validated.selectable,
        search: validated.searchable,
      },
    },
  }
}
