"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
  { href: '/admin', label: 'Admin' },
  { href: '/provider', label: 'Provider' },
  { href: '/exam/start', label: 'Exam' },
  { href: '/verify/test', label: 'Verify' },
]

export default function NavBar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">WESR Portal</Link>
        <nav className="ml-auto flex items-center gap-1">
          {links.map(l => {
            let active = false
            try {
              active = !!pathname && (pathname === l.href || (l.href !== '/' && pathname!.startsWith(l.href)))
            } catch (err) {
              // Ignore any unexpected errors from pathname
              active = false
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "px-3 py-2 rounded-xl text-sm transition-colors " +
                  (active
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900")
                }
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
