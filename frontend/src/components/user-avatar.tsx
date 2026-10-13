import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
  user,
  compact = false,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  compact?: boolean;
}) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(compact ? "h-7 w-7" : "h-8 w-8 ring-2 ring-white")}>
      <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email ?? "avatar"} />
      <AvatarFallback className="bg-indigo-50 text-[10px] font-semibold text-indigo-700">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
