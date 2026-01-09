"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-blue-950/10 to-black/30 pointer-events-none" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 sm:px-8">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-7xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="bg-gradient-to-r from-white via-neutral-100 to-white bg-clip-text text-transparent glow-text">
                  To Pay
                </span>
                <span className="text-white/60 font-normal hidden sm:inline"> & </span>
                <span className="bg-gradient-to-r from-white via-neutral-100 to-white bg-clip-text text-transparent glow-text">
                  To Do
                </span>
              </div>
            </h1>
          </div>

          <nav className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 pt-8">
            <Link
              href="/todos"
              className="group relative text-white/80 hover:text-white active:text-white/90 transition-all duration-300 text-base font-light tracking-wide uppercase py-2 px-4 min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              <span className="relative z-10">To Do</span>
              <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-neutral-400 to-transparent group-hover:w-full transition-all duration-300" />
            </Link>
            
            <span className="hidden sm:block text-white/20 text-lg">·</span>
            
            <Link
              href="/bills"
              className="group relative text-white/80 hover:text-white active:text-white/90 transition-all duration-300 text-base font-light tracking-wide uppercase py-2 px-4 min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              <span className="relative z-10">To Pay</span>
              <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-neutral-400 to-transparent group-hover:w-full transition-all duration-300" />
            </Link>
            
            <span className="hidden sm:block text-white/20 text-lg">·</span>
            
            <Link
              href="/overview"
              className="group relative text-white/80 hover:text-white active:text-white/90 transition-all duration-300 text-base font-light tracking-wide uppercase py-2 px-4 min-h-[44px] flex items-center justify-center touch-manipulation"
            >
              <span className="relative z-10">Übersicht</span>
              <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-neutral-400 to-transparent group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          <div className="pt-12 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-500/30 to-transparent" />
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/30 text-xs font-light tracking-wider">
            © Samuel Soun
          </p>
        </div>
      </main>
    </div>
  )
}
