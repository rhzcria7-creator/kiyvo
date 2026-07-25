// v0.0.1 — Contrato mínimo e testável para skills de domínio.
import { z } from 'zod'

export interface Skill<I, O> {
  name: string
  description: string
  inputSchema: z.ZodType<I>
  run(input: I): Promise<O> | O
}

export function runSkill<I, O>(skill: Skill<I, O>, input: unknown): Promise<O> | O {
  return skill.run(skill.inputSchema.parse(input))
}
