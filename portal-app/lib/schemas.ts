import { z } from 'zod'

export const TRSectionImportSchema = z.object({
  id: z.string().min(2),                          // e.g., "TR-A"
  title: z.string().min(2),
  version: z.string().default('1.0.0'),
  question_count: z.coerce.number().int().min(1),
  disciplines: z.string().optional().default(''), // comma-separated
  roles: z.string().optional().default('')        // comma-separated
})
export type TRSectionImport = z.infer<typeof TRSectionImportSchema>

export const QuestionImportSchema = z.object({
  id: z.string().min(3),                          // unique ID (your namespace)
  locale: z.string().default('en'),
  type: z.enum(['mcq','multi']),
  prompt: z.string().min(5),
  choices: z.string().min(3),                     // pipe-separated: "A|B|C|D"
  answer_key: z.string().min(1),                  // comma-separated numeric indices, 0-based
  section_tags: z.string().min(2),                // comma-separated TR section IDs, e.g., "TR-A,TR-B"
  difficulty: z.coerce.number().int().min(1).max(3),
  retired: z.coerce.boolean().default(false)
})
export type QuestionImport = z.infer<typeof QuestionImportSchema>

// Helpers to normalize
export function splitList(s?: string): string[] {
  return (s||'').split(',').map(x=>x.trim()).filter(Boolean)
}
export function splitChoices(s: string): string[] {
  return s.split('|').map(x=>x.trim())
}
export function splitAnswerKey(s: string): number[] {
  return s.split(',').map(x=>Number(x.trim())).filter(n=>Number.isFinite(n))
}
