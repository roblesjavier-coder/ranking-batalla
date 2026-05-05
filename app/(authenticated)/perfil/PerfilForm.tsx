'use client'

import { useActionState } from 'react'
import type { Profile } from '@/lib/database.types'
import { updateProfile, type UpdateProfileResult } from './actions'

const initialState: UpdateProfileResult = { ok: false }

export function PerfilForm({
  profile,
  email,
}: {
  profile: Profile | null
  email: string
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  )

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <p className="mt-1 text-sm text-gray-500">{email}</p>
        <p className="mt-1 text-xs text-gray-400">
          (No se puede cambiar — es el que usas para iniciar sesión.)
        </p>
      </div>

      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre completo
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name ?? ''}
          required
          maxLength={80}
          placeholder="Tu nombre"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="avatar_url"
          className="block text-sm font-medium text-gray-700"
        >
          URL de foto (opcional)
        </label>
        <input
          type="url"
          id="avatar_url"
          name="avatar_url"
          defaultValue={profile?.avatar_url ?? ''}
          placeholder="https://..."
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Por ahora pegá un link. Más adelante vas a poder subir una foto desde
          el celular.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-green-600">¡Guardado!</p>
      )}

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
