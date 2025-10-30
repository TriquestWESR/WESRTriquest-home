'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, H1, Button } from '@/components/ui'

export default function Page({ params }:{ params:{ code:string } }){
  const { code } = params
  const [started,setStarted]=useState(false)
  const [blueprint, setBlueprint] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const router = useRouter()

  useEffect(() => {
    if (started && !blueprint) {
      fetch('/api/learner/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(r => r.json())
        .then(setBlueprint)
    }
  }, [started, blueprint, code])

  const handleSubmit = async () => {
    const answersArray = Object.entries(answers).map(([qId, selectedIndexes]) => ({
      qId,
      selectedIndexes
    }))
    const userId = prompt('Enter your email or identifier:') || 'anonymous'
    
    const res = await fetch('/api/learner/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId, answers: answersArray })
    })
    
    if (res.ok) {
      router.push(`/results/${code}?user=${userId}`)
    } else {
      alert('Error submitting exam')
    }
  }

  const toggleAnswer = (qId: string, idx: number, type: string) => {
    if (type === 'mcq') {
      setAnswers({ ...answers, [qId]: [idx] })
    } else {
      const cur = answers[qId] || []
      if (cur.includes(idx)) {
        setAnswers({ ...answers, [qId]: cur.filter(i => i !== idx) })
      } else {
        setAnswers({ ...answers, [qId]: [...cur, idx] })
      }
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <H1>Exam — {code}</H1>
      {!started ? (
        <Card>
          <p className="text-sm text-neutral-700">This exam contains fixed question counts per TR section and a locked difficulty mix. Passing is 80% per section.</p>
          <Button className="mt-4" onClick={()=>setStarted(true)}>Start</Button>
        </Card>
      ): !blueprint ? (
        <Card><p>Loading exam...</p></Card>
      ):(
        <div className="space-y-6">
          {blueprint.items.map((item: any, i: number) => (
            <Card key={item.qId}>
              <p className="font-semibold">Q{i+1} ({item.sectionId})</p>
              <p className="mt-2 text-sm text-neutral-800">{item.prompt}</p>
              <div className="mt-3 space-y-2">
                {item.choices.map((choice: string, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type={item.type === 'mcq' ? 'radio' : 'checkbox'}
                      checked={(answers[item.qId] || []).includes(idx)}
                      onChange={() => toggleAnswer(item.qId, idx, item.type)}
                    />
                    <span className="text-sm">{choice}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
          <Button onClick={handleSubmit}>Submit Exam</Button>
        </div>
      )}
    </main>
  )
}
