import { z } from "zod"

// Bill Schemas
export const createBillSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang"),
  description: z.string().max(1000, "Beschreibung ist zu lang").nullable().optional(),
  amount: z.number().positive("Betrag muss größer als 0 sein").max(999999.99, "Betrag ist zu hoch"),
  dueDate: z.string().nullable().optional(),
  attachments: z.array(z.string()).nullable().optional(),
})

export const updateBillSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang").optional(),
  description: z.string().max(1000, "Beschreibung ist zu lang").nullable().optional(),
  amount: z.number().positive("Betrag muss größer als 0 sein").max(999999.99, "Betrag ist zu hoch").optional(),
  dueDate: z.string().nullable().optional(),
  paid: z.boolean().optional(),
  paidDate: z.string().nullable().optional(),
  attachments: z.array(z.string()).nullable().optional(),
})

export const togglePaidBillSchema = z.object({
  paid: z.boolean(),
  paidDate: z.string().nullable().optional(),
})

// Todo Schemas
export const createTodoSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang"),
  description: z.string().max(1000, "Beschreibung ist zu lang").nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang").optional(),
  description: z.string().max(1000, "Beschreibung ist zu lang").nullable().optional(),
  dueDate: z.string().nullable().optional(),
  completed: z.boolean().optional(),
})

// Frontend form schemas (with string inputs for numbers)
export const billFormSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang"),
  description: z.string().max(1000, "Beschreibung ist zu lang").optional().or(z.literal("")),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0 && num <= 999999.99
    },
    { message: "Betrag muss eine positive Zahl sein (max. 999999.99)" }
  ),
  dueDate: z.string().optional().or(z.literal("")),
})

export const todoFormSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel ist zu lang"),
  description: z.string().max(1000, "Beschreibung ist zu lang").optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
})

