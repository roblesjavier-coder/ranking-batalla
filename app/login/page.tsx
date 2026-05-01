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
            Te enviamos un código de 6 dígitos a <strong>{email}</strong>. Pegalo acá:
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="123456"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={cargando || codigo.length !== 6}
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
      <form
        onSubmit={pedirCodigo}
        className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Ingresar a Ranking Batalla</h1>
        <p className="text-gray-600 text-sm">
          Te enviamos un código de 6 dígitos al email — sin contraseñas.
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
          {cargando ? 'Enviando…' : 'Enviarme el código'}
        </button>
      </form>
    </main>
  )
}
