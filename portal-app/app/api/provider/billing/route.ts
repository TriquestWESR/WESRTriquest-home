import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import { requireProvider } from '@/lib/guards'
export async function GET(req: NextRequest) {
  const guard = await requireProvider(req); if (guard instanceof NextResponse) return guard
  const { supa, providerId } = guard
  const url = new URL(req.url)
  const month = url.searchParams.get('month') // YYYY-MM
  let q = supa.from('billing_usage').select('triggered_at, class_id, user_identifier').eq('provider_id', providerId)
  if (month) q = q.gte('triggered_at', month + '-01').lt('triggered_at', month + '-31')
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data || [] })
}
