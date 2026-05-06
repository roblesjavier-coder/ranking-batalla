import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Reclaim de profile precargado: si el email del user matchea un profile
  // sin auth_user_id, se lo asignamos. Esto cubre el caso en que el trigger
  // handle_new_user no se ejecuta (que ya nos paso al menos una vez).
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email) {
      // Caso 1: profile precargado con email coincidente
      await supabase
        .from('profiles')
        .update({
          auth_user_id: user.id,
          claimed_at: new Date().toISOString(),
        })
        .ilike('email', user.email)
        .is('auth_user_id', null)

      // Caso 2: el user ya esta logueado pero NO existe profile alguno con su email
      // (puede pasar con login Google si el trigger fallo y no hay precarga)
      const { data: anyProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (!anyProfile) {
        await supabase.from('profiles').insert({
          auth_user_id: user.id,
          email: user.email,
          full_name:
            (user.user_metadata?.full_name as string | undefined) ?? user.email,
          claimed_at: new Date().toISOString(),
        })
      }
    }
  } catch (claimErr) {
    console.error('[auth/callback] reclaim de profile fallo:', claimErr)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
