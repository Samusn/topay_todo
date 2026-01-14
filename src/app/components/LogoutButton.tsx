"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 active:text-white transition-colors py-2 px-1 min-h-[44px] touch-manipulation text-sm font-light"
    >
      <LogOut className="w-4 h-4" />
      Abmelden
    </button>
  )
}
