import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InsightsClient from "./InsightsClient";

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <InsightsClient user={session.user} />;
}
