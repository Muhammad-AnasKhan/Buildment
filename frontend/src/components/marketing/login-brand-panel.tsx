import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Interactive MDX chapters with quizzes, gates, and open questions",
  "Project-based courses — learn by shipping a real codebase",
  "Mentor dashboards for reviews, progress, and cohort activity",
];

export function LoginBrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-muted/50 p-10 lg:flex lg:p-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,var(--foreground)/5,transparent)]"
        aria-hidden
      />
      <div className="relative">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <p className="mt-8 max-w-md text-lg font-medium leading-snug text-foreground">
          The learning platform where mentors author interactive courses and mentees prove they
          understood — chapter by chapter.
        </p>
        <ul className="mt-8 space-y-4">
          {POINTS.map((text) => (
            <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground/70" />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
