import { NextRequest, NextResponse } from 'next/server'
import { requireProvider } from '@/lib/guards'
import { sendMail } from '@/lib/email'
import { auditLog } from '@/lib/audit'
export async function POST(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { user } = guard
  const { email, code, userId } = await req.json()
  if (!email || !code || !userId) return NextResponse.json({error:'missing_fields'},{status:400})
  const link = `${process.env.NEXT_PUBLIC_PORTAL_BASE ?? ''}/exam/start`
  await sendMail(email, 'WESR Exam — Your access', `<p>You have been assigned an exam.</p><p>User ID: <b>${userId}</b><br/>Course Code: <b>${code}</b></p><p>Start here: <a href="${link}">${link}</a></p>`)
  await auditLog({ actor_user_id:user.id, actor_role:'PROVIDER', action:'email_exam_invite', meta:{ email, code, userId } })
  return NextResponse.json({ok:true})
}
