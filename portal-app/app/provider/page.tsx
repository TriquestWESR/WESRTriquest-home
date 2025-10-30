import Link from 'next/link'
import { Card, H1, H2, Muted, Button } from '@/components/ui'
export const metadata = { robots: { index:false, follow:false } }
export default function Page(){
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>Provider dashboard</H1>
      <Muted className="mt-2">Create classes, select disciplines & roles to filter TR sections, choose taught sections, and publish a Course Code. Billing is per participant per class at first certificate issuance.</Muted>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Card>
          <H2>Create class</H2>
          <ul className="list-disc ml-5 text-sm text-neutral-700 mt-2 space-y-1"><li>Select disciplines</li><li>Select roles</li><li>Tick TR sections (filtered)</li><li>Review counts & mix</li><li>Publish → Course Code</li></ul>
          <div className="mt-4 flex gap-2">
            <Link href="/provider/new-class"><Button>New class</Button></Link>
            <Link href="/provider/classes"><Button className="bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50">My classes</Button></Link>
          </div>
        </Card>
        <Card>
          <H2>Results</H2>
          <p className="text-sm text-neutral-700 mt-2">Per-section pass/fail; export CSV. Fail reports list missed item IDs only.</p>
          <div className="mt-4">
            <Link href="/provider/classes"><Button>View results</Button></Link>
          </div>
        </Card>
        <Card>
          <H2>Billing & Overrides</H2>
          <ul className="list-disc ml-5 text-sm text-neutral-700 mt-2 space-y-1"><li>Per participant per class at first issuance</li><li>Month-to-date usage</li><li>Request overrides for failed participants</li></ul>
          <div className="mt-4 flex gap-2">
            <Link href="/provider/billing"><Button>Billing</Button></Link>
            <Link href="/provider/overrides"><Button className="bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50">Overrides</Button></Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
