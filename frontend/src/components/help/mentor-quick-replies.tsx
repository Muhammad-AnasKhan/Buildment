"use client";

import { Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Ready-made replies for the mentor. Picking one drops the text into the typing bar so it
// can be edited before sending — nothing is sent automatically.
const QUICK_REPLIES = [
  {
    label: "Ask for the error",
    text: "Thanks for reaching out! Could you share the exact error message or the code you're running?",
  },
  {
    label: "Point to the step",
    text: "Take another look at the step right before this one and tell me what you see.",
  },
  {
    label: "Good progress",
    text: "Nice work so far, you're on the right track. Try the next step and let me know how it goes.",
  },
  {
    label: "Offer a call",
    text: "This is easier to show than explain. Want to jump on a quick call so we can go through it together?",
  },
  {
    label: "Wrap up",
    text: "Glad that helped! I'll mark this as resolved, but feel free to ask again if you get stuck.",
  },
];

/** A round "lightning" button that lives inside the typing bar and opens the list of quick replies. */
export function MentorQuickReplies({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Quick replies"
            title="Quick replies"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-primary/10 data-popup-open:text-primary"
          />
        }
      >
        <Zap className="size-[18px]" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-80 rounded-2xl p-1.5"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 py-1.5">
            Quick replies
          </DropdownMenuLabel>
          {QUICK_REPLIES.map((reply) => (
            <DropdownMenuItem
              key={reply.label}
              onClick={() => onPick(reply.text)}
              className="flex-col items-start gap-0.5 rounded-xl px-2.5 py-2"
            >
              <span className="text-sm font-medium text-foreground">
                {reply.label}
              </span>
              <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {reply.text}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
