import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
      <p>Here will go your period tracking data, charts, etc.</p>
    </div>
  );
}
