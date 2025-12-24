import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
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
    const { title, description } = body

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
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

