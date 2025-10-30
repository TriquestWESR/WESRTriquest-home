'use client'
import { useState, useEffect } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'

export default function AdminConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setMsg(null)
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (res.ok) setMsg('✅ Saved')
    else setMsg('❌ Error saving')
  }

  if (loading) return <main className="max-w-4xl mx-auto px-4 py-10"><p>Loading...</p></main>

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>Admin Configuration</H1>
      <Muted className="mt-2">Edit pass threshold, expiry, difficulty mix, disciplines, and role tags.</Muted>
      
      <Card className="mt-6">
        <H2>Pass Threshold</H2>
        <input
          type="number"
          step="0.01"
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={config?.pass_threshold || 0.8}
          onChange={e => setConfig({ ...config, pass_threshold: parseFloat(e.target.value) })}
        />
        
        <H2 className="mt-6">Expiry (months)</H2>
        <input
          type="number"
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={config?.expiry_months || 24}
          onChange={e => setConfig({ ...config, expiry_months: parseInt(e.target.value) })}
        />
        
        <H2 className="mt-6">Difficulty Mix (JSON)</H2>
        <textarea
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2"
          rows={3}
          value={JSON.stringify(config?.difficulty_mix || { easy: 0.6, medium: 0.3, hard: 0.1 }, null, 2)}
          onChange={e => {
            try {
              setConfig({ ...config, difficulty_mix: JSON.parse(e.target.value) })
            } catch {}
          }}
        />
        
        <H2 className="mt-6">Disciplines (comma-separated)</H2>
        <input
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={(config?.disciplines || []).join(', ')}
          onChange={e => setConfig({ ...config, disciplines: e.target.value.split(',').map(s => s.trim()) })}
        />
        
        <H2 className="mt-6">Role Tags (comma-separated)</H2>
        <input
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={(config?.role_tags || []).join(', ')}
          onChange={e => setConfig({ ...config, role_tags: e.target.value.split(',').map(s => s.trim()) })}
        />
        
        <Button className="mt-6" onClick={handleSave}>Save Configuration</Button>
        {msg && <p className="mt-2 text-sm text-neutral-700">{msg}</p>}
      </Card>
    </main>
  )
}
