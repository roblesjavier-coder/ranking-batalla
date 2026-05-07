'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function adminCancelChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  const noteRaw = String(formData.get('note') ?? '').trim()
  const note = noteRaw || null

  if (!challengeId) {
    return { ok: false, error: 'Faltan datos.' }
  }

  const { error } = await supabase.rpc('admin_cancel_challenge', {
    p_challenge_id: challengeId,
    p_note: note,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/desafios-activos')
  revalidatePath('/admin')
  revalidatePath('/desafios')
  return { ok: true }
}
