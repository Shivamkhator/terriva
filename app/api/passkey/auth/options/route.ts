import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { rpID } from "@/lib/webauthn";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userPasskeys = await prisma.passkey.findMany({
      where: { userId: session.user.id },
    });

    if (userPasskeys.length === 0) {
      return NextResponse.json({ error: "No passkeys found" }, { status: 400 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.map(pk => ({
        id: pk.credentialId,
        type: 'public-key',
        transports: pk.transports ? JSON.parse(pk.transports) : undefined,
      })),
      userVerification: 'required',
    });

    await prisma.passkeyChallenge.upsert({
      where: { userId: session.user.id },
      update: { challenge: options.challenge },
      create: { userId: session.user.id, challenge: options.challenge }
    });

    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}