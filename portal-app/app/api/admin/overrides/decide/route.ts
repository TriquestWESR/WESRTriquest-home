import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { auditLog } from '@/lib/audit'
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard instanceof NextResponse) return guard
  const { supa, user } = guard
  const { id, decision } = await req.json() // decision: 'approved'|'rejected'
  if (!id || !['approved','rejected'].includes(decision)) return NextResponse.json({ error:'bad_request' }, { status:400 })
  const { error } = await supa.from('override_logs').update({ status: decision, decided_by: user.id, decided_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await auditLog({ actor_user_id:user.id, actor_role:'WESR_ADMIN', action:'override_'+decision, target_table:'override_logs', target_id:id })
  return NextResponse.json({ ok:true })
}
