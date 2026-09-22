import type { HelpMessageView } from "./help-types";

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
    <ul className="space-y-4">
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
            <article
              className={
                message.authorRole === "MENTOR"
                  ? "border-l-2 border-neutral-900 pl-4"
                  : "border-l-2 border-neutral-200 pl-4"
              }
            >
              <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0 text-xs text-neutral-500">
                <span className="font-medium text-neutral-800">{roleLabel}</span>
                <time dateTime={message.createdAt}>{formatWhen(message.createdAt)}</time>
              </header>
              <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-wrap text-neutral-800">
                {message.body}
              </p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
