"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  const items = [{ href: '/', label: 'Home' }].concat(
    parts.map((p, i) => ({
      href: '/' + parts.slice(0, i + 1).join('/'),
      label: decodeURIComponent(p)
    }))
  )
  if (items.length <= 1) return null
  return (
    <div className="border-b border-neutral-200/70 dark:border-neutral-800/60 bg-neutral-50/60 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-6xl px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <span key={it.href} className="flex items-center gap-1">
            {i > 0 && <span className="opacity-60">/</span>}
            {i === items.length - 1 ? (
              <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{it.label.replace('-', ' ')}</span>
            ) : (
              <Link href={it.href} className="hover:underline capitalize">{it.label.replace('-', ' ')}</Link>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
