"use client";

import { useState } from "react";
import { MustReadCard } from "@buildment/learning-ui/blocks/must-read/MustReadCard";
import { playFeedback } from "@/lib/sound-feedback";
import { apiFetch } from "@/lib/api-client";

type Props = {
  title: string;
  href: string;
  source?: string;
  summary: string;
  readMinutes?: number;
  blockId?: string;
  initialRead?: boolean;
  required?: boolean;
};

export function MandatoryReadCard({ blockId, initialRead = false, ...props }: Props) {
  const [read, setRead] = useState(initialRead);
  function markRead() {
    if (read) return;
    setRead(true);
    playFeedback("check");
    if (blockId) {
      void apiFetch(`/api/v1/blocks/${encodeURIComponent(blockId)}/respond`, {
        method: "POST",
        json: { complete: true },
      }).catch(() => undefined);
    }
  }
  return <MustReadCard {...props} blockId={blockId} read={read} onReadChange={markRead} />;
}
