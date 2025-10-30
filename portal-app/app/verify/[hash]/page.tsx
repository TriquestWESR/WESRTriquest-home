import Link from 'next/link'
import { Card, H1, H2, Muted } from '@/components/ui'
import { fmtDate } from '@/lib/date'
export const metadata = { robots: { index:false, follow:false }, title: 'WESR Triquest — Verify certificate' }

async function getCert(hash:string){
  const base = process.env.NEXT_PUBLIC_PORTAL_BASE ?? ''
  const url = `${base}/api/certificates/verify/${hash}`
  const res = await fetch(url, { cache: 'no-store' })
  if(!res.ok) return null
  return res.json()
}

export default async function Page({ params }:{ params:{ hash:string } }){
  const data = await getCert(params.hash)

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <H1>Certificate verification</H1>
      {!data ? (
        <Card><p className="text-sm text-neutral-700">No certificate found for this link.</p></Card>
      ) : (
        <>
          <Card>
            <H2>Certificate</H2>
            <p className="text-sm text-neutral-700 mt-2">Certificate ID: <span className="font-mono">{data.certificateId}</span></p>
            <p className="text-sm text-neutral-700">Learner: <span className="font-mono">{data.learnerId}</span></p>
            <p className="text-sm text-neutral-700">Created: {fmtDate(data.createdAt)}</p>
            <div className="mt-3">
              <Link className="underline text-sm" href={`/api/certificates/${params.hash}/pdf`} prefetch={false}>Open PDF</Link>
            </div>
          </Card>

          <Card>
            <H2>Endorsements</H2>
            <div className="mt-3">
              {(!data.endorsements || data.endorsements.length===0) && <Muted>No endorsements recorded.</Muted>}
              {data.endorsements?.map((e:any, i:number)=>(
                <div key={i} className="rounded-xl border border-neutral-200 p-3 bg-white/60 mb-2">
                  <p className="text-sm"><span className="font-semibold">{e.sectionId}</span> — v{e.version}</p>
                  <p className="text-xs text-neutral-600">Granted: {fmtDate(e.grantedAt)} · Expires: {fmtDate(e.expiresAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </main>
  )
}
