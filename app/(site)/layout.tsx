import type { Metadata } from "next";
import TerrivaNavigationMenu from "@/components/TerrivaNavigationMenu";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TerrivaNavigationMenu />
        <div className="mt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
