'use client'
import { useEffect, useState } from 'react'
import { Card, Button, H1, H2, Muted } from '@/components/ui'
import { Spinner } from '@/components/spinner'
import { useToast } from '@/components/toast'
import { downloadCSV } from '@/lib/export'
import { useDebounce } from '@/hooks/use-debounce'

function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }

export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [filterRetired,setFilterRetired]=useState(false)
  const [q,setQ]=useState('')
  const debouncedQ = useDebounce(q, 250)
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState(10)
  const [form,setForm]=useState({id:'', title:'', version:'1.0.0', question_count:10, disciplines:[] as string[], roles:[] as string[]})
  const { success, error } = useToast()

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
    try{
      const res = await fetch('/api/admin/tr-sections',{method:'POST', headers:{'content-type':'application/json',...auth()}, body:JSON.stringify(form)})
      if(!res.ok) throw new Error('Save failed')
      success('Section created')
      setForm({id:'', title:'', version:'1.0.0', question_count:10, disciplines:[], roles:[]})
      load()
    }catch(e:any){ error(e?.message||'Failed') }
  }

  async function retire(id:string){ 
    try{ await fetch('/api/admin/tr-sections/'+id,{method:'DELETE', headers:auth()}); success('Retired'); load() }catch{ error('Failed') }
  }
  async function unretire(id:string){ 
    try{ await fetch('/api/admin/tr-sections/'+id,{method:'PUT', headers:{'content-type':'application/json',...auth()}, body:JSON.stringify({retired:false})}); success('Unretired'); load() }catch{ error('Failed') }
  }

  const filtered = rows.filter(r => (filterRetired || !r.retired) && (
    !debouncedQ || r.id.toLowerCase().includes(debouncedQ.toLowerCase()) || r.title.toLowerCase().includes(debouncedQ.toLowerCase())
  ))
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const start = (pageSafe-1)*pageSize
  const view = filtered.slice(start, start+pageSize)

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

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <input placeholder="Search ID or Title" className="rounded-xl border border-neutral-300 px-3 py-2" value={q} onChange={e=>{ setQ(e.target.value); setPage(1) }} />
        <input id="ret" type="checkbox" checked={filterRetired} onChange={e=>setFilterRetired(e.target.checked)} />
        <label htmlFor="ret" className="text-sm">Include retired</label>
  <select aria-label="Rows per page" className="rounded-xl border border-neutral-300 px-3 py-2 text-sm" value={pageSize} onChange={e=>{ setPageSize(parseInt(e.target.value)); setPage(1) }}>
          {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
        </select>
        <button className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100" onClick={()=>downloadCSV('tr_sections.csv', filtered)}>Export CSV</button>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {loading ? <div className="flex items-center gap-2 text-sm text-neutral-700"><Spinner /><span>Loading…</span></div> : view.map(r=>(
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
        {!loading && view.length===0 && <Muted>No sections found.</Muted>}
      </div>

      {!loading && totalPages>1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <button className="rounded-xl border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100" disabled={pageSafe<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span>Page {pageSafe} / {totalPages}</span>
          <button className="rounded-xl border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100" disabled={pageSafe>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      )}
    </main>
  )
}
