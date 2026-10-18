import type { LearnerProfile } from "@/shared/api/learner";
import { requireVerifiedUser } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { ProfileForm } from "@/components/auth/profile-form";
import { PasswordForm } from "@/components/auth/password-form";
import { ProfileSettingsHero } from "@/components/auth/profile-settings-hero";

export default async function ProfileSettingsPage() {
  await requireVerifiedUser();
  const profile = await serverApiFetch<LearnerProfile>("/api/v1/learner/profile");

  const coverUrl = profile.featuredCourse?.coverUrl ?? null;
  const coverLabel = profile.featuredCourse?.title ?? profile.name ?? "Your profile";

  return (
    <div className="min-h-dvh bg-background">
      <ProfileSettingsHero
        name={profile.name}
        email={profile.email}
        image={profile.image}
        coverUrl={coverUrl}
        coverLabel={coverLabel}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="-mt-2 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-border pb-5">
            <h2 className="text-lg font-semibold tracking-tight">Profile settings</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Update how you appear in the workspace. Timezone and skills are optional and used for
              future recommendations.
            </p>
          </div>
          <ProfileForm
            email={profile.email}
            initial={{
              name: profile.name ?? "",
              timezone: profile.timezone,
              skills: profile.skills.join(", "),
            }}
            variant="plain"
          />
        </div>
        <PasswordForm />
      </div>
    </div>
  );
}
