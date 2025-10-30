'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'
function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t, 'content-type':'application/json'} }
export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [deciding,setDeciding]=useState<string|null>(null)
  async function load(){ const r=await fetch('/api/admin/overrides',{headers:auth()}); const j=await r.json(); setRows(j.rows||[]) }
  useEffect(()=>{ load() },[])
  async function decide(id:string, decision:'approved'|'rejected'){ setDeciding(id); await fetch('/api/admin/overrides/decide',{method:'POST', headers:auth(), body:JSON.stringify({id, decision})}); setDeciding(null); load() }
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Override requests</H1>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {rows.map(r=>(
          <Card key={r.id}>
            <p className="font-semibold">{r.user_identifier} — {r.section_id}</p>
            <p className="text-sm text-neutral-700">Reason: {r.reason_category}</p>
            {r.narrative && <p className="text-sm text-neutral-700 mt-1">{r.narrative}</p>}
            {r.evidence_url && <a className="underline text-sm" href={r.evidence_url} target="_blank">Evidence</a>}
            <p className="text-xs text-neutral-500 mt-1">Status: {r.status} · Created: {new Date(r.created_at).toLocaleString()}</p>
            {r.status==='pending' && (
              <div className="mt-3 flex gap-2">
                <button disabled={deciding===r.id} onClick={()=>decide(r.id,'approved')} className="rounded-2xl px-5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-sm">Approve</button>
                <button disabled={deciding===r.id} onClick={()=>decide(r.id,'rejected')} className="rounded-xl border border-neutral-300 px-3 py-2 hover:bg-neutral-100 text-sm">Reject</button>
              </div>
            )}
          </Card>
        ))}
        {rows.length===0 && <Muted>No override requests.</Muted>}
      </div>
    </main>
  )
}
