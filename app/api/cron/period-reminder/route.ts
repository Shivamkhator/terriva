import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { periodReminderEmail } from "@/lib/emailTemplates";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";

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
      emailEnc: { not: null },
      cycleInsight: { isNot: null },
    },
    select: {
    emailEnc: true,
    nameEnc: true,
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

    const daysLeft = Math.ceil(
  (new Date(nextPeriodDate).getTime() - Date.now()) /
    (1000 * 60 * 60 * 24)
);



    if (daysLeft === 2) {
      await sendMail({
        to: decrypt(user.emailEnc!),
        subject: "Period Reminder by Terriva",
        html: periodReminderEmail({
          name: user.nameEnc ? decrypt(user.nameEnc) : "there",

          daysLeft,
        }),
      });
      // Update lastPeriodReminderSent
      await prisma.cycleInsight.updateMany({
        where: {
          userId: insight.userId,
        },
        data: {
          lastPeriodReminderSent: today,
        },
      });
    }
  }


  return NextResponse.json({ ok: true });
}
