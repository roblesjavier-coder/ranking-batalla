'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function entrarConGoogle() {
    setError(null)
    setCargando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    setCargando(false)
    if (error) {
      setError(error.message)
    }
    // Si todo OK, Supabase hace el redirect automaticamente
  }

  async function pedirCodigo(e: FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    setCargando(false)
    if (error) {
      setError(error.message)
      return
    }
    setPaso('codigo')
  }

  async function verificarCodigo(e: FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    })
    setCargando(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  if (paso === 'codigo') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <form
          onSubmit={verificarCodigo}
          className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4"
        >
          <h1 className="text-xl font-semibold">Revisa tu email</h1>
          <p className="text-gray-600 text-sm">
            Te enviamos un codigo de 8 digitos a <strong>{email}</strong>.
            Pegalo aqui:
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6,8}"
            maxLength={8}
            required
            placeholder="12345678"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={cargando || codigo.length < 6}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 font-medium"
          >
            {cargando ? 'Verificando…' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPaso('email')
              setCodigo('')
              setError(null)
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Usar otro email
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Ingresar a Ranking Batalla</h1>

        <button
          type="button"
          onClick={entrarConGoogle}
          disabled={cargando}
          className="w-full rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-800 py-2 font-medium flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {cargando ? 'Conectando…' : 'Continuar con Google'}
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span>o con tu email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={pedirCodigo} className="space-y-4">
          <p className="text-gray-600 text-sm">
            Te enviamos un codigo de 8 digitos al email — sin contrasenas.
          </p>
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 font-medium"
          >
            {cargando ? 'Enviando…' : 'Enviarme el codigo'}
          </button>
        </form>
      </div>
    </main>
  )
}
