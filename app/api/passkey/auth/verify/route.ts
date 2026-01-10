import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { rpID, origin } from "@/lib/webauthn";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [challengeRecord, passkey] = await Promise.all([
      prisma.passkeyChallenge.findUnique({ where: { userId: session.user.id } }),
      prisma.passkey.findUnique({ where: { credentialId: body.id } })
    ]);

    if (!challengeRecord || !passkey) {
      return NextResponse.json({ error: "Missing challenge or passkey" }, { status: 400 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
      },
    });

    if (verification.verified) {
      await prisma.passkey.update({
        where: { credentialId: passkey.credentialId },
        data: { counter: verification.authenticationInfo.newCounter }
      });

      await prisma.passkeyChallenge.delete({ where: { userId: session.user.id } });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}