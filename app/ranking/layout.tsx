import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function RankingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const clubRes = await supabase
    .from('club_settings')
    .select('club_name, logo_url, primary_color')
    .eq('id', 1)
    .maybeSingle()
  const club = clubRes.data as {
    club_name: string | null
    logo_url: string | null
    primary_color: string | null
  } | null

  let isAdmin = false
  if (user) {
    const profileRes = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    isAdmin = (profileRes.data as { role: string | null } | null)?.role === 'admin'
  }

  const primaryColor = club?.primary_color ?? '#b91c1c'

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ ['--primary' as string]: primaryColor } as React.CSSProperties}
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-3 max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {club?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.logo_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-gray-100"
              />
            )}
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {club?.club_name ?? 'Ranking Batalla'}
            </h1>
          </div>
          {user ? (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                Salir
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium flex-shrink-0"
              style={{ color: primaryColor }}
            >
              Ingresar
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto flex">
          <NavLink href="/ranking" label="Ranking" icon="🏆" />
          {user ? (
            <>
              <NavLink href="/desafios" label="Desafios" icon="⚔️" />
              <NavLink href="/perfil" label="Mi perfil" icon="👤" />
              {isAdmin && <NavLink href="/admin" label="Admin" icon="⚙️" />}
            </>
          ) : (
            <NavLink href="/login" label="Ingresar" icon="🔑" />
          )}
        </div>
      </nav>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
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
