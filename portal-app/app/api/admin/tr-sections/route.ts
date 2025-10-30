import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const { supa } = guard
  
  const search = new URL(req.url).searchParams
  const includeRetired = search.get('includeRetired') === '1'
  const q = supa.from('tr_sections').select('*').order('id')
  const { data, error } = includeRetired ? await q : await q.eq('retired', false)
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const body = await req.json()
  const { supa } = guard
  
  const { error } = await supa.from('tr_sections').insert({
    id: body.id,
    title: body.title,
    version: body.version || '1.0.0',
    disciplines: body.disciplines || [],
    roles: body.roles || [],
    question_count: body.question_count,
    retired: false
  })
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json({ok:true})
}
