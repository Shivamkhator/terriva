import { NextRequest, NextResponse } from "next/server";
import { calculateInsights } from "@/lib/cycleInsights";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embedPeriodData } from "@/lib/embeddings";

// GET all periods for current user
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

    const periods = await prisma.period.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(periods);
  } catch (error) {
    console.error("Error fetching periods:", error);
    return NextResponse.json({ error: "Failed to fetch periods" }, { status: 500 });
  }
}

// POST create new period
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

    const { startDate, endDate } = await req.json();
    const start = new Date(startDate);

    const period = await prisma.period.upsert({
      where: {
        userId_startDate: {
          userId: user.id,
          startDate: start,
        },
      },
      update: {
        endDate: endDate ? new Date(endDate) : null,
      },
      create: {
        userId: user.id,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    // Embed the new/updated period data
    await embedPeriodData(period);


    const allPeriods = await prisma.period.findMany({
      where: { userId: user.id },
    });

    const insights = calculateInsights(allPeriods);

    if (insights) {
      await prisma.cycleInsight.upsert({
        where: {
          userId: session.user.id,
        },
        update: {
          avgCycleLength: insights.avgCycleLength,
          avgPeriodLength: insights.avgPeriodLength,
          nextPeriodDate: insights.nextPeriodDate,
          totalPeriods: insights.totalPeriods,
        },
        create: {
          userId: session.user.id,
          avgCycleLength: insights.avgCycleLength,
          avgPeriodLength: insights.avgPeriodLength,
          nextPeriodDate: insights.nextPeriodDate,
          totalPeriods: insights.totalPeriods,
        },
      });

      const insightContent = `Cycle insights: Average cycle ${insights.avgCycleLength} days, average period ${insights.avgPeriodLength} days, next period predicted ${insights.nextPeriodDate?.toDateString()}`

    }

    return NextResponse.json(period);
  } catch (error) {
    console.error("Error creating period:", error);
    return NextResponse.json({ error: "Failed to create period" }, { status: 500 });
  }
}