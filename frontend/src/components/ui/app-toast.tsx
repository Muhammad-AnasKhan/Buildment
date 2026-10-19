"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ToastTone = "error" | "success" | "info";
type ToastOptions = { title?: string; href?: string | null };
type ToastItem = { id: number; message: string; tone: ToastTone } & ToastOptions;

const listeners = new Set<(toast: ToastItem) => void>();

export function toast(message: string, tone: ToastTone = "error", options: ToastOptions = {}) {
  const item = { id: Date.now() + Math.random(), message, tone, ...options };
  listeners.forEach((listener) => listener(item));
}

const toneClasses: Record<ToastTone, string> = {
  error: "border-destructive/30 bg-card text-destructive",
  success: "border-emerald-500/30 bg-card text-emerald-800 dark:text-emerald-200",
  info: "border-border bg-card text-foreground",
};

export function AppToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setItems((current) => [...current, item].slice(-3));
      window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      }, item.tone === "info" ? 6000 : 4200);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => {
        const content = (
          <>
            {item.title ? <span className="block font-medium">{item.title}</span> : null}
            <span className={cn("block", item.title && "mt-0.5 text-muted-foreground line-clamp-2")}>{item.message}</span>
          </>
        );
        const className = cn("pointer-events-auto block rounded-xl border px-4 py-3 text-sm shadow-lg", toneClasses[item.tone]);
        const dismiss = () => setItems((current) => current.filter((entry) => entry.id !== item.id));
        return item.href ? (
          <Link key={item.id} href={item.href} role="status" onClick={dismiss} className={cn(className, "transition-colors hover:bg-muted")}>
            {content}
          </Link>
        ) : (
          <p key={item.id} role="status" className={className}>
            {content}
          </p>
        );
      })}
    </div>
  );
}
