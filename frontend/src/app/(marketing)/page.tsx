import type { Metadata } from "next";
import { EdoraxLanding } from "@/components/marketing/edorax/edorax-landing";

export const metadata: Metadata = {
  title: { absolute: "Edorax: every lesson starts with a question" },
  description: "Short lessons you can read, play with, listen to and prove. Built for phones, slow connections and second-language learners.",
};

export default function HomePage() {
  return <EdoraxLanding />;
}
