import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export async function PUT(req: NextRequest, { params }:{ params:{ id:string } }) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const body = await req.json() // {status}
  const { supa } = guard
  
  const { error } = await supa.from('providers').update({ status: body.status }).eq('id', params.id)
  if (error) return NextResponse.json({error: error.message}, {status:500})
  return NextResponse.json({ok:true})
}
