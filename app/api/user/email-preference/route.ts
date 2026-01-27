import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hashEmail } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enabled } = await req.json();

  await prisma.user.update({
    where: { emailHash: hashEmail(session.user.email!),
 },
    data: { emailNotifications: enabled },
  });

  return NextResponse.json({ success: true });
}
