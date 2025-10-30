import { Card, H1, H2, Muted } from '@/components/ui'
export const metadata = { robots: { index:false, follow:false } }
export default function Page(){
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <H1>WESR Admin Console</H1>
      <Muted className="mt-2">Edit disciplines, roles, TR sections, locked difficulty mix, question counts, and expiry settings. Admin creates/removes providers and assigns roles.</Muted>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Card><H2>Disciplines & roles</H2><p className="text-sm text-neutral-700 mt-2">CRUD for discipline & role tags.</p></Card>
        <Card><H2>TR Sections</H2><p className="text-sm text-neutral-700 mt-2">Catalog with versions, question counts, tags.</p></Card>
        <Card><H2>Providers & billing</H2><p className="text-sm text-neutral-700 mt-2">Create providers, view usage (per participant per class), manage status.</p></Card>
      </div>
    </main>
  )
}
