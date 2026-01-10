import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const passkeyCount = await prisma.passkey.count({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      hasPasskeys: passkeyCount > 0,
      count: passkeyCount 
    })
  } catch (error) {
    console.error("Failed to check passkeys:", error)
    return NextResponse.json(
      { error: "Failed to check passkeys" },
      { status: 500 }
    )
  }
}