import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Terriva",
  icons: "/Terriva.png",
  description: "A Period Tracker Built for You",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {/* <ThemeToggle /> */}
        <div className="md:mt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
