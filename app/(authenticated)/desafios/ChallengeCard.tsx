'use client'

import { useActionState } from 'react'
import {
  cancelChallenge,
  respondChallenge,
  type ActionResult,
} from './actions'
import type { Challenge, Profile } from '@/lib/database.types'

interface Props {
  challenge: Challenge & {
    challenger: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
    defender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  }
  myId: string
}

const initial: ActionResult = { ok: false }

export function ChallengeCard({ challenge, myId }: Props) {
  const isMyChallenge = challenge.challenger_id === myId
  const otherParty = isMyChallenge ? challenge.defender : challenge.challenger
  const otherName = otherParty?.full_name ?? 'Jugador'
  const otherAvatar = otherParty?.avatar_url

  const issued = formatDate(challenge.issued_at)
  const expires = formatDate(challenge.expires_at)

  const [respondState, respondAction, respondPending] = useActionState(
    respondChallenge,
    initial
  )
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelChallenge,
    initial
  )

  return (
    <li className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={otherName} url={otherAvatar} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {otherName}
          </div>
          <div className="text-xs text-gray-500">
            {isMyChallenge ? 'Lo desafiaste tu' : 'Te desafio'} · {issued}
          </div>
        </div>
        <StatusBadge status={challenge.status} />
      </div>

      {challenge.status === 'pendiente' && (
        <p className="text-xs text-gray-600 mb-3">
          Vence el {expires}.
        </p>
      )}

      {challenge.status === 'aceptado' && (
        <p className="text-xs text-gray-600 mb-3">
          Tienen hasta el {expires} para concretar el partido.
        </p>
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
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 text-sm font-medium"
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

      {respondState.error && (
        <p className="mt-2 text-xs text-red-600">{respondState.error}</p>
      )}
      {cancelState.error && (
        <p className="mt-2 text-xs text-red-600">{cancelState.error}</p>
      )}
    </li>
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

function StatusBadge({ status }: { status: Challenge['status'] }) {
  const map: Record<Challenge['status'], { label: string; className: string }> =
    {
      pendiente: {
        label: 'pendiente',
        className: 'bg-amber-50 text-amber-700',
      },
      aceptado: {
        label: 'aceptado',
        className: 'bg-green-50 text-green-700',
      },
      rechazado: {
        label: 'rechazado',
        className: 'bg-gray-100 text-gray-600',
      },
      jugado: { label: 'jugado', className: 'bg-blue-50 text-blue-700' },
      walkover_a_desafiante: {
        label: 'walkover',
        className: 'bg-purple-50 text-purple-700',
      },
      walkover_a_desafiado: {
        label: 'walkover',
        className: 'bg-purple-50 text-purple-700',
      },
      cancelado_mutuo: {
        label: 'cancelado',
        className: 'bg-gray-100 text-gray-600',
      },
      cancelado_admin: {
        label: 'cancelado',
        className: 'bg-gray-100 text-gray-600',
      },
      expirado: { label: 'expirado', className: 'bg-red-50 text-red-700' },
    }
  const m = map[status]
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-medium ${m.className}`}
    >
      {m.label}
    </span>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
  })
}
