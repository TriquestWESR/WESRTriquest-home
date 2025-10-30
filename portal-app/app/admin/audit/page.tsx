import { Card, H1, H2, Muted } from '@/components/ui'

async function fetchAudit() {
  // This runs server-side; assumes admin bearer token is provided by upstream proxy/session
  const res = await fetch(`/api/admin/audit`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function Page() {
  const rows = await fetchAudit()
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Audit logs</H1>
      <Muted className="mt-2">Latest actions across the portal. System-only in this demo build.</Muted>

      <div className="mt-6 grid gap-4">
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
