import { NextRequest, NextResponse } from 'next/server'
import { requireProvider } from '@/lib/guards'
import { supabaseService } from '@/lib/supabase-server'
import { auditLog } from '@/lib/audit'
export async function POST(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { supa, user, providerId } = guard
  const body = await req.json()
  const { attempt_id, class_id, user_identifier, section_id, reason_category, narrative, evidence_url, esignature } = body
  if (!attempt_id || !class_id || !user_identifier || !section_id || !reason_category || !esignature) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  const { error } = await supa.from('override_logs').insert({
    attempt_id, class_id, user_identifier, section_id,
    reason_category, narrative, evidence_url,
    instructor_user_id: user.id, status: 'pending'
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await auditLog({ actor_user_id:user.id, actor_role:'INSTRUCTOR', action:'override_requested', target_table:'attempts', target_id:attempt_id, meta:{ section_id, reason_category } })
  return NextResponse.json({ ok: true })
}
