'use client'
import { useState, useEffect } from 'react'
import { Card, H1, H2, Button } from '@/components/ui'
import { useToast } from '@/components/toast'
import { Spinner } from '@/components/spinner'
export default function Page(){
  const [disciplines,setDisc]=useState<string[]>([])
  const [roles,setRoles]=useState<string[]>([])
  const [sections,setSections]=useState<string[]>([])
  const [allSections, setAllSections] = useState<any[]>([])
  const [providerId, setProviderId] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetch('/api/admin/sections')
      .then(r => r.json())
      .then(data => setAllSections(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to load sections:', err)
        setAllSections([])
      })
    // In real app, fetch current user's provider_id from roles/providers table
    // For now, hardcode or prompt admin to create provider first
  }, [])

  const filteredSections = (Array.isArray(allSections) ? allSections : []).filter(s =>
    disciplines.some(d => s.disciplines?.includes(d)) &&
    roles.some(r => s.roles?.includes(r))
  )

  const handlePublish = async () => {
    if (!providerId) { error('Provider ID required'); return }
    if (disciplines.length === 0) { error('Pick at least one discipline'); return }
    if (roles.length === 0) { error('Pick at least one role'); return }
    if (sections.length === 0) { error('Select at least one TR section'); return }
    const versionLock = Object.fromEntries(sections.map(sid => {
      const sec = allSections.find(s => s.id === sid)
      return [sid, sec?.version || '1.0.0']
    }))
    setBusy(true)
    const res = await fetch('/api/provider/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId,
        selectedSections: sections,
        disciplines,
        roles,
        versionLock
      })
    })
    if (res.ok) {
      const data = await res.json()
      setCode(data.code)
      success('Class created')
      // Fire-and-forget notify (provider email + audit)
      fetch('/api/notify/class-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, classId: data.id })
      }).catch(()=>{})
    } else {
      error('Error creating class')
    }
    setBusy(false)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>New class</H1>
      <Card>
        <label className="block text-sm font-medium">Provider ID (UUID from admin page)</label>
        <input
          className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
          value={providerId}
          onChange={e => setProviderId(e.target.value)}
          placeholder="Paste provider UUID"
        />
        
        <H2 className="mt-6">Disciplines</H2>
        <div className="mt-2 flex flex-wrap gap-2">
          {['HV','LV','Mechanical','Hydraulic','Systems/Comms','Docs/Audit'].map(d=>(
            <button key={d} onClick={()=>setDisc(p=>p.includes(d)?p.filter((x: string)=>x!==d):[...p,d])} className={`rounded-xl border px-3 py-1.5 ${disciplines.includes(d)?'bg-neutral-900 text-white':'border-neutral-300 hover:bg-neutral-100'}`}>{d}</button>
          ))}
        </div>
        
        <H2 className="mt-6">Roles</H2>
        <div className="mt-2 flex flex-wrap gap-2">
          {['HV Operator','Switching Assistant','Work Planner','PCEI','PCWA','Delegated PCEI','Installer'].map(r=>(
            <button key={r} onClick={()=>setRoles(p=>p.includes(r)?p.filter((x: string)=>x!==r):[...p,r])} className={`rounded-xl border px-3 py-1.5 ${roles.includes(r)?'bg-neutral-900 text-white':'border-neutral-300 hover:bg-neutral-100'}`}>{r}</button>
          ))}
        </div>
        
        <H2 className="mt-6">TR Sections (filtered by disciplines & roles)</H2>
        <div className="mt-2 grid sm:grid-cols-2 gap-2">
          {filteredSections.map(s=>(
            <label key={s.id} className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2">
              <input type="checkbox" onChange={e=>setSections(p=>e.target.checked?[...p,s.id]:p.filter((x: string)=>x!==s.id))} />
              <span>{s.id} — {s.title} ({s.question_count}q)</span>
            </label>
          ))}
        </div>
        
        <Button className="mt-5 inline-flex items-center gap-2" onClick={handlePublish} disabled={busy}>
          {busy && <Spinner />}
          <span>Publish class → generate Course Code</span>
        </Button>
        {code && <p className="mt-2 text-lg font-bold">Course Code: {code}</p>}
      </Card>
    </main>
  )
}
