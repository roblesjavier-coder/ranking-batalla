import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ClubSettings } from '@/lib/database.types'
import { ClubForm } from './ClubForm'

export default async function AdminClubPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('club_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle<ClubSettings>()

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Volver
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurar club</h2>
      <ClubForm settings={data ?? null} />
    </div>
  )
}
