import { NextRequest, NextResponse } from 'next/server'
import { requireProvider } from '@/lib/guards'
import { supabaseService } from '@/lib/supabase-server'
export async function GET(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { supa, providerId } = guard
  // attempts for classes of this provider with any section score < pass
  const { data: cfg } = await supa.from('admin_config').select('*').limit(1).single()
  const pass = cfg?.pass_threshold ?? 0.80
  const { data: classes } = await supa.from('classes').select('id').eq('provider_id', providerId)
  const classIds = (classes||[]).map((c:any)=>c.id)
  if (classIds.length===0) return NextResponse.json({ rows: [] })
  const { data: attempts } = await supa.from('attempts').select('*').in('class_id', classIds).order('completed_at', {ascending:false}).limit(200)
  const rows = (attempts||[]).map((a:any)=>{
    const fails = Object.entries(a.section_scores||{}).filter(([_,sc]:any)=> (sc||0) < pass).map(([sid])=>sid)
    return { id:a.id, user_identifier:a.user_identifier, class_id:a.class_id, failed_sections:fails, completed_at:a.completed_at }
  }).filter((r:any)=>r.failed_sections.length>0)
  return NextResponse.json({ rows })
}
