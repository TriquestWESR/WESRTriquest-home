import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireProvider } from '@/lib/guards'

function courseCodeFrom(disciplines: string[]) {
  const d = (disciplines?.[0] || 'GEN').toUpperCase()
  const short = d.replace(/[^A-Z]/g,'').slice(0,3) || 'GEN'
  return `WTRQ-${short}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
}

export async function GET(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { supa, providerId } = guard
  const { data, error } = await supa
    .from('classes')
    .select('id, code, selected_sections, version_lock, created_at')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { supa, providerId } = guard
  const body = await req.json()
  const { disciplines = [], roles = [], selectedSections = [] } = body

  if (!selectedSections.length) {
    return NextResponse.json({ error: 'no_sections_selected' }, { status: 400 })
  }

  // Fetch current TR sections to build version lock and validate IDs
  const { data: trs, error: e1 } = await supa
    .from('tr_sections')
    .select('id, version, retired')
    .in('id', selectedSections)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  const invalid = (selectedSections as string[]).filter(id => !trs?.some(t => t.id === id && !t.retired))
  if (invalid.length) {
    return NextResponse.json({ error: 'invalid_sections', details: invalid }, { status: 400 })
  }

  const versionLock: Record<string,string> = {}
  trs?.forEach(t => { versionLock[t.id] = t.version })

  const code = courseCodeFrom(disciplines)

  const { error: e2 } = await supa.from('classes').insert({
    provider_id: providerId,
    code,
    selected_sections: selectedSections,
    version_lock: versionLock
  })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ ok: true, code, selectedSections, versionLock })
}
 
