import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyRegistrationResponse } from "@simplewebauthn/server"
import { rpID, origin } from "@/lib/webauthn"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // 1. Get the challenge we saved during the /options call
    const challengeRecord = await prisma.passkeyChallenge.findUnique({
      where: { userId: session.user.id },
    })

    if (!challengeRecord) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 400 })
    }

    // 2. Verify the response from the browser
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    })

    // 3. Handle verification results
    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo
      // 4. Store the new passkey in the database
      await prisma.passkey.create({
        data: {
          userId: session.user.id,
          credentialId: credential.id, 
          publicKey: Buffer.from(credential.publicKey).toString("base64url"),
          counter: credential.counter,
          transports: credential.transports ? JSON.stringify(credential.transports) : null
        }
      })

      // 5. Cleanup: Delete the used challenge
      await prisma.passkeyChallenge.delete({
        where: { userId: session.user.id }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 })
  } catch (error: any) {
    console.error("Passkey Verification Error:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to verify registration" },
      { status: 500 }
    )
  }
}