import { supabaseService } from './supabase-server'
import { shuffle } from './random'
import type { AdminConfig, ClassRow, Question, TRSection } from './types'

type BlueprintItem = { qId:string; sectionId:string; prompt:string; choices:string[]; type:'mcq'|'multi' }
export type BlueprintResponse = {
  classId:string; providerId:string; code:string;
  sections: { id:string; title:string; count:number }[];
  items: BlueprintItem[];
}

export async function buildBlueprintByCode(code:string, locale='en'): Promise<BlueprintResponse> {
  const supa = supabaseService()

  // Load class
  const { data: klass, error: cErr } = await supa.from('classes').select('*').eq('code', code).limit(1).single()
  if (cErr || !klass) throw new Error('class_not_found')

  // Load admin config + TR sections
  const { data: cfg, error: aErr } = await supa.from('admin_config').select('*').limit(1).single()
  if (aErr || !cfg) throw new Error('config_error')

  const { data: sections, error: sErr } = await supa
    .from('tr_sections')
    .select('*')
    .in('id', (klass as ClassRow).selected_sections)
    .eq('retired', false)
  if (sErr) throw new Error('sections_error')

  // Pull candidate questions (server-side only) per section
  const items: BlueprintItem[] = []
  const sectionSumm: { id:string; title:string; count:number }[] = []

  for (const s of sections as TRSection[]) {
    const count = s.question_count
    sectionSumm.push({ id:s.id, title:s.title, count })

    // fetch questions for this section, by difficulty
    const { data: qEasy } = await supa
      .from('questions').select('*')
      .contains('section_tags', [s.id])
      .eq('retired', false).eq('locale', locale).eq('difficulty', 1)
    const { data: qMed } = await supa
      .from('questions').select('*')
      .contains('section_tags', [s.id])
      .eq('retired', false).eq('locale', locale).eq('difficulty', 2)
    const { data: qHard } = await supa
      .from('questions').select('*')
      .contains('section_tags', [s.id])
      .eq('retired', false).eq('locale', locale).eq('difficulty', 3)

    const mix = cfg.difficulty_mix as AdminConfig['difficulty_mix']
    const needEasy = Math.max(0, Math.round(count * (mix.easy ?? 0)))
    const needMed  = Math.max(0, Math.round(count * (mix.medium ?? 0)))
    let picked: Question[] = []

    picked = picked.concat(shuffle(qEasy || []).slice(0, needEasy))
    picked = picked.concat(shuffle(qMed || []).slice(0, needMed))
    // fill remainder with hard
    const remainder = Math.max(0, count - picked.length)
    picked = picked.concat(shuffle(qHard || []).slice(0, remainder))

    // if still short (e.g., not enough items), backfill from any difficulty without exposing answers
    if (picked.length < count) {
      const { data: qAny } = await supa.from('questions').select('*').contains('section_tags', [s.id]).eq('retired', false).eq('locale', locale)
      const ids = new Set(picked.map(p=>p.id))
      const extras = shuffle((qAny||[]).filter(q=>!ids.has(q.id))).slice(0, count - picked.length)
      picked = picked.concat(extras)
    }

    // convert to answerless items and randomize choices
    for (const q of shuffle(picked).slice(0, count)) {
      const idx = shuffle([...q.choices.map((_,i)=>i)])
      const remappedChoices = idx.map(i => q.choices[i])
      // store choice index mapping via data attribute at submit time by comparing choice text positions
      items.push({
        qId: q.id,
        sectionId: s.id,
        prompt: q.prompt,
        choices: remappedChoices,
        type: q.type
      })
    }
  }

  return {
    classId: (klass as ClassRow).id,
    providerId: (klass as ClassRow).provider_id,
    code,
    sections: sectionSumm,
    items
  }
}
