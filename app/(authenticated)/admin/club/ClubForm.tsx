'use client'

import { useActionState } from 'react'
import type { ClubSettings } from '@/lib/database.types'
import { updateClubSettings, type UpdateClubResult } from './actions'

const initialState: UpdateClubResult = { ok: false }

export function ClubForm({ settings }: { settings: ClubSettings | null }) {
  const [state, formAction, pending] = useActionState(
    updateClubSettings,
    initialState
  )

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <Field
        id="club_name"
        label="Nombre del club"
        defaultValue={settings?.club_name ?? ''}
        required
      />

      <Field
        id="challenge_range_n"
        label="N puestos arriba que se puede desafiar"
        type="number"
        min={1}
        defaultValue={String(settings?.challenge_range_n ?? 3)}
        hint="Un jugador puede desafiar a alguien hasta N posiciones arriba."
        required
      />

      <Field
        id="challenge_window_days"
        label="Ventana para concretar el partido (días)"
        type="number"
        min={1}
        defaultValue={String(settings?.challenge_window_days ?? 14)}
        hint="Días que tiene el desafiado para jugar antes del walkover automático."
        required
      />

      <Field
        id="rematch_cooldown_days"
        label="Cooldown entre revanchas (días)"
        type="number"
        min={0}
        defaultValue={String(settings?.rematch_cooldown_days ?? 7)}
        hint="Después de un partido, días que deben pasar antes de poder volver a desafiar al mismo jugador. 0 = sin cooldown."
        required
      />

      <Field
        id="vacation_max_days"
        label="Máximo días de vacaciones por activación"
        type="number"
        min={1}
        defaultValue={String(settings?.vacation_max_days ?? 30)}
        hint="Cuántos días seguidos puede estar un jugador en modo vacaciones."
        required
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600">¡Guardado!</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 font-medium"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  defaultValue,
  type = 'text',
  min,
  hint,
  required,
}: {
  id: string
  label: string
  defaultValue: string
  type?: string
  min?: number
  hint?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        defaultValue={defaultValue}
        min={min}
        required={required}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
