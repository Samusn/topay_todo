import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createBillSchema } from "@/lib/schemas"
import { getSessionUserId } from "@/lib/auth-helpers"

export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: [
        { paid: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    })
    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json(
      { error: "Failed to fetch bills", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate with Zod
    const validationResult = createBillSchema.safeParse({
      ...body,
      amount: typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount,
    })

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

    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description, amount, dueDate, attachments } = validationResult.data

    const bill = await prisma.bill.create({
      data: {
        title,
        description: description || null,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        userId,
      },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json(
      { error: "Failed to create bill", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

