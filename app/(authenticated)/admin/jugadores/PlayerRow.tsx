'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import type { Profile } from '@/lib/database.types'
import { deletePlayer, updatePlayer } from './actions'

const initial: { ok: boolean; error?: string } = { ok: false }

interface Props {
  player: Profile & { position: number | null }
}

export function PlayerRow({ player }: Props) {
  const [editing, setEditing] = useState(false)
  const [updateState, updateAction, updatePending] = useActionState(
    updatePlayer,
    initial
  )
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePlayer,
    initial
  )

  const displayName = player.full_name?.trim() || player.email || 'Sin nombre'
  const isClaimed = !!player.auth_user_id

  if (editing) {
    return (
      <li className="px-4 py-3">
        <form action={updateAction} className="space-y-2">
          <input type="hidden" name="profile_id" value={player.id} />
          <input
            type="text"
            name="full_name"
            defaultValue={player.full_name ?? ''}
            placeholder="Nombre"
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            defaultValue={player.email ?? ''}
            placeholder="email@ejemplo.com (opcional)"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {updateState.error && (
            <p className="text-xs text-red-600">{updateState.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updatePending}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-1.5 text-sm font-medium"
            >
              {updatePending ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="w-8 text-center text-sm text-gray-500 font-medium flex-shrink-0">
        {player.position ? `#${player.position}` : '—'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{displayName}</div>
        <div className="text-xs text-gray-500 truncate">
          {player.email || 'sin email'}
        </div>
        <div className="flex gap-1.5 mt-1">
          {player.role === 'admin' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
              admin
            </span>
          )}
          {!isClaimed && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
              pendiente
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Editar
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="profile_id" value={player.id} />
          <button
            type="submit"
            disabled={deletePending}
            onClick={(e) => {
              if (!confirm(`¿Eliminar a ${displayName}?`)) e.preventDefault()
            }}
            className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50"
          >
            {deletePending ? '…' : 'Eliminar'}
          </button>
        </form>
      </div>
    </li>
  )
}
