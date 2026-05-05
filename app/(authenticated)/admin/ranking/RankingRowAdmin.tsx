'use client'

import { useActionState } from 'react'
import type { Profile } from '@/lib/database.types'
import {
  movePlayer,
  removeFromRanking,
  addToRanking,
  type ReorderResult,
} from './actions'

const initial: ReorderResult = { ok: false }

interface Props {
  position: number | null
  profile: Profile
  isFirst: boolean
  isLast: boolean
}

export function RankingRowAdmin({ position, profile, isFirst, isLast }: Props) {
  const [moveState, moveAction, movePending] = useActionState(movePlayer, initial)
  const [removeState, removeAction, removePending] = useActionState(
    removeFromRanking,
    initial
  )
  const [addState, addAction, addPending] = useActionState(addToRanking, initial)

  const displayName = profile.full_name?.trim() || profile.email || 'Sin nombre'
  const inRanking = position !== null

  const errMsg = moveState.error || removeState.error || addState.error

  return (
    <li className="px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="w-10 text-center text-sm font-bold text-gray-700 flex-shrink-0">
          {position !== null ? `#${position}` : '—'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{displayName}</div>
          {profile.role === 'admin' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
              admin
            </span>
          )}
        </div>
        {inRanking ? (
          <div className="flex items-center gap-1">
            <form action={moveAction}>
              <input type="hidden" name="profile_id" value={profile.id} />
              <input type="hidden" name="direction" value="up" />
              <button
                type="submit"
                disabled={isFirst || movePending}
                className="w-9 h-9 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 text-lg leading-none"
                aria-label="Mover arriba"
              >
                ↑
              </button>
            </form>
            <form action={moveAction}>
              <input type="hidden" name="profile_id" value={profile.id} />
              <input type="hidden" name="direction" value="down" />
              <button
                type="submit"
                disabled={isLast || movePending}
                className="w-9 h-9 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 text-lg leading-none"
                aria-label="Mover abajo"
              >
                ↓
              </button>
            </form>
            <form action={removeAction}>
              <input type="hidden" name="profile_id" value={profile.id} />
              <button
                type="submit"
                disabled={removePending}
                onClick={(e) => {
                  if (
                    !confirm(
                      `Sacar a ${displayName} del ranking? (no se elimina del club)`
                    )
                  )
                    e.preventDefault()
                }}
                className="px-2 h-9 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs disabled:opacity-50"
              >
                Sacar
              </button>
            </form>
          </div>
        ) : (
          <form action={addAction}>
            <input type="hidden" name="profile_id" value={profile.id} />
            <button
              type="submit"
              disabled={addPending}
              className="px-3 h-9 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
            >
              Agregar al final
            </button>
          </form>
        )}
      </div>
      {errMsg && <p className="text-xs text-red-600 mt-1">{errMsg}</p>}
    </li>
  )
}
