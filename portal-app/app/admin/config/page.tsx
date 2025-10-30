'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'

export default function Page(){
  const [loading,setLoading]=useState(true)
  const [cfg,setCfg]=useState<any>(null)
  const [disc,setDisc]=useState<string>('')
  const [role,setRole]=useState<string>('')

  useEffect(()=>{(async()=>{
    const res = await fetch('/api/admin/config',{headers:auth()})
    const j=await res.json()
    setCfg(j)
    setLoading(false)
  })()},[])

  function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }

  async function save(){
    setLoading(true)
    await fetch('/api/admin/config',{method:'PUT', headers:{'content-type':'application/json',...auth()}, body:JSON.stringify(cfg)})
    setLoading(false)
  }

  if(loading) return <main className="max-w-4xl mx-auto px-4 py-10"><H1>Admin Config</H1><Muted>Loading…</Muted></main>

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>Admin Config</H1>
      <Muted className="mt-2">Edit global settings: locked difficulty mix, pass threshold, expiry, and the editable sets for disciplines & roles.</Muted>

      <Card>
        <H2>Thresholds & difficulty (locked)</H2>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <label className="text-sm">Pass threshold (%)
            <input type="number" step="1" min="50" max="100"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={Math.round((cfg.pass_threshold??0.80)*100)}
              onChange={e=>setCfg({...cfg, pass_threshold: Number(e.target.value)/100})}/>
          </label>
          <label className="text-sm">Expiry (months)
            <input type="number" min="1" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={cfg.expiry_months||24} onChange={e=>setCfg({...cfg, expiry_months:Number(e.target.value)})}/>
          </label>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          {['easy','medium','hard'].map(k=>(
            <label key={k} className="text-sm capitalize">{k}
              <input type="number" step="1" min="0" max="100"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={Math.round((cfg.difficulty_mix?.[k]??0)*100)}
                onChange={e=>setCfg({...cfg, difficulty_mix:{...cfg.difficulty_mix,[k]:Number(e.target.value)/100}})}/>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={save}>Save</Button>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <H2>Disciplines</H2>
          <div className="flex flex-wrap gap-2 mt-2">
            {(cfg.disciplines||[]).map((d:string,i:number)=>(
              <span key={i} className="rounded-xl border border-neutral-300 px-3 py-1.5">{d}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="Add discipline" value={disc} onChange={e=>setDisc(e.target.value)}/>
            <Button onClick={()=>{ if(disc){ setCfg({...cfg, disciplines:[...cfg.disciplines, disc]}); setDisc('') }}}>Add</Button>
          </div>
        </Card>

        <Card>
          <H2>Roles</H2>
          <div className="flex flex-wrap gap-2 mt-2">
            {(cfg.role_tags||[]).map((r:string,i:number)=>(
              <span key={i} className="rounded-xl border border-neutral-300 px-3 py-1.5">{r}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="Add role" value={role} onChange={e=>setRole(e.target.value)}/>
            <Button onClick={()=>{ if(role){ setCfg({...cfg, role_tags:[...cfg.role_tags, role]}); setRole('') }}}>Add</Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
