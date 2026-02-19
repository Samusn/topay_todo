"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock, Delete } from "lucide-react";

const PIN_LENGTH = 6;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const submit = useCallback(
    async (code: string) => {
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: code }),
        });

        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin("");
          }, 500);
          setError("Falscher PIN");
        }
      } catch {
        setError("Ein Fehler ist aufgetreten");
        setPin("");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  function handleKey(key: string) {
    if (loading) return;

    if (key === "delete") {
      setPin((prev) => prev.slice(0, -1));
      setError("");
      return;
    }

    if (key === "") return;

    const next = pin + key;
    if (next.length > PIN_LENGTH) return;

    setPin(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      submit(next);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-blue-950/10 to-black/30 pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-xs mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-5">
            <Lock className="w-7 h-7 text-white/70" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight">
            <span className="bg-gradient-to-r from-white via-neutral-100 to-white bg-clip-text text-transparent glow-text">
              To Pay & To Do
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-2 font-light">
            PIN eingeben
          </p>
        </div>

        {/* PIN dots */}
        <div
          className={`flex items-center justify-center gap-3 mb-3 transition-transform ${shake ? "animate-shake" : ""}`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                i < pin.length
                  ? "bg-white border-white/60 scale-110"
                  : "bg-transparent border-white/20"
              }`}
            />
          ))}
        </div>

        <div className="h-6 flex items-center justify-center mb-4">
          {error && (
            <p className="text-red-400/90 text-sm text-center font-light">
              {error}
            </p>
          )}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, i) => {
            if (key === "") {
              return <div key={i} />;
            }

            if (key === "delete") {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKey("delete")}
                  disabled={loading || pin.length === 0}
                  className="aspect-square rounded-2xl flex items-center justify-center text-white/50 hover:text-white/70 active:bg-white/5 disabled:opacity-30 transition-all duration-150 touch-manipulation"
                >
                  <Delete className="w-6 h-6" />
                </button>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleKey(key)}
                disabled={loading}
                className="aspect-square rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] active:bg-white/[0.12] active:scale-95 disabled:opacity-40 flex items-center justify-center text-2xl font-light text-white/80 transition-all duration-150 touch-manipulation select-none"
              >
                {key}
              </button>
            );
          })}
        </div>
      </main>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-8px);
          }
          40% {
            transform: translateX(8px);
          }
          60% {
            transform: translateX(-6px);
          }
          80% {
            transform: translateX(6px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
