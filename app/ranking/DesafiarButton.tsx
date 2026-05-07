'use client'

import { useActionState } from 'react'
import { createChallenge, type ActionResult } from '@/app/(authenticated)/desafios/actions'

const initial: ActionResult = { ok: false }

interface Props {
  defenderId: string
  defenderName: string
}

export function DesafiarButton({ defenderId, defenderName }: Props) {
  const [state, formAction, pending] = useActionState(createChallenge, initial)

  return (
    <form
      action={(fd) => {
        const ok = window.confirm(
          `Vas a desafiar a ${defenderName}.\n\n¿Seguro?`
        )
        if (!ok) return
        formAction(fd)
      }}
      className="flex-shrink-0"
    >
      <input type="hidden" name="defender_id" value={defenderId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5"
      >
        {pending ? '…' : 'Desafiar'}
      </button>
      {state.error && (
        <p className="mt-1 text-xs text-red-600 max-w-[160px]">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-1 text-xs text-green-600 max-w-[160px]">
          ¡Desafio enviado!
        </p>
      )}
    </form>
  )
}
