"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StepClient } from "./StepClient";

export function StepsClient({
  id,
  title,
  children,
}: {
  id: string;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      )}
    >
      {title ? (
        <div className="border-b border-neutral-200 bg-neutral-50/60 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            {title}
          </h2>
        </div>
      ) : null}

      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
