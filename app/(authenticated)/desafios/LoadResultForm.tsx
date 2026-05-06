'use client'

import { useActionState, useState } from 'react'
import { submitMatchResult, type ActionResult } from './actions'

interface Player {
  id: string
  full_name: string | null
}

interface Props {
  challengeId: string
  challenger: Player
  defender: Player
  myId: string
}

const initial: ActionResult = { ok: false }

export function LoadResultForm({ challengeId, challenger, defender, myId }: Props) {
  const [state, formAction, pending] = useActionState(submitMatchResult, initial)
  const [showSet3, setShowSet3] = useState(false)
  const [winnerId, setWinnerId] = useState<string>('')

  const challengerName = challenger.full_name?.trim() || 'Desafiante'
  const defenderName = defender.full_name?.trim() || 'Desafiado'
  const iAmChallenger = myId === challenger.id

  return (
    <form action={formAction} className="space-y-3 mt-3 pt-3 border-t border-gray-100">
      <input type="hidden" name="challenge_id" value={challengeId} />

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Fecha del partido
        </label>
        <input
          type="date"
          name="played_at"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <SetRow num={1} challengerName={challengerName} defenderName={defenderName} />
      <SetRow num={2} challengerName={challengerName} defenderName={defenderName} />

      {!showSet3 ? (
        <button
          type="button"
          onClick={() => setShowSet3(true)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          + Agregar set 3 (definitorio)
        </button>
      ) : (
        <div className="space-y-2">
          <SetRow num={3} challengerName={challengerName} defenderName={defenderName} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Formato del set 3
            </label>
            <select
              name="set3_format"
              defaultValue="regular"
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm bg-white"
            >
              <option value="regular">Set normal (a 6/7 games)</option>
              <option value="tiebreak">Tiebreak comun</option>
              <option value="super_tiebreak">Super tiebreak (a 10)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowSet3(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Quitar set 3
          </button>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">¿Quien gano?</label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="winner_id"
              value={challenger.id}
              required
              checked={winnerId === challenger.id}
              onChange={(e) => setWinnerId(e.target.value)}
            />
            <span>{challengerName}{iAmChallenger ? ' (yo)' : ''}</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="winner_id"
              value={defender.id}
              required
              checked={winnerId === defender.id}
              onChange={(e) => setWinnerId(e.target.value)}
            />
            <span>{defenderName}{!iAmChallenger ? ' (yo)' : ''}</span>
          </label>
        </div>
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.ok && state.status === 'reporte_parcial' && (
        <p className="text-xs text-amber-700">
          ¡Reporte guardado! Esperando que tu rival cargue el suyo.
        </p>
      )}
      {state.ok && state.status === 'partido_confirmado' && (
        <p className="text-xs text-green-700">
          ¡Partido confirmado! El ranking se actualizo si correspondia.
        </p>
      )}
      {state.ok && state.status === 'partido_disputado' && (
        <p className="text-xs text-red-700">
          Reportes contradictorios. El admin va a resolver el caso.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 text-sm font-medium"
      >
        {pending ? 'Guardando…' : 'Cargar resultado'}
      </button>
    </form>
  )
}

function SetRow({
  num,
  challengerName,
  defenderName,
}: {
  num: number
  challengerName: string
  defenderName: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        Set {num}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          name={`set${num}_a`}
          min={0}
          max={20}
          required={num !== 3}
          placeholder={challengerName.slice(0, 8)}
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          name={`set${num}_b`}
          min={0}
          max={20}
          required={num !== 3}
          placeholder={defenderName.slice(0, 8)}
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500 ml-2 truncate">
          {challengerName} vs {defenderName}
        </span>
      </div>
    </div>
  )
}
