import { BookOpen, CalendarClock, ChefHat, FileKey2, Scissors, ShoppingBasket, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANT_ICONS: Record<string, LucideIcon> = {
  grocery: ShoppingBasket,
  services: CalendarClock,
  handmade: Scissors,
  "home-kitchens": ChefHat,
  "digital-goods": FileKey2,
  books: BookOpen,
};

/** Icon tile in the variant's accent. Must sit inside a VariantThemeScope to take its colour. */
export function VariantIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = VARIANT_ICONS[slug] ?? Sparkles;
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
        className
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}
