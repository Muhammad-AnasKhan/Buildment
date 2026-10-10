"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      // React 19 / Next 16: inline <script> in client trees triggers a console error.
      // Theme flash is handled by THEME_INIT_SCRIPT in the root layout; this silences the duplicate tag.
      scriptProps={{ type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  );
}
