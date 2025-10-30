import { NextRequest } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import { buildCertificatePDF } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: { hash: string } }) {
  const supa = supabaseService()
  const { hash } = ctx.params
  const { data: cert, error } = await supa.from('certificates').select('*').eq('verify_hash', hash).limit(1).single()
  if (error || !cert) return new Response('Not found', { status: 404 })

  const verifyUrl = `${process.env.NEXT_PUBLIC_PORTAL_BASE ?? ''}/verify/${hash}`

  const pdf = await buildCertificatePDF({
    learnerId: cert.user_identifier,
    certificateId: cert.id,
    verifyUrl,
    endorsements: cert.endorsements || [],
    branding: { title: 'WESR Triquest — Certificate', subtitle: 'Training Requirements Endorsements' }
  })

  const bytes = new Uint8Array(pdf)
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="wesr-certificate-${hash}.pdf"`
    }
  })
}
