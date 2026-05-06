'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  sendEmail,
  challengeEmailHtml,
  challengeResponseEmailHtml,
} from '@/lib/resend'

export interface ActionResult {
  ok: boolean
  error?: string
  challengeId?: string
}

const APP_URL = 'https://rankingbatalla.com'

/**
 * Crear un desafio. Lo dispara el desafiante apretando "Desafiar" en /ranking.
 * Las validaciones (regla N, cooldown, vacaciones, etc.) se hacen en la
 * funcion SQL `create_challenge`.
 */
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

  // Email al desafiado — best-effort, no rompe la accion si falla
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

/**
 * Aceptar o rechazar un desafio. Solo el desafiado puede.
 */
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

  // Email al desafiante avisando la respuesta — best-effort
  try {
    const { data: ch } = await supabase
      .from('challenges')
      .select(
        `
          challenger:profiles!challenger_id (full_name, email),
          defender:profiles!defender_id (full_name)
        `
      )
      .eq('id', challengeId)
      .maybeSingle()

    const challenger = (ch?.challenger ?? null) as
      | { full_name: string | null; email: string | null }
      | null
    const defender = (ch?.defender ?? null) as
      | { full_name: string | null }
      | null

    if (challenger?.email) {
    CLAUDE_END_OF_FILE_DELIM

mkdir -p "$(dirname 'lib/resend.ts')"
cat > 'lib/resend.ts' <<'CLAUDE_END_OF_FILE_DELIM'
// Helper para enviar emails via Resend HTTP API.
// La API key se configura en la env var RESEND_API_KEY (en Vercel).

const RESEND_FROM = 'Ranking Batalla <noreply@rankingbatalla.com>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

interface SendEmailResult {
  ok: boolean
  error?: string
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[resend] RESEND_API_KEY no esta configurada')
    return { ok: false, error: 'RESEND_API_KEY no configurada' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[resend] error enviando email:', res.status, errBody)
      return { ok: false, error: `Resend ${res.status}: ${errBody}` }
    }

    return { ok: true }
  } catch (err) {
    console.error('[resend] excepcion enviando email:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Email que se envia al desafiado cuando alguien lo desafia.
 */
export function challengeEmailHtml({
  challengerName,
  defenderName,
  appUrl,
}: {
  challengerName: string
  defenderName: string
  appUrl: string
}): { subject: string; html: string } {
  return {
    subject: `${challengerName} te desafio en Ranking Batalla`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 12px;">Hola ${defenderName} 👋</h2>
        <p style="margin: 0 0 16px; line-height: 1.5;">
          <strong>${challengerName}</strong> te acaba de desafiar.
        </p>
        <p style="margin: 0 0 24px; line-height: 1.5;">
          Entra a la app para aceptar o rechazar el desafio. Tienes 14 dias para concretar el partido.
        </p>
        <p style="margin: 0 0 24px;">
          <a href="${appUrl}/desafios"
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Ver el desafio
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Ranking Batalla · ${appUrl}
        </p>
      </div>
    `,
  }
}
