import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateTodoSchema } from "@/lib/schemas"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate with Zod
    const validationResult = updateTodoSchema.safeParse(body)

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

    const { title, description, dueDate, completed } = validationResult.data

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (completed !== undefined) updateData.completed = completed

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json(
      { error: "Failed to update todo", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json(
      { error: "Failed to delete todo", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

