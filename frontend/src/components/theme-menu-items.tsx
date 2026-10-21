"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useHydrated } from "@/lib/use-browser-storage";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Same as device", icon: Monitor },
] as const;

/** Light, dark or device theme, for any account menu. */
export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  // next-themes only knows the stored choice in the browser, so the first render shows no tick.
  const mounted = useHydrated();
  const current = mounted ? (theme ?? "system") : null;

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <DropdownMenuItem key={value} className="min-h-9 gap-2 px-2" onClick={() => setTheme(value)}>
          <Icon className="size-4" />
          <span className="flex-1">{label}</span>
          {current === value && <Check className="size-4" aria-label="Current theme" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
}
