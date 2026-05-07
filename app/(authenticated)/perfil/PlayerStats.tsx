export interface PlayerStatsData {
  played: number
  won: number
  lost: number
  current_position: number | null
  peak_position: number | null
}

export function PlayerStats({ stats }: { stats: PlayerStatsData | null }) {
  if (!stats) return null

  const winrate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0
  const peak = stats.peak_position && stats.peak_position < 999999 ? stats.peak_position : null

  if (stats.played === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Mis estadisticas</h3>
        <p className="text-sm text-gray-500">
          Todavia no jugaste partidos confirmados. Cuando los juegues, vas a ver
          tus estadisticas aca.
        </p>
        {stats.current_position !== null && (
          <div className="mt-3 inline-block rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
            Posicion actual: <span className="font-bold">#{stats.current_position}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Mis estadisticas</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Posicion actual"
          value={stats.current_position !== null ? `#${stats.current_position}` : '—'}
        />
        <Stat label="Mejor posicion" value={peak !== null ? `#${peak}` : '—'} />
        <Stat label="Partidos jugados" value={String(stats.played)} />
        <Stat label="Winrate" value={`${winrate}%`} highlight />
        <Stat label="Ganados" value={String(stats.won)} color="green" />
        <Stat label="Perdidos" value={String(stats.lost)} color="red" />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  color = 'gray',
  highlight = false,
}: {
  label: string
  value: string
  color?: 'gray' | 'green' | 'red'
  highlight?: boolean
}) {
  const colorClass = highlight
    ? 'text-[var(--primary)]'
    : color === 'green'
    ? 'text-green-700'
    : color === 'red'
    ? 'text-red-700'
    : 'text-gray-900'
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className={`text-2xl font-bold leading-tight ${colorClass}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
