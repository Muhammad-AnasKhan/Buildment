import type { LearnerProfile } from "@/shared/api/learner";
import type { AiCredentialStatus } from "@/shared/api/ai";
import type { GamificationSummary } from "@/shared/api/gamification";
import { requireVerifiedUser } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { ProfileForm } from "@/components/auth/profile-form";
import { PasswordForm } from "@/components/auth/password-form";
import { AiKeySettings } from "@/components/learner/ai-key-settings";
import { ProfileSettingsHero } from "@/components/auth/profile-settings-hero";
import { GamificationPreferences } from "@/components/auth/gamification-preferences";
import { showsGameElements } from "@/lib/gamification";

export default async function ProfileSettingsPage() {
  await requireVerifiedUser();
  const [profile, aiStatus, gamification] = await Promise.all([
    serverApiFetch<LearnerProfile>("/api/v1/learner/profile"),
    serverApiFetch<AiCredentialStatus>("/api/v1/learner/ai-credential"),
    serverApiFetch<GamificationSummary>("/api/v1/learner/gamification").catch(() => null),
  ]);
  const gameFeaturesOn = Boolean(gamification && (gamification.features.xp || gamification.features.streakFreezes));

  return (
    <div className="min-h-dvh bg-background">
      <ProfileSettingsHero
        name={profile.name}
        email={profile.email}
        image={profile.image}
        topThree={gamification && showsGameElements(gamification) ? gamification.topThree : null}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="-mt-2 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-6 border-b border-border pb-5">
            <h2 className="text-lg font-semibold tracking-tight">Profile settings</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Update how you appear in the workspace. Your timezone decides when your day ends for
              streaks and weekly goals. Skills are optional and used for future recommendations.
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
        <AiKeySettings initial={aiStatus} />
        {gamification && gameFeaturesOn ? <GamificationPreferences initial={gamification} /> : null}
        <PasswordForm />
      </div>
    </div>
  );
}
