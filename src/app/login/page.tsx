"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Ungültiger Benutzername oder Passwort")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-blue-950/10 to-black/30 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 sm:p-10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-2">
              <span className="bg-gradient-to-r from-white via-neutral-100 to-white bg-clip-text text-transparent">
                Anmelden
              </span>
            </h1>
            <p className="text-white/60 text-sm font-light">
              Bitte melde dich an, um fortzufahren
            </p>
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registered') === 'true' && (
              <div className="mt-4 bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                <p className="text-green-400 text-sm">Registrierung erfolgreich! Bitte melde dich an.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-white/60 mb-2">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors touch-manipulation"
                placeholder="Benutzername"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-white/60 mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors touch-manipulation"
                placeholder="Passwort"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/10 hover:bg-white/20 active:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg text-white transition-all text-sm font-light touch-manipulation"
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-white/60 hover:text-white/80 text-sm font-light transition-colors"
            >
              Noch kein Account? Registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
