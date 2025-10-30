'use client'
import { useState, useEffect } from 'react'
import { Card, H1, H2, Button } from '@/components/ui'

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<any[]>([])
  const [form, setForm] = useState({ id: '', title: '', version: '1.0.0', disciplines: '', roles: '', question_count: 10 })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/sections').then(r => r.json()).then(setSections)
  }, [])

  const handleSave = async () => {
    setMsg(null)
    const body = {
      ...form,
      disciplines: form.disciplines.split(',').map(s => s.trim()),
      roles: form.roles.split(',').map(s => s.trim()),
      question_count: parseInt(form.question_count.toString())
    }
    const res = await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setMsg('✅ Saved')
      const updated = await fetch('/api/admin/sections').then(r => r.json())
      setSections(updated)
      setForm({ id: '', title: '', version: '1.0.0', disciplines: '', roles: '', question_count: 10 })
    } else {
      setMsg('❌ Error saving')
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>TR Sections</H1>
      
      <Card className="mt-6">
        <H2>Add/Edit Section</H2>
        <label className="block text-sm font-medium mt-4">Section ID</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. TR-A" />
        
        <label className="block text-sm font-medium mt-4">Title</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to HV" />
        
        <label className="block text-sm font-medium mt-4">Version</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" />
        
        <label className="block text-sm font-medium mt-4">Disciplines (comma-separated)</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.disciplines} onChange={e => setForm({ ...form, disciplines: e.target.value })} placeholder="HV, LV" />
        
        <label className="block text-sm font-medium mt-4">Roles (comma-separated)</label>
        <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.roles} onChange={e => setForm({ ...form, roles: e.target.value })} placeholder="HV Operator, PCEI" />
        
        <label className="block text-sm font-medium mt-4">Question Count</label>
        <input type="number" aria-label="Question Count" placeholder="10" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={form.question_count} onChange={e => setForm({ ...form, question_count: parseInt(e.target.value) })} />
        
        <Button className="mt-6" onClick={handleSave}>Save Section</Button>
        {msg && <p className="mt-2 text-sm text-neutral-700">{msg}</p>}
      </Card>
      
      <Card className="mt-6">
        <H2>Existing Sections</H2>
        <div className="mt-4 space-y-2">
          {sections.map(s => (
            <div key={s.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <p className="font-semibold">{s.id} — {s.title}</p>
              <p className="text-sm text-neutral-600">Version: {s.version} | Questions: {s.question_count}</p>
              <p className="text-sm text-neutral-600">Disciplines: {s.disciplines.join(', ')}</p>
              <p className="text-sm text-neutral-600">Roles: {s.roles.join(', ')}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  )
}
