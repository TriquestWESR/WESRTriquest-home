import { Card, H1 } from '@/components/ui'
export default function Page({ params }:{ params:{ code:string } }){
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <H1>Results — {params.code}</H1>
      <Card>
        <p className="text-sm text-neutral-700">Section scores and endorsements will appear here. Certificates expire after 24 months.</p>
      </Card>
    </main>
  )
}
