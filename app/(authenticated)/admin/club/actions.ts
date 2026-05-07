'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateClubResult {
  ok: boolean
  error?: string
}

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function updateClubSettings(
  _prev: UpdateClubResult,
  formData: FormData
): Promise<UpdateClubResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No estas autenticado.' }

  const club_name = String(formData.get('club_name') ?? '').trim()
  const challenge_range_n = Number(formData.get('challenge_range_n'))
  const challenge_window_days = Number(formData.get('challenge_window_days'))
  const rematch_cooldown_days = Number(formData.get('rematch_cooldown_days'))
  const vacation_max_days = Number(formData.get('vacation_max_days'))
  const primary_color = String(formData.get('primary_color') ?? '').trim() || '#b91c1c'

  if (!club_name) return { ok: false, error: 'Nombre del club requerido.' }
  if (!Number.isFinite(challenge_range_n) || challenge_range_n < 1)
    return { ok: false, error: 'N debe ser un numero >= 1.' }
  if (!Number.isFinite(challenge_window_days) || challenge_window_days < 1)
    return { ok: false, error: 'Ventana debe ser un numero >= 1.' }
  if (!Number.isFinite(rematch_cooldown_days) || rematch_cooldown_days < 0)
    return { ok: false, error: 'Cooldown debe ser un numero >= 0.' }
  if (!Number.isFinite(vacation_max_days) || vacation_max_days < 1)
    return { ok: false, error: 'Vacation max debe ser un numero >= 1.' }
  if (!/^#[0-9a-fA-F]{6}$/.test(primary_color))
    return { ok: false, error: 'Color primario invalido (debe ser hex #rrggbb).' }

  const updates: Record<string, unknown> = {
    club_name,
    challenge_range_n,
    challenge_window_days,
    rematch_cooldown_days,
    vacation_max_days,
    primary_color,
  }

  // Logo
  const logoFile = formData.get('logo_file')
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_MIME.includes(logoFile.type)) {
      return { ok: false, error: 'Formato de logo invalido (png, jpg, svg o webp).' }
    }
    if (logoFile.size > MAX_BYTES) {
      return { ok: false, error: 'Logo demasiado grande (max 5MB).' }
    }
    const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `logo-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('club-assets')
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type })
    if (upErr) return { ok: false, error: `Error subiendo logo: ${upErr.message}` }
    const { data: pub } = supabase.storage.from('club-assets').getPublicUrl(path)
    updates.logo_url = pub.publicUrl
  } else if (formData.get('remove_logo') === '1') {
    updates.logo_url = null
  }

  // Banner
  const bannerFile = formData.get('banner_file')
  if (bannerFile instanceof File && bannerFile.size > 0) {
    if (!ALLOWED_MIME.includes(bannerFile.type)) {
      return { ok: false, error: 'Formato de banner invalido (png, jpg, svg o webp).' }
    }
    if (bannerFile.size > MAX_BYTES) {
      return { ok: false, error: 'Banner demasiado grande (max 5MB).' }
    }
    const ext = bannerFile.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `banner-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('club-assets')
      .upload(path, bannerFile, { upsert: true, contentType: bannerFile.type })
    if (upErr) return { ok: false, error: `Error subiendo banner: ${upErr.message}` }
    const { data: pub } = supabase.storage.from('club-assets').getPublicUrl(path)
    updates.banner_url = pub.publicUrl
  } else if (formData.get('remove_banner') === '1') {
    updates.banner_url = null
  }

  const { error } = await supabase.from('club_settings').update(updates).eq('id', 1)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/club')
  revalidatePath('/admin')
  revalidatePath('/ranking')
  revalidatePath('/')
  return { ok: true }
}
