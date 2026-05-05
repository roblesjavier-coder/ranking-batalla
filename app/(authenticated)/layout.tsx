import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ClubSettings, Profile } from '@/lib/database.types'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, clubRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle(),
    supabase.from('club_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  const profile = profileRes.data as Profile | null
  const club = clubRes.data as ClubSettings | null
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-3 max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {club?.club_name ?? 'Ranking Batalla'}
          </h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto flex">
          <NavLink href="/ranking" label="Ranking" icon="🏆" />
          <NavLink href="/perfil" label="Mi perfil" icon="👤" />
          {isAdmin && <NavLink href="/admin" label="Admin" icon="⚙️" />}
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="flex-1 py-2 text-center text-xs text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <div className="text-xl leading-none mb-0.5">{icon}</div>
      <div>{label}</div>
    </Link>
  )
}
