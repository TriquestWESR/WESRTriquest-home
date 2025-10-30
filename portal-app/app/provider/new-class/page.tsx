'use client'
import { useState } from 'react'
import { Card, H1, H2, Button } from '@/components/ui'
export default function Page(){
  const [disciplines,setDisc]=useState<string[]>([])
  const [roles,setRoles]=useState<string[]>([])
  const [sections,setSections]=useState<string[]>([])
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>New class</H1>
      <Card>
        <H2>Disciplines</H2>
        <div className="mt-2 flex flex-wrap gap-2">
          {['HV','LV','Mechanical','Hydraulic','Systems/Comms','Docs/Audit'].map(d=>(
            <button key={d} onClick={()=>setDisc(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])} className={`rounded-xl border px-3 py-1.5 ${disciplines.includes(d)?'bg-neutral-900 text-white':'border-neutral-300 hover:bg-neutral-100'}`}>{d}</button>
          ))}
        </div>
        <H2 className="mt-6">Roles</H2>
        <div className="mt-2 flex flex-wrap gap-2">
          {['HV Operator','Switching Assistant','Work Planner','PCEI','PCWA','Delegated PCEI','Installer'].map(r=>(
            <button key={r} onClick={()=>setRoles(p=>p.includes(r)?p.filter(x=>x!==r):[...p,r])} className={`rounded-xl border px-3 py-1.5 ${roles.includes(r)?'bg-neutral-900 text-white':'border-neutral-300 hover:bg-neutral-100'}`}>{r}</button>
          ))}
        </div>
        <H2 className="mt-6">TR Sections (filtered)</H2>
        <div className="mt-2 grid sm:grid-cols-2 gap-2">
          {['TR-A','TR-B','TR-C','TR-D','TR-E','TR-F','TR-G','TR-H'].map(s=>(
            <label key={s} className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2">
              <input type="checkbox" onChange={e=>setSections(p=>e.target.checked?[...p,s]:p.filter(x=>x!==s))} />
              <span>{s}</span>
            </label>
          ))}
        </div>
        <Button className="mt-5">Publish class → generate Course Code</Button>
      </Card>
    </main>
  )
}
