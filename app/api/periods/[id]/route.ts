import { NextResponse } from "next/server"
import {prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params  // ✅ THIS FIXES EVERYTHING

  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const period = await prisma.period.findUnique({
      where: { id },
    })

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 })
    }

    if (period.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.period.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting period:", error)
    return NextResponse.json(
      { error: "Failed to delete period" },
      { status: 500 }
    )
  }
}
