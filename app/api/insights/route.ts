import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const insights = await prisma.cycleInsight.findUnique({
    where: { userId: session.user.id },
  });

  return Response.json(insights);
}
