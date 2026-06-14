import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reclaimMyProfile } from '@/app/auth/reclaim'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[auth/callback] exchange error:', error)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Reclamo de profile (Google OAuth / magic link). Cubre el caso en que el
  // trigger handle_new_user no se ejecuta.
  try {
    await reclaimMyProfile()
  } catch (claimErr) {
    console.error('[auth/callback] reclaim de profile fallo:', claimErr)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
