import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Challenge, Profile } from '@/lib/database.types'
import { ChallengeCard } from './ChallengeCard'

export const dynamic = 'force-dynamic'

type Tab = 'activos' | 'recibidos' | 'enviados'

interface ChallengeWithProfiles extends Challenge {
  challenger: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  defender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export default async function DesafiosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab: Tab =
    params.tab === 'recibidos' ||
    params.tab === 'enviados' ||
    params.tab === 'activos'
      ? params.tab
      : 'activos'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // Mi profile
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

  // Filtros por tab
  const baseQuery = supabase
    .from('challenges')
    .select(
      `
        *,
        challenger:profiles!challenger_id (id, full_name, avatar_url),
        defender:profiles!defender_id (id, full_name, avatar_url)
      `
    )
    .order('issued_at', { ascending: false })

  const { data: rawChallenges } = await baseQuery
  const all = (rawChallenges ?? []) as unknown as ChallengeWithProfiles[]

  const activos = all.filter(
    (c) =>
      c.status === 'aceptado' &&
      (c.challenger_id === myId || c.defender_id === myId)
  )
  const recibidos = all.filter(
    (c) => c.status === 'pendiente' && c.defender_id === myId
  )
  const enviados = all.filter(
    (c) => c.status === 'pendiente' && c.challenger_id === myId
  )

  const visible: ChallengeWithProfiles[] =
    tab === 'activos' ? activos : tab === 'recibidos' ? recibidos : enviados

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Desafios</h2>
      <p className="text-sm text-gray-500 mb-4">
        Tus partidos pendientes y por confirmar.
      </p>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        <TabLink
          tab="activos"
          current={tab}
          label="Activos"
          count={activos.length}
        />
        <TabLink
          tab="recibidos"
          current={tab}
          label="Recibidos"
          count={recibidos.length}
        />
        <TabLink
          tab="enviados"
          current={tab}
          label="Enviados"
          count={enviados.length}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <ul className="space-y-3">
          {visible.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
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
      className={`flex-1 text-center text-sm py-2 rounded-md font-medium transition-colors ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
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
  const messages: Record<Tab, { emoji: string; title: string; desc: string }> =
    {
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

