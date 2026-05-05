import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'

interface RankingRow {
  position: number
  profile: Profile | null
}

export default async function RankingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rankings')
    .select(
      `
        position,
        profile:profiles!inner (
          id,
          full_name,
          email,
          avatar_url,
          auth_user_id,
          vacation_until,
          role
        )
      `
    )
    .order('position', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Error cargando el ranking: {error.message}
      </div>
    )
  }

  const rankings = (data ?? []) as unknown as RankingRow[]

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">🎾</div>
        <h2 className="text-xl font-semibold text-gray-900">
          Todavía no hay ranking
        </h2>
        <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
          El admin del club todavía no agregó jugadores. Cuando lo haga, los vas
          a ver acá ordenados por posición.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Ranking del club</h2>
      <p className="text-sm text-gray-500 mb-4">
        {rankings.length} {rankings.length === 1 ? 'jugador' : 'jugadores'}
      </p>

      <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        {rankings.map((row) => {
          const p = row.profile
          if (!p) return null
          const isPending = !p.auth_user_id
          const isOnVacation =
            !!p.vacation_until && new Date(p.vacation_until) > new Date()
          const displayName = p.full_name?.trim() || p.email || 'Sin nombre'

          return (
            <li
              key={p.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <PositionBadge position={row.position} />

              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-semibold flex items-center justify-center flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {displayName}
                </div>
                {(isPending || isOnVacation || p.role === 'admin') && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.role === 'admin' && (
                      <Badge color="gray">admin</Badge>
                    )}
                    {isOnVacation && (
                      <Badge color="purple">🏖️ vacaciones</Badge>
                    )}
                    {isPending && (
                      <Badge color="amber">pendiente</Badge>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PositionBadge({ position }: { position: number }) {
  const isTop3 = position <= 3
  const colors = isTop3
    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
    : 'bg-blue-50 text-blue-700 border-blue-100'
  return (
    <div
      className={`w-10 h-10 rounded-full ${colors} border font-bold text-sm flex items-center justify-center flex-shrink-0`}
    >
      #{position}
    </div>
  )
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode
  color: 'amber' | 'purple' | 'gray'
}) {
  const colors = {
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[color]}`}
    >
      {children}
    </span>
  )
}
