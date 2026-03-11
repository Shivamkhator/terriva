"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: ReactNode;
  attribute?: "class" | "data-theme" | "data-mode";
  enableSystem?: boolean;
  defaultTheme?: string;
}

export default function Providers({ 
  children, 
  attribute = "class", 
  enableSystem = false, 
  defaultTheme = "light" 
}: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute={attribute} 
        enableSystem={enableSystem} 
        defaultTheme={defaultTheme}
        disableTransitionOnChange={false}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}