import Link from 'next/link'

interface SetScore {
  a: number
  b: number
  format?: string
}

interface ScoreShape {
  sets?: SetScore[]
}

export interface RecentMatch {
  played_at: string | null
  opponent_id: string | null
  opponent_name: string | null
  opponent_avatar: string | null
  score: ScoreShape | null
  i_won: boolean
}

export function RecentMatches({ matches }: { matches: RecentMatch[] }) {
  if (!matches || matches.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Ultimos partidos</h3>
      <ul className="divide-y divide-gray-100">
        {matches.map((m, i) => (
          <li key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
            <ResultBadge won={m.i_won} />

            {m.opponent_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.opponent_avatar}
                alt=""
                className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 font-semibold flex items-center justify-center flex-shrink-0 text-sm">
                {(m.opponent_name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate">
                vs{' '}
                {m.opponent_id ? (
                  <Link
                    href={`/ranking/jugador/${m.opponent_id}`}
                    className="font-medium hover:underline"
                  >
                    {m.opponent_name ?? 'Rival'}
                  </Link>
                ) : (
                  <span className="font-medium">{m.opponent_name ?? 'Rival'}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                <span>{formatScore(m.score)}</span>
                {m.played_at && <span>· {formatDate(m.played_at)}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultBadge({ won }: { won: boolean }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        won ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {won ? 'G' : 'P'}
    </div>
  )
}

function formatScore(score: ScoreShape | null): string {
  if (!score?.sets || score.sets.length === 0) return 'Sin score'
  return score.sets
    .map((s) => {
      const tag =
        s.format === 'super_tiebreak'
          ? ' (super tb)'
          : s.format === 'tiebreak'
          ? ' (tb)'
          : ''
      return `${s.a}-${s.b}${tag}`
    })
    .join(' / ')
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} dias`
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7)
    return `hace ${w} ${w === 1 ? 'semana' : 'semanas'}`
  }
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}
