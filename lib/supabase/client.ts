import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client — use in 'use client' components
// Singleton pattern: only one instance per browser session
let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}
