import { signOutAction } from "@/server/auth/actions";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";

export function NavUserMenu({
  user,
  homeHref,
  showProgress,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  homeHref?: string;
  showProgress?: boolean;
}) {
  return (
    <UserMenuDropdown
      user={user}
      signOutAction={signOutAction}
      homeHref={homeHref}
      showProgress={showProgress}
    />
  );
}
