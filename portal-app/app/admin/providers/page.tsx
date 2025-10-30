'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'
import { Spinner } from '@/components/spinner'
import { useToast } from '@/components/toast'
import { downloadCSV } from '@/lib/export'
import { useDebounce } from '@/hooks/use-debounce'

function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t,'content-type':'application/json'} }

export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [name,setName]=useState('')
  const [loading,setLoading]=useState(true)
  const [q,setQ]=useState('')
  const dq = useDebounce(q, 250)
  const { success, error } = useToast()

  async function load(){ 
    setLoading(true)
    const res=await fetch('/api/admin/providers',{headers:auth()})
    setRows(await res.json())
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  async function create(){ 
    if(!name) { error('Provider name required'); return }
    const res = await fetch('/api/admin/providers',{method:'POST', headers:auth(), body:JSON.stringify({name})})
    if(!res.ok) { error('Failed to create'); return }
    setName('')
    success('Provider created')
    load()
  }
  async function setStatus(id:string,status:'active'|'disabled'){ 
    const res = await fetch('/api/admin/providers/'+id,{method:'PUT', headers:auth(), body:JSON.stringify({status})})
    if(!res.ok) { error('Update failed'); return }
    success('Status updated')
    load()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Providers</H1>
      <Muted className="mt-2">Create/disable providers. Assign roles to existing Supabase users by email.</Muted>

      <Card>
        <H2>New provider</H2>
        <div className="mt-2 flex gap-2">
          <input className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="Provider name" value={name} onChange={e=>setName(e.target.value)} />
          <Button onClick={create}>Create</Button>
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <input placeholder="Search providers" className="rounded-xl border border-neutral-300 px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100" onClick={()=>downloadCSV('providers.csv', rows)}>Export CSV</button>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {loading ? <div className="flex items-center gap-2 text-sm text-neutral-700"><Spinner /><span>Loading…</span></div> : rows.filter(p=>!dq || p.name.toLowerCase().includes(dq.toLowerCase())).map(p=>(
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-neutral-700">Status: {p.status}</p>
              </div>
              <div className="flex gap-2">
                {p.status==='active'
                  ? <button className="rounded-xl border px-3 py-1.5 border-neutral-300 hover:bg-neutral-100 text-sm" onClick={()=>setStatus(p.id,'disabled')}>Disable</button>
                  : <button className="rounded-xl border px-3 py-1.5 border-neutral-300 hover:bg-neutral-100 text-sm" onClick={()=>setStatus(p.id,'active')}>Enable</button>}
              </div>
            </div>
            <RoleAssign />
          </Card>
        ))}
      </div>
    </main>
  )
}

function RoleAssign(){
  const [email,setEmail]=useState('')
  const [role,setRole]=useState('PROVIDER')
  const { success, error } = useToast()
  
  async function add(){ 
    const res=await fetch('/api/admin/roles',{method:'POST', headers:auth(), body:JSON.stringify({email, role})})
    const j=await res.json()
    if (j?.error) error(j.error)
    else success('Role assigned')
  }
  function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t, 'content-type':'application/json'} }
  
  return (
    <div className="mt-4 rounded-xl border border-neutral-200 p-4">
      <p className="text-sm font-semibold">Assign role to user (by email)</p>
      <div className="mt-2 grid sm:grid-cols-3 gap-2">
        <input placeholder="user@example.com" className="rounded-xl border border-neutral-300 px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        <select title="Select role" className="rounded-xl border border-neutral-300 px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
          {['WESR_ADMIN','PROVIDER','INSTRUCTOR','LEARNER'].map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <button onClick={add} className="rounded-2xl px-5 py-3 bg-neutral-900 text-white hover:bg-neutral-800">Assign</button>
      </div>
    </div>
  )
}
