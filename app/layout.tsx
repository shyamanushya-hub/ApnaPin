import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ApnaPin — Your locality, your community',
    template: '%s | ApnaPin',
  },
  description:
    'The most trusted page about every locality in India. Find verified information about your PIN code, area, and neighbourhood.',
  metadataBase: new URL('https://apnapin.com'),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const firstName = (user?.user_metadata?.first_name as string | undefined)?.trim()
  const greeting = firstName || (user?.phone ? `+${user.phone}` : 'Signed in')

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <a href="/" className="group flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[11px] text-paper shadow-sm">
                ●
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Apna<span className="text-saffron">Pin</span>
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <span className="hidden text-ink/55 sm:inline">{greeting}</span>
                  <form action="/auth/sign-out" method="post">
                    <button type="submit" className="text-ink/60 transition-colors hover:text-ink">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <a href="/sign-in" className="text-ink/60 transition-colors hover:text-ink">
                    Sign in
                  </a>
                  <a
                    href="/sign-up"
                    className="rounded-full bg-brand-blue px-4 py-1.5 text-paper transition-transform hover:-translate-y-px"
                  >
                    Sign up
                  </a>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="mt-20 border-t border-line/80">
          <div className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-ink/40 sm:px-6">
            <span className="font-display text-sm text-ink/60">ApnaPin</span> · The most trusted page
            about every locality in India · apnapin.com
          </div>
        </footer>
      </body>
    </html>
  )
}
