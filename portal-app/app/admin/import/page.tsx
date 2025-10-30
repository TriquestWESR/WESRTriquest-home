'use client'
import { useState } from 'react'
import { Card, H1, H2, Button, Muted } from '@/components/ui'

export default function Page(){
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <H1>Bulk import</H1>
      <Muted className="mt-2">Upload CSV or JSON to create TR sections and Questions. Validation is enforced before insert.</Muted>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Importer
          title="TR Sections"
          downloadTemplate="/templates/tr_sections.csv"
          api="/api/admin/import/tr-sections"
          help="CSV headers: id,title,version,question_count,disciplines,roles. CSV uses comma (,) and lists can be separated by comma or semicolon."
        />
        <Importer
          title="Questions"
          downloadTemplate="/templates/questions.csv"
          api="/api/admin/import/questions"
          help='CSV headers: id,locale,type,prompt,choices,answer_key,section_tags,difficulty,retired. choices are "|" separated; answer_key uses 0-based indices (e.g., "0,2").'
        />
      </div>
    </main>
  )
}

function Importer({ title, downloadTemplate, api, help }:{ title:string; downloadTemplate:string; api:string; help:string }){
  const [file,setFile]=useState<File|null>(null)
  const [result,setResult]=useState<any|null>(null)
  const [busy,setBusy]=useState(false)

  async function submit(){
    if(!file) return
    setBusy(true); setResult(null)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch(api,{ method:'POST', body: fd })
    const j = await res.json(); setResult(j); setBusy(false)
  }

  return (
    <Card>
      <H2>{title}</H2>
      <p className="text-sm text-neutral-700 mt-1">{help}</p>
      <div className="mt-3 flex items-center gap-3">
  <input aria-label="Upload file" type="file" accept=".csv,.json" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <a className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100" href={downloadTemplate}>Download CSV template</a>
        <Button disabled={!file||busy} onClick={submit}>{busy?'Uploading…':'Upload & import'}</Button>
      </div>
      {result && (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white/70 p-3">
          {result.error
            ? <p className="text-sm text-red-600">Error: {result.error}</p>
            : <p className="text-sm text-green-700">Imported: {result.inserted} rows. Skipped: {result.skipped||0}.</p>}
          {result.details && <pre className="mt-2 text-xs bg-white/60 p-3 rounded-lg border border-neutral-200 overflow-x-auto">{JSON.stringify(result.details,null,2)}</pre>}
        </div>
      )}
    </Card>
  )
}
