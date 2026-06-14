import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  // 303 forces a GET on the redirect target after the POST.
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
