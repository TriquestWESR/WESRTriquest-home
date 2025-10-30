import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const { supa } = guard
  
  const { data, error } = await supa.from('providers').select('*').order('created_at', {ascending:false})
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const body = await req.json() // {name}
  const { supa } = guard
  
  const { error } = await supa.from('providers').insert({ name: body.name, status: 'active' })
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json({ok:true})
}
