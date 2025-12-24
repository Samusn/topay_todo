import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
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
    const { title, description, amount, dueDate, attachments } = body

    if (!title || amount === undefined) {
      return NextResponse.json(
        { error: "Title and amount are required" },
        { status: 400 }
      )
    }

    const bill = await prisma.bill.create({
      data: {
        title,
        description: description || null,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
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

