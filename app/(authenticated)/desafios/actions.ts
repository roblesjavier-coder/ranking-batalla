'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  sendEmail,
  challengeEmailHtml,
  challengeResponseEmailHtml,
  matchResultPendingEmailHtml,
  matchConfirmedEmailHtml,
} from '@/lib/resend'

export interface ActionResult {
  ok: boolean
  error?: string
  challengeId?: string
  status?: 'reporte_parcial' | 'partido_confirmado' | 'partido_disputado'
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
  if (error) return { ok: false, error: error.message }

  try {
    const { data: caller } = await supabase.auth.getUser()
    if (caller?.user) {
      const [{ data: challenger }, { data: defender }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('auth_user_id', caller.user.id).maybeSingle(),
        supabase.from('profiles').select('full_name, email').eq('id', defenderId).maybeSingle(),
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
    console.error('[createChallenge] email fallo:', err)
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

  try {
    const { data: ch } = await supabase
      .from('challenges')
      .select(`
          challenger:profiles!challenger_id (full_name, email),
          defender:profiles!defender_id (full_name)
        `)
      .eq('id', challengeId)
      .maybeSingle()
    const challenger = (ch?.challenger ?? null) as { full_name: string | null; email: string | null } | null
    const defender = (ch?.defender ?? null) as { full_name: string | null } | null
    if (challenger?.email) {
      const { subject, html } = challengeResponseEmailHtml({
        challengerName: challenger.full_name ?? 'Jugador',
        defenderName: defender?.full_name ?? 'Tu rival',
        response: response as 'aceptado' | 'rechazado',
        appUrl: APP_URL,
      })
      await sendEmail({ to: challenger.email, subject, html })
    }
  } catch (err) {
    console.error('[respondChallenge] email fallo:', err)
  }

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
  const { error } = await supabase.rpc('cancel_challenge', { p_challenge_id: challengeId })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/desafios')
  return { ok: true }
}

interface SetScore {
  a: number
  b: number
  format?: 'regular' | 'tiebreak' | 'super_tiebreak'
}

export async function submitMatchResult(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  const winnerId = String(formData.get('winner_id') ?? '')
  if (!challengeId || !winnerId) {
    return { ok: false, error: 'Faltan datos del partido' }
  }

  const sets: SetScore[] = []
  for (let i = 1; i <= 3; i++) {
    const aRaw = formData.get(`set${i}_a`)
    const bRaw = formData.get(`set${i}_b`)
    if (aRaw == null || bRaw == null || aRaw === '' || bRaw === '') {
      if (i === 3) continue
      return { ok: false, error: `Set ${i} incompleto` }
    }
    const a = Number(aRaw)
    const b = Number(bRaw)
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
      return { ok: false, error: `Set ${i} con numero invalido` }
    }
    const fmt = String(formData.get(`set${i}_format`) ?? 'regular') as
      | 'regular'
      | 'tiebreak'
      | 'super_tiebreak'
    sets.push({ a, b, format: fmt })
  }
  if (sets.length < 2) return { ok: false, error: 'Hay que cargar al menos 2 sets' }

  const playedAtRaw = String(formData.get('played_at') ?? '')
  const playedAt = playedAtRaw || undefined

  const { data: statusText, error } = await supabase.rpc('submit_match_result', {
    p_challenge_id: challengeId,
    p_winner_id: winnerId,
    p_score: { sets },
    ...(playedAt ? { p_played_at: playedAt } : {}),
  })
  if (error) return { ok: false, error: error.message }

  const status = statusText as 'reporte_parcial' | 'partido_confirmado' | 'partido_disputado'

  try {
    const { data: ch } = await supabase
      .from('challenges')
      .select(`
          challenger:profiles!challenger_id (id, full_name, email),
          defender:profiles!defender_id (id, full_name, email)
        `)
      .eq('id', challengeId)
      .maybeSingle()
    const challenger = (ch?.challenger ?? null) as
      | { id: string; full_name: string | null; email: string | null }
      | null
    const defender = (ch?.defender ?? null) as
      | { id: string; full_name: string | null; email: string | null }
      | null

    const { data: caller } = await supabase.auth.getUser()
    const callerProfile = caller?.user
      ? (
          await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('auth_user_id', caller.user.id)
            .maybeSingle()
        ).data
      : null

    const reporterIsChallenger = callerProfile?.id === challenger?.id
    const reporter = reporterIsChallenger ? challenger : defender
    const otherParty = reporterIsChallenger ? defender : challenger

    if (status === 'reporte_parcial' && otherParty?.email) {
      const { subject, html } = matchResultPendingEmailHtml({
        recipientName: otherParty.full_name ?? 'Jugador',
        reporterName: reporter?.full_name ?? 'Tu rival',
        appUrl: APP_URL,
      })
      await sendEmail({ to: otherParty.email, subject, html })
    } else if (status === 'partido_confirmado' && challenger && defender) {
      const winnerIsChallenger = winnerId === challenger.id
      const winnerProfile = winnerIsChallenger ? challenger : defender
      const loserProfile = winnerIsChallenger ? defender : challenger
      if (winnerProfile.email) {
        const { subject, html } = matchConfirmedEmailHtml({
          recipientName: winnerProfile.full_name ?? 'Jugador',
          opponentName: loserProfile.full_name ?? 'Tu rival',
          iWon: true,
          appUrl: APP_URL,
        })
        await sendEmail({ to: winnerProfile.email, subject, html })
      }
      if (loserProfile.email) {
        const { subject, html } = matchConfirmedEmailHtml({
          recipientName: loserProfile.full_name ?? 'Jugador',
          opponentName: winnerProfile.full_name ?? 'Tu rival',
          iWon: false,
          appUrl: APP_URL,
        })
        await sendEmail({ to: loserProfile.email, subject, html })
      }
    }
  } catch (err) {
    console.error('[submitMatchResult] email fallo:', err)
  }

  revalidatePath('/desafios')
  revalidatePath('/ranking')
  return { ok: true, status }
}

// Cancelacion mutua post-aceptacion
export async function requestMatchCancel(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  if (!challengeId) return { ok: false, error: 'challenge_id requerido' }
  const { error } = await supabase.rpc('request_match_cancel', {
    p_challenge_id: challengeId,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/desafios')
  return { ok: true }
}

export async function acceptMatchCancel(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  if (!challengeId) return { ok: false, error: 'challenge_id requerido' }
  const { error } = await supabase.rpc('accept_match_cancel', {
    p_challenge_id: challengeId,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/desafios')
  revalidatePath('/ranking')
  return { ok: true }
}

export async function withdrawMatchCancel(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const challengeId = String(formData.get('challenge_id') ?? '')
  if (!challengeId) return { ok: false, error: 'challenge_id requerido' }
  const { error } = await supabase.rpc('withdraw_match_cancel', {
    p_challenge_id: challengeId,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/desafios')
  return { ok: true }
}
