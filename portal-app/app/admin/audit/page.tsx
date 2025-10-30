import Link from 'next/link'
import { Card, H1, Muted, Button } from '@/components/ui'

async function fetchAudit(params: URLSearchParams) {
  const qs = params.toString()
  const res = await fetch(`/api/admin/audit${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return { rows: [], page: 1, limit: 50, total: null }
  return res.json()
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const params = new URLSearchParams()
  const action = typeof searchParams.action === 'string' ? searchParams.action : ''
  const actor = typeof searchParams.actor === 'string' ? searchParams.actor : ''
  const from = typeof searchParams.from === 'string' ? searchParams.from : ''
  const to = typeof searchParams.to === 'string' ? searchParams.to : ''
  const page = parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10)
  const limit = parseInt(typeof searchParams.limit === 'string' ? searchParams.limit : '50', 10)

  if (action) params.set('action', action)
  if (actor) params.set('actor', actor)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (limit) params.set('limit', String(limit))
  if (page) params.set('page', String(page))

  const data = await fetchAudit(params)
  const rows = data.rows || []
  const total = data.total as number | null

  const prevPage = Math.max((page || 1) - 1, 1)
  const nextPage = (page || 1) + 1

  const baseParams = new URLSearchParams(params)
  baseParams.delete('page')

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Audit logs</H1>
      <Muted className="mt-2">Filter by action, actor, and date. Pagination is server-side.</Muted>

      <form className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-3" method="GET">
        <input name="action" placeholder="action contains…" defaultValue={action} className="border rounded-xl px-3 py-2 text-sm" />
        <input name="actor" placeholder="actor contains…" defaultValue={actor} className="border rounded-xl px-3 py-2 text-sm" />
        <input type="date" name="from" aria-label="From date" defaultValue={from} className="border rounded-xl px-3 py-2 text-sm" />
        <input type="date" name="to" aria-label="To date" defaultValue={to} className="border rounded-xl px-3 py-2 text-sm" />
        <input type="number" min={1} max={1000} name="limit" aria-label="Limit" defaultValue={String(limit)} className="border rounded-xl px-3 py-2 text-sm" />
        <Button type="submit">Apply</Button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-neutral-600">{total ? `Total: ${total}` : ''}</div>
        <div className="flex items-center gap-2">
          <Link href={`?${baseParams.toString()}&page=${prevPage}`} className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">Prev</Link>
          <span className="text-sm">Page {page}</span>
          <Link href={`?${baseParams.toString()}&page=${nextPage}`} className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">Next</Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {rows.map((r:any) => (
          <Card key={r.id}>
            <div className="text-sm text-neutral-500">{new Date(r.created_at).toLocaleString()}</div>
            <div className="font-medium">{r.action}</div>
            <div className="text-sm text-neutral-600">actor: {r.actor_role || 'system'} · target: {r.target_table || '-'} {r.target_id ? `#${r.target_id}` : ''}</div>
            {r.meta && <pre className="mt-2 whitespace-pre-wrap break-words text-xs bg-neutral-50 rounded-xl p-3 border border-neutral-200">{JSON.stringify(r.meta, null, 2)}</pre>}
          </Card>
        ))}
      </div>
    </main>
  )
}
