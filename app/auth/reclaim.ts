'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Reclama el profile del usuario logueado, sin importar el metodo de login
 * (Google OAuth, magic link o codigo OTP). Es idempotente: si el profile ya
 * esta reclamado, no hace nada. Reemplaza la dependencia del trigger
 * handle_new_user, que fallaba silenciosamente.
 */
export async function reclaimMyProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return

  // Caso 1: profile precargado con email coincidente y sin auth_user_id
  await supabase
    .from('profiles')
    .update({
      auth_user_id: user.id,
      claimed_at: new Date().toISOString(),
    })
    .ilike('email', user.email)
    .is('auth_user_id', null)

  // Caso 2: no existe ningun profile para este user todavia -> lo creamos
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
