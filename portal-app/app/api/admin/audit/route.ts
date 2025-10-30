import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if ('json' in guard) return guard as any
  const { supa } = guard

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 1000)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
  const offset = (page - 1) * limit

  const action = searchParams.get('action') || undefined
  const actor = searchParams.get('actor') || undefined
  const from = searchParams.get('from') || undefined
  const to = searchParams.get('to') || undefined

  let query = supa
    .from('audit_logs')
    .select('*', { count: 'exact' })

  if (action) query = query.ilike('action', `%${action}%`)
  if (actor) query = query.ilike('actor_role', `%${actor}%`)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data || [], page, limit, total: count ?? null })
}
