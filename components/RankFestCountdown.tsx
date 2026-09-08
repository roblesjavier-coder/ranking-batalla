'use client'

import { useSyncExternalStore } from 'react'
import { RANKFEST } from '@/lib/rankfest'

// "Reloj" externo: avisa a los suscriptores cada segundo. En el servidor
// devuelve null para que el HTML inicial no dependa de la hora.
function subscribeClock(onTick: () => void) {
  const id = setInterval(onTick, 1000)
  return () => clearInterval(id)
}
const getClientTime = () => Math.floor(Date.now() / 1000)
const getServerTime = () => null

interface Props {
  /** ISO con zona horaria, ej: 2026-09-12T14:00:00-03:00 */
  startsAt: string
  endsAt: string
  /** compact = chips chicos para el banner; full = bloques grandes para la landing */
  variant?: 'compact' | 'full'
}

type Remaining = { d: number; h: number; m: number; s: number }

function diff(target: Date, now: Date): Remaining {
  const total = Math.max(0, target.getTime() - now.getTime())
  const s = Math.floor(total / 1000)
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

export function RankFestCountdown({ startsAt, endsAt, variant = 'full' }: Props) {
  const seconds = useSyncExternalStore(subscribeClock, getClientTime, getServerTime)
  const now = seconds === null ? null : new Date(seconds * 1000)

  const start = new Date(startsAt)
  const end = new Date(endsAt)

  // Antes de hidratar no sabemos la hora del cliente: mostramos placeholder
  // para evitar diferencias servidor/cliente.
  if (!now) {
    return variant === 'compact' ? (
      <div className="h-9" aria-hidden />
    ) : (
      <div className="h-20" aria-hidden />
    )
  }

  if (now >= end) {
    return (
      <p className={variant === 'compact' ? 'text-xs text-amber-200/80' : 'text-lg text-amber-200/80 tracking-widest uppercase'}>
        {RANKFEST.countdown.done}
      </p>
    )
  }

  if (now >= start) {
    return (
      <p
        className={
          variant === 'compact'
            ? 'text-sm font-bold text-red-400 uppercase tracking-widest animate-pulse'
            : 'text-2xl font-bold text-red-400 uppercase tracking-[0.3em] animate-pulse'
        }
      >
        {RANKFEST.countdown.live}
      </p>
    )
  }

  const r = diff(start, now)
  const units: { value: number; label: string }[] = [
    { value: r.d, label: r.d === 1 ? 'dia' : 'dias' },
    { value: r.h, label: 'hrs' },
    { value: r.m, label: 'min' },
    { value: r.s, label: 'seg' },
  ]

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5" aria-label="Cuenta regresiva">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center bg-black/60 border border-red-900/70 rounded px-2 py-1 min-w-[44px]"
          >
            <span className="text-base font-bold leading-none text-amber-100 tabular-nums">
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-amber-200/70">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4" aria-label="Cuenta regresiva">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center bg-[#12110f] border border-[#4e4639] rounded-lg px-3 py-3 min-w-[64px] sm:min-w-[80px]"
        >
          <span className="text-3xl sm:text-4xl font-bold leading-none text-[#eee4cf] tabular-nums">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#9c9588]">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}
