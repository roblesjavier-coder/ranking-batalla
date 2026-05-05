import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'
import { BulkAddForm } from './BulkAddForm'
import { PlayerRow } from './PlayerRow'

interface PlayerWithPosition extends Profile {
  position: number | null
}

export default async function AdminJugadoresPage() {
  const supabase = await createClient()

  const [profilesRes, rankingsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: true }),
    supabase.from('rankings').select('profile_id, position'),
  ])

  const profiles = (profilesRes.data ?? []) as Profile[]
  const rankings = rankingsRes.data ?? []
  const positionByProfile = new Map<string, number>(
    rankings.map((r) => [r.profile_id as string, r.position as number])
  )

  const players: PlayerWithPosition[] = profiles.map((p) => ({
    ...p,
    position: positionByProfile.get(p.id) ?? null,
  }))

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Volver
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Jugadores</h2>
      <p className="text-sm text-gray-500 mb-4">
        {players.length} {players.length === 1 ? 'jugador' : 'jugadores'} registrados
      </p>

      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Agregar jugadores (carga masiva)
        </h3>
        <BulkAddForm />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Roster</h3>
        {players.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-sm text-gray-500">
            Todavía no hay jugadores. Cargá la lista arriba.
          </div>
        ) : (
          <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {players.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
