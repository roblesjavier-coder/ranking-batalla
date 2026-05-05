// Tipos TypeScript del schema de la DB de Ranking Batalla.
// Mantener sincronizado con el SQL en 03_SQL_TABLAS_V1.sql y 04_SQL_MIGRATION_PRECARGA.sql.

export type UserRole = 'jugador' | 'admin'

export type ChallengeStatus =
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'jugado'
  | 'walkover_a_desafiante'
  | 'walkover_a_desafiado'
  | 'cancelado_mutuo'
  | 'cancelado_admin'
  | 'expirado'

export type ChallengeResponse = 'aceptado' | 'rechazado'

export type CancellationType = 'mutuo' | 'admin'

export type RankingChangeReason = 'siembra' | 'partido' | 'walkover' | 'ajuste_admin'

export interface Profile {
  id: string
  auth_user_id: string | null
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  vacation_until: string | null
  vacation_started_at: string | null
  invited_at: string | null
  claimed_at: string | null
  created_at: string
  updated_at: string
}

export interface ClubSettings {
  id: number
  club_name: string
  logo_url: string | null
  banner_url: string | null
  primary_color: string | null
  secondary_color: string | null
  challenge_range_n: number
  challenge_window_days: number
  rematch_cooldown_days: number
  vacation_max_days: number
  updated_at: string
}

export interface Ranking {
  profile_id: string
  position: number
  updated_at: string
}

export interface Challenge {
  id: string
  challenger_id: string
  defender_id: string
  status: ChallengeStatus
  issued_at: string
  expires_at: string
  responded_at: string | null
  response: ChallengeResponse | null
  cancelled_at: string | null
  cancellation_type: CancellationType | null
  cancellation_note: string | null
  cancelled_by_admin_id: string | null
  resolved_at: string | null
}

export interface Match {
  id: string
  challenge_id: string
  played_at: string
  winner_id: string | null
  loser_id: string | null
  score: unknown
  challenger_reported_winner_id: string | null
  challenger_reported_score: unknown
  challenger_reported_at: string | null
  defender_reported_winner_id: string | null
  defender_reported_score: unknown
  defender_reported_at: string | null
  confirmed_at: string | null
  disputed: boolean
  admin_resolved_by: string | null
}

export interface RankingHistory {
  id: string
  profile_id: string
  from_position: number | null
  to_position: number
  reason: RankingChangeReason
  challenge_id: string | null
  changed_at: string
}
