"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, X, CheckCircle2, Circle, Trash2, Edit2, Paperclip, XCircle } from "lucide-react"

interface Bill {
  id: string
  title: string
  description: string | null
  amount: number
  dueDate: string | null
  paid: boolean
  paidDate: string | null
  attachments: string | null
  createdAt: string
  updatedAt: string
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)

  const fetchBills = async () => {
    try {
      const response = await fetch("/api/bills")
      const data = await response.json()
      setBills(data.map((bill: Bill) => ({
        ...bill,
        attachments: bill.attachments ? JSON.parse(bill.attachments) : null
      })))
    } catch (error) {
      console.error("Error fetching bills:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setAttachments((prev) => [...prev, base64String])
        }
        reader.readAsDataURL(file)
      } else {
        alert("Nur Bilder und PDFs werden unterstützt")
      }
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newAmount.trim()) return

    try {
      const response = editingBill
        ? await fetch(`/api/bills/${editingBill.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: newTitle,
              description: newDescription || null,
              amount: parseFloat(newAmount),
              dueDate: newDueDate || null,
              attachments: attachments.length > 0 ? attachments : null,
            }),
          })
        : await fetch("/api/bills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: newTitle,
              description: newDescription || null,
              amount: parseFloat(newAmount),
              dueDate: newDueDate || null,
              attachments: attachments.length > 0 ? attachments : null,
            }),
          })

      if (response.ok) {
        setNewTitle("")
        setNewDescription("")
        setNewAmount("")
        setNewDueDate("")
        setAttachments([])
        setIsDialogOpen(false)
        setEditingBill(null)
        fetchBills()
      } else {
        const errorData = await response.json()
        console.error("Error creating/updating bill:", errorData)
        alert("Fehler: " + (errorData.error || "Unbekannter Fehler"))
      }
    } catch (error) {
      console.error("Error creating/updating bill:", error)
      alert("Fehler beim Erstellen/Aktualisieren der Rechnung. Bitte versuche es erneut.")
    }
  }

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill)
    setNewTitle(bill.title)
    setNewDescription(bill.description || "")
    setNewAmount(bill.amount.toString())
    setNewDueDate(bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "")
    setAttachments(bill.attachments || [])
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingBill(null)
    setNewTitle("")
    setNewDescription("")
    setNewAmount("")
    setNewDueDate("")
    setAttachments([])
  }

  const handleTogglePaid = async (id: string, paid: boolean) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paid: !paid,
          paidDate: !paid ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating bill:", errorData)
        alert("Fehler beim Aktualisieren der Rechnung: " + (errorData.error || "Unbekannter Fehler"))
        return
      }

      fetchBills()
    } catch (error) {
      console.error("Error updating bill:", error)
      alert("Fehler beim Aktualisieren der Rechnung. Bitte versuche es erneut.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error deleting bill:", errorData)
        alert("Fehler beim Löschen der Rechnung: " + (errorData.error || "Unbekannter Fehler"))
        return
      }

      fetchBills()
    } catch (error) {
      console.error("Error deleting bill:", error)
      alert("Fehler beim Löschen der Rechnung. Bitte versuche es erneut.")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const unpaidBills = bills.filter((bill) => !bill.paid)
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0)

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
                To Pay
              </span>
            </h1>
            {totalUnpaid > 0 && (
              <p className="text-white/60 text-sm font-light mt-2">
                Offene Rechnungen: {formatCurrency(totalUnpaid)}
              </p>
            )}
          </div>

          {/* Add Bill Button */}
          <div className="mb-8">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-300 text-sm font-light tracking-wide uppercase"
            >
              <Plus className="w-4 h-4" />
              Neue Rechnung
            </button>
          </div>

          {/* Dialog for creating/editing bill */}
          {isDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleCancel}
              />
              <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white">
                    {editingBill ? "Rechnung bearbeiten" : "Neue Rechnung"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Rechnung Titel"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Betrag (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Fälligkeitsdatum
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Hinweis (optional)
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Optionaler Hinweis"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Rechnung/Bilder (optional)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/80 hover:text-white transition-all text-sm font-light flex items-center justify-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Dateien hinzufügen
                    </button>
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                          >
                            <span className="text-xs text-white/60">
                              Datei {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-white/40 hover:text-red-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm font-light"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-sm font-light"
                  >
                    {editingBill ? "Speichern" : "Erstellen"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bills List */}
          {loading ? (
            <div className="text-center text-white/40 text-sm font-light py-12">
              Loading...
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm font-light">
                Keine Rechnungen vorhanden. Erstelle deine erste Rechnung!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 sm:p-5 transition-all duration-300 ${
                    bill.paid ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTogglePaid(bill.id, bill.paid)
                      }}
                      type="button"
                      className={`mt-1 flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        bill.paid
                          ? "bg-green-500/20 border-green-400/40"
                          : "border-white/30 hover:border-white/50 hover:bg-white/5"
                      }`}
                    >
                      {bill.paid && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                      {!bill.paid && <Circle className="w-4 h-4 text-white/60" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-base font-normal text-white ${
                            bill.paid ? "line-through text-white/50" : ""
                          }`}
                        >
                          {bill.title}
                        </h3>
                        <span className="text-lg font-semibold text-white">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                      {bill.description && (
                        <p className="text-sm text-white/50 font-light mb-1">
                          {bill.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/40 font-light">
                        {bill.dueDate && (
                          <span
                            className={
                              !bill.paid && new Date(bill.dueDate) < new Date()
                                ? "text-red-400/80"
                                : ""
                            }
                          >
                            Fällig: {formatDate(bill.dueDate)}
                          </span>
                        )}
                        {bill.paid && bill.paidDate && (
                          <span>Bezahlt: {formatDate(bill.paidDate)}</span>
                        )}
                        {bill.attachments && bill.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {bill.attachments.length} Datei{bill.attachments.length > 1 ? "en" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEdit(bill)
                        }}
                        type="button"
                        className="p-2 sm:p-1.5 text-white/60 hover:text-white/90 hover:bg-white/5 rounded transition-all active:scale-95"
                        title="Bearbeiten"
                        aria-label="Bearbeiten"
                      >
                        <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (
                            window.confirm(
                              "Möchtest du diese Rechnung wirklich löschen?"
                            )
                          ) {
                            handleDelete(bill.id)
                          }
                        }}
                        type="button"
                        className="p-2 sm:p-1.5 text-white/60 hover:text-red-400/90 hover:bg-white/5 rounded transition-all active:scale-95"
                        title="Löschen"
                        aria-label="Löschen"
                      >
                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
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

