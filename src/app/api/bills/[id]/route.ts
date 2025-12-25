import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("PATCH /api/bills/[id] - ID:", id)
    
    const body = await request.json()
    console.log("PATCH /api/bills/[id] - Body:", body)
    
    const { title, description, amount, dueDate, paid, paidDate, attachments } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (paid !== undefined) updateData.paid = paid
    if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null
    if (attachments !== undefined) updateData.attachments = attachments ? JSON.stringify(attachments) : null

    console.log("PATCH /api/bills/[id] - Update data:", updateData)

    const bill = await prisma.bill.update({
      where: { id },
      data: updateData,
    })

    console.log("PATCH /api/bills/[id] - Updated bill:", bill)
    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error updating bill:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorDetails = error instanceof Error ? error.stack : undefined
    console.error("Error details:", errorDetails)
    return NextResponse.json(
      { error: "Failed to update bill", details: errorMessage },
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

