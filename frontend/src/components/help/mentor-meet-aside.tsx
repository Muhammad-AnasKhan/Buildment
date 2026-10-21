import { Phone } from "lucide-react";
import { helpOutlineButton } from "./help-styles";

export function MentorMeetAside({ menteeName }: { menteeName: string }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Mentee</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{menteeName}</p>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-neutral-50/80 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Phone className="size-4 text-neutral-400" aria-hidden />
          Meet with mentee
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Live call and screen share will live here — for now, use written replies on the thread.
        </p>
        <button type="button" disabled className={`${helpOutlineButton} mt-3 w-full text-neutral-400`}>
          Start call (coming soon)
        </button>
      </div>
    </aside>
  );
}
