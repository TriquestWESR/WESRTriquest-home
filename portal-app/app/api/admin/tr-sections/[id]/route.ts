import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export async function PUT(_req: NextRequest, { params }:{ params:{ id:string } }) {
  const guard = await requireAdmin(_req)
  if (guard instanceof NextResponse) return guard
  const body = await _req.json()
  const { supa } = guard
  
  const { error } = await supa.from('tr_sections').update({
    title: body.title,
    version: body.version,
    disciplines: body.disciplines,
    roles: body.roles,
    question_count: body.question_count,
    retired: body.retired ?? false
  }).eq('id', params.id)
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json({ok:true})
}

export async function DELETE(_req: NextRequest, { params }:{ params:{ id:string } }) {
  const guard = await requireAdmin(_req)
  if (guard instanceof NextResponse) return guard
  const { supa } = guard
  
  const { error } = await supa.from('tr_sections').update({ retired: true }).eq('id', params.id)
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json({ok:true})
}
