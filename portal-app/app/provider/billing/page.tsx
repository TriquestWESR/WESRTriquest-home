'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Muted } from '@/components/ui'
function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }
export default function Page(){
  const [month,setMonth]=useState<string>(''); const [rows,setRows]=useState<any[]>([])
  async function load(){ const r = await fetch('/api/provider/billing'+(month?`?month=${month}`:''), {headers:auth()}); const j=await r.json(); setRows(j.rows||[]) }
  useEffect(()=>{ load() },[month])
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <H1>Billing usage</H1>
      <Muted className="mt-2">Per participant per class at first certificate issuance.</Muted>
      <Card>
        <div className="flex items-center gap-3">
          <label className="text-sm">Month (YYYY-MM)</label>
          <input value={month} onChange={e=>setMonth(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" placeholder="YYYY-MM" />
            <a className="rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100" 
             href={`/api/provider/billing.csv${month?`?month=${month}`:''}`} onClick={(e)=>{ if(!month) e.currentTarget.href='/api/provider/billing.csv' }}>
            Download CSV
          </a>
        </div>
      </Card>
      <div className="mt-6 grid gap-3">
        {rows.map((r,i)=>(
          <Card key={i}>
            <p className="text-sm">Time: {new Date(r.triggered_at).toLocaleString()}</p>
            <p className="text-sm">Class: {r.class_id}</p>
            <p className="text-sm">User: {r.user_identifier}</p>
          </Card>
        ))}
        {rows.length===0 && <Muted className="mt-3">No usage found for selected period.</Muted>}
      </div>
    </main>
  )
}
