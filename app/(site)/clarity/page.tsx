import { getServerSession } from "next-auth";
import { PasskeyGuard } from "@/components/PasskeyGuard"
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClarityPage from "./ClarityClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (<PasskeyGuard><ClarityPage user={session.user} /></PasskeyGuard>);
}
