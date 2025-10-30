'use client'
import { useState } from 'react'
import { Card, H1, Button, Muted } from '@/components/ui'
import { useRouter } from 'next/navigation'

export default function Page(){
  const [uid,setUid]=useState(''); const [code,setCode]=useState('')
  const router = useRouter()
  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <H1>Start your exam</H1>
      <Muted className="mt-2">Enter your User ID and Course Code from your provider.</Muted>
      <Card>
        <label className="block text-sm font-medium">User ID</label>
  <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={uid} onChange={e=>setUid(e.target.value)} placeholder="Enter your User ID" />
        <label className="block text-sm font-medium mt-4">Course Code</label>
  <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter Course Code" />
  <Button className="mt-5" onClick={()=>{ if(uid && code) router.push(`/exam/${encodeURIComponent(code)}?uid=${encodeURIComponent(uid)}`) }}>Continue</Button>
      </Card>
    </main>
  )
}
