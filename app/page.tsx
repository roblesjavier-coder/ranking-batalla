import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 text-center space-y-3">
        <h1 className="text-xl font-semibold">¡Estás dentro!</h1>
        <p className="text-gray-600 text-sm">
          Sesión activa como <strong>{user.email}</strong>
        </p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 hover:bg-black text-white py-2 font-medium"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}
