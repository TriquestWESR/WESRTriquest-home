import Link from 'next/link'
import { Card, H1, Muted } from '@/components/ui'

export default function HomePage() {
  const sections = [
    {
      title: 'Get Started',
      items: [
        { href: '/login', label: 'Login', desc: 'Sign in to access Admin and Provider tools' },
        { href: '/exam/start', label: 'Start Exam', desc: 'Enter a code to begin an assessment' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { href: '/admin', label: 'Admin Home', desc: 'TR Sections, Providers, Overrides, Billing, Import' },
      ],
    },
    {
      title: 'Provider',
      items: [
        { href: '/provider', label: 'Provider Home', desc: 'Classes, New Class, Overrides, Billing' },
      ],
    },
    {
      title: 'Verify',
      items: [
        { href: '/verify/test', label: 'Verify Certificate', desc: 'Demo verify route for hash-based verification' },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <H1>WESR Portal</H1>
        <Muted className="mt-1">All key areas are one click away. Login for full access.</Muted>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title}>
            <div className="mb-3 font-semibold text-lg">{s.title}</div>
            <ul className="space-y-2">
              {s.items.map((it) => (
                <li key={it.href} className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={it.href} className="font-medium hover:underline">
                      {it.label}
                    </Link>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">{it.desc}</div>
                  </div>
                  <Link
                    href={it.href}
                    className="px-3 py-1.5 rounded-xl text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
