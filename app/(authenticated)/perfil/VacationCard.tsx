'use client'

import { useActionState, useState } from 'react'
import { setVacationMode, type VacationResult } from './actions'

const initial: VacationResult = { ok: false }

interface Props {
  vacationUntil: string | null
  maxDays: number
}

export function VacationCard({ vacationUntil, maxDays }: Props) {
  const [state, formAction, pending] = useActionState(setVacationMode, initial)
  const [days, setDays] = useState(7)

  const isOnVacation =
    !!vacationUntil && new Date(vacationUntil) > new Date()
  const untilFormatted = vacationUntil
    ? new Date(vacationUntil).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏖️</span>
        <h3 className="text-lg font-semibold text-gray-900">Modo vacaciones</h3>
      </div>

      {isOnVacation ? (
        <>
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm text-purple-800">
            Estas en vacaciones hasta el <strong>{untilFormatted}</strong>.
            Mientras tanto, nadie te puede desafiar.
          </div>
          <form action={formAction}>
            <input type="hidden" name="days" value="0" />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-2 text-sm font-medium"
            >
              {pending ? 'Volviendo…' : 'Volver al ranking ahora'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Si te vas de viaje o no puedes jugar por un tiempo, activa el modo vacaciones.
            Mientras dure, nadie podra desafiarte y tu posicion queda guardada.
          </p>
          <form action={formAction} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dias en vacaciones
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  name="days"
                  min={1}
                  max={maxDays}
                  step={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-mono text-sm bg-gray-100 rounded-lg py-1">
                  {days} {days === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Maximo {maxDays} dias por activacion.
              </p>
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 font-medium"
            >
              {pending ? 'Activando…' : `Activar por ${days} ${days === 1 ? 'dia' : 'dias'}`}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
