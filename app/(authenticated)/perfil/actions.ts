'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateProfileResult {
  ok: boolean
  error?: string
}

export async function updateProfile(
  _prev: UpdateProfileResult,
  formData: FormData
): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No estás autenticado.' }

  const fullName = String(formData.get('full_name') ?? '').trim()
  const avatarRaw = String(formData.get('avatar_url') ?? '').trim()

  if (!fullName) {
    return { ok: false, error: 'El nombre es requerido.' }
  }
  if (fullName.length > 80) {
    return { ok: false, error: 'El nombre es demasiado largo (máx 80).' }
  }

  let avatar_url: string | null = avatarRaw || null
  if (avatar_url) {
    try {
      const u = new URL(avatar_url)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        return { ok: false, error: 'La URL de la foto debe empezar con http(s)://' }
      }
    } catch {
      return { ok: false, error: 'La URL de la foto no es válida.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, avatar_url })
    .eq('auth_user_id', user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/perfil')
  revalidatePath('/ranking')
  return { ok: true }
}
