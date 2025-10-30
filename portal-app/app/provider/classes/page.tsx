'use client'
import { useEffect, useState } from 'react'
import { Card, H1, H2, Muted } from '@/components/ui'

function auth(){ const t=(window as any).supabaseToken||''; return {'authorization':'Bearer '+t} }

type Klass = { id:string, code:string, selected_sections:string[], version_lock:Record<string,string>, created_at:string }

export default function Page(){
  const [rows,setRows]=useState<Klass[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{(async()=>{
  const res = await fetch('/api/provider/classes',{headers:auth()})
    const j = await res.json(); setRows(j||[]); setLoading(false)
  })()},[])
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>My classes</H1>
      <Muted className="mt-2">Course Codes are unique; share them with participants to access the exam.</Muted>
      {loading ? <Muted className="mt-6">Loading…</Muted> : (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {rows.map(c=>(
            <Card key={c.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.code}</p>
                  <p className="text-sm text-neutral-700">{new Date(c.created_at).toLocaleString()}</p>
                  <p className="text-xs text-neutral-600 mt-1">Sections: {c.selected_sections.join(', ')}</p>
                </div>
                <button className="rounded-xl border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 text-sm"
                  onClick={()=>navigator.clipboard.writeText(c.code)}>Copy</button>
              </div>
            </Card>
          ))}
          {rows.length===0 && <Muted>No classes yet.</Muted>}
        </div>
      )}
    </main>
  )
}
