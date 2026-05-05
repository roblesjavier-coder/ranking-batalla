'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ReorderResult {
  ok: boolean
  error?: string
}

/**
 * Mover un jugador hacia arriba o abajo en una posición.
 * Hace swap atómico con el vecino.
 */
export async function movePlayer(
  _prev: ReorderResult,
  formData: FormData
): Promise<ReorderResult> {
  const supabase = await createClient()
  const profileId = String(formData.get('profile_id') ?? '')
  const direction = String(formData.get('direction') ?? '') as 'up' | 'down'

  if (!profileId) return { ok: false, error: 'profile_id requerido' }
  if (direction !== 'up' && direction !== 'down')
    return { ok: false, error: 'direction inválido' }

  // Posición actual del jugador
  const { data: current } = await supabase
    .from('rankings')
    .select('profile_id, position')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (!current) return { ok: false, error: 'Jugador no está en el ranking.' }

  const targetPos =
    direction === 'up' ? current.position - 1 : current.position + 1

  // Vecino en la posición destino
  const { data: neighbor } = await supabase
    .from('rankings')
    .select('profile_id, position')
    .eq('position', targetPos)
    .maybeSingle()

  if (!neighbor) {
    return { ok: false, error: 'No hay nadie en la posición destino.' }
  }

  // Swap atómico via función PostgreSQL — pero no la tenemos.
  // Workaround: usar 3 updates con posición temporal para evitar conflict de UNIQUE.
  const TEMP = -999
  const { error: e1 } = await supabase
    .from('rankings')
    .update({ position: TEMP })
    .eq('profile_id', current.profile_id)
  if (e1) return { ok: false, error: 'Paso 1 falló: ' + e1.message }

  const { error: e2 } = await supabase
    .from('rankings')
    .update({ position: current.position })
    .eq('profile_id', neighbor.profile_id)
  if (e2) return { ok: false, error: 'Paso 2 falló: ' + e2.message }

  const { error: e3 } = await supabase
    .from('rankings')
    .update({ position: targetPos })
    .eq('profile_id', current.profile_id)
  if (e3) return { ok: false, error: 'Paso 3 falló: ' + e3.message }

  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true }
}

/**
 * Quitar un jugador del ranking (sin eliminar el profile).
 * Útil cuando un jugador deja el club o el admin no quiere estar en el ladder.
 */
export async function removeFromRanking(
  _prev: ReorderResult,
  formData: FormData
): Promise<ReorderResult> {
  const supabase = await createClient()
  const profileId = String(formData.get('profile_id') ?? '')
  if (!profileId) return { ok: false, error: 'profile_id requerido' }

  const { data: current } = await supabase
    .from('rankings')
    .select('position')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (!current) return { ok: false, error: 'No estaba en el ranking.' }

  const { error: delErr } = await supabase
    .from('rankings')
    .delete()
    .eq('profile_id', profileId)
  if (delErr) return { ok: false, error: delErr.message }

  // Reacomodar: bajar 1 a todos los que estaban más abajo
  const { data: below } = await supabase
    .from('rankings')
    .select('profile_id, position')
    .gt('position', current.position)
    .order('position', { ascending: true })
  if (below) {
    for (const row of below) {
      // Update one by one (no hay UPDATE batch en supabase-js sin RPC)
      await supabase
        .from('rankings')
        .update({ position: row.position - 1 })
        .eq('profile_id', row.profile_id)
    }
  }

  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true }
}

/**
 * Agregar un jugador al final del ranking si todavía no está.
 */
export async function addToRanking(
  _prev: ReorderResult,
  formData: FormData
): Promise<ReorderResult> {
  const supabase = await createClient()
  const profileId = String(formData.get('profile_id') ?? '')
  if (!profileId) return { ok: false, error: 'profile_id requerido' }

  const { data: existing } = await supabase
    .from('rankings')
    .select('position')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (existing) return { ok: false, error: 'Ya está en el ranking.' }

  const { data: maxRow } = await supabase
    .from('rankings')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
  const nextPos = (maxRow?.[0]?.position ?? 0) + 1

  const { error } = await supabase
    .from('rankings')
    .insert({ profile_id: profileId, position: nextPos })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true }
}
