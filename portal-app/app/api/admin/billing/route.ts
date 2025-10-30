import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard instanceof NextResponse) return guard
  const { supa } = guard
  const url = new URL(req.url)
  const month = url.searchParams.get('month')
  let q = supa.from('v_billing_monthly').select('*')
  if (month) q = q.eq('month_start', month + '-01')
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data||[] })
}
