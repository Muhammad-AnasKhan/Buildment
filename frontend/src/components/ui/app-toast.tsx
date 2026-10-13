"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastItem = { id: number; message: string; tone: "error" | "success" };

const listeners = new Set<(toast: ToastItem) => void>();

export function toast(message: string, tone: ToastItem["tone"] = "error") {
  const item = { id: Date.now() + Math.random(), message, tone };
  listeners.forEach((listener) => listener(item));
}

export function AppToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setItems((current) => [...current, item].slice(-3));
      window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      }, 4200);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => (
        <p
          key={item.id}
          role="status"
          className={cn(
            "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg",
            item.tone === "error"
              ? "border-destructive/30 bg-card text-destructive"
              : "border-emerald-500/30 bg-card text-emerald-800 dark:text-emerald-200"
          )}
        >
          {item.message}
        </p>
      ))}
    </div>
  );
}
