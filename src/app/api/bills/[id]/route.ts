import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, amount, dueDate, paid, paidDate, attachments } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (paid !== undefined) updateData.paid = paid
    if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null
    if (attachments !== undefined) updateData.attachments = attachments ? JSON.stringify(attachments) : null

    const bill = await prisma.bill.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json(
      { error: "Failed to update bill", details: error instanceof Error ? error.message : String(error) },
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
    await prisma.bill.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bill:", error)
    return NextResponse.json(
      { error: "Failed to delete bill", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

