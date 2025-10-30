'use client'
import { useSearchParams } from 'next/navigation'
import { Card, H1, H2 } from '@/components/ui'

export default function Page({ params }:{ params:{ code:string } }){
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')
  
  // In a real app, fetch results from DB by code + userId
  // For now, show placeholder
  
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <H1>Results — {params.code}</H1>
      <Card>
        <H2>User: {userId || 'N/A'}</H2>
        <p className="text-sm text-neutral-700 mt-2">Section scores and endorsements will appear here after submission is processed.</p>
        <p className="text-sm text-neutral-700 mt-2">Certificates expire after 24 months.</p>
        <p className="text-sm text-neutral-700 mt-2 font-semibold">To see real results, wire the results page to fetch from attempts/certificates tables by user_identifier.</p>
      </Card>
    </main>
  )
}
