import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { periodReminderEmail } from "@/lib/emailTemplates";
import { NextResponse } from "next/server";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


export async function GET() {
  const today = new Date();
  const users = await prisma.user.findMany({
    where: {
      emailNotifications: true,
      email: { not: null },
      cycleInsight: { isNot: null },
    },
    include: {
      cycleInsight: true,
    },
  });


  for (const user of users) {
    const insight = user.cycleInsight;
    if (!insight) continue;

    const { avgCycleLength, nextPeriodDate, lastPeriodReminderSent } = insight;

    if (!nextPeriodDate) continue;

    // 🔒 Idempotency guard
    if (
      lastPeriodReminderSent &&
      isSameDay(lastPeriodReminderSent, today)
    ) {
      continue;
    }

    const daysLeft =
      (new Date(nextPeriodDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);


    if (daysLeft === 2) {
      await sendMail({
        to: user.email!,
        subject: "Period Reminder by Terriva",
        html: periodReminderEmail({
          name: user.name || "there",
          daysLeft,
        }),
      });
    }
  }


  return NextResponse.json({ ok: true });
}
