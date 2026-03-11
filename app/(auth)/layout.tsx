import type { Metadata } from "next";
import Providers from "@/components/Providers";

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
    <html lang="en">
      <body
        className={`antialiased`}
      >
      <Providers attribute="class" defaultTheme="light">
          {children}
        </Providers>
      </body>
    </html>
  );
}
