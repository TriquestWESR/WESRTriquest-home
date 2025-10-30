import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { parseCSV } from '@/lib/csv'
import { QuestionImportSchema, splitChoices, splitAnswerKey, splitList } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard instanceof NextResponse) return guard
  const { supa } = guard
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error:'no_file' }, { status:400 })

  const text = await file.text()
  const ext = (file.name.split('.').pop()||'').toLowerCase()
  let rows:any[]=[]
  try{
    rows = (ext==='json') ? JSON.parse(text) : parseCSV(text)
  }catch(e:any){ return NextResponse.json({ error:'parse_error', details:e?.message }, { status:400 }) }

  const valid:any[]=[]; const errors:any[]=[]
  for (let i=0;i<rows.length;i++){
    const r = rows[i]
    const parsed = QuestionImportSchema.safeParse(r)
    if (!parsed.success){ errors.push({ index:i, issues:parsed.error.issues }); continue }
    const v = parsed.data
    // Normalize and basic checks
    const choices = splitChoices(v.choices)
    const key = splitAnswerKey(v.answer_key)
    const maxIdx = choices.length - 1
    const bad = key.some(k => k<0 || k>maxIdx)
    if (bad){ errors.push({ index:i, issues:[{path:['answer_key'], message:'answer indexes out of range'}]}); continue }

    valid.push({
      id: v.id,
      locale: v.locale || 'en',
      type: v.type,
      prompt: v.prompt,
      choices,
      answer_key: key,
      section_tags: splitList(v.section_tags),
      difficulty: v.difficulty,
      retired: v.retired ?? false
    })
  }
  if (valid.length===0) return NextResponse.json({ error:'no_valid_rows', details:errors }, { status:400 })

  const { error } = await supa.from('questions').upsert(valid, { onConflict: 'id' })
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ inserted: valid.length, skipped: rows.length - valid.length, details: errors })
}
