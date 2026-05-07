import { createClient } from '@/lib/supabase/server'
import type { ClubSettings, Profile } from '@/lib/database.types'
import { PerfilForm } from './PerfilForm'
import { VacationCard } from './VacationCard'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: club }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle<Profile>(),
    supabase.from('club_settings').select('*').eq('id', 1).maybeSingle<ClubSettings>(),
  ])

  const maxDays = club?.vacation_max_days ?? 30

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Mi perfil</h2>
      <PerfilForm profile={profile ?? null} email={user.email ?? ''} />
      <VacationCard
        vacationUntil={profile?.vacation_until ?? null}
        maxDays={maxDays}
      />
    </div>
  )
}
