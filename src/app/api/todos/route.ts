import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createTodoSchema } from "@/lib/schemas"

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [
        { completed: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    })
    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json(
      { error: "Failed to fetch todos", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate with Zod
    const validationResult = createTodoSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validierungsfehler",
          details: validationResult.error.errors.map((err: { path: (string | number)[]; message: string }) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      )
    }

    const { title, description, dueDate } = validationResult.data

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json(
      { error: "Failed to create todo", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

