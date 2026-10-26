import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PostHogProvider } from "@/components/posthog-provider";
import { AppToast } from "@/components/ui/app-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Used by the system design lab board: its own type voice (see src/lab/board-style.ts).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "buildment — learn by building",
    template: "%s · buildment",
  },
  description:
    "Project-based courses with interactive checkpoints, real mentor feedback, and progress you can trust.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
          suppressHydrationWarning
        />
        <ThemeProvider>
          <PostHogProvider>{children}</PostHogProvider>
          <AppToast />
        </ThemeProvider>
      </body>
    </html>
  );
}
