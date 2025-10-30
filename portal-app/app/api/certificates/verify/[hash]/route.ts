import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: { hash: string } }) {
  const supa = supabaseService()
  const { hash } = ctx.params
  const { data: cert, error } = await supa.from('certificates').select('*').eq('verify_hash', hash).limit(1).single()
  if (error || !cert) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Minimal public payload
  return NextResponse.json({
    certificateId: cert.id,
    learnerId: cert.user_identifier,
    endorsements: cert.endorsements, // [{sectionId,version,grantedAt,expiresAt}]
    verifyHash: hash,
    createdAt: cert.created_at
  })
}
