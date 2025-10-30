'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, H1, Button } from '@/components/ui'
export default function Page({ params }:{ params:{ code:string } }){
  const { code } = params
  const [started,setStarted]=useState(false)
  const router = useRouter()
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <H1>Exam — {code}</H1>
      {!started ? (
        <Card>
          <p className="text-sm text-neutral-700">This exam contains fixed question counts per TR section and a locked difficulty mix. Passing is 80% per section.</p>
          <Button className="mt-4" onClick={()=>setStarted(true)}>Start</Button>
        </Card>
      ):(
        <Card>
          <p className="text-sm text-neutral-700">[Exam UI will render items here after blueprint fetch]</p>
          <Button className="mt-4" onClick={()=>router.push(`/results/${code}`)}>Submit</Button>
        </Card>
      )}
    </main>
  )
}
