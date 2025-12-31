import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { periodReminderEmail } from "@/lib/emailTemplates";
import { NextResponse } from "next/server";

export async function GET() {
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

  const { avgCycleLength, nextPeriodDate } = insight;

  if (!nextPeriodDate) continue;

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
