'use client'
import { useState, useEffect } from 'react'
import { Card, H1, H2, Button } from '@/components/ui'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/providers').then(r => r.json()).then(setProviders)
  }, [])

  const handleCreate = async () => {
    setMsg(null)
    const res = await fetch('/api/admin/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'active' })
    })
    if (res.ok) {
      setMsg('✅ Provider created')
      const updated = await fetch('/api/admin/providers').then(r => r.json())
      setProviders(updated)
      setName('')
    } else {
      setMsg('❌ Error creating provider')
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Providers</H1>
      
      <Card className="mt-6">
        <H2>Create Provider</H2>
        <label className="block text-sm font-medium mt-4">Provider Name</label>
        <input
          className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Training Co Ltd"
        />
        <Button className="mt-4" onClick={handleCreate}>Create Provider</Button>
        {msg && <p className="mt-2 text-sm text-neutral-700">{msg}</p>}
      </Card>
      
      <Card className="mt-6">
        <H2>Existing Providers</H2>
        <div className="mt-4 space-y-2">
          {providers.map(p => (
            <div key={p.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-neutral-600">Status: {p.status} | ID: {p.id}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  )
}
