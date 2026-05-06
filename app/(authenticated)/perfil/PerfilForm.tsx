'use client'

import { useActionState, useRef, useState } from 'react'
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
  const [state, formAction, pending] = useActionState(updateProfile, initialState)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile?.avatar_url ?? null
  )
  const [removeFlag, setRemoveFlag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setRemoveFlag(false)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(String(ev.target?.result ?? ''))
    reader.readAsDataURL(file)
  }

  function onRemove() {
    setRemoveFlag(true)
    setPreviewUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
    >
      <input type="hidden" name="remove_avatar" value={removeFlag ? '1' : '0'} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <p className="mt-1 text-sm text-gray-500">{email}</p>
        <p className="mt-1 text-xs text-gray-400">
          (No se puede cambiar — es el que usas para iniciar sesion.)
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto de perfil
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="block w-full text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 font-medium"
            >
              {previewUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={onRemove}
                className="block w-full text-xs text-red-600 hover:text-red-700"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          name="avatar_file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={onPickFile}
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG, WEBP o GIF. Maximo 5 MB.
        </p>
      </div>

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
