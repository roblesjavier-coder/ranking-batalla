// Helper para enviar emails via Resend HTTP API.

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
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('[resend] error:', res.status, errBody)
      return { ok: false, error: `Resend ${res.status}: ${errBody}` }
    }
    return { ok: true }
  } catch (err) {
    console.error('[resend] excepcion:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

function frame(title: string, body: string, ctaLabel: string, ctaUrl: string, ctaColor = '#2563eb'): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 12px;">${title}</h2>
      ${body}
      <p style="margin: 24px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background: ${ctaColor}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500;">${ctaLabel}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">Ranking Batalla</p>
    </div>
  `
}

function formatExpiresEs(iso: string | null): string | null {
  if (!iso) return null
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long' })
  } catch {
    return null
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
    html: frame(
      `Hola ${defenderName} 👋`,
      `<p style="margin:0 0 16px;line-height:1.5;"><strong>${challengerName}</strong> te acaba de desafiar.</p>
       <p style="margin:0;line-height:1.5;">Entra a la app para aceptar o rechazar el desafio. Tienen 14 dias para concretar el partido.</p>`,
      'Ver el desafio',
      `${appUrl}/desafios`
    ),
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
    ? 'Tienen 14 dias para jugarlo. Cuando lo jueguen, ambos cargan el resultado en la app.'
    : 'Puedes desafiar a alguien mas.'
  return {
    subject,
    html: frame(
      `Hola ${challengerName} 👋`,
      `<p style="margin:0 0 16px;line-height:1.5;">${intro}</p><p style="margin:0;line-height:1.5;">${cta}</p>`,
      'Ver mis desafios',
      `${appUrl}/desafios`,
      accepted ? '#2563eb' : '#6b7280'
    ),
  }
}

// Nuevo: mail unificado de "desafio confirmado" para ambos jugadores
// cuando el desafiado acepta. Incluye la fecha real de expiracion.
export function challengeConfirmedEmailHtml({
  recipientName,
  opponentName,
  expiresAt,
  appUrl,
}: {
  recipientName: string
  opponentName: string
  expiresAt: string | null
  appUrl: string
}): { subject: string; html: string } {
  const expiresFormatted = formatExpiresEs(expiresAt)
  const deadline = expiresFormatted
    ? `Tienen hasta el <strong>${expiresFormatted}</strong> para jugarlo.`
    : `Tienen 14 dias para jugarlo.`
  return {
    subject: `Desafio confirmado vs ${opponentName}`,
    html: frame(
      `Hola ${recipientName} 👋`,
      `<p style="margin:0 0 16px;line-height:1.5;">El desafio contra <strong>${opponentName}</strong> esta confirmado.</p>
       <p style="margin:0 0 16px;line-height:1.5;">${deadline}</p>
       <p style="margin:0;line-height:1.5;">Cuando jueguen, ambos cargan el resultado en la app. Si los dos coinciden en el ganador, el ranking se actualiza automaticamente.</p>`,
      'Ver el desafio',
      `${appUrl}/desafios`
    ),
  }
}

export function matchResultPendingEmailHtml({
  recipientName,
  reporterName,
  appUrl,
}: {
  recipientName: string
  reporterName: string
  appUrl: string
}): { subject: string; html: string } {
  return {
    subject: `${reporterName} cargo el resultado del partido`,
    html: frame(
      `Hola ${recipientName} 👋`,
      `<p style="margin:0 0 16px;line-height:1.5;"><strong>${reporterName}</strong> ya cargo el resultado del partido.</p>
       <p style="margin:0;line-height:1.5;">Para confirmarlo y cerrar el desafio, entra y carga tu version. Si los dos coinciden en el ganador, el ranking se actualiza automaticamente.</p>`,
      'Cargar mi resultado',
      `${appUrl}/desafios`
    ),
  }
}

export function matchConfirmedEmailHtml({
  recipientName,
  opponentName,
  iWon,
  appUrl,
}: {
  recipientName: string
  opponentName: string
  iWon: boolean
  appUrl: string
}): { subject: string; html: string } {
  const subject = iWon
    ? `Ganaste contra ${opponentName} 🎾`
    : `Resultado confirmado vs ${opponentName}`
  const intro = iWon
    ? `Ganaste contra <strong>${opponentName}</strong>. ¡Buen partido!`
    : `Cerro el partido contra <strong>${opponentName}</strong>.`
  return {
    subject,
    html: frame(
      `Hola ${recipientName} 👋`,
      `<p style="margin:0 0 16px;line-height:1.5;">${intro}</p>
       <p style="margin:0;line-height:1.5;">Mira el ranking actualizado en la app.</p>`,
      'Ver el ranking',
      `${appUrl}/ranking`,
      iWon ? '#16a34a' : '#6b7280'
    ),
  }
}
