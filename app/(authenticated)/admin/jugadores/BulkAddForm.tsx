'use client'

import { useActionState } from 'react'
import { addPlayersBulk, type AddPlayersResult } from './actions'

const initial: AddPlayersResult = { ok: false }

export function BulkAddForm() {
  const [state, formAction, pending] = useActionState(addPlayersBulk, initial)

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <div>
        <label
          htmlFor="lines"
          className="block text-sm font-medium text-gray-700"
        >
          Pegá los nombres (uno por línea)
        </label>
        <textarea
          id="lines"
          name="lines"
          rows={6}
          required
          placeholder={`Max Lennard Struff\nJoan Draper\nJavier Rublev, javier@gmail.com\nClaudio Rune <claudio@x.com>`}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Solo nombre, o nombre + email (separados por coma o &lt;&gt;). El email
          es opcional, lo podés agregar después.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="append_to_ranking"
          defaultChecked
          className="rounded border-gray-300"
        />
        Agregar al final del ranking automáticamente
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-green-600">
          ¡{state.added} jugador{state.added === 1 ? '' : 'es'} agregado{state.added === 1 ? '' : 's'}!
        </p>
      )}
      {state.skipped && state.skipped.length > 0 && (
        <details className="text-xs text-amber-700 bg-amber-50 rounded p-2">
          <summary>{state.skipped.length} omitido(s)</summary>
          <ul className="mt-1 list-disc pl-5">
            {state.skipped.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </details>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 font-medium"
      >
        {pending ? 'Cargando…' : 'Agregar'}
      </button>
    </form>
  )
}
