import Link from 'next/link'
import { Card, H1, H2, Muted } from '@/components/ui'
export const metadata = { robots: { index:false, follow:false } }
export default function Page(){
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>WESR Admin Console</H1>
      <Muted className="mt-2">Manage TR Sections, global config, providers, and roles.</Muted>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
  <Card>
          <H2>Disciplines & Roles (Config)</H2>
          <p className="text-sm text-neutral-700 mt-2">Edit discipline/role sets, difficulty mix, pass threshold, expiry.</p>
          <Link className="underline text-sm mt-2 inline-block" href="/admin/config">Open config</Link>
        </Card>
        <Card>
          <H2>TR Sections</H2>
          <p className="text-sm text-neutral-700 mt-2">Create, edit, retire/unretire; set counts, versions, tags.</p>
          <Link className="underline text-sm mt-2 inline-block" href="/admin/tr-sections">Manage TR sections</Link>
        </Card>
        <Card>
          <H2>Providers & Roles</H2>
          <p className="text-sm text-neutral-700 mt-2">Create/disable providers and assign roles to user emails.</p>
          <Link className="underline text-sm mt-2 inline-block" href="/admin/providers">Manage providers</Link>
        </Card>
        <Card>
          <H2>Bulk import</H2>
          <p className="text-sm text-neutral-700 mt-2">Upload CSV/JSON for TR sections and Questions.</p>
          <Link className="underline text-sm mt-2 inline-block" href="/admin/import">Open import</Link>
        </Card>
      </div>
    </main>
  )
}
