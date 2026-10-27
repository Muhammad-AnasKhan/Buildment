"use client";

import { useEffect } from "react";
import { acquireAppActivityTracker } from "@/lib/app-activity-tracker";

/** Counts overall active app time for the signed-in user. Renders nothing; safe to mount in several layouts. */
export function AppActivityTracker() {
  useEffect(() => acquireAppActivityTracker(), []);
  return null;
}
