import type { HelpMessageView } from "@/shared/api/help";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HelpNoteTimeline({
  messages,
  viewerId,
}: {
  messages: HelpMessageView[];
  viewerId: string;
}) {
  if (messages.length === 0) return null;

  return (
    <ul className="space-y-5">
      {messages.map((message) => {
        const isMine = message.authorId === viewerId;
        const roleLabel =
          message.authorRole === "MENTOR"
            ? "Mentor"
            : isMine
              ? "You"
              : message.authorName;

        return (
          <li key={message.id}>
            <article className={message.authorRole === "MENTOR" ? "rounded-xl border border-primary/15 bg-primary/5 px-4 py-4" : "rounded-xl border bg-background px-4 py-4"}>
              <header className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{roleLabel}</span>
                <time dateTime={message.createdAt}>{formatWhen(message.createdAt)}</time>
              </header>
              <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {message.body}
              </p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
