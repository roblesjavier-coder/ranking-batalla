import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'
import { PerfilForm } from './PerfilForm'
import { PlayerStats, type PlayerStatsData } from './PlayerStats'
import { VacationCard } from './VacationCard'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle<Profile>()

  let stats: PlayerStatsData | null = null
  let maxVacationDays = 30
  if (profile?.id) {
    const [{ data: statsData }, { data: clubData }] = await Promise.all([
      supabase.rpc('get_player_stats', { p_profile_id: profile.id }),
      supabase
        .from('club_settings')
        .select('vacation_max_days')
        .eq('id', 1)
        .maybeSingle(),
    ])

    if (Array.isArray(statsData) && statsData.length > 0) {
      stats = statsData[0] as PlayerStatsData
    } else if (statsData && typeof statsData === 'object') {
      stats = statsData as PlayerStatsData
    }

    if (clubData) {
      const c = clubData as { vacation_max_days: number | null }
      if (c.vacation_max_days) maxVacationDays = c.vacation_max_days
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi perfil</h2>
      <PlayerStats stats={stats} />
      <VacationCard
        vacationUntil={profile?.vacation_until ?? null}
        maxDays={maxVacationDays}
      />
      <PerfilForm profile={profile ?? null} email={user.email ?? ''} />
    </div>
  )
}
