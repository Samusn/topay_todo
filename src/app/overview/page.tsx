"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Plus, Edit2, Trash2, Paperclip, Check } from "lucide-react"

interface Todo {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

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

interface CalendarItem {
  date: string
  todos: Todo[]
  bills: Bill[]
}

export default function OverviewPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [dialogType, setDialogType] = useState<"todo" | "bill" | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const fetchData = async () => {
    try {
      const [todosRes, billsRes] = await Promise.all([
        fetch("/api/todos"),
        fetch("/api/bills"),
      ])
      
      if (todosRes.ok && billsRes.ok) {
        const todosData = await todosRes.json()
        const billsData = await billsRes.json()
        setTodos(Array.isArray(todosData) ? todosData : [])
        setBills(
          Array.isArray(billsData)
            ? billsData.map((bill: Bill) => ({
                ...bill,
                attachments: bill.attachments ? JSON.parse(bill.attachments) : null,
              }))
            : []
        )
      } else {
        setTodos([])
        setBills([])
      }
    } catch (error) {
      setTodos([])
      setBills([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDateClick = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateKey = `${year}-${month}-${day}`
    setSelectedDate(dateKey)
    setNewDueDate(dateKey)
    setIsDialogOpen(true)
  }

  const handleCreateTodo = async () => {
    if (!newTitle.trim()) return

    try {
      const url = editingTodo ? `/api/todos/${editingTodo.id}` : "/api/todos"
      const method = editingTodo ? "PATCH" : "POST"

      const requestBody = {
        title: newTitle,
        description: newDescription || null,
        dueDate: newDueDate || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        resetDialog()
        fetchData()
      } else {
        let errorMessage = "Unbekannter Fehler"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          const text = await response.text()
          errorMessage = text || `HTTP ${response.status}`
        }
        alert("Fehler beim Speichern: " + errorMessage)
      }
    } catch (error) {
      alert("Fehler beim Speichern: " + (error instanceof Error ? error.message : "Unbekannter Fehler"))
    }
  }

  const handleCreateBill = async () => {
    if (!newTitle.trim() || !newAmount.trim()) return

    try {
      const url = editingBill ? `/api/bills/${editingBill.id}` : "/api/bills"
      const method = editingBill ? "PATCH" : "POST"

      const requestBody = {
        title: newTitle,
        description: newDescription || null,
        amount: parseFloat(newAmount),
        dueDate: newDueDate || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        resetDialog()
        fetchData()
      } else {
        let errorMessage = "Unbekannter Fehler"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          const text = await response.text()
          errorMessage = text || `HTTP ${response.status} ${response.statusText}`
        }
        alert("Fehler beim Speichern: " + errorMessage)
      }
    } catch (error) {
      console.error("Error creating/updating bill:", error)
      alert("Fehler beim Speichern: " + (error instanceof Error ? error.message : "Unbekannter Fehler"))
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setEditingBill(null)
    setDialogType("todo")
    setNewTitle(todo.title)
    setNewDescription(todo.description || "")
    if (todo.dueDate) {
      const dateStr = todo.dueDate.split("T")[0]
      setNewDueDate(dateStr)
    } else {
      setNewDueDate("")
    }
    setNewAmount("")
    setIsDialogOpen(true)
  }

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill)
    setEditingTodo(null)
    setDialogType("bill")
    setNewTitle(bill.title)
    setNewDescription(bill.description || "")
    setNewAmount(bill.amount.toString())
    if (bill.dueDate) {
      const dateStr = bill.dueDate.split("T")[0]
      setNewDueDate(dateStr)
    } else {
      setNewDueDate("")
    }
    setIsDialogOpen(true)
  }

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm("Möchtest du dieses Todo wirklich löschen?")) return
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
    }
  }

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm("Möchtest du diese Rechnung wirklich löschen?")) return
    try {
      await fetch(`/api/bills/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
    }
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert("Fehler beim Aktualisieren des Todos: " + (errorData.error || "Unbekannter Fehler"))
        return
      }

      fetchData()
    } catch (error) {
      alert("Fehler beim Aktualisieren des Todos. Bitte versuche es erneut.")
    }
  }

  const handleToggleBill = async (id: string, paid: boolean) => {
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
        alert("Fehler beim Aktualisieren der Rechnung: " + (errorData.error || "Unbekannter Fehler"))
        return
      }

      fetchData()
    } catch (error) {
      alert("Fehler beim Aktualisieren der Rechnung. Bitte versuche es erneut.")
    }
  }

  const resetDialog = () => {
    setIsDialogOpen(false)
    setSelectedDate(null)
    setEditingTodo(null)
    setEditingBill(null)
    setDialogType(null)
    setNewTitle("")
    setNewDescription("")
    setNewAmount("")
    setNewDueDate("")
  }

  const openNewTodoDialog = (date: string) => {
    setSelectedDate(date)
    setNewDueDate(date)
    setDialogType("todo")
    setEditingTodo(null)
    setEditingBill(null)
    setNewTitle("")
    setNewDescription("")
    setNewAmount("")
    setIsDialogOpen(true)
  }

  const openNewBillDialog = (date: string) => {
    setSelectedDate(date)
    setNewDueDate(date)
    setDialogType("bill")
    setEditingTodo(null)
    setEditingBill(null)
    setNewTitle("")
    setNewDescription("")
    setNewAmount("")
    setIsDialogOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const dateStr = dateString.split("T")[0]
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount)
  }

  const getMonthlyExpenses = () => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    return bills
      .filter((bill) => {
        if (!bill.paid || !bill.paidDate) return false
        const paidDate = new Date(bill.paidDate)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
      })
      .reduce((sum, bill) => sum + bill.amount, 0)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getItemsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    const dateTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false
      const [year, month, day] = todo.dueDate.split("T")[0].split("-").map(Number)
      const todoDate = new Date(year, month - 1, day)
      return formatDateKey(todoDate) === dateKey
    })
    const dateBills = bills.filter((bill) => {
      if (!bill.dueDate) return false
      const [year, month, day] = bill.dueDate.split("T")[0].split("-").map(Number)
      const billDate = new Date(year, month - 1, day)
      return formatDateKey(billDate) === dateKey
    })
    return { todos: dateTodos, bills: dateBills }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ]

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const todayDate = new Date()

  const calendarDays = []
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    calendarDays.push(date)
  }

  const itemsByDate: Record<string, { todos: Todo[]; bills: Bill[] }> = {}
  todos
    .filter((todo) => todo.dueDate)
    .forEach((todo) => {
      const dateStr = todo.dueDate!.split("T")[0]
      const [year, month, day] = dateStr.split("-").map(Number)
      const todoDate = new Date(year, month - 1, day)
      const key = formatDateKey(todoDate)
      if (!itemsByDate[key]) itemsByDate[key] = { todos: [], bills: [] }
      itemsByDate[key].todos.push(todo)
    })
  bills
    .filter((bill) => bill.dueDate)
    .forEach((bill) => {
      const dateStr = bill.dueDate!.split("T")[0]
      const [year, month, day] = dateStr.split("-").map(Number)
      const billDate = new Date(year, month - 1, day)
      const key = formatDateKey(billDate)
      if (!itemsByDate[key]) itemsByDate[key] = { todos: [], bills: [] }
      itemsByDate[key].bills.push(bill)
    })

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
        <div className="max-w-6xl mx-auto">
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
                Übersicht
              </span>
            </h1>
            <p className="text-white/60 text-sm font-light">
              Ausgaben {monthNames[currentDate.getMonth()]}: {formatCurrency(getMonthlyExpenses())}
            </p>
          </div>

          {/* Calendar */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-medium text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-light text-white/60 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const dateKey = formatDateKey(date)
                const dayItems = itemsByDate[dateKey] || { todos: [], bills: [] }
                const isToday = isSameDay(date, todayDate)
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const totalItems = dayItems.todos.length + dayItems.bills.length
                const uncompletedTodos = dayItems.todos.filter((todo) => !todo.completed).length
                const unpaidBills = dayItems.bills.filter((bill) => !bill.paid).length
                const uncompletedItems = uncompletedTodos + unpaidBills

                const todayForCalc = new Date()
                todayForCalc.setHours(0, 0, 0, 0)
                const dateForCalc = new Date(date)
                dateForCalc.setHours(0, 0, 0, 0)
                const daysUntilDue = Math.ceil((dateForCalc.getTime() - todayForCalc.getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0 && uncompletedItems > 0
                const isOverdue = daysUntilDue < 0 && uncompletedItems > 0

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDateClick(date)}
                    className={`aspect-square p-1 sm:p-2 border border-white/10 rounded-lg transition-all text-left cursor-pointer hover:bg-white/10 ${
                      isToday
                        ? "bg-white/10 border-white/30"
                        : isOverdue
                        ? "bg-red-500/10 border-red-400/30"
                        : isUrgent
                        ? "bg-yellow-500/10 border-yellow-400/30"
                        : totalItems > 0
                        ? "bg-white/5 border-white/20"
                        : "border-white/5"
                    } ${!isCurrentMonth ? "opacity-30" : ""}`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 ${
                        isToday ? "text-white" : "text-white/70"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {totalItems > 0 && (
                      <div className="space-y-0.5">
                        {dayItems.todos.length > 0 && (
                          <div className="text-[10px] sm:text-xs text-blue-400/80 truncate">
                            {dayItems.todos.length} Todo{dayItems.todos.length > 1 ? "s" : ""}
                          </div>
                        )}
                        {dayItems.bills.length > 0 && (
                          <div className="text-[10px] sm:text-xs text-purple-400/80 truncate">
                            {dayItems.bills.length} Rechnung{dayItems.bills.length > 1 ? "en" : ""}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upcoming Items */}
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-medium text-white">Fälligkeiten</h2>

            {loading ? (
              <div className="text-center text-white/40 text-sm font-light py-12">
                Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsByDate)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .slice(0, 10)
                  .filter(([dateKey, items]) => {
                    const uncompletedTodos = items.todos.filter((todo) => !todo.completed).length
                    const unpaidBills = items.bills.filter((bill) => !bill.paid).length
                    return uncompletedTodos + unpaidBills > 0
                  })
                  .map(([dateKey, items]) => {
                    const [year, month, day] = dateKey.split("-").map(Number)
                    const date = new Date(year, month - 1, day)
                    const todayForCalc = new Date()
                    todayForCalc.setHours(0, 0, 0, 0)
                    date.setHours(0, 0, 0, 0)
                    const daysUntilDue = Math.ceil((date.getTime() - todayForCalc.getTime()) / (1000 * 60 * 60 * 24))
                    const uncompletedTodos = items.todos.filter((todo) => !todo.completed).length
                    const unpaidBills = items.bills.filter((bill) => !bill.paid).length
                    const uncompletedItems = uncompletedTodos + unpaidBills
                    const isOverdue = daysUntilDue < 0 && uncompletedItems > 0
                    const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0 && uncompletedItems > 0

                    return (
                      <div
                        key={dateKey}
                        className={`bg-white/5 border rounded-lg p-4 sm:p-5 ${
                          isOverdue
                            ? "border-red-400/30 bg-red-500/5"
                            : isUrgent
                            ? "border-yellow-400/30 bg-yellow-500/5"
                            : "border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-white">
                            {formatDate(dateKey)}
                          </h3>
                          {isOverdue && (
                            <span className="text-xs text-red-400/80 font-medium">
                              ⚠️ Überfällig
                            </span>
                          )}
                          {isUrgent && !isOverdue && (
                            <span className="text-xs text-yellow-400/80 font-medium">
                              ⚠️ ASAP
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {items.todos.filter((todo) => !todo.completed).map((todo) => (
                            <div
                              key={todo.id}
                              className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg ${todo.completed ? "opacity-60" : ""}`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleTodo(todo.id, todo.completed)
                                }}
                                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                  todo.completed
                                    ? "bg-white/20 border-white/40"
                                    : "border-white/30 hover:border-white/50 hover:bg-white/5"
                                }`}
                              >
                                {todo.completed && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-normal ${todo.completed ? "text-white/50 line-through" : "text-white"}`}>
                                    {todo.title}
                                  </p>
                                  {todo.completed && (
                                    <span className="text-xs text-white/40 font-light">
                                      Erledigt
                                    </span>
                                  )}
                                </div>
                                {todo.description && (
                                  <p className="text-xs text-white/50 font-light mt-1">
                                    {todo.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}

                          {items.bills.filter((bill) => !bill.paid).map((bill) => (
                            <div
                              key={bill.id}
                              className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg ${bill.paid ? "opacity-60" : ""}`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleBill(bill.id, bill.paid)
                                }}
                                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                  bill.paid
                                    ? "bg-white/20 border-white/40"
                                    : "border-white/30 hover:border-white/50 hover:bg-white/5"
                                }`}
                              >
                                {bill.paid && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-normal ${bill.paid ? "text-white/50 line-through" : "text-white"}`}>
                                      {bill.title}
                                    </p>
                                    {bill.paid && (
                                      <span className="text-xs text-white/40 font-light">
                                        Bezahlt
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-sm font-semibold flex-shrink-0 ${bill.paid ? "text-white/50 line-through" : "text-white"}`}>
                                    {formatCurrency(bill.amount)}
                                  </p>
                                </div>
                                {bill.description && (
                                  <p className="text-xs text-white/50 font-light mt-1">
                                    {bill.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {!loading && Object.keys(itemsByDate).length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm font-light">
                  Keine anstehenden Fälligkeiten
                </p>
              </div>
            )}

            {!loading && (todos.filter((t) => t.completed).length > 0 || bills.filter((b) => b.paid).length > 0) && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 w-full text-sm text-white/50 hover:text-white/70 transition-colors py-2"
                >
                  {showCompleted ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>
                    Erledigt ({todos.filter((t) => t.completed).length + bills.filter((b) => b.paid).length})
                  </span>
                </button>

                {showCompleted && (
                  <div className="space-y-4 mt-4">
                    {todos.filter((todo) => todo.completed).map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg opacity-60"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleTodo(todo.id, todo.completed)
                          }}
                          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer bg-white/20 border-white/40"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-normal text-white/50 line-through">
                              {todo.title}
                            </p>
                            <span className="text-xs text-white/40 font-light">
                              Erledigt
                            </span>
                          </div>
                          {todo.description && (
                            <p className="text-xs text-white/50 font-light mt-1">
                              {todo.description}
                            </p>
                          )}
                          {todo.dueDate && (
                            <p className="text-xs text-white/40 font-light mt-1">
                              Fällig: {formatDate(todo.dueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {bills.filter((bill) => bill.paid).map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg opacity-60"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleBill(bill.id, bill.paid)
                          }}
                          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer bg-white/20 border-white/40"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-normal text-white/50 line-through">
                                {bill.title}
                              </p>
                              <span className="text-xs text-white/40 font-light">
                                Bezahlt
                              </span>
                            </div>
                            <p className="text-sm font-semibold flex-shrink-0 text-white/50 line-through">
                              {formatCurrency(bill.amount)}
                            </p>
                          </div>
                          {bill.description && (
                            <p className="text-xs text-white/50 font-light mt-1">
                              {bill.description}
                            </p>
                          )}
                          {bill.dueDate && (
                            <p className="text-xs text-white/40 font-light mt-1">
                              Fällig: {formatDate(bill.dueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialog for creating/editing items */}
      {isDialogOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={resetDialog}
          />
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 sm:p-8 w-[calc(100%-2rem)] sm:w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-white">
                  {formatDate(selectedDate)}
                </h2>
                {dialogType && (
                  <p className="text-sm text-white/60 mt-1">
                    {dialogType === "todo" ? "Todo" : "Rechnung"} {editingTodo || editingBill ? "bearbeiten" : "erstellen"}
                  </p>
                )}
              </div>
              <button
                onClick={resetDialog}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!dialogType ? (
              <div className="space-y-4">
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => openNewTodoDialog(selectedDate)}
                    className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-white transition-all text-sm font-light"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Neues Todo
                  </button>
                  <button
                    onClick={() => openNewBillDialog(selectedDate)}
                    className="flex-1 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-white transition-all text-sm font-light"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Neue Rechnung
                  </button>
                </div>

                {(itemsByDate[selectedDate]?.todos.length > 0 || itemsByDate[selectedDate]?.bills.length > 0) && (
                  <div className="space-y-4">
                    {itemsByDate[selectedDate].todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-start gap-3 p-4 bg-white/5 rounded-lg ${todo.completed ? "opacity-60" : ""}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleTodo(todo.id, todo.completed)
                          }}
                          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            todo.completed
                              ? "bg-white/20 border-white/40"
                              : "border-white/30 hover:border-white/50 hover:bg-white/5"
                          }`}
                        >
                          {todo.completed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-normal ${todo.completed ? "text-white/50 line-through" : "text-white"}`}>
                              {todo.title}
                            </p>
                            {todo.completed && (
                              <span className="text-xs text-white/40 font-light">
                                Erledigt
                              </span>
                            )}
                          </div>
                          {todo.description && (
                            <p className="text-xs text-white/50 font-light mt-1">
                              {todo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTodo(todo)
                            }}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/5 rounded transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTodo(todo.id)
                            }}
                            className="p-2 text-white/60 hover:text-red-400/90 hover:bg-white/5 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {itemsByDate[selectedDate].bills.map((bill) => (
                      <div
                        key={bill.id}
                        className={`flex items-start gap-3 p-4 bg-white/5 rounded-lg ${bill.paid ? "opacity-60" : ""}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleBill(bill.id, bill.paid)
                          }}
                          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            bill.paid
                              ? "bg-white/20 border-white/40"
                              : "border-white/30 hover:border-white/50 hover:bg-white/5"
                          }`}
                        >
                          {bill.paid && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-normal ${bill.paid ? "text-white/50 line-through" : "text-white"}`}>
                                {bill.title}
                              </p>
                              {bill.paid && (
                                <span className="text-xs text-white/40 font-light">
                                  Bezahlt
                                </span>
                              )}
                            </div>
                            <p className={`text-sm font-semibold flex-shrink-0 ${bill.paid ? "text-white/50 line-through" : "text-white"}`}>
                              {formatCurrency(bill.amount)}
                            </p>
                          </div>
                          {bill.description && (
                            <p className="text-xs text-white/50 font-light mt-1">
                              {bill.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditBill(bill)
                            }}
                            className="p-2 text-white/60 hover:text-white/90 hover:bg-white/5 rounded transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteBill(bill.id)
                            }}
                            className="p-2 text-white/60 hover:text-red-400/90 hover:bg-white/5 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Titel {dialogType === "bill" && "*"}
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={dialogType === "todo" ? "Todo Titel" : "Rechnung Titel"}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    autoFocus
                  />
                </div>

                {dialogType === "bill" && (
                  <div>
                    <label className="block text-sm font-light text-white/60 mb-2">
                      Betrag (CHF) *
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
                )}

                <div className="w-full">
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Fälligkeitsdatum
                  </label>
                  <div className="w-full overflow-hidden">
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                      style={{ maxWidth: '100%', boxSizing: 'border-box', minWidth: 0, width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    {dialogType === "todo" ? "Beschreibung" : "Hinweis"} (optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder={`Optionale ${dialogType === "todo" ? "Beschreibung" : "Hinweis"}`}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetDialog}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-all text-sm font-light"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={dialogType === "todo" ? handleCreateTodo : handleCreateBill}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-sm font-light"
                  >
                    {editingTodo || editingBill ? "Speichern" : "Erstellen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

