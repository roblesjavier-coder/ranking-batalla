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

export function challengeResponseEmailHtml({
  challengerName,
  defenderName,
  response,
  appUrl,
}: {
  challengerName: string
  defenderName: string
  response: 'aceptado' | 'rechazado'
  appUrl: string
}): { subject: string; html: string } {
  const accepted = response === 'aceptado'
  const subject = accepted
    ? `${defenderName} acepto tu desafio`
    : `${defenderName} rechazo tu desafio`
  const intro = accepted
    ? `<strong>${defenderName}</strong> acepto el desafio. ¡A coordinar el partido!`
    : `<strong>${defenderName}</strong> rechazo tu desafio.`
  const cta = accepted
    ? 'Tienen 14 dias para jugarlo.'
    : 'Puedes desafiar a alguien mas o esperar para volver a intentarlo.'

  return {
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 12px;">Hola ${challengerName} 👋</h2>
        <p style="margin: 0 0 16px; line-height: 1.5;">${intro}</p>
        <p style="margin: 0 0 24px; line-height: 1.5;">${cta}</p>
        <p style="margin: 0 0 24px;">
          <a href="${appUrl}/desafios"
             style="display: inline-block; background: ${accepted ? '#2563eb' : '#6b7280'}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Ver mis desafios
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
