import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'
import { RankingRowAdmin } from './RankingRowAdmin'

interface Row {
  position: number
  profile: Profile
}

export default async function AdminRankingPage() {
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
        auth_user_id,
        role
      )
    `
    )
    .order('position', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Error: {error.message}
      </div>
    )
  }

  const rows = (data ?? []) as unknown as Row[]

  // También listar jugadores que NO están en el ranking
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, auth_user_id')
    .order('created_at', { ascending: true })
  const inRanking = new Set(rows.map((r) => r.profile.id))
  const outOfRanking = (allProfiles ?? []).filter(
    (p) => !inRanking.has(p.id as string)
  ) as unknown as Profile[]

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Volver
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Ordenar ranking</h2>
      <p className="text-sm text-gray-500 mb-4">
        Usá las flechas para mover jugadores. El orden se guarda al instante.
      </p>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-sm text-gray-500">
          No hay jugadores en el ranking todavía.
        </div>
      ) : (
        <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden mb-6">
          {rows.map((row, idx) => (
            <RankingRowAdmin
              key={row.profile.id}
              position={row.position}
              profile={row.profile}
              isFirst={idx === 0}
              isLast={idx === rows.length - 1}
            />
          ))}
        </ul>
      )}

      {outOfRanking.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Fuera del ranking
          </h3>
          <ul className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {outOfRanking.map((p) => (
              <RankingRowAdmin
                key={p.id}
                position={null}
                profile={p}
                isFirst={false}
                isLast={false}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
