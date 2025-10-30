'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'
function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t, 'content-type':'application/json'} }
export default function Page(){
  const [rows,setRows]=useState<any[]>([])
  const [sel,setSel]=useState<any|null>(null)
  const [saving,setSaving]=useState(false)

  async function load(){ const r=await fetch('/api/provider/attempts-failed',{headers:auth()}); const j=await r.json(); setRows(j.rows||[]) }
  useEffect(()=>{ load() },[])

  async function submitOverride(f:{attempt_id:string,class_id:string,user_identifier:string,section_id:string,reason_category:string,narrative?:string,evidence_url?:string,esignature:string}){
    setSaving(true)
  const res=await fetch('/api/provider/override',{method:'POST', headers:auth(), body: JSON.stringify(f)})
    const j=await res.json(); setSaving(false)
    if(!j.ok) alert(j.error||'Failed'); else { setSel(null); load() }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <H1>Instructor overrides</H1>
      <Muted className="mt-2">Request an override ONLY for non-knowledge reasons (language, accessibility, technical). Provide a reason and e-signature.</Muted>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {rows.map(r=> (
          <Card key={r.id}>
            <p className="font-semibold">Attempt {String(r.id).slice(0,8)} — {r.user_identifier}</p>
            <p className="text-sm text-neutral-700">Failed sections: {r.failed_sections.join(', ')}</p>
            <p className="text-xs text-neutral-500">Completed: {r.completed_at ? new Date(r.completed_at).toLocaleString() : 'n/a'}</p>
            <button className="mt-3 rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
              onClick={()=>setSel({ attempt_id:r.id, class_id:r.class_id, user_identifier:r.user_identifier, section_id:r.failed_sections[0]||'', reason_category:'language', narrative:'', evidence_url:'', esignature:'' })}>
              Request override
            </button>
          </Card>
        ))}
        {rows.length===0 && <Muted>No failed attempts found.</Muted>}
      </div>

      {sel && (
        <Card>
          <H2>New override</H2>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <label className="text-sm">Section
              <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={sel.section_id} onChange={e=>setSel({...sel, section_id:e.target.value})}/>
            </label>
            <label className="text-sm">Reason
              <select className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={sel.reason_category} onChange={e=>setSel({...sel, reason_category:e.target.value})}>
                {['language','accessibility','technical','other'].map(x=> <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">Narrative
              <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={3} value={sel.narrative} onChange={e=>setSel({...sel, narrative:e.target.value})}/>
            </label>
            <label className="text-sm sm:col-span-2">Evidence URL (optional)
              <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={sel.evidence_url} onChange={e=>setSel({...sel, evidence_url:e.target.value})}/>
            </label>
            <label className="text-sm sm:col-span-2">E-signature (type full name)
              <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={sel.esignature} onChange={e=>setSel({...sel, esignature:e.target.value})}/>
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button disabled={saving} onClick={()=>submitOverride(sel)} className="rounded-2xl px-5 py-3 bg-neutral-900 text-white hover:bg-neutral-800">{saving?'Submitting…':'Submit override'}</button>
            <button className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100" onClick={()=>setSel(null)}>Cancel</button>
          </div>
        </Card>
      )}
    </main>
  )
}
