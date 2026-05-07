import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayerStats, type PlayerStatsData } from '@/components/PlayerStats'
import { RecentMatches, type RecentMatch } from '@/components/RecentMatches'

interface Props {
  params: Promise<{ id: string }>
}

export default async function JugadorPublicoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: profile },
    { data: statsData },
    { data: matchesData },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, vacation_until, auth_user_id')
      .eq('id', id)
      .maybeSingle(),
    supabase.rpc('get_player_stats', { p_profile_id: id }),
    supabase.rpc('get_player_recent_matches', { p_profile_id: id, p_limit: 5 }),
    supabase.auth.getUser(),
  ])

  if (!profile) {
    notFound()
  }

  let stats: PlayerStatsData | null = null
  if (Array.isArray(statsData) && statsData.length > 0) {
    stats = statsData[0] as PlayerStatsData
  } else if (statsData && typeof statsData === 'object') {
    stats = statsData as PlayerStatsData
  }

  const matches: RecentMatch[] = Array.isArray(matchesData)
    ? (matchesData as RecentMatch[])
    : []

  const p = profile as {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    role: string | null
    vacation_until: string | null
    auth_user_id: string | null
  }

  const displayName = p.full_name?.trim() || p.email || 'Sin nombre'
  const isOnVacation =
    !!p.vacation_until && new Date(p.vacation_until) > new Date()
  const isPending = !p.auth_user_id

  let isOwnProfile = false
  if (user) {
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    isOwnProfile = (myProfile as { id: string } | null)?.id === p.id
  }

  return (
    <div>
      <Link
        href="/ranking"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Volver al ranking
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 flex items-center gap-4">
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatar_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover bg-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 text-gray-500 font-semibold text-3xl flex items-center justify-center flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{displayName}</h1>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.role === 'admin' && <Badge color="gray">admin</Badge>}
            {isOnVacation && <Badge color="purple">🏖️ vacaciones</Badge>}
            {isPending && <Badge color="amber">pendiente</Badge>}
          </div>
        </div>
      </div>

      <PlayerStats stats={stats} />
      <RecentMatches matches={matches} />

      {isOwnProfile && (
        <Link
          href="/perfil"
          className="block w-full rounded-lg text-white py-2.5 text-center font-medium"
          style={{ backgroundColor: 'var(--primary, #b91c1c)' }}
        >
          Editar mi perfil
        </Link>
      )}
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
