"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein")
      return
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten")
        return
      }

      router.push("/login?registered=true")
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
                Registrieren
              </span>
            </h1>
            <p className="text-white/60 text-sm font-light">
              Erstelle einen neuen Account
            </p>
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
                minLength={3}
                className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors touch-manipulation"
                placeholder="Benutzername (min. 3 Zeichen)"
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
                minLength={6}
                className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors touch-manipulation"
                placeholder="Passwort (min. 6 Zeichen)"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-white/60 mb-2">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors touch-manipulation"
                placeholder="Passwort wiederholen"
                autoComplete="new-password"
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
              {loading ? "Registrieren..." : "Registrieren"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-white/60 hover:text-white/80 text-sm font-light transition-colors"
            >
              Bereits ein Account? Anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
