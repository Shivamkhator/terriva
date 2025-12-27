import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all flows for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const flows = await prisma.DailyFlow.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(flows);
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json({ error: "Failed to fetch flows" }, { status: 500 });
  }
}

// POST create or update flow
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { date, intensity } = await req.json();

    const flow = await prisma.DailyFlow.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date),
        },
      },
      update: {
        intensity,
      },
      create: {
        userId: user.id,
        date: new Date(date),
        intensity,
      },
    });

    return NextResponse.json(flow);
  } catch (error) {
    console.error("Error saving flow:", error);
    return NextResponse.json({ error: "Failed to save flow" }, { status: 500 });
  }
}