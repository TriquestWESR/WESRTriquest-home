'use client'
import { useEffect, useState } from 'react'
import { Card, H1, Muted } from '@/components/ui'
function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }
export default function Page(){
  const [month,setMonth]=useState<string>(''); const [rows,setRows]=useState<any[]>([])
  async function load(){ const r=await fetch('/api/admin/billing'+(month?`?month=${month}`:''),{headers:auth()}); const j=await r.json(); setRows(j.rows||[]) }
  useEffect(()=>{ load() },[month])
  const sum = rows.reduce((a:number,r:any)=>a+(r.participants_first_issuance||0),0)
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>Billing overview</H1>
      <Card>
        <div className="flex items-center gap-3">
          <label className="text-sm">Month (YYYY-MM)</label>
          <input value={month} onChange={e=>setMonth(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="YYYY-MM" />
          <p className="text-sm text-neutral-700">Total first-issuance events: <strong>{sum}</strong></p>
        </div>
      </Card>
      <div className="mt-6 grid gap-3">
        {rows.map((r:any,i:number)=>(
          <Card key={i}>
            <p className="text-sm">Month: {new Date(r.month_start).toLocaleDateString()}</p>
            <p className="text-sm">Provider: {r.provider_id}</p>
            <p className="text-sm">Count: {r.participants_first_issuance}</p>
          </Card>
        ))}
        {rows.length===0 && <Muted className="mt-3">No data for selection.</Muted>}
      </div>
    </main>
  )
}
