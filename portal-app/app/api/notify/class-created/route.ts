import { NextRequest, NextResponse } from 'next/server'
import { requireProvider } from '@/lib/guards'
import { sendMail } from '@/lib/email'
import { auditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const guard = await requireProvider(req)
  // If guard returned a Response (unauthorized/forbidden), pass it through
  if (guard instanceof NextResponse) return guard
  const { user, providerId } = guard

  const { code, classId } = await req.json()
  if (!code) return NextResponse.json({ error: 'missing_code' }, { status: 400 })

  // Email the provider user (if email available)
  const link = `${process.env.NEXT_PUBLIC_PORTAL_BASE ?? ''}/provider/classes`
  if (user?.email) {
    await sendMail(
      user.email,
      'WESR Triquest — Class created',
      `<p>Your class has been created. Course Code: <b>${code}</b></p><p>View classes: <a href="${link}">${link}</a></p>`
    )
    await auditLog({ actor_user_id: user.id, actor_role: 'PROVIDER', action: 'email_class_created', meta: { code } })
  }

  // Record an audit entry for class creation
  await auditLog({ action: 'class_created', actor_role: 'PROVIDER', target_table: 'classes', target_id: classId || null, meta: { providerId, code } })

  return NextResponse.json({ ok: true })
}
