import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateBillSchema, togglePaidBillSchema } from "@/lib/schemas"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check if this is a simple toggle paid request
    if (body.paid !== undefined && Object.keys(body).length <= 2) {
      const validationResult = togglePaidBillSchema.safeParse({
        paid: body.paid,
        paidDate: body.paidDate || null,
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

      const { paid, paidDate } = validationResult.data

      const bill = await prisma.bill.update({
        where: { id },
        data: {
          paid,
          paidDate: paidDate ? new Date(paidDate) : null,
        },
      })

      return NextResponse.json(bill)
    }

    // Full update validation
    const validationResult = updateBillSchema.safeParse({
      ...body,
      amount: body.amount !== undefined 
        ? (typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount)
        : undefined,
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

    const { title, description, amount, dueDate, paid, paidDate, attachments } = validationResult.data

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (amount !== undefined) updateData.amount = amount
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
    const errorMessage = error instanceof Error ? error.message : String(error)
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

