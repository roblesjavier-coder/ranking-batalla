import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ClubSettings, Profile } from '@/lib/database.types'
import { DesafiarButton } from './DesafiarButton'

interface RankingRow {
  position: number
  profile: Profile | null
}

export default async function RankingPage() {
  const supabase = await createClient()

  const [
    { data: rankingsData, error: rankingsErr },
    { data: clubData },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
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
      .order('position', { ascending: true }),
    supabase.from('club_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.auth.getUser(),
  ])

  if (rankingsErr) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Error cargando el ranking: {rankingsErr.message}
      </div>
    )
  }

  const rankings = (rankingsData ?? []) as unknown as RankingRow[]
  const club = clubData as ClubSettings | null
  const challengeRangeN = club?.challenge_range_n ?? 20
  const bannerUrl = (club as unknown as { banner_url: string | null } | null)?.banner_url

  let myProfileId: string | null = null
  let myPosition: number | null = null
  let amOnVacation = false
  if (user) {
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('id, vacation_until')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (myProfile) {
      myProfileId = myProfile.id
      amOnVacation =
        !!myProfile.vacation_until &&
        new Date(myProfile.vacation_until) > new Date()
      const myRow = rankings.find((r) => r.profile?.id === myProfile.id)
      myPosition = myRow?.position ?? null
    }
  }

  return (
    <div>
      {bannerUrl && (
        <div className="-mx-4 -mt-6 mb-4 overflow-hidden bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt=""
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Ranking del club</h2>
      <p className="text-sm text-gray-500 mb-4">
        {rankings.length} {rankings.length === 1 ? 'jugador' : 'jugadores'} · toca uno para ver sus stats
      </p>

      {rankings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🎾</div>
          <h2 className="text-xl font-semibold text-gray-900">
            Todavia no hay ranking
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            El admin del club todavia no agrego jugadores. Cuando lo haga, los vas a ver aqui ordenados por posicion.
          </p>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {rankings.map((row) => {
            const p = row.profile
            if (!p) return null
            const isPending = !p.auth_user_id
            const isOnVacation =
              !!p.vacation_until && new Date(p.vacation_until) > new Date()
            const displayName = p.full_name?.trim() || p.email || 'Sin nombre'
            const isMe = !!myProfileId && p.id === myProfileId

            const canChallenge =
              !!user &&
              !isMe &&
              myPosition !== null &&
              row.position < myPosition &&
              myPosition - row.position <= challengeRangeN &&
              !amOnVacation &&
              !isOnVacation &&
              !isPending

            return (
              <li
                key={p.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Link
                  href={`/ranking/jugador/${p.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
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
                      {isMe && (
                        <span className="ml-1.5 text-xs text-gray-500">(tu)</span>
                      )}
                    </div>
                    {(isPending || isOnVacation || p.role === 'admin') && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.role === 'admin' && <Badge color="gray">admin</Badge>}
                        {isOnVacation && <Badge color="purple">🏖️ vacaciones</Badge>}
                        {isPending && <Badge color="amber">pendiente</Badge>}
                      </div>
                    )}
                  </div>
                </Link>

                {canChallenge && (
                  <DesafiarButton defenderId={p.id} defenderName={displayName} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function PositionBadge({ position }: { position: number }) {
  const isTop3 = position <= 3
  if (isTop3) {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold text-sm flex items-center justify-center flex-shrink-0">
        #{position}
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-700 border border-gray-200 font-bold text-sm flex items-center justify-center flex-shrink-0">
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
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
