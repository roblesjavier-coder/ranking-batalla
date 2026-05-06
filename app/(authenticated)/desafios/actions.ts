'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, challengeEmailHtml } from '@/lib/resend'

export interface ActionResult {
  ok: boolean
  error?: string
  challengeId?: string
}

const APP_URL = 'https://rankingbatalla.com'

export async function createChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const defenderId = String(formData.get('defender_id') ?? '')
  if (!defenderId) return { ok: false, error: 'defender_id requerido' }

  const { data: challengeId, error } = await supabase.rpc('create_challenge', {
    defender_profile_id: defenderId,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  try {
    const { data: caller } = await supabase.auth.getUser()
    if (caller?.user) {
      const [{ data: challenger }, { data: defender }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_user_id', caller.user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', defenderId)
          .maybeSingle(),
      ])
      if (defender?.email) {
        const { subject, html } = challengeEmailHtml({
          challengerName: challenger?.full_name ?? 'Alguien',
          defenderName: defender.full_name ?? defender.email,
          appUrl: APP_URL,
        })
        await sendEmail({ to: defender.email, subject, html })
      }
    }
  } catch (err) {
    console.error('[createChallenge] email fallo (no bloqueante):', err)
  }

  revalidatePath('/ranking')
  revalidatePath('/desafios')
  return { ok: true, challengeId: challengeId as string }
}

export async function respondChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  const response = String(formData.get('response') ?? '')

  if (!challengeId) return { ok: false, error: 'challenge_id requerido' }
  if (response !== 'aceptado' && response !== 'rechazado') {
    return { ok: false, error: 'Respuesta invalida' }
  }

  const { error } = await supabase.rpc('respond_challenge', {
    p_challenge_id: challengeId,
    p_response: response,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/desafios')
  return { ok: true }
}

export async function cancelChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  if (!challengeId) return { ok: false, error: 'challenge_id requerido' }

  const { error } = await supabase.rpc('cancel_challenge', {
    p_challenge_id: challengeId,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/desafios')
  return { ok: true }
}
