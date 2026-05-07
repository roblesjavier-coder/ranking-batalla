import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ActiveChallengeCard, type ActiveChallenge } from './ActiveChallengeCard'

export default async function AdminDesafiosActivosPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('challenges')
    .select(`
      id,
      status,
      issued_at,
      expires_at,
      challenger:profiles!challenger_id ( id, full_name ),
      defender:profiles!defender_id ( id, full_name )
    `)
    .in('status', ['pendiente', 'aceptado'])
    .order('expires_at', { ascending: true })

  const challenges: ActiveChallenge[] = (rows ?? []).map((r) => {
    const raw = r as unknown as {
      id: string
      status: 'pendiente' | 'aceptado'
      issued_at: string
      expires_at: string
      challenger:
        | { id: string; full_name: string | null }
        | { id: string; full_name: string | null }[]
        | null
      defender:
        | { id: string; full_name: string | null }
        | { id: string; full_name: string | null }[]
        | null
    }
    const challenger = Array.isArray(raw.challenger) ? raw.challenger[0] ?? null : raw.challenger
    const defender = Array.isArray(raw.defender) ? raw.defender[0] ?? null : raw.defender
    return {
      id: raw.id,
      status: raw.status,
      issued_at: raw.issued_at,
      expires_at: raw.expires_at,
      challenger,
      defender,
    }
  })

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Volver
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Desafios activos</h2>
      <p className="text-sm text-gray-500 mb-6">
        Lista de desafios pendientes y aceptados. Podes cancelar cualquiera por motivos de fuerza mayor (lesion, mudanza, etc).
      </p>

      {challenges.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500 text-sm">
          No hay desafios activos.
        </div>
      ) : (
        <ul className="space-y-3">
          {challenges.map((c) => (
            <ActiveChallengeCard key={c.id} challenge={c} />
          ))}
        </ul>
      )}
    </div>
  )
}
