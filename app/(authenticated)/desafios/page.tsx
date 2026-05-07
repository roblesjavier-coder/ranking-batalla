import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Challenge, Match, Profile } from '@/lib/database.types'
import { ChallengeCard } from './ChallengeCard'

export const dynamic = 'force-dynamic'

type Tab = 'activos' | 'recibidos' | 'enviados' | 'historial'

interface ChallengeWithProfiles extends Challenge {
  cancel_requested_by?: string | null
  cancel_requested_at?: string | null
  challenger: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  defender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

type MatchPartial = Pick<
  Match,
  | 'challenge_id'
  | 'played_at'
  | 'winner_id'
  | 'loser_id'
  | 'score'
  | 'challenger_reported_winner_id'
  | 'challenger_reported_at'
  | 'defender_reported_winner_id'
  | 'defender_reported_at'
  | 'confirmed_at'
  | 'disputed'
>

export default async function DesafiosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab: Tab =
    params.tab === 'recibidos' ||
    params.tab === 'enviados' ||
    params.tab === 'activos' ||
    params.tab === 'historial'
      ? params.tab
      : 'activos'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!myProfile) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        No encontramos tu perfil. Cierra sesion y vuelve a entrar.
      </div>
    )
  }

  const myId = myProfile.id

  const [{ data: rawChallenges }, { data: rawMatches }] = await Promise.all([
    supabase
      .from('challenges')
      .select(`
          *,
          challenger:profiles!challenger_id (id, full_name, avatar_url),
          defender:profiles!defender_id (id, full_name, avatar_url)
        `)
      .order('issued_at', { ascending: false }),
    supabase
      .from('matches')
      .select(
        'challenge_id, played_at, winner_id, loser_id, score, challenger_reported_winner_id, challenger_reported_at, defender_reported_winner_id, defender_reported_at, confirmed_at, disputed'
      ),
  ])

  const all = (rawChallenges ?? []) as unknown as ChallengeWithProfiles[]
  const matches = (rawMatches ?? []) as unknown as MatchPartial[]
  const matchByChallenge = new Map<string, MatchPartial>(
    matches.map((m) => [m.challenge_id, m])
  )

  const isMine = (c: ChallengeWithProfiles) =>
    c.challenger_id === myId || c.defender_id === myId

  const activos = all.filter((c) => c.status === 'aceptado' && isMine(c))
  const recibidos = all.filter((c) => c.status === 'pendiente' && c.defender_id === myId)
  const enviados = all.filter((c) => c.status === 'pendiente' && c.challenger_id === myId)
  const historial = all.filter(
    (c) =>
      isMine(c) &&
      [
        'jugado',
        'walkover_a_desafiante',
        'walkover_a_desafiado',
        'rechazado',
        'cancelado_mutuo',
        'cancelado_admin',
        'expirado',
      ].includes(c.status)
  )

  const visible: ChallengeWithProfiles[] =
    tab === 'activos'
      ? activos
      : tab === 'recibidos'
      ? recibidos
      : tab === 'enviados'
      ? enviados
      : historial

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Desafios</h2>
      <p className="text-sm text-gray-500 mb-4">
        Tus partidos pendientes y por confirmar.
      </p>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        <TabLink tab="activos" current={tab} label="Activos" count={activos.length} />
        <TabLink tab="recibidos" current={tab} label="Recibidos" count={recibidos.length} />
        <TabLink tab="enviados" current={tab} label="Enviados" count={enviados.length} />
        <TabLink tab="historial" current={tab} label="Historial" count={historial.length} />
      </div>

      {visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <ul className="space-y-3">
          {visible.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              match={matchByChallenge.get(c.id) ?? null}
              myId={myId}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function TabLink({
  tab,
  current,
  label,
  count,
}: {
  tab: Tab
  current: Tab
  label: string
  count: number
}) {
  const isActive = tab === current
  return (
    <Link
      href={`/desafios?tab=${tab}`}
      className={`flex-1 text-center text-sm py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { emoji: string; title: string; desc: string }> = {
    activos: {
      emoji: '🎾',
      title: 'No tienes partidos por jugar',
      desc: 'Cuando aceptes un desafio (o te acepten uno) lo vas a ver aqui.',
    },
    recibidos: {
      emoji: '📨',
      title: 'No tienes desafios pendientes de respuesta',
      desc: 'Si alguien te desafia, lo vas a ver aqui para aceptar o rechazar.',
    },
    enviados: {
      emoji: '📤',
      title: 'No mandaste ningun desafio',
      desc: 'Ve al ranking y aprieta "Desafiar" en algun jugador arriba tuyo.',
    },
    historial: {
      emoji: '📜',
      title: 'Todavia no tienes partidos jugados',
      desc: 'Cuando termines tu primer partido, aparecera aqui.',
    },
  }
  const m = messages[tab]
  return (
    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
      <div className="text-5xl mb-3">{m.emoji}</div>
      <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
      <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">{m.desc}</p>
    </div>
  )
}
