'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateProfileResult {
  ok: boolean
  error?: string
}

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])
const MAX_BYTES = 5 * 1024 * 1024

export async function updateProfile(
  _prev: UpdateProfileResult,
  formData: FormData
): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No estas autenticado.' }

  const fullName = String(formData.get('full_name') ?? '').trim()
  if (!fullName) return { ok: false, error: 'El nombre es requerido.' }
  if (fullName.length > 80) {
    return { ok: false, error: 'El nombre es demasiado largo (max 80).' }
  }

  const avatarFile = formData.get('avatar_file') as File | null
  const removeAvatar = String(formData.get('remove_avatar') ?? '') === '1'

  let avatar_url: string | null | undefined = undefined

  if (removeAvatar) {
    avatar_url = null
  } else if (avatarFile && avatarFile.size > 0) {
    if (!ALLOWED_TYPES.has(avatarFile.type)) {
      return { ok: false, error: 'Tipo de imagen no soportado (usa JPG, PNG, WEBP o GIF).' }
    }
    if (avatarFile.size > MAX_BYTES) {
      return { ok: false, error: 'La imagen pesa mas de 5 MB.' }
    }

    const ext = (avatarFile.name.split('.').pop() || 'jpg').toLowerCase()
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `${user.id}/${Date.now()}.${safeExt}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, {
        upsert: true,
        contentType: avatarFile.type,
        cacheControl: '3600',
      })
    if (upErr) {
      return { ok: false, error: 'No se pudo subir la imagen: ' + upErr.message }
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    avatar_url = pub.publicUrl
  }

  const update: { full_name: string; avatar_url?: string | null } = {
    full_name: fullName,
  }
  if (avatar_url !== undefined) update.avatar_url = avatar_url

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('auth_user_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/perfil')
  revalidatePath('/ranking')
  return { ok: true }
}

export interface VacationResult {
  ok: boolean
  error?: string
}

/**
 * Activa el modo vacaciones por N días, o lo desactiva si days = 0.
 */
export async function setVacationMode(
  _prev: VacationResult,
  formData: FormData
): Promise<VacationResult> {
  const supabase = await createClient()
  const daysRaw = String(formData.get('days') ?? '0')
  const days = parseInt(daysRaw, 10)
  if (!Number.isFinite(days)) {
    return { ok: false, error: 'Cantidad de dias invalida.' }
  }

  const { error } = await supabase.rpc('set_vacation_mode', { p_days: days })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/perfil')
  revalidatePath('/ranking')
  return { ok: true }
}
