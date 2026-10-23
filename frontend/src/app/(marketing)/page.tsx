import type { Metadata } from "next";
import MarketingHomePage from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Make something you can show | buildment",
  description: "Build a marketplace or practise a skill for work. Project-based courses from Dev Weekends, with checkpoints and mentor reviews.",
};

export default function HomePage() {
  return <MarketingHomePage />;
}
