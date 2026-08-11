import { signOutAction } from "@/server/auth/actions";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";

export function NavUserMenu({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return <UserMenuDropdown user={user} signOutAction={signOutAction} />;
}
