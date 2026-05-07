import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DisputeCard, type DisputeData } from './DisputeCard'

export default async function AdminDisputasPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('matches')
    .select(`
      challenge_id,
      played_at,
      challenger_reported_winner_id,
      challenger_reported_score,
      challenger_reported_at,
      defender_reported_winner_id,
      defender_reported_score,
      defender_reported_at,
      challenge:challenges!challenge_id (
        id,
        challenger_id,
        defender_id,
        challenger:profiles!challenger_id ( id, full_name ),
        defender:profiles!defender_id ( id, full_name )
      )
    `)
    .eq('disputed', true)
    .order('played_at', { ascending: false })

  // Supabase devuelve relaciones embebidas como objeto o array dependiendo
  // del tipo de relacion; normalizamos a objeto.
  const disputes: DisputeData[] = (rows ?? []).map((r) => {
    const raw = r as unknown as {
      challenge_id: string
      played_at: string | null
      challenger_reported_winner_id: string | null
      challenger_reported_score: { sets?: { a: number; b: number; format?: string }[] } | null
      challenger_reported_at: string | null
      defender_reported_winner_id: string | null
      defender_reported_score: { sets?: { a: number; b: number; format?: string }[] } | null
      defender_reported_at: string | null
      challenge:
        | {
            id: string
            challenger_id: string
            defender_id: string
            challenger: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null
            defender: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null
          }
        | null
    }
    const ch = raw.challenge!
    const challenger = Array.isArray(ch.challenger) ? ch.challenger[0] ?? null : ch.challenger
    const defender = Array.isArray(ch.defender) ? ch.defender[0] ?? null : ch.defender
    return {
      challenge_id: raw.challenge_id,
      played_at: raw.played_at,
      challenger_reported_winner_id: raw.challenger_reported_winner_id,
      challenger_reported_score: raw.challenger_reported_score,
      challenger_reported_at: raw.challenger_reported_at,
      defender_reported_winner_id: raw.defender_reported_winner_id,
      defender_reported_score: raw.defender_reported_score,
      defender_reported_at: raw.defender_reported_at,
      challenge: {
        id: ch.id,
        challenger_id: ch.challenger_id,
        defender_id: ch.defender_id,
        challenger,
        defender,
      },
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
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Disputas</h2>
      <p className="text-sm text-gray-500 mb-6">
        Partidos donde los jugadores reportaron ganadores distintos. Resolve eligiendo el ganador correcto y opcionalmente dejas una nota.
      </p>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500 text-sm">
          No hay disputas pendientes.
        </div>
      ) : (
        <ul className="space-y-3">
          {disputes.map((d) => (
            <DisputeCard key={d.challenge_id} dispute={d} />
          ))}
        </ul>
      )}
    </div>
  )
}
