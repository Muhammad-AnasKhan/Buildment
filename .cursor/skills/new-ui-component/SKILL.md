---
name: new-ui-component
description: >-
  Build a new screen or UI component for buildment following its shadcn/ui + Tailwind
  design system. Use when the user asks to build, design, or style a new page,
  component, dashboard, or screen.
---

# Build a new UI component or screen

## Steps

1. **Look for an existing shadcn primitive first.** Check `src/components/ui/` before writing
   custom markup for anything standard (buttons, dialogs, forms, dropdowns, tables, cards). If one
   is missing, add it via the shadcn CLI (`pnpm dlx shadcn@latest add <component>`) rather than
   hand-rolling it.
2. **Server Component by default.** Only mark it `"use client"` if it needs hooks, event handlers,
   or browser APIs — see [typescript-nextjs.mdc](../../rules/typescript-nextjs.mdc).
3. **Follow the design system** in [design-system.mdc](../../rules/design-system.mdc): theme
   tokens not inline colors, `lucide-react` icons, neutral/zinc palette, dark-mode-safe from the
   start.
4. **Check role/route placement**: mentee-facing screens go under `src/app/(learn)/`, mentor-facing
   under `src/app/(teach)/`, admin under `src/app/(admin)/` — see `docs/07-architecture.mdx` for the
   full route layout.
5. Before considering it done, verify:
   - [ ] Responsive at mobile width (the spec is responsive-web-only, no native apps)
   - [ ] Keyboard-navigable (tab order, focus states)
   - [ ] Looks correct in dark mode
   - [ ] Empty state handled (no data yet) — don't ship a component that only looks right with
         seed data present

## Reference

The core screens and their build order are listed in `docs/00-product-overview.mdx` §"Build order":
chapter reader → MDX editor → mentee dashboard/course overview → review queue → reports →
assignment flows. Check the relevant `docs/phases/mN-*.mdx` file for what's actually in scope for
the current milestone before over-building a screen.
