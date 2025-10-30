import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { parseCSV } from '@/lib/csv'
import { TRSectionImportSchema, splitList } from '@/lib/schemas'

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

  const valid:any[] = []; const errors:any[]=[]
  for (let i=0;i<rows.length;i++){
    const r = rows[i]
    const parsed = TRSectionImportSchema.safeParse(r)
    if (!parsed.success){ errors.push({ index:i, issues:parsed.error.issues }); continue }
    const v = parsed.data
    valid.push({
      id: v.id,
      title: v.title,
      version: v.version || '1.0.0',
      question_count: v.question_count,
      disciplines: splitList(v.disciplines?.replace(/;/g,',')),
      roles: splitList(v.roles?.replace(/;/g,',')),
      retired: false
    })
  }
  if (valid.length===0) return NextResponse.json({ error:'no_valid_rows', details:errors }, { status:400 })

  const { error } = await supa.from('tr_sections').upsert(valid, { onConflict: 'id' })
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ inserted: valid.length, skipped: rows.length - valid.length, details: errors })
}
