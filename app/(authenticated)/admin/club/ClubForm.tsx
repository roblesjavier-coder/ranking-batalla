'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { updateClubSettings, type UpdateClubResult } from './actions'

export interface ClubBranding {
  club_name: string | null
  logo_url: string | null
  banner_url: string | null
  primary_color: string | null
  challenge_range_n: number | null
  challenge_window_days: number | null
  rematch_cooldown_days: number | null
  vacation_max_days: number | null
}

const initial: UpdateClubResult = { ok: false }

export function ClubForm({ settings }: { settings: ClubBranding | null }) {
  const [state, formAction, pending] = useActionState(updateClubSettings, initial)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logo_url ?? null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(settings?.banner_url ?? null)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [bannerRemoved, setBannerRemoved] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color ?? '#b91c1c')

  function onLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setLogoRemoved(false)
  }

  function onBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerPreview(URL.createObjectURL(file))
    setBannerRemoved(false)
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* ---------- BANNER ---------- */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Banner del club</h3>
        {bannerPreview && !bannerRemoved ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerPreview}
            alt="banner"
            className="w-full aspect-[4/3] object-cover rounded-xl bg-gray-100 mb-2"
          />
        ) : (
          <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400 mb-2">
            Sin banner
          </div>
        )}
        <input
          type="file"
          name="banner_file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={onBannerChange}
          className="text-sm w-full"
        />
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG o WEBP. Max 5MB.</p>
        {bannerPreview && !bannerRemoved && (
          <button
            type="button"
            onClick={() => {
              setBannerPreview(null)
              setBannerRemoved(true)
            }}
            className="text-xs text-red-600 mt-2"
          >
            Quitar banner
          </button>
        )}
        {bannerRemoved && <input type="hidden" name="remove_banner" value="1" />}
      </section>

      {/* ---------- LOGO ---------- */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Logo del club</h3>
        <div className="flex items-center gap-4">
          {logoPreview && !logoRemoved ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt="logo"
              className="w-20 h-20 rounded-full object-cover bg-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
              Sin logo
            </div>
          )}
          <div className="flex-1 min-w-0">
            <input
              type="file"
              name="logo_file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={onLogoChange}
              className="text-sm w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Cuadrado/redondo. Max 5MB.</p>
            {logoPreview && !logoRemoved && (
              <button
                type="button"
                onClick={() => {
                  setLogoPreview(null)
                  setLogoRemoved(true)
                }}
                className="text-xs text-red-600 mt-2"
              >
                Quitar logo
              </button>
            )}
            {logoRemoved && <input type="hidden" name="remove_logo" value="1" />}
          </div>
        </div>
      </section>

      {/* ---------- COLOR PRIMARIO ---------- */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Color primario</h3>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-14 h-11 rounded cursor-pointer border border-gray-200"
          />
          <input
            type="text"
            name="primary_color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            pattern="^#[0-9a-fA-F]{6}$"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Se aplica en botones, badges y links de la app.
        </p>
        <div
          className="mt-3 rounded-lg p-3 text-white text-sm font-medium text-center"
          style={{ backgroundColor: primaryColor }}
        >
          Preview del color en un boton
        </div>
      </section>

      {/* ---------- DATOS DEL CLUB ---------- */}
      <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Datos del club</h3>

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
          label="Ventana para concretar el partido (dias)"
          type="number"
          min={1}
          defaultValue={String(settings?.challenge_window_days ?? 14)}
          hint="Dias que tienen para jugar antes del walkover automatico."
          required
        />

        <Field
          id="rematch_cooldown_days"
          label="Cooldown entre revanchas (dias)"
          type="number"
          min={0}
          defaultValue={String(settings?.rematch_cooldown_days ?? 7)}
          hint="Dias que deben pasar antes de poder volver a desafiar al mismo. 0 = sin cooldown."
          required
        />

        <Field
          id="vacation_max_days"
          label="Maximo dias de vacaciones por activacion"
          type="number"
          min={1}
          defaultValue={String(settings?.vacation_max_days ?? 30)}
          hint="Cuantos dias seguidos puede estar un jugador en modo vacaciones."
          required
        />
      </section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600">¡Guardado!</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg text-white py-2.5 font-medium disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
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
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
