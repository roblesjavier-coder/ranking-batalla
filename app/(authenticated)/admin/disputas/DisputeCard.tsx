'use client'

import { useActionState, useState } from 'react'
import { resolveDispute, type ActionResult } from './actions'

interface SetScore {
  a: number
  b: number
  format?: string
}
interface ScoreShape {
  sets?: SetScore[]
}

export interface DisputeData {
  challenge_id: string
  played_at: string | null
  challenger_reported_winner_id: string | null
  challenger_reported_score: ScoreShape | null
  challenger_reported_at: string | null
  defender_reported_winner_id: string | null
  defender_reported_score: ScoreShape | null
  defender_reported_at: string | null
  challenge: {
    id: string
    challenger_id: string
    defender_id: string
    challenger: { id: string; full_name: string | null } | null
    defender: { id: string; full_name: string | null } | null
  }
}

const initial: ActionResult = { ok: false }

export function DisputeCard({ dispute }: { dispute: DisputeData }) {
  const [state, action, pending] = useActionState(resolveDispute, initial)
  const [winner, setWinner] = useState<string>('')

  const ch = dispute.challenge
  const challengerName = ch.challenger?.full_name ?? 'Desafiante'
  const defenderName = ch.defender?.full_name ?? 'Desafiado'

  const challengerSays = winnerLabel(
    dispute.challenger_reported_winner_id,
    ch.challenger_id,
    challengerName,
    defenderName
  )
  const defenderSays = winnerLabel(
    dispute.defender_reported_winner_id,
    ch.challenger_id,
    challengerName,
    defenderName
  )

  return (
    <li className="bg-white rounded-2xl shadow-sm p-4">
      <div className="text-xs text-gray-500 mb-2">
        {dispute.played_at ? `Jugado el ${formatDate(dispute.played_at)}` : 'Sin fecha'}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <ReportBox
          title={`${challengerName} (desafiante)`}
          says={challengerSays}
          score={dispute.challenger_reported_score}
        />
        <ReportBox
          title={`${defenderName} (desafiado)`}
          says={defenderSays}
          score={dispute.defender_reported_score}
        />
      </div>

      <form action={action} className="space-y-2">
        <input type="hidden" name="challenge_id" value={dispute.challenge_id} />
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ¿Quien gano?
          </label>
          <div className="flex gap-2">
            <RadioOption
              value={ch.challenger_id}
              label={challengerName}
              checked={winner === ch.challenger_id}
              onChange={() => setWinner(ch.challenger_id)}
            />
            <RadioOption
              value={ch.defender_id}
              label={defenderName}
              checked={winner === ch.defender_id}
              onChange={() => setWinner(ch.defender_id)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nota (opcional)
          </label>
          <input
            type="text"
            name="admin_note"
            placeholder="Por que decidiste asi"
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={pending || !winner}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 text-sm font-medium"
        >
          {pending ? 'Resolviendo…' : 'Confirmar resolucion'}
        </button>

        {state.error && (
          <p className="text-xs text-red-600">{state.error}</p>
        )}
      </form>
    </li>
  )
}

function RadioOption({
  value,
  label,
  checked,
  onChange,
}: {
  value: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={`flex-1 rounded-lg border px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
        checked ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input
        type="radio"
        name="winner_id"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="truncate">{label}</span>
    </label>
  )
}

function ReportBox({
  title,
  says,
  score,
}: {
  title: string
  says: string
  score: ScoreShape | null
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-xs">
      <div className="font-semibold text-gray-700 truncate">{title}</div>
      <div className="text-gray-600 mt-1">Gano: {says}</div>
      {score?.sets && score.sets.length > 0 && (
        <div className="text-gray-500 mt-1 space-y-0.5">
          {score.sets.map((s, i) => (
            <div key={i}>
              Set {i + 1}: {s.a}-{s.b}
              {s.format === 'super_tiebreak' ? ' (super tb)' : s.format === 'tiebreak' ? ' (tb)' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function winnerLabel(
  reported: string | null,
  challengerId: string,
  chName: string,
  dfName: string
): string {
  if (!reported) return '—'
  return reported === challengerId ? chName : dfName
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}
