import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard instanceof NextResponse) return guard
  const { supa } = guard
  const { data, error } = await supa.from('override_logs').select('*').order('created_at', {ascending:false}).limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data||[] })
}
