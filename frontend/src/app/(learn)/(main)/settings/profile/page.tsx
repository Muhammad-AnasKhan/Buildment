import { prisma } from "@/server/db";
import { requireVerifiedUser } from "@/server/auth/guards";
import { ProfileForm } from "@/components/auth/profile-form";
import { ProfileSettingsHero } from "@/components/auth/profile-settings-hero";

export default async function ProfileSettingsPage() {
  const user = await requireVerifiedUser();
  const [profile, featuredEnrollment] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.enrollment.findFirst({
      where: { userId: user.id, status: { not: "DROPPED" } },
      orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
      select: {
        course: { select: { title: true, coverUrl: true } },
      },
    }),
  ]);

  const coverUrl = featuredEnrollment?.course.coverUrl ?? null;
  const coverLabel = featuredEnrollment?.course.title ?? user.name ?? "Your profile";

  return (
    <div className="min-h-dvh bg-background">
      <ProfileSettingsHero
        name={user.name}
        email={user.email ?? ""}
        image={user.image}
        coverUrl={coverUrl}
        coverLabel={coverLabel}
      />

      <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="-mt-2 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-border pb-5">
            <h2 className="text-lg font-semibold tracking-tight">Profile settings</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Update how you appear in the workspace. Timezone and skills are optional and used for
              future recommendations.
            </p>
          </div>
          <ProfileForm
            email={user.email ?? ""}
            initial={{
              name: user.name ?? "",
              timezone: profile?.timezone ?? "UTC",
              skills: (profile?.skills ?? []).join(", "),
            }}
            variant="plain"
          />
        </div>
      </div>
    </div>
  );
}
