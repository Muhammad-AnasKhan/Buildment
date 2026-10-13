import { CourseCover } from "@/components/learn/course-cover";
import { cn } from "@/lib/utils";

function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function ProfileSettingsHero({
  name,
  email,
  image,
  coverUrl,
  coverLabel,
  className,
}: {
  name: string | null | undefined;
  email: string;
  image?: string | null;
  coverUrl: string | null | undefined;
  coverLabel: string;
  className?: string;
}) {
  const displayName = name?.trim() || email.split("@")[0] || "Learner";

  return (
    <header className={cn("relative w-full", className)}>
      <CourseCover
        coverUrl={coverUrl}
        title={coverLabel}
        aspect="banner"
        className="aspect-auto min-h-[11rem] w-full rounded-none sm:min-h-[13rem] lg:min-h-[15rem]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-background bg-card text-lg font-semibold shadow-md sm:size-[4.5rem]">
            {userImageOrInitials(image ?? null, displayName, email)}
          </span>
          <div className="min-w-0 pb-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function userImageOrInitials(image: string | null, displayName: string, email: string) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="size-full rounded-[calc(1rem-2px)] object-cover" />;
  }
  return initials(displayName, email);
}
