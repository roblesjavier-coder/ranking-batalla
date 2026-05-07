'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function resolveDispute(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  const winnerId = String(formData.get('winner_id') ?? '')
  const noteRaw = String(formData.get('admin_note') ?? '').trim()
  const note = noteRaw || null

  if (!challengeId || !winnerId) {
    return { ok: false, error: 'Faltan datos.' }
  }

  const { error } = await supabase.rpc('resolve_disputed_match', {
    p_challenge_id: challengeId,
    p_winner_id: winnerId,
    p_admin_note: note,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/disputas')
  revalidatePath('/admin')
  revalidatePath('/desafios')
  revalidatePath('/ranking')
  return { ok: true }
}
