'use client'

import { useActionState, useState } from 'react'
import {
  acceptMatchCancel,
  cancelChallenge,
  requestMatchCancel,
  respondChallenge,
  withdrawMatchCancel,
  type ActionResult,
} from './actions'
import { LoadResultForm } from './LoadResultForm'
import type { Challenge, Match, Profile } from '@/lib/database.types'

interface MatchPartial extends Pick<
  Match,
  | 'challenge_id'
  | 'played_at'
  | 'winner_id'
  | 'loser_id'
  | 'score'
  | 'challenger_reported_winner_id'
  | 'challenger_reported_at'
  | 'defender_reported_winner_id'
  | 'defender_reported_at'
  | 'confirmed_at'
  | 'disputed'
> {}

interface Props {
  challenge: Challenge & {
    cancel_requested_by?: string | null
    cancel_requested_at?: string | null
    challenger: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
    defender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  }
  match: MatchPartial | null
  myId: string
}

const initial: ActionResult = { ok: false }

export function ChallengeCard({ challenge, match, myId }: Props) {
  const isMyChallenge = challenge.challenger_id === myId
  const otherParty = isMyChallenge ? challenge.defender : challenge.challenger
  const otherName = otherParty?.full_name ?? 'Jugador'
  const otherAvatar = otherParty?.avatar_url

  const issued = formatDate(challenge.issued_at)
  const expires = formatDate(challenge.expires_at)

  const [respondState, respondAction, respondPending] = useActionState(respondChallenge, initial)
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelChallenge, initial)
  const [reqCancelState, reqCancelAction, reqCancelPending] = useActionState(requestMatchCancel, initial)
  const [accCancelState, accCancelAction, accCancelPending] = useActionState(acceptMatchCancel, initial)
  const [wdCancelState, wdCancelAction, wdCancelPending] = useActionState(withdrawMatchCancel, initial)

  const [showLoadForm, setShowLoadForm] = useState(false)

  const myReported = match
    ? isMyChallenge
      ? !!match.challenger_reported_at
      : !!match.defender_reported_at
    : false
  const otherReported = match
    ? isMyChallenge
      ? !!match.defender_reported_at
      : !!match.challenger_reported_at
    : false

  const cancelReqBy = challenge.cancel_requested_by ?? null
  const iRequestedCancel = cancelReqBy === myId
  const otherRequestedCancel = cancelReqBy && cancelReqBy !== myId
  const noOneRequestedCancel = !cancelReqBy

  return (
    <li className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={otherName} url={otherAvatar} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{otherName}</div>
          <div className="text-xs text-gray-500">
            {isMyChallenge ? 'Lo desafiaste tu' : 'Te desafio'} · {issued}
          </div>
        </div>
        <StatusBadge status={challenge.status} disputed={!!match?.disputed} />
      </div>

      {challenge.status === 'pendiente' && (
        <p className="text-xs text-gray-600 mb-3">Vence el {expires}.</p>
      )}

      {challenge.status === 'aceptado' && !match?.disputed && noOneRequestedCancel && (
        <p className="text-xs text-gray-600 mb-3">
          Tienen hasta el {expires} para concretar el partido.
        </p>
      )}

      {challenge.status === 'aceptado' && match?.disputed && (
        <p className="text-xs text-red-700 mb-3">
          Reportes contradictorios. Esperando resolucion del admin.
        </p>
      )}

      {challenge.status === 'jugado' && match?.confirmed_at && (
        <ResultSummary match={match} challengerId={challenge.challenger_id} />
      )}

      {/* Solicitud de cancelacion */}
      {challenge.status === 'aceptado' && otherRequestedCancel && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-800">
          <p className="font-semibold mb-2">{otherName} pidio cancelar el desafio.</p>
          <p className="mb-2">Si aceptas, se cancela sin que nadie cambie de puesto en el ranking.</p>
          <div className="flex gap-2">
            <form action={accCancelAction} className="flex-1">
              <input type="hidden" name="challenge_id" value={challenge.id} />
              <button
                type="submit"
                disabled={accCancelPending}
                className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-1.5 text-xs font-medium"
              >
                {accCancelPending ? 'Aceptando…' : 'Aceptar cancelar'}
              </button>
            </form>
          </div>
          {accCancelState.error && (
            <p className="mt-2 text-xs text-red-600">{accCancelState.error}</p>
          )}
        </div>
      )}

      {challenge.status === 'aceptado' && iRequestedCancel && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-800">
          <p className="font-semibold mb-2">Pediste cancelar el desafio.</p>
          <p className="mb-2">Esperando que {otherName} acepte. Mientras tanto puedes retirar la solicitud.</p>
          <form action={wdCancelAction}>
            <input type="hidden" name="challenge_id" value={challenge.id} />
            <button
              type="submit"
              disabled={wdCancelPending}
              className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-1.5 text-xs font-medium"
            >
              {wdCancelPending ? 'Retirando…' : 'Retirar solicitud'}
            </button>
          </form>
          {wdCancelState.error && (
            <p className="mt-2 text-xs text-red-600">{wdCancelState.error}</p>
          )}
        </div>
      )}

      {/* Botones segun rol */}
      {challenge.status === 'pendiente' && !isMyChallenge && (
        <div className="flex gap-2">
          <form action={respondAction} className="flex-1">
            <input type="hidden" name="challenge_id" value={challenge.id} />
            <input type="hidden" name="response" value="aceptado" />
            <button
              type="submit"
              disabled={respondPending}
              className="w-full rounded-lg bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white py-2 text-sm font-medium"
            >
              {respondPending ? 'Aceptando…' : 'Aceptar'}
            </button>
          </form>
          <form action={respondAction} className="flex-1">
            <input type="hidden" name="challenge_id" value={challenge.id} />
            <input type="hidden" name="response" value="rechazado" />
            <button
              type="submit"
              disabled={respondPending}
              className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-2 text-sm font-medium"
            >
              Rechazar
            </button>
          </form>
        </div>
      )}

      {challenge.status === 'pendiente' && isMyChallenge && (
        <form action={cancelAction}>
          <input type="hidden" name="challenge_id" value={challenge.id} />
          <button
            type="submit"
            disabled={cancelPending}
            className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-2 text-sm font-medium"
          >
            {cancelPending ? 'Cancelando…' : 'Cancelar desafio'}
          </button>
        </form>
      )}

      {challenge.status === 'aceptado' && !match?.disputed && (
        <>
          {myReported ? (
            <p className="text-xs text-amber-700">
              Ya cargaste tu reporte. {otherReported ? '' : `Esperando que ${otherName} cargue el suyo.`}
            </p>
          ) : !showLoadForm ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowLoadForm(true)}
                className="w-full rounded-lg bg-[var(--primary)] hover:opacity-90 text-white py-2 text-sm font-medium"
              >
                {otherReported ? `${otherName} ya reporto — cargar mi version` : 'Cargar resultado'}
              </button>
              {noOneRequestedCancel && (
                <form action={reqCancelAction}>
                  <input type="hidden" name="challenge_id" value={challenge.id} />
                  <button
                    type="submit"
                    disabled={reqCancelPending}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    {reqCancelPending ? 'Pidiendo…' : 'Pedir cancelar el desafio'}
                  </button>
                </form>
              )}
              {reqCancelState.error && (
                <p className="text-xs text-red-600">{reqCancelState.error}</p>
              )}
            </div>
          ) : (
            challenge.challenger && challenge.defender && (
              <LoadResultForm
                challengeId={challenge.id}
                challenger={challenge.challenger}
                defender={challenge.defender}
                myId={myId}
              />
            )
          )}
        </>
      )}

      {respondState.error && (
        <p className="mt-2 text-xs text-red-600">{respondState.error}</p>
      )}
      {cancelState.error && (
        <p className="mt-2 text-xs text-red-600">{cancelState.error}</p>
      )}
    </li>
  )
}

function ResultSummary({
  match,
  challengerId,
}: {
  match: MatchPartial
  challengerId: string
}) {
  const challengerWon = match.winner_id === challengerId
  const score = match.score as { sets?: { a: number; b: number; format?: string }[] } | null
  return (
    <div className="text-xs text-gray-700 mb-3 bg-gray-50 rounded-lg p-2">
      <div className="font-semibold">
        Gano {challengerWon ? 'el desafiante' : 'el desafiado'}
        {challengerWon && ' · subio puesto'}
      </div>
      {score?.sets && score.sets.length > 0 && (
        <div className="mt-1">
          {score.sets.map((s, i) => (
            <span key={i} className="mr-2">
              Set {i + 1}: {s.a}-{s.b}
              {s.format === 'super_tiebreak' ? ' (super tb)' : s.format === 'tiebreak' ? ' (tb)' : ''}
            </span>
          ))}
        </div>
      )}
      {match.played_at && (
        <div className="mt-1 text-gray-500">Jugado el {formatDate(match.played_at)}</div>
      )}
    </div>
  )
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt=""
        className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-semibold flex items-center justify-center flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function StatusBadge({
  status,
  disputed,
}: {
  status: Challenge['status']
  disputed: boolean
}) {
  if (disputed && status === 'aceptado') {
    return <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-50 text-red-700">disputado</span>
  }
  const map: Record<Challenge['status'], { label: string; className: string }> = {
    pendiente: { label: 'pendiente', className: 'bg-amber-50 text-amber-700' },
    aceptado: { label: 'aceptado', className: 'bg-green-50 text-green-700' },
    rechazado: { label: 'rechazado', className: 'bg-gray-100 text-gray-600' },
    jugado: { label: 'jugado', className: 'bg-blue-50 text-blue-700' },
    walkover_a_desafiante: { label: 'walkover', className: 'bg-purple-50 text-purple-700' },
    walkover_a_desafiado: { label: 'walkover', className: 'bg-purple-50 text-purple-700' },
    cancelado_mutuo: { label: 'cancelado', className: 'bg-gray-100 text-gray-600' },
    cancelado_admin: { label: 'cancelado', className: 'bg-gray-100 text-gray-600' },
    expirado: { label: 'expirado', className: 'bg-red-50 text-red-700' },
  }
  const m = map[status]
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.className}`}>{m.label}</span>
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}
