'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'

function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t,'content-type':'application/json'} }

export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [name,setName]=useState('')

  async function load(){ 
    const res=await fetch('/api/admin/providers',{headers:auth()})
    setRows(await res.json())
  }
  useEffect(()=>{ load() },[])

  async function create(){ 
    if(!name) return
    await fetch('/api/admin/providers',{method:'POST', headers:auth(), body:JSON.stringify({name})})
    setName('')
    load()
  }
  async function setStatus(id:string,status:'active'|'disabled'){ 
    await fetch('/api/admin/providers/'+id,{method:'PUT', headers:auth(), body:JSON.stringify({status})})
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

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {rows.map(p=>(
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
  const [msg,setMsg]=useState<string|null>(null)
  
  async function add(){ 
    setMsg(null)
    const res=await fetch('/api/admin/roles',{method:'POST', headers:auth(), body:JSON.stringify({email, role})})
    const j=await res.json()
    setMsg(j.error?('Error: '+j.error):'Role assigned')
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
      {msg && <p className="text-sm text-neutral-700 mt-2">{msg}</p>}
    </div>
  )
}
