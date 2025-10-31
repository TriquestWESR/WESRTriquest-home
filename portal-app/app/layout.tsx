import './globals.css'
import Providers from '@/components/providers'
import ThemeToggle from '@/components/theme-toggle'
import NavBar from '@/components/nav'
import Breadcrumbs from '@/components/breadcrumbs'
export const metadata = {
  title: 'WESR Triquest — Portal',
  robots: { index: false, follow: false }
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Providers>
          <NavBar />
          <Breadcrumbs />
          <main className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
          <footer className="mt-6 border-t border-neutral-200/70 dark:border-neutral-800/60">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-3">
              <span>© {new Date().getFullYear()} WESR</span>
              <span className="opacity-50">•</span>
              <a href="/login" className="hover:underline">Login</a>
              <span className="opacity-50">•</span>
              <a href="/admin" className="hover:underline">Admin</a>
              <span className="opacity-50">•</span>
              <a href="/provider" className="hover:underline">Provider</a>
              <span className="opacity-50">•</span>
              <a href="/exam/start" className="hover:underline">Exam</a>
            </div>
          </footer>
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  )
}
