import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'
import { PerfilForm } from './PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle<Profile>()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi perfil</h2>
      <PerfilForm profile={profile ?? null} email={user.email ?? ''} />
    </div>
  )
}
