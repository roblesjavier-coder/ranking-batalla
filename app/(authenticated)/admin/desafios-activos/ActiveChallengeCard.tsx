'use client'

import { useActionState, useState } from 'react'
import {
  adminCancelChallenge,
  adminMarkInconclusive,
  type ActionResult,
} from './actions'

export interface ActiveChallenge {
  id: string
  status: 'pendiente' | 'aceptado'
  issued_at: string
  expires_at: string
  challenger: { id: string; full_name: string | null } | null
  defender: { id: string; full_name: string | null } | null
}

const initial: ActionResult = { ok: false }

export function ActiveChallengeCard({ challenge }: { challenge: ActiveChallenge }) {
  const [state, action, pending] = useActionState(adminCancelChallenge, initial)
  const [incState, incAction, incPending] = useActionState(adminMarkInconclusive, initial)
  const [showForm, setShowForm] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [showInc, setShowInc] = useState(false)
  const [incConfirmed, setIncConfirmed] = useState(false)

  const challengerName = challenge.challenger?.full_name ?? 'Desafiante'
  const defenderName = challenge.defender?.full_name ?? 'Desafiado'
  const isPendiente = challenge.status === 'pendiente'

  return (
    <li className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-gray-900 truncate">
          {challengerName} <span className="text-gray-400">vs</span> {defenderName}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            isPendiente ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {challenge.status}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Lanzado el {formatDate(challenge.issued_at)} · vence el {formatDate(challenge.expires_at)}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-1.5 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Cancelar (admin)
        </button>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="challenge_id" value={challenge.id} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              name="note"
              placeholder="Ej: lesion del jugador X"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Confirmo que quiero cancelar este desafio
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setConfirmed(false)
              }}
              className="flex-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 text-sm font-medium"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={pending || !confirmed}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-1.5 text-sm font-medium"
            >
              {pending ? 'Cancelando…' : 'Cancelar desafio'}
            </button>
          </div>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        </form>
      )}

      {/* Marcar inconclusa (solo desafios aceptados) */}
      {challenge.status === 'aceptado' && !showForm && (
        <div className="mt-2">
          {!showInc ? (
            <button
              onClick={() => setShowInc(true)}
              className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium py-1.5 border border-orange-200 rounded-lg hover:bg-orange-50"
            >
              🏳️ Marcar inconclusa (admin)
            </button>
          ) : (
            <form action={incAction} className="space-y-2">
              <input type="hidden" name="challenge_id" value={challenge.id} />
              <p className="text-xs text-gray-600">
                Cierra el desafio como inconcluso sin que nadie cambie de puesto. Usalo cuando no
                hay acuerdo o alguien no entra a cargar el resultado.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  name="note"
                  placeholder="Ej: no se pusieron de acuerdo"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={incConfirmed}
                  onChange={(e) => setIncConfirmed(e.target.checked)}
                />
                Confirmo marcar este desafio como inconcluso
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInc(false)
                    setIncConfirmed(false)
                  }}
                  className="flex-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 text-sm font-medium"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={incPending || !incConfirmed}
                  className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-1.5 text-sm font-medium"
                >
                  {incPending ? 'Marcando…' : 'Marcar inconclusa'}
                </button>
              </div>
              {incState.error && <p className="text-xs text-red-600">{incState.error}</p>}
            </form>
          )}
        </div>
      )}
    </li>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}
