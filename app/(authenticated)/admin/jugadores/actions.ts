'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface AddPlayersResult {
  ok: boolean
  added?: number
  skipped?: string[]
  error?: string
}

interface ParsedLine {
  name: string
  email: string | null
}

function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  // Soporta:  "Nombre Apellido" | "Nombre Apellido, email@x.com" | "Nombre Apellido <email>"
  const angleMatch = trimmed.match(/^(.+?)\s*<([^>]+)>\s*$/)
  if (angleMatch) {
    return { name: angleMatch[1].trim(), email: angleMatch[2].trim().toLowerCase() }
  }
  const commaIdx = trimmed.lastIndexOf(',')
  if (commaIdx > 0) {
    const after = trimmed.slice(commaIdx + 1).trim()
    if (after.includes('@')) {
      return { name: trimmed.slice(0, commaIdx).trim(), email: after.toLowerCase() }
    }
  }
  return { name: trimmed, email: null }
}

export async function addPlayersBulk(
  _prev: AddPlayersResult,
  formData: FormData
): Promise<AddPlayersResult> {
  const supabase = await createClient()
  const text = String(formData.get('lines') ?? '')
  const appendToRanking = formData.get('append_to_ranking') === 'on'

  const parsed = text
    .split(/\r?\n/)
    .map(parseLine)
    .filter((x): x is ParsedLine => x !== null)

  if (parsed.length === 0) return { ok: false, error: 'No hay nombres para cargar.' }

  // Duplicados dentro del mismo paste
  const seenNames = new Set<string>()
  const toInsert: ParsedLine[] = []
  const skipped: string[] = []
  for (const p of parsed) {
    const key = p.name.toLowerCase()
    if (seenNames.has(key)) {
      skipped.push(`${p.name} (duplicado en la lista)`)
      continue
    }
    seenNames.add(key)
    toInsert.push(p)
  }

  // Chequear emails ya existentes en DB
  const emails = toInsert.map((p) => p.email).filter((e): e is string => !!e)
  if (emails.length > 0) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('email')
      .in('email', emails)
    const existingSet = new Set((existing ?? []).map((r) => r.email))
    if (existingSet.size > 0) {
      const remaining: ParsedLine[] = []
      for (const p of toInsert) {
        if (p.email && existingSet.has(p.email)) {
          skipped.push(`${p.name} (email ya existe)`)
        } else {
          remaining.push(p)
        }
      }
      toInsert.length = 0
      toInsert.push(...remaining)
    }
  }

  if (toInsert.length === 0) {
    return {
      ok: false,
      error: 'Todos los jugadores ya estaban (ningún nuevo).',
      skipped,
    }
  }

  const rows = toInsert.map((p) => ({
    full_name: p.name,
    email: p.email,
    role: 'jugador' as const,
  }))

  const { data: inserted, error: insertErr } = await supabase
    .from('profiles')
    .insert(rows)
    .select('id')

  if (insertErr) return { ok: false, error: insertErr.message }

  if (appendToRanking && inserted) {
    // Calcular siguiente posición libre
    const { data: maxRow } = await supabase
      .from('rankings')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
    const startPos = (maxRow?.[0]?.position ?? 0) + 1

    const rankingRows = inserted.map((r, i) => ({
      profile_id: r.id,
      position: startPos + i,
    }))
    const { error: rankErr } = await supabase
      .from('rankings')
      .insert(rankingRows)
    if (rankErr) return { ok: false, error: 'Jugadores creados, pero falló agregarlos al ranking: ' + rankErr.message }
  }

  revalidatePath('/admin/jugadores')
  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true, added: inserted?.length ?? 0, skipped }
}

export async function deletePlayer(
  _prev: { ok: boolean; error?: string },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const profileId = String(formData.get('profile_id') ?? '')
  if (!profileId) return { ok: false, error: 'profile_id requerido' }

  // Borrar primero del ranking (FK), luego el profile
  await supabase.from('rankings').delete().eq('profile_id', profileId)
  const { error } = await supabase.from('profiles').delete().eq('id', profileId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/jugadores')
  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true }
}

export async function updatePlayer(
  _prev: { ok: boolean; error?: string },
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const profileId = String(formData.get('profile_id') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const emailRaw = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!profileId) return { ok: false, error: 'profile_id requerido' }
  if (!fullName) return { ok: false, error: 'El nombre es requerido' }
  const email = emailRaw || null
  if (email && !email.includes('@')) return { ok: false, error: 'Email inválido' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, email })
    .eq('id', profileId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/jugadores')
  revalidatePath('/admin/ranking')
  revalidatePath('/ranking')
  return { ok: true }
}
