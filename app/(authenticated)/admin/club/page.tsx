import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClubForm, type ClubBranding } from './ClubForm'

export default async function AdminClubPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('club_settings')
    .select(
      'club_name, logo_url, banner_url, primary_color, challenge_range_n, challenge_window_days, rematch_cooldown_days, vacation_max_days'
    )
    .eq('id', 1)
    .maybeSingle()

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Volver
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Configurar club</h2>
      <p className="text-sm text-gray-500 mb-6">
        Branding, reglas del ladder y vacaciones.
      </p>
      <ClubForm settings={(data ?? null) as ClubBranding | null} />
    </div>
  )
}
