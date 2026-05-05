'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateClubResult {
  ok: boolean
  error?: string
}

export async function updateClubSettings(
  _prev: UpdateClubResult,
  formData: FormData
): Promise<UpdateClubResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No estás autenticado.' }

  const club_name = String(formData.get('club_name') ?? '').trim()
  const challenge_range_n = Number(formData.get('challenge_range_n'))
  const challenge_window_days = Number(formData.get('challenge_window_days'))
  const rematch_cooldown_days = Number(formData.get('rematch_cooldown_days'))
  const vacation_max_days = Number(formData.get('vacation_max_days'))

  if (!club_name) return { ok: false, error: 'El nombre del club es requerido.' }
  if (!Number.isInteger(challenge_range_n) || challenge_range_n < 1)
    return { ok: false, error: 'N puestos arriba debe ser un entero >= 1.' }
  if (!Number.isInteger(challenge_window_days) || challenge_window_days < 1)
    return { ok: false, error: 'La ventana de días debe ser un entero >= 1.' }
  if (!Number.isInteger(rematch_cooldown_days) || rematch_cooldown_days < 0)
    return { ok: false, error: 'El cooldown debe ser un entero >= 0.' }
  if (!Number.isInteger(vacation_max_days) || vacation_max_days < 1)
    return { ok: false, error: 'Máximo de vacaciones debe ser un entero >= 1.' }

  const { error } = await supabase
    .from('club_settings')
    .update({
      club_name,
      challenge_range_n,
      challenge_window_days,
      rematch_cooldown_days,
      vacation_max_days,
    })
    .eq('id', 1)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/club')
  revalidatePath('/ranking')
  revalidatePath('/', 'layout')
  return { ok: true }
}
