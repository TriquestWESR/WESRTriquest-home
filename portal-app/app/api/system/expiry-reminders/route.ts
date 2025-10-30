import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import { sendMail } from '@/lib/email'
import { auditLog } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const supa = supabaseService()
  const { searchParams } = new URL(req.url)
  const days = Math.max(1, parseInt(searchParams.get('days') || '30', 10))
  const dry = searchParams.get('dry') === '1'

  const soon = new Date(); soon.setDate(soon.getDate() + days)
  const now = new Date()

  // Fetch certificates; filter expiries in window on server side
  const { data, error } = await supa.from('certificates').select('id,user_identifier,endorsements')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const due: Array<{ id:string; user_identifier:string; expiresAt:string; sections:string[] }> = []
  for (const c of data || []) {
    const expiring = (c.endorsements||[]).filter((e:any)=>{
      const d = new Date(e.expiresAt)
      return d >= now && d <= soon
    })
    if (expiring.length > 0) {
      due.push({ id: c.id, user_identifier: c.user_identifier, expiresAt: expiring[0].expiresAt, sections: expiring.map((e:any)=>e.sectionId) })
    }
  }

  let sent = 0
  for (const row of due) {
    const to = row.user_identifier.includes('@') ? row.user_identifier : null
    if (!to) continue
    const html = `<p>Your WESR endorsements will expire on ${new Date(row.expiresAt).toLocaleDateString()}.</p><p>Sections: ${row.sections.join(', ')}</p>`
    if (!dry) {
      try {
        await sendMail(to, 'WESR certificate expiry reminder', html)
        await auditLog({ action:'expiry_reminder_sent', target_table:'certificates', target_id: row.id, meta: { to, sections: row.sections, expiresAt: row.expiresAt } })
        sent++
      } catch (e:any) {
        await auditLog({ action:'expiry_reminder_error', target_table:'certificates', target_id: row.id, meta: { error: e?.message || String(e) } })
      }
    }
  }

  return NextResponse.json({ scanned: data?.length||0, due: due.length, sent, dry })
}

export async function GET(req: NextRequest) {
  // Alias to POST for convenience
  return POST(req)
}
