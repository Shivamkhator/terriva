import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { rpID, rpName } from "@/lib/webauthn"
import { prisma } from "@/lib/prisma"
import { hashEmail } from "@/lib/crypto"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingPasskeys = await prisma.passkey.findMany({
      where: { userId: session.user.id }
    })

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(session.user.id),
      userName: session.user.email ? hashEmail(session.user.email) : session.user.id,
      timeout: 60000,
      attestationType: "none",
      authenticatorSelection: {
        userVerification: "required",
        residentKey: "preferred"
      },
      excludeCredentials: existingPasskeys.map(pk => ({
        id: pk.credentialId,
        type: "public-key"
      }))
    })

    await prisma.passkeyChallenge.deleteMany({
      where: { userId: session.user.id }
    })

    await prisma.passkeyChallenge.create({
      data: {
        userId: session.user.id,
        challenge: options.challenge // Remove the await here
      }
    })

    return NextResponse.json(options)
  } catch (error) {
    console.error("Passkey registration error:", error)
    return NextResponse.json(
      { error: "Failed to generate registration options" },
      { status: 500 }
    )
  }
}