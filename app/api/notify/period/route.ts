import { sendMail } from "@/lib/mailer";
import { periodReminderEmail } from "@/lib/emailTemplates";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, daysLeft } = await req.json();

  if (!email || daysLeft == null) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  await sendMail({
    to: email,
    subject: "🌸 Period Reminder",
    html: periodReminderEmail({ name, daysLeft }),
  });

  return NextResponse.json({ success: true });
}
