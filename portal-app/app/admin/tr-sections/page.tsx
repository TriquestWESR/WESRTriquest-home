'use client'
import { useEffect, useState } from 'react'
import { Card, Button, H1, H2, Muted } from '@/components/ui'

function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }

export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [filterRetired,setFilterRetired]=useState(false)
  const [form,setForm]=useState({id:'', title:'', version:'1.0.0', question_count:10, disciplines:[] as string[], roles:[] as string[]})

  async function load(){
    setLoading(true)
    const url = '/api/admin/tr-sections' + (filterRetired?'?includeRetired=1':'')
    const res = await fetch(url,{headers:auth()})
    const j=await res.json()
    setRows(j)
    setLoading(false)
  }
  useEffect(()=>{ load() },[filterRetired])

  async function create(){
    await fetch('/api/admin/tr-sections',{method:'POST', headers:{'content-type':'application/json',...auth()}, body:JSON.stringify(form)})
    setForm({id:'', title:'', version:'1.0.0', question_count:10, disciplines:[], roles:[]})
    load()
  }

  async function retire(id:string){ 
    await fetch('/api/admin/tr-sections/'+id,{method:'DELETE', headers:auth()})
    load()
  }
  async function unretire(id:string){ 
    await fetch('/api/admin/tr-sections/'+id,{method:'PUT', headers:{'content-type':'application/json',...auth()}, body:JSON.stringify({retired:false})})
    load()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>TR Sections</H1>
      <Muted className="mt-2">Create, edit, retire/unretire. Use Admin Config to manage the discipline/role tag sets.</Muted>

      <Card>
        <H2>New section</H2>
        <div className="grid md:grid-cols-3 gap-3 mt-2">
          <input placeholder="ID (e.g., TR-A)" className="rounded-xl border border-neutral-300 px-3 py-2" value={form.id} onChange={e=>setForm({...form,id:e.target.value})}/>
          <input placeholder="Title" className="rounded-xl border border-neutral-300 px-3 py-2" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <input placeholder="Version" className="rounded-xl border border-neutral-300 px-3 py-2" value={form.version} onChange={e=>setForm({...form,version:e.target.value})}/>
          <input type="number" min={1} placeholder="Question count" className="rounded-xl border border-neutral-300 px-3 py-2" value={form.question_count} onChange={e=>setForm({...form,question_count:Number(e.target.value)})}/>
          <input placeholder="Disciplines (comma sep)" className="rounded-xl border border-neutral-300 px-3 py-2" onChange={e=>setForm({...form,disciplines:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
          <input placeholder="Roles (comma sep)" className="rounded-xl border border-neutral-300 px-3 py-2" onChange={e=>setForm({...form,roles:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
        </div>
        <Button className="mt-3" onClick={create}>Create</Button>
      </Card>

      <div className="flex items-center gap-2 mt-6">
        <input id="ret" type="checkbox" checked={filterRetired} onChange={e=>setFilterRetired(e.target.checked)} />
        <label htmlFor="ret" className="text-sm">Include retired</label>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {loading ? <Muted>Loading…</Muted> : rows.map(r=>(
          <Card key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.id} — {r.title}</p>
                <p className="text-sm text-neutral-700">v{r.version} · Qs: {r.question_count} · {r.retired ? 'Retired' : 'Active'}</p>
                <p className="text-xs text-neutral-500 mt-1">Disciplines: {r.disciplines.join(', ') || '—'}</p>
                <p className="text-xs text-neutral-500">Roles: {r.roles.join(', ') || '—'}</p>
              </div>
              <div className="flex gap-2">
                {!r.retired
                  ? <button className="rounded-xl border px-3 py-1.5 border-neutral-300 hover:bg-neutral-100 text-sm" onClick={()=>retire(r.id)}>Retire</button>
                  : <button className="rounded-xl border px-3 py-1.5 border-neutral-300 hover:bg-neutral-100 text-sm" onClick={()=>unretire(r.id)}>Unretire</button>
                }
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
