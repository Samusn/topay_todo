"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, X, Check, Trash2 } from "lucide-react"

interface Todo {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) return

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          dueDate: newDueDate || null,
        }),
      })

      if (response.ok) {
        setNewTitle("")
        setNewDescription("")
        setNewDueDate("")
        setIsDialogOpen(false)
        fetchTodos()
      }
    } catch (error) {
      console.error("Error creating todo:", error)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      })
      fetchTodos()
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })
      fetchTodos()
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden">
      {/* Elegant gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-blue-950/10 to-black/30 pointer-events-none" />
      
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm font-light tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-neutral-100 to-white bg-clip-text text-transparent glow-text">
                To Do
              </span>
            </h1>
          </div>

          {/* Add Todo Button */}
          <div className="mb-8">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-300 text-sm font-light tracking-wide uppercase"
            >
              <Plus className="w-4 h-4" />
              Neues Todo
            </button>
          </div>

          {/* Dialog for creating todo */}
          {isDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsDialogOpen(false)}
              />
              <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white">Neues Todo</h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate()
                      }}
                      placeholder="Todo Titel"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Beschreibung (optional)
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate()
                      }}
                      placeholder="Optionale Beschreibung"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Fälligkeitsdatum (optional)
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm font-light"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-sm font-light"
                  >
                    Erstellen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Todos List */}
          {loading ? (
            <div className="text-center text-white/40 text-sm font-light py-12">
              Loading...
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm font-light">
                Keine Todos vorhanden. Erstelle dein erstes Todo!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 sm:p-5 transition-all duration-300 ${
                    todo.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggle(todo.id, todo.completed)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.completed
                          ? "bg-white/20 border-white/40"
                          : "border-white/30 hover:border-white/50"
                      }`}
                    >
                      {todo.completed && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base font-normal text-white mb-1 ${
                          todo.completed ? "line-through text-white/50" : ""
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-white/50 font-light mb-1">
                          {todo.description}
                        </p>
                      )}
                      {todo.dueDate && (
                        <p className={`text-xs font-light ${
                          !todo.completed && new Date(todo.dueDate) < new Date()
                            ? "text-red-400/80"
                            : "text-white/40"
                        }`}>
                          Fällig: {new Date(todo.dueDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-white/80 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

