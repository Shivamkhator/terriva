import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terriva",
  icons: "/Terriva.png",
  description: "A Period Tracker Built for You",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      {children}
    </div>
  );
}
