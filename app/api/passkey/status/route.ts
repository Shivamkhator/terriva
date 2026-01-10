import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ hasPasskey: false })
  }

  const count = await prisma.passkey.count({
    where: { userId: session.user.id }
  })

  return NextResponse.json({ hasPasskey: count > 0 })
}
