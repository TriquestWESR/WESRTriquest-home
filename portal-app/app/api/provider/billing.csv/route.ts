import { NextRequest } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import { requireProvider } from '@/lib/guards'
import { stringify } from 'csv-stringify/sync'
export async function GET(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof Response) return guard
  const { supa, providerId } = guard
  const url = new URL(req.url)
  const month = url.searchParams.get('month')
  let q = supa.from('billing_usage').select('triggered_at, class_id, user_identifier').eq('provider_id', providerId)
  if (month) q = q.gte('triggered_at', month + '-01').lt('triggered_at', month + '-31')
  const { data, error } = await q
  if (error) return new Response('err', { status: 500 })
  const csv = stringify((data||[]).map((r:any)=>({
    TriggeredAt: new Date(r.triggered_at).toISOString(),
    ClassId: r.class_id,
    UserIdentifier: r.user_identifier
  })), { header: true })
  return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="wesr-billing.csv"' }})
}
