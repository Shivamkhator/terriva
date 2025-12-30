import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";
import { Noto_Serif } from "next/font/google"
import InstallPrompt from "@/components/InstallPrompt";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Terriva",
  icons: "/Terriva.png",
  description: "Your insights, only yours.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Terriva",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#052b33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="translucent" />
        <meta name="apple-mobile-web-app-title" content="Terriva" />


      </head>
      <body
        className={notoSerif.className}
      >
        <InstallPrompt />
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
